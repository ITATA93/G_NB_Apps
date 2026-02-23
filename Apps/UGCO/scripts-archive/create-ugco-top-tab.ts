/**
 * create-ugco-top-tab.ts - Crear pestaña UGCO en menú superior
 *
 * En modo "mix", los items de primer nivel van al menú superior
 * y sus hijos van al menú lateral.
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
    return Math.random().toString(36).substring(2, 10);
}

const ESPECIALIDADES = [
    { id: 'digestivo_alto', nombre: 'Digestivo Alto', icono: '🔶' },
    { id: 'digestivo_bajo', nombre: 'Digestivo Bajo', icono: '🟤' },
    { id: 'mama', nombre: 'Mama', icono: '🩷' },
    { id: 'ginecologia', nombre: 'Ginecología', icono: '💜' },
    { id: 'urologia', nombre: 'Urología', icono: '💙' },
    { id: 'torax', nombre: 'Tórax', icono: '🫁' },
    { id: 'piel', nombre: 'Piel y Partes Blandas', icono: '💛' },
    { id: 'endocrinologia', nombre: 'Endocrinología', icono: '💚' },
    { id: 'hematologia', nombre: 'Hematología', icono: '❤️' },
];

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  CREAR PESTAÑA UGCO EN MENÚ SUPERIOR                              ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Primero, eliminar el menú UGCO existente para recrearlo limpio
    log('\n1. Eliminando menú UGCO anterior...', 'gray');
    try {
        await client.post('/uiSchemas:remove/ugco-menu-9nb8qc3jsv');
        log('   [OK] Menú anterior eliminado', 'green');
    } catch (e: any) {
        log('   [--] No existía o ya fue eliminado', 'yellow');
    }

    // 2. Crear la estructura del menú UGCO como item principal (aparecerá en top)
    log('\n2. Creando pestaña UGCO en menú superior...', 'gray');

    const ugcoTopUid = `ugco-${generateUid()}`;

    // Schema para pestaña en menú superior con página y sub-items
    const ugcoSchema = {
        type: 'void',
        title: '🏥 UGCO',
        'x-component': 'Menu.Item',
        'x-decorator': 'ACLMenuItemProvider',
        'x-component-props': {
            icon: 'MedicineBoxOutlined',
        },
        'x-uid': ugcoTopUid,
        'x-async': false,
        properties: {
            page: {
                type: 'void',
                'x-component': 'Page',
                'x-component-props': {
                    enablePageTabs: true,
                },
                'x-uid': `ugco-page-${generateUid()}`,
                'x-async': true,
                properties: {},
            },
        },
    };

    try {
        await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: ugcoSchema,
        });
        log(`   [OK] Pestaña UGCO creada: ${ugcoTopUid}`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 3. Verificar resultado
    log('\n3. Verificando estructura del menú...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        const items = Object.keys(menu?.properties || {});

        log(`   Items en menú principal: ${items.length}`, 'green');
        for (const key of items) {
            const item = menu.properties[key];
            log(`     - ${item.title || key}`, 'gray');
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 4. Asignar a todos los roles
    log('\n4. Asignando permisos a todos los roles...', 'gray');
    const roles = ['root', 'admin', 'member'];

    for (const role of roles) {
        try {
            const res = await client.get(`/roles:get?filterByTk=${role}&appends=menuUiSchemas`);
            const currentMenus = res.data?.data?.menuUiSchemas || [];
            const uids = currentMenus.map((m: any) => m['x-uid']);

            if (!uids.includes(ugcoTopUid)) {
                uids.push(ugcoTopUid);
            }

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
    log('  LISTO! Ahora:', 'green');
    log('  1. Refresca NocoBase (F5)', 'gray');
    log('  2. Deberías ver "🏥 UGCO" en el menú superior', 'gray');
    log('  3. Usa UI Editor para agregar bloques a la página', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
