/**
 * create-page-final.ts - Crear página exactamente como "a"
 *
 * Diferencias encontradas:
 * - Parent de "a" es 345392373628932 (Especialidades), no UGCO directo
 * - Grid de "a" no tiene x-index en raw
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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    console.log('=== CREAR PÁGINA FINAL (EXACTAMENTE COMO "a") ===\n');

    // Usar el mismo parent que "a"
    const ESPECIALIDADES_PARENT_ID = 345392373628932;

    const pageUid = uid();
    const gridUid = uid();
    const menuUid = uid();
    const pageName = uid();
    const gridName = uid();

    console.log('UIDs generados:');
    console.log('  pageUid:', pageUid);
    console.log('  gridUid:', gridUid);
    console.log('  menuUid:', menuUid);

    // 1. Crear schema de página SIN x-index en el Grid (como "a")
    console.log('\n1. Creando schema de página...');

    const pageSchema = {
        type: 'void',
        name: pageName,
        'x-uid': pageUid,
        'x-component': 'Page',
        properties: {
            [gridName]: {
                type: 'void',
                name: gridName,
                'x-uid': gridUid,
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock'
                // SIN x-async ni x-index en el schema inicial
            }
        }
    };

    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Schema creado');

    // 2. Crear ruta bajo Especialidades (como "a")
    console.log('\n2. Creando ruta bajo Especialidades...');

    const routeResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_Final',
        parentId: ESPECIALIDADES_PARENT_ID,
        schemaUid: pageUid,
        menuSchemaUid: menuUid,
        enableTabs: false
    });

    console.log('   ✓ Ruta creada:', routeResponse.data?.data?.id);

    // 3. Verificar registros RAW
    console.log('\n3. Verificando registros RAW...');

    const pageRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': pageUid } }
    });
    console.log('Page RAW:', JSON.stringify(pageRaw.data?.data?.[0]));

    const gridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': gridUid } }
    });
    console.log('Grid RAW:', JSON.stringify(gridRaw.data?.data?.[0]));

    // Comparar con "a"
    const aPageRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': '0h2vgqaifns' } }
    });
    console.log('\n"a" Page RAW:', JSON.stringify(aPageRaw.data?.data?.[0]));

    const aGridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': 'wcwvfnle40g' } }
    });
    console.log('"a" Grid RAW:', JSON.stringify(aGridRaw.data?.data?.[0]));

    // 4. Verificar tree paths
    console.log('\n4. Tree paths...');

    const testPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('Test paths:', testPaths.data?.data?.length);
    for (const p of testPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    const aPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: '0h2vgqaifns' } }
    });
    console.log('"a" paths:', aPaths.data?.data?.length);
    for (const p of aPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    // 5. Intentar llamar endpoints de sincronización/refresh
    console.log('\n5. Probando endpoints de sincronización...');

    const syncEndpoints = [
        '/uiSchemas:clearAncestor',
        '/systemSettings:get',
        '/app:getLang',
        '/app:getInfo',
        '/desktopRoutes:listAccessible'
    ];

    for (const endpoint of syncEndpoints) {
        try {
            const res = await client.get(endpoint, { validateStatus: () => true });
            if (res.status === 200) {
                console.log(`   ${endpoint}: OK`);
            }
        } catch (e) {}
    }

    console.log('\n\n✅ Test_Final creada');
    console.log('   URL: /admin/' + pageUid);
    console.log('\n   IMPORTANTE: Intenta estos pasos:');
    console.log('   1. Haz logout y login de nuevo en NocoBase');
    console.log('   2. Limpia el cache del navegador (Ctrl+Shift+Delete)');
    console.log('   3. Haz hard refresh (Ctrl+Shift+R)');
    console.log('   4. Abre en una ventana de incógnito');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
