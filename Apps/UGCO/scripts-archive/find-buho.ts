/**
 * find-buho.ts - Buscar menú BUHO y estructura de aplicaciones
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== BUSCANDO BUHO Y APLICACIONES ===\n');

    // 1. Buscar schemas con BUHO
    console.log('1. Buscando schemas con "BUHO"...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const buhoSchemas = schemas.filter((s: any) => {
            const title = (s.title || '').toUpperCase();
            const uid = (s['x-uid'] || '').toUpperCase();
            const name = (s.name || '').toUpperCase();
            return title.includes('BUHO') || uid.includes('BUHO') || name.includes('BUHO');
        });

        console.log(`   Schemas con BUHO: ${buhoSchemas.length}`);
        for (const s of buhoSchemas) {
            console.log(`     - ${s['x-uid']}: ${s.title || s.name || '(sin título)'}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 2. Listar aplicaciones de NocoBase
    console.log('\n2. Listando aplicaciones...');
    try {
        const res = await client.get('/applications:list');
        const apps = res.data?.data || [];

        console.log(`   Aplicaciones: ${apps.length}`);
        for (const app of apps) {
            console.log(`     - ${app.name}: ${app.displayName || app.title || '(sin nombre)'}`);
            console.log(`       status: ${app.status}, cname: ${app.cname || 'N/A'}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.response?.status} - ${e.message}`);
    }

    // 3. Ver información de la app actual
    console.log('\n3. Info de app actual...');
    try {
        const res = await client.get('/app:getInfo');
        const info = res.data?.data;
        console.log(`   Nombre: ${info?.name}`);
        console.log(`   Version: ${info?.version}`);
        console.log(`   Options: ${JSON.stringify(info?.options || {})}`);
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 4. Buscar todos los menús
    console.log('\n4. Buscando todos los menús en el sistema...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        // Filtrar schemas que son menús
        const menus = schemas.filter((s: any) => {
            const component = s['x-component'] || '';
            const uid = s['x-uid'] || '';
            return component === 'Menu' || uid.includes('menu') || uid.includes('Menu');
        });

        console.log(`   Menús encontrados: ${menus.length}`);
        for (const m of menus) {
            console.log(`     - ${m['x-uid']}: ${m.title || m['x-component']}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 5. Buscar la aplicación "main" o principal
    console.log('\n5. Buscando en aplicación main...');
    try {
        // Intentar obtener el schema del menú de la app main
        const res = await client.get('/applications:get?filterByTk=main&appends=options');
        const app = res.data?.data;
        console.log(`   App main: ${JSON.stringify(app, null, 2)}`);
    } catch (e: any) {
        console.log(`   Error: ${e.response?.status}`);
    }

    // 6. Buscar schemas con título que contenga letras mayúsculas (posibles menús principales)
    console.log('\n6. Schemas con títulos destacados...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const highlighted = schemas.filter((s: any) => {
            const title = s.title || '';
            // Buscar títulos en mayúsculas o con iconos
            return title === title.toUpperCase() && title.length > 2 && title.length < 20;
        });

        console.log(`   Títulos en mayúsculas:`);
        for (const s of highlighted.slice(0, 15)) {
            console.log(`     - ${s['x-uid']}: "${s.title}" [${s['x-component']}]`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }
}

main().catch(console.error);
