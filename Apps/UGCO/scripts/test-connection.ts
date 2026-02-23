import { createClient, log } from '../../../shared/scripts/ApiClient';
import chalk from 'chalk';

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║           MIRA - PRUEBA DE CONEXIÓN (TypeScript)           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    try {
        const client = createClient();
        const axiosClient = client.getClient();

        log(`📡 Conectando a: ${axiosClient.defaults.baseURL}`, 'yellow');

        // 1. Probar endpoint de colecciones
        log('\n1. Probando endpoint /api/collections...', 'yellow');
        const collections = await client.get('/collections', { pageSize: 1 });

        if (collections && collections.data) {
            log(`✅ Conexión exitosa!`, 'green');
            log(`ℹ️  Total colecciones: ${collections.meta?.count || 'N/A'}`, 'white');
        } else {
            log('⚠️  Respuesta inesperada (sin data)', 'red');
        }

        // 2. Probar endpoint de autenticación (check)
        log('\n2. Verificando autenticación...', 'yellow');
        const auth = await client.get('/auth:check');

        if (auth && auth.data) {
            log(`✅ Autenticado como: ${auth.data.nickname || auth.data.username}`, 'green');
            log(`ℹ️  Rol: ${auth.data.roles?.[0]?.name || 'N/A'}`, 'white');
        }

    } catch (error: any) {
        log('\n❌ ERROR DE CONEXIÓN:', 'red');
        if (error.response) {
            log(`Status: ${error.response.status}`, 'red');
            log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        } else {
            log(error.message, 'red');
        }
        process.exit(1);
    }
}

main();
