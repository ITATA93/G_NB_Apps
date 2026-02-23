/**
 * insert-ugco-sibling.ts - Insertar UGCO como hermano de INICIO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'cyan') {
    console.log(colors[color](msg));
}

function generateUid() {
    return Math.random().toString(36).substring(2, 12);
}

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  INSERTAR UGCO COMO HERMANO DE INICIO                             ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    const inicioUid = '1o5y8dftms0';

    // 1. Ver la estructura actual de INICIO
    log('\n1. Estructura de INICIO...', 'gray');
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${inicioUid}`);
        const inicio = res.data?.data;
        log(`   title: ${inicio.title}`, 'green');
        log(`   x-component: ${inicio['x-component']}`, 'gray');
        log(`   x-async: ${inicio['x-async']}`, 'gray');
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 2. Crear schema de UGCO similar a INICIO
    log('\n2. Creando schema UGCO...', 'gray');

    const ugcoUid = `ugco-main-${generateUid()}`;

    const ugcoSchema = {
        name: ugcoUid,
        type: 'void',
        title: 'UGCO',
        'x-uid': ugcoUid,
        'x-component': 'Page',
        'x-component-props': {
            enablePageTabs: true,
        },
        'x-async': false,
    };

    // 3. Intentar insertar UGCO después de INICIO
    log('\n3. Insertando UGCO después de INICIO...', 'gray');

    try {
        // Método 1: insertAdjacent afterEnd
        await client.post(`/uiSchemas:insertAdjacent/${inicioUid}?position=afterEnd`, {
            schema: ugcoSchema,
        });
        log('   [OK] UGCO insertado con insertAdjacent', 'green');
    } catch (e: any) {
        log(`   [ERROR] insertAdjacent: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');

        // Método 2: insert simple
        log('\n   Intentando método alternativo...', 'yellow');
        try {
            await client.post('/uiSchemas:insert', ugcoSchema);
            log('   [OK] UGCO creado con insert', 'green');

            // Ahora mover al lado de INICIO
            log('   Moviendo UGCO junto a INICIO...', 'gray');
            try {
                await client.post(`/uiSchemas:insertAdjacent/${inicioUid}?position=afterEnd`, {
                    schema: { 'x-uid': ugcoUid },
                });
                log('   [OK] UGCO movido', 'green');
            } catch (e2: any) {
                log(`   [ERROR] No se pudo mover: ${e2.message}`, 'red');
            }
        } catch (e2: any) {
            log(`   [ERROR] insert: ${e2.response?.data?.errors?.[0]?.message || e2.message}`, 'red');
        }
    }

    // 4. Verificar resultado
    log('\n4. Verificando...', 'gray');
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${ugcoUid}`);
        if (res.data?.data) {
            log(`   [OK] UGCO existe: ${ugcoUid}`, 'green');
        }
    } catch (e: any) {
        log(`   [--] UGCO no encontrado`, 'yellow');
    }

    // 5. Mostrar URL esperada
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Si funcionó, prueba acceder a:', 'yellow');
    log(`  https://mira.hospitaldeovalle.cl/admin/${ugcoUid}`, 'white');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
