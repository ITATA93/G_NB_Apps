/**
 * add-ugco-menu-item.ts - Agregar UGCO como item del menú principal
 *
 * Similar a como está configurado INICIO pero como Menu.Item
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
    log('║  AGREGAR UGCO COMO ITEM DE MENÚ PRINCIPAL                         ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Limpiar schemas UGCO anteriores
    log('\n1. Limpiando schemas UGCO anteriores...', 'gray');
    const ugcoSchemas = [
        'ugco-aappr0k1',
        'ugco-root-menu',
    ];

    for (const uid of ugcoSchemas) {
        try {
            await client.post(`/uiSchemas:remove/${uid}`);
            log(`   [OK] Eliminado: ${uid}`, 'green');
        } catch (e: any) {
            // Ignorar si no existe
        }
    }

    // 2. Crear UGCO como Menu.Item simple (como está INICIO)
    log('\n2. Creando UGCO como Menu.Item...', 'gray');

    const ugcoUid = `ugco-${generateUid()}`;
    const pageUid = `ugco-page-${generateUid()}`;

    const ugcoMenuSchema = {
        type: 'void',
        title: 'UGCO',
        'x-component': 'Menu.Item',
        'x-decorator': 'ACLMenuItemProvider',
        'x-component-props': {
            icon: 'MedicineBoxOutlined',
        },
        'x-server-hooks': [
            {
                type: 'onSelfCreate',
                method: 'bindMenuToRole',
            },
        ],
        'x-uid': ugcoUid,
        'x-async': false,
        properties: {
            page: {
                type: 'void',
                title: 'UGCO',
                'x-component': 'Page',
                'x-component-props': {
                    enablePageTabs: true,
                },
                'x-uid': pageUid,
                'x-async': true,
            },
        },
    };

    try {
        await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: ugcoMenuSchema,
        });
        log(`   [OK] UGCO creado: ${ugcoUid}`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 3. Verificar estructura actual
    log('\n3. Verificando menú actual...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        const props = menu?.properties || {};

        log(`   Items en menú: ${Object.keys(props).length}`, 'green');
        for (const [key, val] of Object.entries(props) as any) {
            log(`     - ${val.title || key} [${val['x-component']}]`, 'gray');
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 4. Asignar permisos
    log('\n4. Asignando permisos...', 'gray');
    const roles = ['root', 'admin', 'member'];

    for (const role of roles) {
        try {
            // Obtener permisos actuales
            const res = await client.get(`/roles:get?filterByTk=${role}&appends=menuUiSchemas`);
            const current = res.data?.data?.menuUiSchemas || [];
            const uids = current.map((m: any) => m['x-uid']);

            // Agregar nuevo UID si no existe
            if (!uids.includes(ugcoUid)) {
                uids.push(ugcoUid);
            }

            // Actualizar
            await client.post(`/roles:update?filterByTk=${role}`, {
                menuUiSchemas: uids,
                allowNewMenu: true,
            });
            log(`   [OK] ${role}`, 'green');
        } catch (e: any) {
            log(`   [ERROR] ${role}: ${e.message}`, 'red');
        }
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Prueba ahora:', 'yellow');
    log('  1. Cierra sesión en NocoBase', 'gray');
    log('  2. Inicia sesión de nuevo', 'gray');
    log('  3. Busca "UGCO" en el menú', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    // 5. Mostrar URL de la app
    log('  Si no funciona, puede que necesites:', 'yellow');
    log('  - Ir a Settings > Roles & Permissions', 'gray');
    log('  - Seleccionar tu rol (root)', 'gray');
    log('  - En "Menu" habilitar UGCO', 'gray');
}

main().catch(console.error);
