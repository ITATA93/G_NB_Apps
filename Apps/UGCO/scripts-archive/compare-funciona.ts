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
    console.log('=== COMPARANDO "Funciona" vs "Test_Async" ===\n');

    const FUNCIONA_UID = 'aeh5ge6pdmr';
    const TEST_ASYNC_UID = '1akrkhzo9i7';

    // 1. JSON Schema
    console.log('1. JSON Schema:\n');

    const funcionaSchema = await client.get(`/uiSchemas:getJsonSchema/${FUNCIONA_UID}`);
    console.log('Funciona:', JSON.stringify(funcionaSchema.data?.data));

    const testSchema = await client.get(`/uiSchemas:getJsonSchema/${TEST_ASYNC_UID}`);
    console.log('Test_Async:', JSON.stringify(testSchema.data?.data));

    // 2. Properties
    console.log('\n\n2. Properties:\n');

    const funcionaProps = await client.get(`/uiSchemas:getProperties/${FUNCIONA_UID}`);
    console.log('Funciona properties:');
    console.log(JSON.stringify(funcionaProps.data?.data, null, 2));

    const testProps = await client.get(`/uiSchemas:getProperties/${TEST_ASYNC_UID}`);
    console.log('\nTest_Async properties:');
    console.log(JSON.stringify(testProps.data?.data, null, 2));

    // 3. RAW records
    console.log('\n\n3. RAW en uiSchemas:\n');

    const funcionaRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': FUNCIONA_UID } }
    });
    console.log('Funciona RAW:', JSON.stringify(funcionaRaw.data?.data?.[0]));

    const testRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_ASYNC_UID } }
    });
    console.log('Test_Async RAW:', JSON.stringify(testRaw.data?.data?.[0]));

    // 4. Tree paths
    console.log('\n\n4. Tree paths:\n');

    const funcionaPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: FUNCIONA_UID } }
    });
    console.log('Funciona paths:', funcionaPaths.data?.data?.length);
    for (const p of funcionaPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    const testPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: TEST_ASYNC_UID } }
    });
    console.log('\nTest_Async paths:', testPaths.data?.data?.length);
    for (const p of testPaths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    // 5. Rutas
    console.log('\n\n5. Rutas:\n');

    const funcionaRoute = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: FUNCIONA_UID } }
    });
    console.log('Funciona ruta:', JSON.stringify(funcionaRoute.data?.data?.[0], null, 2));

    const testRoute = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: TEST_ASYNC_UID } }
    });
    console.log('\nTest_Async ruta:', JSON.stringify(testRoute.data?.data?.[0], null, 2));

    // 6. Grids RAW
    console.log('\n\n6. Grids RAW:\n');

    // Obtener UID del grid de Funciona
    const funcionaGridKey = Object.keys(funcionaProps.data?.data?.properties || {})[0];
    const funcionaGridUid = funcionaProps.data?.data?.properties?.[funcionaGridKey]?.['x-uid'];

    if (funcionaGridUid) {
        const funcionaGrid = await client.get('/uiSchemas:list', {
            params: { filter: { 'x-uid': funcionaGridUid } }
        });
        console.log('Funciona Grid RAW:', JSON.stringify(funcionaGrid.data?.data?.[0]));
    }

    // Obtener UID del grid de Test_Async
    const testGridKey = Object.keys(testProps.data?.data?.properties || {})[0];
    const testGridUid = testProps.data?.data?.properties?.[testGridKey]?.['x-uid'];

    if (testGridUid) {
        const testGrid = await client.get('/uiSchemas:list', {
            params: { filter: { 'x-uid': testGridUid } }
        });
        console.log('Test_Async Grid RAW:', JSON.stringify(testGrid.data?.data?.[0]));
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
