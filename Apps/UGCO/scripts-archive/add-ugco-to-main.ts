/**
 * add-ugco-to-main.ts - Agregar UGCO al menú principal junto con INICIO
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
    log('║  AGREGAR UGCO AL MENÚ PRINCIPAL (JUNTO CON INICIO)                ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Primero encontrar el parent de INICIO para entender la estructura
    log('\n1. Buscando estructura de INICIO...', 'gray');

    // Obtener el schema completo de INICIO
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/1o5y8dftms0');
        const inicio = res.data?.data;
        console.log('   INICIO schema:');
        console.log('     x-uid:', inicio['x-uid']);
        console.log('     x-component:', inicio['x-component']);
        console.log('     title:', inicio.title);
        console.log('     x-async:', inicio['x-async']);
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 2. Buscar todos los schemas que son Page para encontrar el patrón
    log('\n2. Buscando todas las páginas...', 'gray');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const pages = schemas.filter((s: any) => s['x-component'] === 'Page');
        console.log(`   Páginas encontradas: ${pages.length}`);
        for (const p of pages) {
            console.log(`     - ${p['x-uid']}: "${p.title || '(sin título)'}"`);
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 3. Buscar el parent del schema INICIO usando getParentPath
    log('\n3. Buscando path de INICIO...', 'gray');
    try {
        const res = await client.get('/uiSchemas:getParentPath/1o5y8dftms0');
        console.log('   Parent path:', JSON.stringify(res.data?.data));
    } catch (e: any) {
        log(`   Error: ${e.response?.status}`, 'yellow');
    }

    // 4. Intentar insertar UGCO como hermano de INICIO
    log('\n4. Insertando UGCO junto a INICIO...', 'gray');

    const ugcoPageSchema = {
        type: 'void',
        title: 'UGCO',
        'x-component': 'Page',
        'x-component-props': {
            enablePageTabs: true,
        },
        'x-uid': 'ugco-main-page',
        'x-async': true,
        properties: {},
    };

    // Método 1: Insertar después de INICIO
    try {
        await client.post('/uiSchemas:insertAdjacent/1o5y8dftms0?position=afterEnd', {
            schema: ugcoPageSchema,
        });
        log('   [OK] UGCO insertado después de INICIO', 'green');
    } catch (e: any) {
        const msg = e.response?.data?.errors?.[0]?.message || e.message;
        log(`   [ERROR] Método 1: ${msg}`, 'red');

        // Método 2: Buscar el contenedor y agregar ahí
        log('\n   Intentando método alternativo...', 'yellow');
        try {
            // Buscar schemas que contengan a INICIO
            const res = await client.get('/uiSchemas:list?pageSize=500');
            const schemas = res.data?.data || [];

            // Encontrar schemas que podrían ser contenedores
            const containers = schemas.filter((s: any) => {
                const component = s['x-component'] || '';
                return component.includes('Tabs') || component.includes('Menu') || component.includes('Grid');
            });

            console.log('   Posibles contenedores:');
            for (const c of containers.slice(0, 10)) {
                console.log(`     - ${c['x-uid']}: ${c['x-component']}`);
            }
        } catch (e2: any) {
            log(`   Error: ${e2.message}`, 'red');
        }
    }

    // 5. Ver la estructura actual del desktop/admin
    log('\n5. Explorando estructura de desktop...', 'gray');
    try {
        // Buscar schemas relacionados con desktop, admin, root
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const relevant = schemas.filter((s: any) => {
            const uid = (s['x-uid'] || '').toLowerCase();
            return uid.includes('desktop') || uid.includes('admin') || uid.includes('root') || uid.includes('layout');
        });

        console.log('   Schemas relevantes:');
        for (const s of relevant) {
            console.log(`     - ${s['x-uid']}: ${s['x-component'] || s.title}`);
        }

        // Ver nocobase-admin-menu de nuevo
        const menuRes = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = menuRes.data?.data;
        console.log('\n   nocobase-admin-menu props:', JSON.stringify(menu['x-component-props'], null, 2));
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Nota: La página INICIO está fuera del nocobase-admin-menu', 'yellow');
    log('  Puede estar en otra estructura de la app principal', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
