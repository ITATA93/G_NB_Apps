#!/usr/bin/env node

/**
 * Script CORREGIDO para listar todas las colecciones
 * Ahora maneja correctamente la conexión
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Leer .env
const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const NOCOBASE_API_URL = envContent.match(/NOCOBASE_API_URL=(.+)/)?.[1]?.trim() || '';
const NOCOBASE_API_TOKEN = envContent.match(/NOCOBASE_API_TOKEN=(.+)/)?.[1]?.trim() || '';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Role': 'root',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, rawBody: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  Lista Completa de Colecciones - NocoBase UGCO            ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  try {
    // Obtener todas las colecciones
    const url = `${NOCOBASE_API_URL}/collections:list`;
    log('📡 Consultando API...', 'cyan');
    const response = await makeRequest(url, NOCOBASE_API_TOKEN);

    if (response.status !== 200) {
      log(`✗ Error: Status ${response.status}`, 'red');
      return;
    }

    const collections = response.data.data || [];
    log(`✓ ${collections.length} colecciones encontradas\n`, 'green');

    // Clasificar
    const ugco = collections.filter(c =>
      c.name.startsWith('t_') ||
      c.title?.toLowerCase().includes('paciente') ||
      c.title?.toLowerCase().includes('oncol') ||
      c.title?.toLowerCase().includes('comite') ||
      c.title?.toLowerCase().includes('episodio') ||
      c.name === 'departments'
    );

    const system = collections.filter(c =>
      c.name === 'users' ||
      c.name === 'roles' ||
      c.name.startsWith('_')
    );

    const other = collections.filter(c => !ugco.includes(c) && !system.includes(c));

    // Mostrar colecciones UGCO
    if (ugco.length > 0) {
      log('═══════════════════════════════════════════════════════════', 'green');
      log('  COLECCIONES UGCO', 'green');
      log('═══════════════════════════════════════════════════════════', 'green');

      for (const col of ugco) {
        log(`\n📋 ${col.name}`, 'bright');
        log(`   Título: ${col.title || 'Sin título'}`, 'cyan');
        log(`   Oculta: ${col.hidden ? 'Sí' : 'No'}`);
        log(`   Origen: ${col.origin || 'N/A'}`);

        // Obtener esquema detallado
        try {
          const schemaUrl = `${NOCOBASE_API_URL}/collections:get?filterByTk=${col.name}`;
          const schemaRes = await makeRequest(schemaUrl, NOCOBASE_API_TOKEN);

          if (schemaRes.status === 200 && schemaRes.data.data) {
            const fields = schemaRes.data.data.fields || [];
            log(`   Campos: ${fields.length}`, fields.length > 0 ? 'green' : 'yellow');

            if (fields.length > 0) {
              log(`\n   📝 Campos definidos:`);
              fields.forEach(f => {
                const required = f.required ? '(requerido)' : '';
                const relation = f.target ? `→ ${f.target}` : '';
                log(`      • ${f.name}: ${f.type} ${required} ${relation}`, 'cyan');
              });
            } else {
              log(`   ⚠️  COLECCIÓN VACÍA - Sin campos definidos`, 'yellow');
            }
          }
        } catch (err) {
          log(`   ⚠️  Error obteniendo esquema: ${err.message}`, 'red');
        }
      }
    }

    // Mostrar colecciones del sistema
    if (system.length > 0) {
      log('\n═══════════════════════════════════════════════════════════', 'blue');
      log('  COLECCIONES DEL SISTEMA', 'blue');
      log('═══════════════════════════════════════════════════════════', 'blue');

      system.forEach(col => {
        log(`\n📋 ${col.name} - "${col.title || 'Sin título'}"`);
      });
    }

    // Otras colecciones
    if (other.length > 0) {
      log('\n═══════════════════════════════════════════════════════════', 'magenta');
      log('  OTRAS COLECCIONES', 'magenta');
      log('═══════════════════════════════════════════════════════════', 'magenta');

      other.forEach(col => {
        log(`\n📋 ${col.name} - "${col.title || 'Sin título'}"`);
      });
    }

    // Resumen
    log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
    log('║  RESUMEN                                                   ║', 'bright');
    log('╚════════════════════════════════════════════════════════════╝', 'bright');

    log(`\n📊 Total colecciones: ${collections.length}`);
    log(`   • UGCO: ${ugco.length}`, 'green');
    log(`   • Sistema: ${system.length}`, 'blue');
    log(`   • Otras: ${other.length}`, 'magenta');

    // Análisis de estado
    log(`\n💡 Análisis UGCO:`, 'yellow');

    const emptyCollections = ugco.filter(c => {
      // Revisar si tiene campos en el objeto principal
      return !c.fields || c.fields.length === 0;
    });

    if (emptyCollections.length > 0) {
      log(`   ⚠️  ${emptyCollections.length} colección(es) sin campos definidos`, 'yellow');
      emptyCollections.forEach(c => {
        log(`      • ${c.name} - "${c.title}"`, 'yellow');
      });
    }

    // Colecciones ALMA faltantes
    log(`\n   ❌ Colecciones ALMA faltantes:`, 'red');
    log(`      • alma_pacientes`, 'red');
    log(`      • alma_episodios`, 'red');
    log(`      • alma_diagnosticos`, 'red');

    // Colecciones ONCO faltantes
    log(`\n   ❌ Colecciones ONCO faltantes:`, 'red');
    log(`      • onco_especialidades`, 'red');
    log(`      • onco_casos`, 'red');
    log(`      • onco_caso_especialidades`, 'red');
    log(`      • onco_episodios`, 'red');
    log(`      • onco_seguimiento_eventos`, 'red');
    log(`      • onco_comite_sesiones`, 'red');
    log(`      • onco_comite_casos`, 'red');

    // Guardar reporte
    const report = {
      timestamp: new Date().toISOString(),
      total: collections.length,
      collections: collections,
      classification: {
        ugco: ugco.map(c => ({ name: c.name, title: c.title })),
        system: system.map(c => ({ name: c.name, title: c.title })),
        other: other.map(c => ({ name: c.name, title: c.title }))
      }
    };

    const reportPath = path.join(__dirname, '../temp-collections-full.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    log(`\n✓ Reporte completo guardado en: ${reportPath}`, 'green');

    log('\n');

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

main();
