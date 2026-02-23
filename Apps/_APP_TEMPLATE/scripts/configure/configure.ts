/**
 * Script de Configuración de Colecciones - [NOMBRE_APP]
 *
 * Este script crea y configura todas las colecciones de la aplicación en NocoBase.
 *
 * Uso:
 *   node scripts/configure/configure.ts
 *   node scripts/configure/configure.ts --dry-run
 *   node scripts/configure/configure.ts --collection nombre_coleccion
 */

import { ApiClient } from '../utils/ApiClient';
import dotenv from 'dotenv';

dotenv.config();

interface CollectionConfig {
  name: string;
  title: string;
  fields: any[];
  indexes?: any[];
  associations?: any[];
}

/**
 * Configuraciones de colecciones
 * TODO: Definir configuraciones reales basadas en el modelo de datos
 */
const COLLECTIONS: CollectionConfig[] = [
  // Ejemplo:
  // {
  //   name: 'casos_oncologicos',
  //   title: 'Casos Oncológicos',
  //   fields: [
  //     { name: 'id', type: 'bigInteger', primaryKey: true, autoIncrement: true },
  //     { name: 'numero_caso', type: 'string', unique: true, allowNull: false },
  //     { name: 'fecha_ingreso', type: 'date', allowNull: false },
  //     // ... más campos
  //   ],
  //   indexes: [
  //     { fields: ['numero_caso'], unique: true },
  //     { fields: ['fecha_ingreso'] }
  //   ]
  // }
];

async function configureCollection(client: ApiClient, config: CollectionConfig, dryRun: boolean = false) {
  console.log(`\n📋 Configurando colección: ${config.name}`);

  if (dryRun) {
    console.log('  [DRY-RUN] Se crearían:', config.fields.length, 'campos');
    return;
  }

  try {
    // Verificar si la colección ya existe
    const exists = await client.collectionExists(config.name);

    if (exists) {
      console.log(`  ⚠️  Colección ${config.name} ya existe. Actualizando...`);
      // TODO: Implementar lógica de actualización
    } else {
      console.log(`  ✨ Creando colección ${config.name}...`);
      // TODO: Implementar creación de colección
      // await client.createCollection(config);
    }

    console.log(`  ✅ Colección ${config.name} configurada correctamente`);
  } catch (error) {
    console.error(`  ❌ Error configurando ${config.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando configuración de colecciones para [NOMBRE_APP]\n');

  // Parsear argumentos
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const collectionArg = args.find(arg => arg.startsWith('--collection='));
  const specificCollection = collectionArg ? collectionArg.split('=')[1] : null;

  if (dryRun) {
    console.log('⚠️  Modo DRY-RUN: No se realizarán cambios\n');
  }

  // Inicializar cliente API
  const client = new ApiClient();

  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión a NocoBase...');
    await client.testConnection();
    console.log('✅ Conexión exitosa\n');

    // Filtrar colecciones si se especificó una
    let collectionsToProcess = COLLECTIONS;
    if (specificCollection) {
      collectionsToProcess = COLLECTIONS.filter(c => c.name === specificCollection);
      if (collectionsToProcess.length === 0) {
        console.error(`❌ Colección "${specificCollection}" no encontrada en configuración`);
        process.exit(1);
      }
      console.log(`📌 Configurando solo: ${specificCollection}\n`);
    }

    // Configurar cada colección
    for (const config of collectionsToProcess) {
      await configureCollection(client, config, dryRun);
    }

    console.log('\n✅ Configuración completada exitosamente');
    console.log(`📊 Total de colecciones procesadas: ${collectionsToProcess.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main();
}

export { configureCollection, COLLECTIONS };
