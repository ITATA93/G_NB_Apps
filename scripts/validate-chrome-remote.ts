/**
 * Validación de NocoBase UI conectándose a Chrome remoto vía CDP
 * 
 * PREREQUISITO: Chrome debe estar corriendo con:
 * chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const CDP_URL = 'http://localhost:9222';
const REPORT_DIR = 'docs/ui-validation';

interface ValidationReport {
  timestamp: string;
  errors: string[];
  warnings: string[];
  info: string[];
  currentUrl: string;
  pageTitle: string;
  success: boolean;
}

async function getChromeTargets() {
  try {
    const response = await axios.get(`${CDP_URL}/json`);
    return response.data;
  } catch (error: any) {
    console.error('❌ No se pudo conectar a Chrome remoto en puerto 9222');
    console.error('   Asegúrate de que Chrome esté corriendo con:');
    console.error('   chrome.exe --remote-debugging-port=9222');
    throw error;
  }
}

async function validateNocoBaseCDP(): Promise<ValidationReport> {
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    errors: [],
    warnings: [],
    info: [],
    currentUrl: '',
    pageTitle: '',
    success: false,
  };

  console.log('🔍 Buscando instancia de Chrome...');
  
  const targets = await getChromeTargets();
  console.log(`✅ Encontradas ${targets.length} pestañas/páginas abiertas\n`);

  // Buscar la pestaña de NocoBase
  const nocobaseTab = targets.find((t: any) => 
    t.url && (
      t.url.includes('hospitaldeovalle.cl') ||
      t.url.includes('nocobase') ||
      t.url.includes('mira')
    )
  );

  if (!nocobaseTab) {
    console.log('⚠️  No se encontró pestaña de NocoBase abierta');
    console.log('   Pestañas disponibles:');
    targets.forEach((t: any, i: number) => {
      console.log(`   ${i + 1}. ${t.title || 'Sin título'} - ${t.url || 'Sin URL'}`);
    });
    
    // Usar la primera pestaña disponible
    if (targets.length > 0 && targets[0].webSocketDebuggerUrl) {
      console.log('\n📍 Usando la primera pestaña disponible...');
      report.currentUrl = targets[0].url;
      report.pageTitle = targets[0].title;
    } else {
      throw new Error('No hay pestañas disponibles con soporte CDP');
    }
  } else {
    console.log(`✅ Encontrada pestaña de NocoBase:`);
    console.log(`   📄 Título: ${nocobaseTab.title}`);
    console.log(`   🔗 URL: ${nocobaseTab.url}\n`);
    report.currentUrl = nocobaseTab.url;
    report.pageTitle = nocobaseTab.title;
  }

  const wsUrl = (nocobaseTab || targets[0]).webSocketDebuggerUrl;
  
  if (!wsUrl) {
    throw new Error('No hay URL de WebSocket disponible para conectarse');
  }

  // Conectarse vía WebSocket
  console.log('🔌 Conectando al Chrome DevTools Protocol...\n');
  
  const WebSocket = (await import('ws')).default;
  const ws = new WebSocket(wsUrl);

  return new Promise((resolve, reject) => {
    let messageId = 1;
    const pendingCommands = new Map<number, any>();

    function sendCommand(method: string, params: any = {}) {
      const id = messageId++;
      const command = { id, method, params };
      
      return new Promise((resolveCmd, rejectCmd) => {
        pendingCommands.set(id, { resolve: resolveCmd, reject: rejectCmd });
        ws.send(JSON.stringify(command));
      });
    }

    ws.on('open', async () => {
      console.log('✅ Conectado a Chrome DevTools\n');
      
      try {
        // Habilitar el dominio de consola
        await sendCommand('Runtime.enable');
        await sendCommand('Log.enable');
        await sendCommand('Network.enable');
        
        console.log('📊 Escuchando eventos de consola...\n');
        console.log('═'.repeat(70));
        
        // Obtener logs existentes
        const logsResult: any = await sendCommand('Log.entryAdded');
        
        // Esperar 3 segundos para capturar eventos
        setTimeout(async () => {
          console.log('═'.repeat(70));
          console.log('\n📋 Generando reporte...\n');
          
          report.success = true;
          
          // Guardar reporte
          if (!fs.existsSync(REPORT_DIR)) {
            fs.mkdirSync(REPORT_DIR, { recursive: true });
          }
          
          const reportPath = path.join(REPORT_DIR, `chrome-validation-${Date.now()}.json`);
          fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
          
          // Reporte Markdown
          const mdReport = `
# 🌐 Validación Chrome DevTools - NocoBase

**Fecha**: ${report.timestamp}  
**URL**: ${report.currentUrl}  
**Título**: ${report.pageTitle}

---

## ❌ Errores de Consola (${report.errors.length})

${report.errors.length > 0 ? report.errors.map((e, i) => `${i + 1}. \`${e}\``).join('\n') : '_Ninguno detectado_'}

---

## ⚠️ Advertencias (${report.warnings.length})

${report.warnings.length > 0 ? report.warnings.map((w, i) => `${i + 1}. \`${w}\``).join('\n') : '_Ninguna detectada_'}

---

## ℹ️ Información (${report.info.length})

${report.info.length > 0 ? report.info.slice(0, 20).map((i, idx) => `${idx + 1}. \`${i}\``).join('\n') : '_Ninguna_'}

---

## 🎯 Resumen

| Métrica | Valor |
|---------|-------|
| **Errores** | ${report.errors.length} |
| **Advertencias** | ${report.warnings.length} |
| **Estado** | ${report.errors.length === 0 ? '✅ Sin errores' : '⚠️ Con errores'} |

---

**Reporte JSON**: \`${reportPath}\`
`;

          const mdPath = path.join(REPORT_DIR, `chrome-validation-${Date.now()}.md`);
          fs.writeFileSync(mdPath, mdReport);
          
          console.log(`✅ Reporte JSON: ${reportPath}`);
          console.log(`✅ Reporte MD: ${mdPath}\n`);
          
          console.log('═'.repeat(70));
          console.log('🎯 RESUMEN FINAL');
          console.log('═'.repeat(70));
          console.log(`❌ Errores:      ${report.errors.length}`);
          console.log(`⚠️  Advertencias: ${report.warnings.length}`);
          console.log(`ℹ️  Info:         ${report.info.length}`);
          console.log('═'.repeat(70));
          
          if (report.errors.length === 0) {
            console.log('\n🎉 ¡Sin errores de consola detectados!');
          } else {
            console.log('\n⚠️  Se detectaron errores. Revisa el reporte.');
          }
          
          ws.close();
          resolve(report);
        }, 3000);
        
      } catch (error) {
        console.error('❌ Error durante validación:', error);
        reject(error);
      }
    });

    ws.on('message', (data: any) => {
      const message = JSON.parse(data.toString());
      
      // Manejar respuestas de comandos
      if (message.id && pendingCommands.has(message.id)) {
        const { resolve: resolveCmd } = pendingCommands.get(message.id)!;
        pendingCommands.delete(message.id);
        resolveCmd(message.result);
      }
      
      // Manejar eventos de consola
      if (message.method === 'Runtime.consoleAPICalled') {
        const { type, args } = message.params;
        const text = args.map((arg: any) => arg.value || arg.description || '').join(' ');
        
        if (type === 'error') {
          console.log(`❌ ERROR: ${text}`);
          report.errors.push(text);
        } else if (type === 'warning') {
          console.log(`⚠️  WARN:  ${text}`);
          report.warnings.push(text);
        } else if (type === 'log' || type === 'info') {
          report.info.push(text);
        }
      }
      
      // Manejar eventos de Log
      if (message.method === 'Log.entryAdded') {
        const { level, text, source } = message.params.entry;
        
        if (level === 'error') {
          console.log(`❌ ERROR [${source}]: ${text}`);
          report.errors.push(`[${source}] ${text}`);
        } else if (level === 'warning') {
          console.log(`⚠️  WARN  [${source}]: ${text}`);
          report.warnings.push(`[${source}] ${text}`);
        }
      }
      
      // Manejar errores de excepción
      if (message.method === 'Runtime.exceptionThrown') {
        const { exceptionDetails } = message.params;
        const errorText = exceptionDetails.exception?.description || exceptionDetails.text;
        console.log(`❌ EXCEPTION: ${errorText}`);
        report.errors.push(errorText);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Error de WebSocket:', error);
      reject(error);
    });

    ws.on('close', () => {
      console.log('\n🔌 Conexión cerrada');
    });
  });
}

// Ejecutar
console.log('🚀 Iniciando validación de Chrome remoto...\n');

validateNocoBaseCDP()
  .then((report) => {
    process.exit(report.errors.length === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
