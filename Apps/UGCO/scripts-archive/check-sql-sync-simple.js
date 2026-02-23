#!/usr/bin/env node

/**
 * Script simplificado para verificar sincronización SQL
 */

const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  Verificación de Sincronización SQL                        ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  const client = createClient();

  // Obtener fuentes de datos con detalles completos
  log('📊 Consultando fuentes de datos...', 'cyan');
  const response = await client.get('/dataSources:list?paginate=false');

  if (response.status !== 200) {
    log('✗ Error obteniendo fuentes de datos', 'red');
    return;
  }

  const dataSources = response.data.data || [];
  const mssqlSource = dataSources.find(ds => ds.type === 'mssql');

  if (!mssqlSource) {
    log('⚠️  No se encontró fuente MSSQL', 'yellow');
    return;
  }

  log(`\n🗄️  Fuente de datos SQL: ${mssqlSource.key}`, 'bright');
  log(`═══════════════════════════════════════════════════════════\n`, 'bright');

  log(`Host: ${mssqlSource.options?.host || 'N/A'}`, 'cyan');
  log(`Puerto: ${mssqlSource.options?.port || 'N/A'}`, 'cyan');
  log(`Database: ${mssqlSource.options?.database || 'N/A'}`, 'cyan');
  log(`Usuario: ${mssqlSource.options?.username || 'N/A'}`, 'cyan');
  log(`Status: ${mssqlSource.status}`, mssqlSource.status === 'loaded' ? 'green' : 'yellow');

  // Ver opciones de sincronización
  log(`\n🔍 Configuración de conexión:`, 'bright');

  if (mssqlSource.options) {
    // Mostrar todas las opciones (excepto contraseña)
    const opts = { ...mssqlSource.options };
    delete opts.password;

    Object.keys(opts).forEach(key => {
      if (key.toLowerCase().includes('sync') ||
        key.toLowerCase().includes('refresh') ||
        key.toLowerCase().includes('poll') ||
        key.toLowerCase().includes('interval')) {
        log(`   ${key}: ${opts[key]}`, 'yellow');
      }
    });
  }

  log(`\n📋 Colecciones sincronizadas: ${mssqlSource.collections?.length || 0}`, 'cyan');

  if (mssqlSource.collections && mssqlSource.collections.length > 0) {
    mssqlSource.collections.forEach((col, idx) => {
      log(`   ${idx + 1}. ${col}`, 'yellow');
    });
  }

  // Conclusión
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  RESPUESTA A TU PREGUNTA                                   ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  log('❓ ¿Se actualizarán solas?', 'bright');
  log('', '');
  log('📌 Respuesta corta:', 'cyan');
  log('   En NocoBase, las tablas SQL externas normalmente NO se actualizan', 'yellow');
  log('   automáticamente en tiempo real. Hay varias formas de sincronización:', 'yellow');
  log('', '');
  log('🔄 Opciones de sincronización:', 'cyan');
  log('', '');
  log('   1️⃣  MANUAL (más común):', 'bright');
  log('      • Vas a la UI de NocoBase', 'yellow');
  log('      • Data sources > d_llw3u3ya2ej', 'yellow');
  log('      • Click en "Sync" o "Refresh"', 'yellow');
  log('      • ❌ NO es automático', 'red');
  log('', '');
  log('   2️⃣  PROGRAMADA (plugin adicional):', 'bright');
  log('      • Configurar cron job o tarea programada', 'yellow');
  log('      • Sincronización cada X minutos/horas', 'yellow');
  log('      • ✅ Automático pero con retraso', 'green');
  log('', '');
  log('   3️⃣  TIEMPO REAL (avanzado):', 'bright');
  log('      • Triggers en SQL Server', 'yellow');
  log('      • Change Data Capture (CDC)', 'yellow');
  log('      • Webhooks o eventos', 'yellow');
  log('      • ✅ Automático y en tiempo real', 'green');
  log('      • ⚠️  Requiere configuración compleja', 'red');
  log('', '');
  log('💡 Para UGCO (ALMA/TrakCare):', 'bright');
  log('', '');
  log('   Opción recomendada: MANUAL o PROGRAMADA', 'cyan');
  log('', '');
  log('   Razones:', 'yellow');
  log('   • ALMA es sistema de solo lectura para UGCO', 'yellow');
  log('   • Los datos de pacientes no cambian cada segundo', 'yellow');
  log('   • Sincronización cada 15-30 min es suficiente', 'yellow');
  log('   • Más simple y menos carga en el servidor SQL', 'yellow');
  log('', '');
  log('🎯 Próximo paso sugerido:', 'bright');
  log('', '');
  log('   1. Verificar en la UI si existe opción de auto-sync', 'cyan');
  log('   2. O crear script de sincronización programada', 'cyan');
  log('   3. Configurarlo para correr cada 15-30 minutos', 'cyan');
  log('', '');

  log('');
}

main().catch(error => {
  log(`\n✗ Error: ${error.message}`, 'red');
  console.error(error);
});
