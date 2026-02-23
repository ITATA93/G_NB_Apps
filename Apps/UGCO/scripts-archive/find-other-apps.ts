/**
 * find-other-apps.ts - Buscar estructura de RECA, ALMA, BUHO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== BUSCANDO ESTRUCTURA DE OTRAS APPS ===\n');

    // 1. Listar TODAS las aplicaciones con todos sus campos
    console.log('1. Listando todas las aplicaciones...');
    try {
        const res = await client.get('/applications:list?pageSize=100&appends=*');
        const apps = res.data?.data || [];

        console.log(`   Total apps: ${apps.length}`);
        for (const app of apps) {
            console.log(`\n   ═══ ${app.name || app.displayName} ═══`);
            console.log(`   ${JSON.stringify(app, null, 2)}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 2. Buscar en todas las colecciones del sistema
    console.log('\n\n2. Listando TODAS las colecciones...');
    try {
        const res = await client.get('/collections:list?pageSize=200');
        const collections = res.data?.data || [];

        console.log(`   Total colecciones: ${collections.length}`);

        // Mostrar las que no empiezan con ugco
        const nonUgco = collections.filter((c: any) => {
            const name = (c.name || '').toLowerCase();
            return !name.includes('ugco') && !name.startsWith('_');
        });

        console.log(`\n   Colecciones principales (sin UGCO):`);
        for (const c of nonUgco.slice(0, 30)) {
            console.log(`     - ${c.name}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 3. Buscar schemas con nombres que podrían ser de otras apps
    console.log('\n\n3. Buscando schemas por patrones...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=1000');
        const schemas = res.data?.data || [];

        // Buscar schemas que tengan patrones similares a aplicaciones
        const appPatterns = schemas.filter((s: any) => {
            const uid = (s['x-uid'] || '').toLowerCase();
            const title = (s.title || '').toLowerCase();
            const component = s['x-component'] || '';

            // Buscar menús principales o páginas de primer nivel
            return (component === 'Menu.Item' || component === 'Menu.SubMenu') &&
                   !uid.includes('ugco');
        });

        console.log(`   Items de menú (no UGCO): ${appPatterns.length}`);
        for (const s of appPatterns) {
            console.log(`     - ${s['x-uid']}: "${s.title}" [${s['x-component']}]`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 4. Acceder directamente a otras apps si existen
    console.log('\n\n4. Intentando acceder a otras apps...');
    const appNames = ['reca', 'alma', 'buho', 'RECA', 'ALMA', 'BUHO', 'main'];

    for (const appName of appNames) {
        try {
            // Intentar obtener info de la app
            const res = await client.get(`/applications:get?filterByTk=${appName}`);
            console.log(`   [ENCONTRADA] ${appName}:`);
            console.log(`     ${JSON.stringify(res.data?.data, null, 2)}`);
        } catch (e: any) {
            if (e.response?.status !== 404) {
                console.log(`   [ERROR] ${appName}: ${e.response?.status}`);
            }
        }
    }

    // 5. Ver el menú admin completo con profundidad
    console.log('\n\n5. Menú admin completo...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        function showTree(obj: any, indent = 0) {
            const prefix = '  '.repeat(indent);
            const uid = obj['x-uid'] || '?';
            const title = obj.title || '';
            const comp = obj['x-component'] || '';

            console.log(`${prefix}[${uid}] ${title || comp}`);

            if (obj.properties) {
                for (const val of Object.values(obj.properties)) {
                    showTree(val as any, indent + 1);
                }
            }
        }

        showTree(menu);
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 6. Buscar en la base de datos directamente las tablas de apps
    console.log('\n\n6. Buscando tablas de aplicaciones...');
    try {
        const res = await client.get('/collections:list?pageSize=200');
        const collections = res.data?.data || [];

        const appCollections = collections.filter((c: any) => {
            const name = (c.name || '').toLowerCase();
            return name.includes('application') || name.includes('app_') || name === 'applications';
        });

        console.log(`   Colecciones de aplicaciones: ${appCollections.length}`);
        for (const c of appCollections) {
            console.log(`     - ${c.name}`);

            // Intentar listar registros
            try {
                const dataRes = await client.get(`/${c.name}:list?pageSize=10`);
                const data = dataRes.data?.data || [];
                console.log(`       Registros: ${data.length}`);
                for (const d of data.slice(0, 5)) {
                    console.log(`         - ${d.name || d.title || d.id}`);
                }
            } catch (e2: any) {
                // Ignorar
            }
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }
}

main().catch(console.error);
