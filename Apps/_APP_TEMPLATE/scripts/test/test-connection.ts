/**
 * Script de Test de Conexión - [NOMBRE_APP]
 *
 * Verifica la conexión a NocoBase API y valida configuración.
 *
 * Uso:
 *   node scripts/test/test-connection.ts
 */

import { ApiClient } from '../utils/ApiClient';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔍 Verificando configuración y conexión a NocoBase\n');

  // Verificar variables de entorno
  console.log('📋 Verificando variables de entorno...');

  const apiUrl = process.env.NOCOBASE_BASE_URL;
  const apiToken = process.env.NOCOBASE_API_KEY;

  if (!apiUrl) {
    console.error('❌ NOCOBASE_BASE_URL no está configurada en .env');
    process.exit(1);
  }
  console.log(`✅ NOCOBASE_BASE_URL: ${apiUrl}`);

  if (!apiToken) {
    console.error('❌ NOCOBASE_API_KEY no está configurada en .env');
    process.exit(1);
  }
  console.log(`✅ NOCOBASE_API_KEY: ${apiToken.substring(0, 10)}...`);

  // Inicializar cliente
  const client = new ApiClient();

  try {
    // Test de conexión
    console.log('\n🔌 Probando conexión a NocoBase API...');

    const testResult = await client.testConnection();

    if (testResult.success) {
      console.log('✅ Conexión exitosa');

      if (testResult.user) {
        console.log(`✅ Usuario autenticado: ${testResult.user.email || testResult.user.username}`);
        console.log(`✅ Rol: ${testResult.user.role || 'N/A'}`);
      }

      if (testResult.version) {
        console.log(`✅ Versión de NocoBase: ${testResult.version}`);
      }

      console.log('\n📊 Obteniendo información del sistema...');

      try {
        const collections = await client.listCollections();
        console.log(`✅ Colecciones disponibles: ${collections.length}`);
      } catch (error) {
        console.log(`⚠️  No se pudo obtener lista de colecciones: ${error.message}`);
      }

      console.log('\n✅ Todas las verificaciones pasaron correctamente');
      console.log('💡 El sistema está listo para ser usado');

      process.exit(0);
    } else {
      console.error('❌ La conexión falló');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error durante la prueba de conexión:');
    console.error(`   ${error.message}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }

    console.log('\n💡 Sugerencias:');
    console.log('   1. Verificar que NocoBase está corriendo');
    console.log('   2. Verificar que NOCOBASE_BASE_URL es correcta');
    console.log('   3. Verificar que NOCOBASE_API_KEY es válido');
    console.log('   4. Si el token expiró, re-autenticarse');

    process.exit(1);
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main();
}
