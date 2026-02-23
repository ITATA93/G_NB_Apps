/**
 * create-page-correct-way.ts - Crear página como lo hace la UI de NocoBase
 *
 * DESCUBRIMIENTO: En páginas funcionales, getJsonSchema NO incluye properties.
 * El Grid existe como nodo SEPARADO conectado via tree paths.
 *
 * Proceso correcto:
 * 1. Crear Page schema SIN properties
 * 2. Agregar Grid usando insertAdjacent (NO como property embebida)
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
    console.log('=== CREAR PÁGINA DE LA FORMA CORRECTA ===\n');

    const ESPECIALIDADES_PARENT_ID = 345392373628932;

    const pageUid = uid();
    const gridUid = uid();
    const menuUid = uid();
    const pageName = uid();
    const gridName = uid();

    console.log('UIDs:');
    console.log('  pageUid:', pageUid);
    console.log('  gridUid:', gridUid);

    // 1. Crear Page schema SIN properties (como Ejemplo_01)
    console.log('\n1. Creando Page schema SIN properties...');

    const pageSchema = {
        type: 'void',
        name: pageName,
        'x-uid': pageUid,
        'x-component': 'Page'
        // SIN properties
    };

    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Page creado');

    // Verificar que no tiene properties
    const pageCheck = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('   JSON Schema:', JSON.stringify(pageCheck.data?.data));

    // 2. Agregar Grid usando insertAdjacent
    console.log('\n2. Agregando Grid con insertAdjacent...');

    const gridSchema = {
        type: 'void',
        name: gridName,
        'x-uid': gridUid,
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock'
        // SIN x-async ni x-index
    };

    await client.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, {
        schema: gridSchema
    });
    console.log('   ✓ Grid agregado');

    // 3. Crear la ruta
    console.log('\n3. Creando ruta...');

    const routeRes = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_CorrectWay',
        parentId: ESPECIALIDADES_PARENT_ID,
        schemaUid: pageUid,
        menuSchemaUid: menuUid,
        enableTabs: false
    });
    console.log('   ✓ Ruta creada:', routeRes.data?.data?.id);

    // 4. Verificar estructura
    console.log('\n\n4. Verificando estructura...');

    // JSON Schema (debería NO tener properties)
    const finalSchema = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('JSON Schema final:', JSON.stringify(finalSchema.data?.data));

    // Properties (debería tener el Grid)
    const props = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    console.log('\nProperties:', JSON.stringify(props.data?.data, null, 2));

    // Tree paths
    const paths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('\nTree paths:', paths.data?.data?.length);
    for (const p of paths.data?.data || []) {
        console.log('  ', JSON.stringify(p));
    }

    // RAW records
    console.log('\n\n5. Registros RAW...');
    const pageRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': pageUid } }
    });
    console.log('Page RAW:', JSON.stringify(pageRaw.data?.data?.[0]));

    const gridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': gridUid } }
    });
    console.log('Grid RAW:', JSON.stringify(gridRaw.data?.data?.[0]));

    // Comparar con Ejemplo_01
    console.log('\n\n6. Comparación con Ejemplo_01...');
    const ejemploSchema = await client.get('/uiSchemas:getJsonSchema/83spwnaehs3');
    console.log('Ejemplo_01 JSON Schema:', JSON.stringify(ejemploSchema.data?.data));

    console.log('\n\n✅ Test_CorrectWay creada');
    console.log('   URL: /admin/' + pageUid);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
