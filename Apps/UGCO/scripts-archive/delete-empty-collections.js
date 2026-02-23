#!/usr/bin/env node

/**
 * Script para eliminar colecciones vacías de NocoBase
 * Hospital de Ovalle - UGCO
 *
 * ADVERTENCIA: Este script eliminará permanentemente las colecciones.
 */

const { createClient, log } = require('../../shared/scripts/_base-api-client');
const readline = require('readline');

// Colecciones a eliminar (las 5 vacías de UGCO)
const COLLECTIONS_TO_DELETE = [
  { name: 't_fcwwwzv1d9m', title: 'Episodio Oncologico' },
  { name: 't_y8hbbtkjgl3', title: 'Oncologia' },
  { name: 't_uralzvq4vg1', title: 'Pacientes_Hospitalizados' },
  { name: 't_6xbh17pki1d', title: 'Pacientes' },
  { name: 't_pkg68r6rprd', title: 'Comite Oncologico' }
];

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.toLowerCase().trim();
      resolve(normalized === 's' || normalized === 'si' || normalized === 'y' || normalized === 'yes');
    });
  });
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  Eliminar Colecciones Vacías - NocoBase UGCO              ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  const client = createClient();

  // Verificar conexión
  log('🔍 Verificando conexión...', 'cyan');
  const connected = await client.testConnection();

  if (!connected) {
    log('✗ No se pudo conectar a NocoBase', 'red');
    log('  Verifica que la API esté disponible y el token sea válido\n', 'yellow');
    return;
  }

  log('✓ Conexión exitosa\n', 'green');

  // Mostrar colecciones a eliminar
  log('⚠️  ADVERTENCIA: Se eliminarán las siguientes colecciones:', 'red');
  log('═══════════════════════════════════════════════════════════', 'red');

  COLLECTIONS_TO_DELETE.forEach((col, idx) => {
    log(`\n${idx + 1}. ${col.name}`, 'yellow');
    log(`   Título: ${col.title}`, 'yellow');
    log(`   Campos: 0 (vacía)`, 'yellow');
  });

  log('\n═══════════════════════════════════════════════════════════', 'red');
  log('\n⚠️  Esta acción NO se puede deshacer', 'red');
  log('⚠️  Las colecciones serán eliminadas permanentemente\n', 'red');

  // Pedir confirmación
  const confirm = await askConfirmation('¿Estás SEGURO de que quieres eliminar estas colecciones? (s/n): ');

  if (!confirm) {
    log('\n✗ Operación cancelada por el usuario', 'yellow');
    log('  No se realizaron cambios\n', 'yellow');
    return;
  }

  log('\n🔄 Iniciando eliminación de colecciones...\n', 'cyan');

  const results = {
    deleted: [],
    failed: [],
    errors: []
  };

  // Eliminar cada colección
  for (let i = 0; i < COLLECTIONS_TO_DELETE.length; i++) {
    const col = COLLECTIONS_TO_DELETE[i];

    log(`[${i + 1}/${COLLECTIONS_TO_DELETE.length}] Eliminando: ${col.name} (${col.title})`, 'cyan');

    try {
      // Verificar que existe antes de eliminar
      const exists = await client.getCollectionSchema(col.name);

      if (!exists) {
        log(`  ℹ  La colección ya no existe`, 'yellow');
        continue;
      }

      // Eliminar
      await client.deleteCollection(col.name);

      log(`  ✓ Eliminada exitosamente`, 'green');
      results.deleted.push(col);

    } catch (error) {
      log(`  ✗ Error: ${error.message}`, 'red');
      results.failed.push(col);
      results.errors.push({
        collection: col.name,
        error: error.message
      });
    }
  }

  // Resumen
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  RESUMEN                                                   ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');

  log(`\n📊 Resultados:`);
  log(`   ✓ Eliminadas: ${results.deleted.length}`, results.deleted.length > 0 ? 'green' : 'reset');
  log(`   ✗ Fallidas: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'reset');

  if (results.deleted.length > 0) {
    log(`\n✓ Colecciones eliminadas:`, 'green');
    results.deleted.forEach(col => {
      log(`   • ${col.name} - "${col.title}"`, 'green');
    });
  }

  if (results.failed.length > 0) {
    log(`\n✗ Colecciones que no se pudieron eliminar:`, 'red');
    results.failed.forEach(col => {
      log(`   • ${col.name} - "${col.title}"`, 'red');
    });

    log(`\n💡 Errores detallados:`, 'yellow');
    results.errors.forEach(err => {
      log(`   • ${err.collection}: ${err.error}`, 'yellow');
    });
  }

  // Verificar estado final
  if (results.deleted.length > 0) {
    log('\n🔍 Verificando estado final...', 'cyan');

    try {
      const collections = await client.getCollections();
      const remaining = collections.filter(c =>
        COLLECTIONS_TO_DELETE.some(del => del.name === c.name)
      );

      if (remaining.length === 0) {
        log('✓ Todas las colecciones fueron eliminadas correctamente', 'green');
      } else {
        log(`⚠️  ${remaining.length} colección(es) aún existen:`, 'yellow');
        remaining.forEach(c => {
          log(`   • ${c.name}`, 'yellow');
        });
      }
    } catch (error) {
      log(`⚠️  No se pudo verificar el estado final: ${error.message}`, 'yellow');
    }
  }

  log('\n═══════════════════════════════════════════════════════════', 'bright');

  if (results.deleted.length === COLLECTIONS_TO_DELETE.length) {
    log('✅ OPERACIÓN COMPLETADA EXITOSAMENTE', 'green');
    log('\n💡 Próximos pasos:', 'cyan');
    log('   1. Crear las colecciones ALMA (alma_pacientes, alma_episodios, alma_diagnosticos)', 'cyan');
    log('   2. Crear las colecciones ONCO con nombres correctos (onco_*)', 'cyan');
    log('   3. Agregar campos a cada colección según el diccionario de datos\n', 'cyan');
  } else if (results.deleted.length > 0) {
    log('⚠️  OPERACIÓN COMPLETADA CON ERRORES', 'yellow');
    log('\n💡 Algunas colecciones no se pudieron eliminar.', 'yellow');
    log('   Revisa los errores arriba e intenta eliminarlas manualmente desde la UI.\n', 'yellow');
  } else {
    log('✗ OPERACIÓN FALLIDA', 'red');
    log('\n💡 Ninguna colección pudo ser eliminada.', 'yellow');
    log('   Opciones:', 'yellow');
    log('   1. Intenta eliminarlas manualmente desde la UI de NocoBase', 'cyan');
    log('   2. Verifica que tienes permisos suficientes (rol root)', 'cyan');
    log('   3. Contacta al administrador del sistema\n', 'cyan');
  }

  log('');
}

main().catch(error => {
  log(`\n✗ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
