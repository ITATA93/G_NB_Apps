/**
 * Script de Seed de Datos de Referencia - [NOMBRE_APP]
 *
 * Carga datos de referencia (catálogos, maestros) desde archivos JSON.
 *
 * Uso:
 *   node scripts/seed/seed-references.ts
 *   node scripts/seed/seed-references.ts --only ref_especialidades
 *   node scripts/seed/seed-references.ts --force
 */

import { ApiClient } from '../utils/ApiClient';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface ReferenceData {
  collection: string;
  file: string;
  description: string;
}

/**
 * Configuración de datos de referencia a cargar
 * TODO: Actualizar con las referencias reales de la aplicación
 */
const REFERENCES: ReferenceData[] = [
  // Ejemplo:
  // {
  //   collection: 'ref_especialidades',
  //   file: 'BD/diccionarios/especialidades.json',
  //   description: 'Especialidades médicas'
  // },
  // {
  //   collection: 'ref_cie10',
  //   file: 'BD/diccionarios/codigos_cie10.json',
  //   description: 'Códigos CIE-10 de diagnósticos'
  // }
];

/**
 * Lee archivo JSON de datos
 */
function readDataFile(filePath: string): any[] {
  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo no encontrado: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Carga datos de una referencia
 */
async function seedReference(client: ApiClient, ref: ReferenceData, force: boolean = false) {
  console.log(`\n📦 Cargando ${ref.description} (${ref.collection})`);

  try {
    // Leer datos del archivo
    console.log(`  📄 Leyendo ${ref.file}...`);
    const data = readDataFile(ref.file);
    console.log(`  ✅ ${data.length} registros leídos`);

    // Verificar si la colección existe
    const exists = await client.collectionExists(ref.collection);
    if (!exists) {
      console.error(`  ❌ Colección ${ref.collection} no existe. Ejecutar configure primero.`);
      throw new Error(`Collection ${ref.collection} not found`);
    }

    // Si force, eliminar datos existentes
    if (force) {
      console.log(`  🗑️  Eliminando datos existentes (--force)...`);
      // TODO: Implementar eliminación
      // await client.deleteAll(ref.collection);
    }

    // Cargar datos
    console.log(`  ⬆️  Cargando ${data.length} registros...`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const record of data) {
      try {
        // TODO: Implementar lógica de upsert (crear o actualizar)
        // Si el registro ya existe (por código), actualizar
        // Si no existe, crear

        // await client.upsert(ref.collection, record, { uniqueField: 'codigo' });

        successCount++;
      } catch (error) {
        if (error.message.includes('duplicate')) {
          skipCount++;
        } else {
          errorCount++;
          console.error(`  ⚠️  Error en registro:`, record.codigo || record.id, '-', error.message);
        }
      }
    }

    console.log(`  ✅ Carga completada: ${successCount} creados, ${skipCount} existentes, ${errorCount} errores`);
  } catch (error) {
    console.error(`  ❌ Error cargando ${ref.collection}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando carga de datos de referencia para [NOMBRE_APP]\n');

  // Parsear argumentos
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyArg = args.find(arg => arg.startsWith('--only='));
  const onlyCollection = onlyArg ? onlyArg.split('=')[1] : null;

  if (force) {
    console.log('⚠️  Modo FORCE: Los datos existentes serán eliminados\n');
  }

  // Inicializar cliente API
  const client = new ApiClient();

  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión a NocoBase...');
    await client.testConnection();
    console.log('✅ Conexión exitosa\n');

    // Filtrar referencias si se especificó una
    let referencesToLoad = REFERENCES;
    if (onlyCollection) {
      referencesToLoad = REFERENCES.filter(r => r.collection === onlyCollection);
      if (referencesToLoad.length === 0) {
        console.error(`❌ Referencia "${onlyCollection}" no encontrada en configuración`);
        process.exit(1);
      }
      console.log(`📌 Cargando solo: ${onlyCollection}\n`);
    }

    // Cargar cada referencia en orden
    for (const ref of referencesToLoad) {
      await seedReference(client, ref, force);
    }

    console.log('\n✅ Carga de referencias completada exitosamente');
    console.log(`📊 Total de referencias procesadas: ${referencesToLoad.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la carga:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main();
}

export { seedReference, REFERENCES };
