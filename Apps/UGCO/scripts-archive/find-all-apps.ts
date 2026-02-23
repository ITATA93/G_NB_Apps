/**
 * find-all-apps.ts - Buscar RECA, ALMA, BUHO en el sistema
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== BUSCANDO RECA, ALMA, BUHO ===\n');

    // 1. Buscar en schemas
    console.log('1. Buscando en uiSchemas...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=1000');
        const schemas = res.data?.data || [];

        const keywords = ['RECA', 'ALMA', 'BUHO', 'UGCO'];
        for (const kw of keywords) {
            const found = schemas.filter((s: any) => {
                const title = (s.title || '').toUpperCase();
                const uid = (s['x-uid'] || '').toUpperCase();
                const name = (s.name || '').toUpperCase();
                return title.includes(kw) || uid.includes(kw) || name.includes(kw);
            });

            console.log(`\n   ${kw}: ${found.length} schemas`);
            for (const s of found.slice(0, 5)) {
                console.log(`     - ${s['x-uid']}: "${s.title || s.name}" [${s['x-component']}]`);
            }
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 2. Buscar en applications
    console.log('\n\n2. Buscando en applications...');
    try {
        const res = await client.get('/applications:list');
        const apps = res.data?.data || [];

        console.log(`   Total apps: ${apps.length}`);
        for (const app of apps) {
            console.log(`\n   === ${app.name} ===`);
            console.log(`     displayName: ${app.displayName || app.title}`);
            console.log(`     status: ${app.status}`);
            console.log(`     cname: ${app.cname || 'N/A'}`);
            console.log(`     options: ${JSON.stringify(app.options || {})}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 3. Ver systemSettings
    console.log('\n\n3. System Settings...');
    try {
        const res = await client.get('/systemSettings:get');
        const settings = res.data?.data;
        console.log(`   title: ${settings?.title}`);
        console.log(`   options: ${JSON.stringify(settings?.options || {})}`);
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 4. Buscar en el menú principal por apps
    console.log('\n\n4. Buscando menú de apps...');
    const possibleMenuUids = [
        'nocobase-applications-menu',
        'applications-menu',
        'app-menu',
        'main-menu',
        'top-menu',
    ];

    for (const uid of possibleMenuUids) {
        try {
            const res = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
            console.log(`   [ENCONTRADO] ${uid}`);
            console.log(`     ${JSON.stringify(res.data?.data, null, 2).slice(0, 500)}`);
        } catch (e: any) {
            // No mostrar errores
        }
    }

    // 5. Listar todas las colecciones para ver si hay una de apps/menus
    console.log('\n\n5. Buscando colecciones relacionadas...');
    try {
        const res = await client.get('/collections:list');
        const collections = res.data?.data || [];

        const relevant = collections.filter((c: any) => {
            const name = (c.name || '').toLowerCase();
            return name.includes('app') || name.includes('menu') || name.includes('route');
        });

        console.log(`   Colecciones relevantes: ${relevant.length}`);
        for (const c of relevant) {
            console.log(`     - ${c.name}: ${c.title || ''}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }
}

main().catch(console.error);
