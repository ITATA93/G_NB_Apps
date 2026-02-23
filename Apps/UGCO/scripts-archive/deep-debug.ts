/**
 * deep-debug.ts - Comparación exhaustiva entre página funcional y creada por API
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

// Página funcional "a"
const A_PAGE_UID = '0h2vgqaifns';
const A_GRID_UID = 'wcwvfnle40g';
const A_ROUTE_ID = 345404482584576;

// Página creada Test_Complete
const TEST_PAGE_UID = 'rac9wwh3i';
const TEST_GRID_UID = '8surox8v8gp';
const TEST_ROUTE_ID = 345411065544704;

async function main() {
    console.log('=== COMPARACIÓN EXHAUSTIVA ===\n');

    // 1. Comparar registros RAW en uiSchemas (no el JSON renderizado)
    console.log('1. REGISTROS RAW EN uiSchemas\n');

    const aPageRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': A_PAGE_UID } }
    });
    const testPageRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_PAGE_UID } }
    });

    console.log('Página "a" RAW:');
    console.log(JSON.stringify(aPageRaw.data?.data?.[0], null, 2));
    console.log('\nTest_Complete RAW:');
    console.log(JSON.stringify(testPageRaw.data?.data?.[0], null, 2));

    // Comparar Grids
    console.log('\n\n--- GRIDS RAW ---');
    const aGridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': A_GRID_UID } }
    });
    const testGridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_GRID_UID } }
    });

    console.log('Grid "a" RAW:');
    console.log(JSON.stringify(aGridRaw.data?.data?.[0], null, 2));
    console.log('\nGrid Test RAW:');
    console.log(JSON.stringify(testGridRaw.data?.data?.[0], null, 2));

    // 2. Comparar rutas COMPLETAS
    console.log('\n\n2. RUTAS COMPLETAS\n');

    const aRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: A_ROUTE_ID }
    });
    const testRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: TEST_ROUTE_ID }
    });

    console.log('Ruta "a":');
    console.log(JSON.stringify(aRoute.data?.data, null, 2));
    console.log('\nRuta Test:');
    console.log(JSON.stringify(testRoute.data?.data, null, 2));

    // 3. Comparar tree paths en detalle
    console.log('\n\n3. TREE PATHS DETALLADOS\n');

    const aTreePaths = await client.get('/uiSchemaTreePath:list', {
        params: {
            filter: {
                $or: [
                    { ancestor: A_PAGE_UID },
                    { descendant: A_PAGE_UID }
                ]
            }
        }
    });
    const testTreePaths = await client.get('/uiSchemaTreePath:list', {
        params: {
            filter: {
                $or: [
                    { ancestor: TEST_PAGE_UID },
                    { descendant: TEST_PAGE_UID }
                ]
            }
        }
    });

    console.log('Tree paths "a":');
    for (const p of aTreePaths.data?.data || []) {
        console.log(JSON.stringify(p));
    }
    console.log('\nTree paths Test:');
    for (const p of testTreePaths.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // 4. Verificar ServerHooks
    console.log('\n\n4. SERVER HOOKS\n');
    try {
        const hooks = await client.get('/uiSchemaServerHooks:list', {
            params: { pageSize: 100 }
        });
        const aHooks = (hooks.data?.data || []).filter((h: any) =>
            h.uid === A_PAGE_UID || h.uid === A_GRID_UID
        );
        const testHooks = (hooks.data?.data || []).filter((h: any) =>
            h.uid === TEST_PAGE_UID || h.uid === TEST_GRID_UID
        );

        console.log('Hooks para "a":', aHooks.length);
        for (const h of aHooks) {
            console.log(JSON.stringify(h));
        }
        console.log('\nHooks para Test:', testHooks.length);
        for (const h of testHooks) {
            console.log(JSON.stringify(h));
        }

        console.log('\nTodos los hooks:');
        for (const h of hooks.data?.data || []) {
            console.log(`  ${h.uid}: ${h.type}`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 5. Verificar si hay diferencias en los campos del schema
    console.log('\n\n5. DIFERENCIAS EN CAMPOS\n');

    const aPage = aPageRaw.data?.data?.[0] || {};
    const testPage = testPageRaw.data?.data?.[0] || {};

    const allKeys = new Set([...Object.keys(aPage), ...Object.keys(testPage)]);

    console.log('Campo                  | "a"                  | Test');
    console.log('-----------------------|----------------------|----------------------');
    for (const key of allKeys) {
        const aVal = JSON.stringify(aPage[key]) || 'undefined';
        const testVal = JSON.stringify(testPage[key]) || 'undefined';
        const match = aVal === testVal ? '✓' : '✗';
        console.log(`${match} ${key.padEnd(20)} | ${aVal.substring(0, 20).padEnd(20)} | ${testVal.substring(0, 20)}`);
    }

    // 6. Verificar templates
    console.log('\n\n6. TEMPLATES\n');
    try {
        const templates = await client.get('/uiSchemaTemplates:list', {
            params: { pageSize: 100 }
        });
        console.log('Total templates:', templates.data?.data?.length);
        const pageTemplates = (templates.data?.data || []).filter((t: any) =>
            t.uid === A_PAGE_UID || t.uid === TEST_PAGE_UID ||
            t.name?.includes('page') || t.componentName?.includes('Page')
        );
        for (const t of pageTemplates) {
            console.log(JSON.stringify(t));
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 7. Buscar en TODAS las tablas cualquier referencia
    console.log('\n\n7. BUSCANDO EN OTRAS TABLAS\n');

    const tables = [
        'applicationPlugins',
        'systemSettings',
        'roles',
        'rolesResources',
        'dataSourcesCollections'
    ];

    for (const table of tables) {
        try {
            const res = await client.get(`/${table}:list`, {
                params: { pageSize: 5 }
            });
            if (res.data?.data?.length > 0) {
                console.log(`${table}: ${res.data.data.length} registros`);
            }
        } catch (e) {}
    }

    // 8. Ver si hay algo especial en el parent de "a"
    console.log('\n\n8. COMPARANDO PARENTS\n');

    const aParentId = aRoute.data?.data?.parentId;
    const testParentId = testRoute.data?.data?.parentId;

    console.log('Parent de "a":', aParentId);
    console.log('Parent de Test:', testParentId);

    if (aParentId !== testParentId) {
        const aParent = await client.get('/desktopRoutes:get', {
            params: { filterByTk: aParentId }
        });
        const testParent = await client.get('/desktopRoutes:get', {
            params: { filterByTk: testParentId }
        });

        console.log('\nParent de "a":');
        console.log(JSON.stringify(aParent.data?.data, null, 2));
        console.log('\nParent de Test:');
        console.log(JSON.stringify(testParent.data?.data, null, 2));
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
