/**
 * Script de Listado de Colecciones - [NOMBRE_APP]
 *
 * Lista todas las colecciones de la aplicación con información básica.
 *
 * Uso:
 *   node scripts/inspect/list-collections.ts
 *   node scripts/inspect/list-collections.ts --json
 */

import { ApiClient } from '../utils/ApiClient';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Parsear argumentos
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');

  if (!jsonOutput) {
    console.log('📋 Listando colecciones de [NOMBRE_APP]\n');
  }

  // Inicializar cliente API
  const client = new ApiClient();

  try {
    // Obtener lista de colecciones
    const collections = await client.listCollections();

    if (jsonOutput) {
      // Salida JSON
      console.log(JSON.stringify(collections, null, 2));
    } else {
      // Salida formateada para humanos
      if (collections.length === 0) {
        console.log('❌ No se encontraron colecciones');
        console.log('\n💡 Ejecutar primero: node scripts/configure/configure.ts');
      } else {
        console.log(`Total de colecciones: ${collections.length}\n`);

        // Categorizar colecciones
        const ownCollections = collections.filter(c => !c.name.startsWith('ref_') && !c.name.startsWith('alma_'));
        const refCollections = collections.filter(c => c.name.startsWith('ref_'));
        const almaCollections = collections.filter(c => c.name.startsWith('alma_'));

        if (ownCollections.length > 0) {
          console.log('📊 Colecciones Propias (Read/Write):');
          ownCollections.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.name}`);
            console.log(`     └─ Título: ${col.title || 'N/A'}`);
            console.log(`     └─ Campos: ${col.fields?.length || 0}`);
          });
          console.log('');
        }

        if (refCollections.length > 0) {
          console.log('📚 Colecciones de Referencia:');
          refCollections.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.name}`);
            console.log(`     └─ Título: ${col.title || 'N/A'}`);
          });
          console.log('');
        }

        if (almaCollections.length > 0) {
          console.log('🏥 Colecciones Integradas (ALMA - Read-Only):');
          almaCollections.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.name}`);
            console.log(`     └─ Título: ${col.title || 'N/A'}`);
          });
          console.log('');
        }

        // Resumen
        console.log('─────────────────────────────────────');
        console.log(`Propias:      ${ownCollections.length}`);
        console.log(`Referencias:  ${refCollections.length}`);
        console.log(`Integradas:   ${almaCollections.length}`);
        console.log(`─────────────────────────────────────`);
        console.log(`Total:        ${collections.length}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listando colecciones:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main();
}
