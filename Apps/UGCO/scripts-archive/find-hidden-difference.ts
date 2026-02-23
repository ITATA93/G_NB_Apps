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

async function main() {
    console.log('=== BUSCANDO DIFERENCIAS OCULTAS ===\n');

    const FUNCIONA_UID = 'aeh5ge6pdmr';
    const FUNCIONA_GRID = 'b852i2zdv22';
    const TEST_UID = '1akrkhzo9i7';
    const TEST_GRID = 'z8y0zf92vwf';

    // 1. Buscar en uiSchemaServerHooks
    console.log('1. uiSchemaServerHooks:\n');
    try {
        const hooks = await client.get('/uiSchemaServerHooks:list', { params: { pageSize: 100 } });
        console.log('Total hooks:', hooks.data?.data?.length);

        const funcionaHooks = (hooks.data?.data || []).filter((h: any) =>
            h.uid === FUNCIONA_UID || h.uid === FUNCIONA_GRID
        );
        const testHooks = (hooks.data?.data || []).filter((h: any) =>
            h.uid === TEST_UID || h.uid === TEST_GRID
        );

        console.log('Hooks de Funciona:', funcionaHooks.length);
        console.log('Hooks de Test_Async:', testHooks.length);
    } catch (e) {
        console.log('Error obteniendo hooks');
    }

    // 2. Buscar TODOS los tree paths (incluyendo donde son descendant)
    console.log('\n\n2. TODOS los tree paths:\n');

    const funcionaAllPaths = await client.get('/uiSchemaTreePath:list', {
        params: {
            filter: {
                $or: [
                    { ancestor: FUNCIONA_UID },
                    { descendant: FUNCIONA_UID },
                    { ancestor: FUNCIONA_GRID },
                    { descendant: FUNCIONA_GRID }
                ]
            }
        }
    });
    console.log('Funciona total paths:', funcionaAllPaths.data?.data?.length);
    for (const p of funcionaAllPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    const testAllPaths = await client.get('/uiSchemaTreePath:list', {
        params: {
            filter: {
                $or: [
                    { ancestor: TEST_UID },
                    { descendant: TEST_UID },
                    { ancestor: TEST_GRID },
                    { descendant: TEST_GRID }
                ]
            }
        }
    });
    console.log('\nTest_Async total paths:', testAllPaths.data?.data?.length);
    for (const p of testAllPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    // 3. Ver si hay diferencia en el campo 'type' del tree path
    console.log('\n\n3. Verificando campo "type" en tree paths del Grid:\n');

    const funcionaGridPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: FUNCIONA_GRID } }
    });
    console.log('Funciona Grid paths:');
    for (const p of funcionaGridPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    const testGridPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: TEST_GRID } }
    });
    console.log('\nTest_Async Grid paths:');
    for (const p of testGridPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    // 4. Buscar en rolesResources
    console.log('\n\n4. Buscando en rolesResources:\n');
    try {
        const resources = await client.get('/rolesResources:list', { params: { pageSize: 200 } });
        const pageResources = (resources.data?.data || []).filter((r: any) =>
            r.name?.includes(FUNCIONA_UID) || r.name?.includes(TEST_UID) ||
            r.uiSchemaUid === FUNCIONA_UID || r.uiSchemaUid === TEST_UID
        );
        console.log('Recursos relacionados:', pageResources.length);
        for (const r of pageResources) {
            console.log('  ', JSON.stringify(r));
        }
    } catch (e) {
        console.log('No hay recursos relacionados');
    }

    // 5. Ver si hay algo en la estructura del schema que no vemos
    console.log('\n\n5. Obteniendo schema con getTree:\n');
    try {
        const funcionaTree = await client.get(`/uiSchemas:getTree/${FUNCIONA_UID}`);
        console.log('Funciona tree:', JSON.stringify(funcionaTree.data?.data));
    } catch (e: any) {
        console.log('getTree no disponible:', e.response?.status);
    }

    // 6. Probar endpoint getFullSchema
    console.log('\n\n6. Probando diferentes endpoints:\n');
    const endpoints = [
        `/uiSchemas:get?filter[x-uid]=${FUNCIONA_UID}`,
        `/uiSchemas:get?filter[x-uid]=${TEST_UID}`,
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await client.get(endpoint);
            console.log(`${endpoint.substring(0, 50)}: ${res.status}`);
            if (res.data?.data) {
                console.log('  Data:', JSON.stringify(res.data?.data).substring(0, 200));
            }
        } catch (e: any) {
            console.log(`${endpoint.substring(0, 50)}: ${e.response?.status}`);
        }
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
