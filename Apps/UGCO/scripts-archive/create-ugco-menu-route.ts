/**
 * create-ugco-menu-route.ts - Crear UGCO como ruta válida en el menú
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
    log('║  CREAR UGCO COMO RUTA EN EL MENÚ PRINCIPAL                        ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Primero limpiar schemas UGCO huérfanos
    log('\n1. Limpiando schemas UGCO anteriores...', 'gray');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=1000');
        const schemas = res.data?.data || [];

        const ugcoSchemas = schemas.filter((s: any) => {
            const uid = (s['x-uid'] || '').toLowerCase();
            return uid.includes('ugco');
        });

        for (const s of ugcoSchemas) {
            try {
                await client.post(`/uiSchemas:remove/${s['x-uid']}`);
                log(`   Eliminado: ${s['x-uid']}`, 'gray');
            } catch (e: any) {
                // Ignorar
            }
        }
        log(`   [OK] Limpieza completada`, 'green');
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 2. Crear UGCO en nocobase-admin-menu con estructura completa
    log('\n2. Creando UGCO en nocobase-admin-menu...', 'gray');

    const menuUid = generateUid();
    const pageUid = generateUid();

    // Schema exacto como lo crea NocoBase UI
    const ugcoMenuSchema = {
        'x-uid': menuUid,
        _isJSONSchemaObject: true,
        version: '2.0',
        type: 'void',
        title: 'UGCO',
        'x-component': 'Menu.Item',
        'x-decorator': 'ACLMenuItemProvider',
        'x-component-props': {},
        'x-server-hooks': [
            {
                type: 'onSelfCreate',
                method: 'bindMenuToRole',
            },
        ],
        properties: {
            page: {
                'x-uid': pageUid,
                _isJSONSchemaObject: true,
                version: '2.0',
                type: 'void',
                'x-component': 'Page',
                'x-async': true,
                'x-component-props': {},
                properties: {},
            },
        },
    };

    try {
        await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: ugcoMenuSchema,
            wrap: null,
        });
        log(`   [OK] Menú UGCO creado: ${menuUid}`, 'green');
        log(`   [OK] Página UGCO creada: ${pageUid}`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 3. Verificar
    log('\n3. Verificando estructura...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        log(`   Items en menú:`, 'green');
        for (const [key, val] of Object.entries(menu?.properties || {}) as any) {
            log(`     - ${val.title || key} [${val['x-uid']}]`, 'gray');

            // Ver si tiene página
            if (val.properties?.page) {
                log(`       └─ Page: ${val.properties.page['x-uid']}`, 'gray');
            }
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 4. Asignar permisos
    log('\n4. Asignando permisos...', 'gray');
    try {
        for (const role of ['root', 'admin', 'member']) {
            const res = await client.get(`/roles:get?filterByTk=${role}&appends=menuUiSchemas`);
            const current = res.data?.data?.menuUiSchemas || [];
            const uids = current.map((m: any) => m['x-uid']);

            if (!uids.includes(menuUid)) {
                uids.push(menuUid);
            }

            await client.post(`/roles:update?filterByTk=${role}`, {
                menuUiSchemas: uids,
            });
            log(`   [OK] ${role}`, 'green');
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Prueba ahora:', 'yellow');
    log(`  https://mira.hospitaldeovalle.cl/admin/${pageUid}`, 'green');
    log('', 'cyan');
    log('  O refresca NocoBase y busca UGCO en el menú', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
