/**
 * create-top-menu-tab.ts - Crear pestaña UGCO en el menú superior de NocoBase
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

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  EXPLORAR ESTRUCTURA DE MENÚS EN NOCOBASE                         ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Buscar todos los schemas de tipo Menu
    log('\n1. Buscando schemas de menú...', 'gray');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=100');
        const schemas = res.data?.data || [];

        console.log(`   Total schemas: ${schemas.length}`);

        // Filtrar los que tienen "menu" en el uid o title
        const menuSchemas = schemas.filter((s: any) => {
            const uid = (s['x-uid'] || s.uid || '').toLowerCase();
            const title = (s.title || '').toLowerCase();
            return uid.includes('menu') || title.includes('menu') || s['x-component']?.includes('Menu');
        });

        console.log(`   Schemas de menú: ${menuSchemas.length}`);
        for (const m of menuSchemas) {
            console.log(`     - ${m['x-uid'] || m.uid}: ${m.title || m['x-component'] || 'sin título'}`);
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 2. Ver schema del admin-menu completo
    log('\n2. Estructura del nocobase-admin-menu...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        console.log(`   x-uid: ${menu['x-uid']}`);
        console.log(`   x-component: ${menu['x-component']}`);
        console.log(`   x-component-props:`, JSON.stringify(menu['x-component-props'] || {}));

        const props = menu.properties || {};
        console.log(`   Items directos: ${Object.keys(props).length}`);
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 3. Buscar páginas existentes como "INICIO"
    log('\n3. Buscando páginas existentes...', 'gray');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=200');
        const schemas = res.data?.data || [];

        // Buscar páginas (x-component = Page)
        const pages = schemas.filter((s: any) => s.title && s.title.length > 0);

        console.log(`   Páginas con título:`);
        for (const p of pages.slice(0, 20)) {
            console.log(`     - ${p['x-uid']}: "${p.title}" (${p['x-component'] || 'void'})`);
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 4. Ver estructura de una página existente (INICIO)
    log('\n4. Estructura de página INICIO...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/1o5y8dftms0');
        const page = res.data?.data;
        console.log(JSON.stringify(page, null, 2));
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 5. Buscar el parent de INICIO para entender cómo está vinculado al menú
    log('\n5. Buscando parent de INICIO...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getParentJsonSchema/1o5y8dftms0');
        const parent = res.data?.data;
        console.log(`   Parent x-uid: ${parent?.['x-uid']}`);
        console.log(`   Parent title: ${parent?.title}`);
        console.log(`   Parent component: ${parent?.['x-component']}`);
    } catch (e: any) {
        log(`   Error: ${e.response?.status} - ${e.response?.data?.errors?.[0]?.message || e.message}`, 'yellow');
    }
}

main().catch(console.error);
