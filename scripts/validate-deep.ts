/**
 * Validación PROFUNDA de NocoBase UI + Network
 * Captura errores de consola Y requests de red fallidos
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const CDP_URL = 'http://localhost:9222';
const REPORT_DIR = 'docs/ui-validation';

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  type?: string;
  timestamp: number;
}

interface DeepValidationReport {
  timestamp: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkFailures: NetworkRequest[];
  networkSuccess: NetworkRequest[];
  currentUrl: string;
  pageTitle: string;
}

async function deepValidate(): Promise<DeepValidationReport> {
  const report: DeepValidationReport = {
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    consoleWarnings: [],
    networkFailures: [],
    networkSuccess: [],
    currentUrl: '',
    pageTitle: '',
  };

  console.log('🔍 Conectando a Chrome...\n');
  
  const response = await axios.get(`${CDP_URL}/json`);
  const targets = response.data;
  
  const nocobaseTab = targets.find((t: any) => 
    t.url && t.url.includes('hospitaldeovalle.cl')
  );

  if (!nocobaseTab) {
    throw new Error('No se encontró pestaña de NocoBase');
  }

  report.currentUrl = nocobaseTab.url;
  report.pageTitle = nocobaseTab.title;
  
  const WebSocket = (await import('ws')).default;
  const ws = new WebSocket(nocobaseTab.webSocketDebuggerUrl);

  return new Promise((resolve) => {
    let messageId = 1;
    const pendingRequests = new Map<string, NetworkRequest>();

    function sendCommand(method: string, params: any = {}) {
      const id = messageId++;
      ws.send(JSON.stringify({ id, method, params }));
    }

    ws.on('open', () => {
      console.log('✅ Conectado a Chrome DevTools\n');
      console.log('📊 Capturando eventos (10 segundos)...\n');
      
      // Habilitar dominios
      sendCommand('Runtime.enable');
      sendCommand('Log.enable');
      sendCommand('Network.enable');
      
      // Esperar 10 segundos capturando todo
      setTimeout(() => {
        console.log('\n📋 Generando reporte...\n');
        ws.close();
        resolve(report);
      }, 10000);
    });

    ws.on('message', (data: any) => {
      const message = JSON.parse(data.toString());
      
      // CONSOLA: Errores
      if (message.method === 'Runtime.consoleAPICalled') {
        const { type, args } = message.params;
        const text = args.map((arg: any) => arg.value || arg.description || '').join(' ');
        
        if (type === 'error') {
          console.log(`❌ ${text.substring(0, 100)}...`);
          report.consoleErrors.push(text);
        } else if (type === 'warning') {
          console.log(`⚠️  ${text.substring(0, 100)}...`);
          report.consoleWarnings.push(text);
        }
      }
      
      // CONSOLA: Log.entryAdded
      if (message.method === 'Log.entryAdded') {
        const { level, text } = message.params.entry;
        
        if (level === 'error') {
          report.consoleErrors.push(text);
        } else if (level === 'warning') {
          report.consoleWarnings.push(text);
        }
      }
      
      // NETWORK: Request iniciado
      if (message.method === 'Network.requestWillBeSent') {
        const { requestId, request, timestamp, type } = message.params;
        pendingRequests.set(requestId, {
          url: request.url,
          method: request.method,
          type,
          timestamp,
        });
      }
      
      // NETWORK: Respuesta recibida
      if (message.method === 'Network.responseReceived') {
        const { requestId, response } = message.params;
        const req = pendingRequests.get(requestId);
        
        if (req) {
          req.status = response.status;
          req.statusText = response.statusText;
          
          if (response.status >= 400) {
            console.log(`🔴 ${response.status} ${req.method} ${req.url.substring(0, 80)}`);
            report.networkFailures.push(req);
          } else if (response.status >= 200 && response.status < 300) {
            report.networkSuccess.push(req);
          }
          
          pendingRequests.delete(requestId);
        }
      }
      
      // NETWORK: Fallo de carga
      if (message.method === 'Network.loadingFailed') {
        const { requestId, errorText } = message.params;
        const req = pendingRequests.get(requestId);
        
        if (req) {
          req.statusText = errorText;
          console.log(`💥 FAILED: ${req.method} ${req.url.substring(0, 80)}`);
          report.networkFailures.push(req);
          pendingRequests.delete(requestId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Error WebSocket:', error);
    });
  });
}

// Ejecutar
console.log('🚀 Iniciando validación profunda...\n');

deepValidate()
  .then((report) => {
    // Guardar JSON
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    
    const jsonPath = path.join(REPORT_DIR, `deep-validation-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    
    // Reporte consola
    console.log('═'.repeat(70));
    console.log('🎯 RESUMEN FINAL');
    console.log('═'.repeat(70));
    console.log(`❌ Errores consola:     ${report.consoleErrors.length}`);
    console.log(`⚠️  Warnings consola:    ${report.consoleWarnings.length}`);
    console.log(`🔴 Network failures:    ${report.networkFailures.length}`);
    console.log(`✅ Network success:     ${report.networkSuccess.length}`);
    console.log('═'.repeat(70));
    
    if (report.networkFailures.length > 0) {
      console.log('\n🔴 REQUESTS FALLIDOS:');
      report.networkFailures.forEach((req, i) => {
        console.log(`${i + 1}. [${req.status || 'FAILED'}] ${req.method} ${req.url}`);
      });
    }
    
    console.log(`\n✅ Reporte guardado: ${jsonPath}\n`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
