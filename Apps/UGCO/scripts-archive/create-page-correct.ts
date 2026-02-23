/**
 * create-page-correct.ts - Crear página EXACTAMENTE como NocoBase UI
 *
 * Descubrimientos:
 * 1. El menuSchemaUid es solo una referencia, no necesita existir en uiSchemas
 * 2. El pageSchema debe tener un Grid con x-async: true
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
    console.log('=== CREANDO PÁGINA Test_03 CORRECTAMENTE ===\n');

    const pageUid = uid();
    const menuUid = uid();  // Solo referencia, no crearemos el schema
    const gridUid = uid();

    // 1. Crear SOLO el page schema (vacío, como "a")
    console.log('1. Creando page schema vacío (sin Grid)...');
    const pageSchema = {
        type: 'void',
        name: uid(),
        'x-uid': pageUid,
        'x-component': 'Page'
        // Sin x-async, sin properties
    };

    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Page schema:', pageUid);

    // 2. NO crear menuSchema - solo usar el UID como referencia
    console.log('\n2. Usando menuSchemaUid como referencia (sin crear)...');
    console.log('   MenuSchemaUid:', menuUid, '(no existe en DB)');

    // 3. Crear la ruta
    console.log('\n3. Creando ruta...');
    const routeRes = await client.post('/desktopRoutes:create', {
        parentId: 345392373628928,  // UGCO
        title: 'Test_03',
        type: 'page',
        schemaUid: pageUid,
        menuSchemaUid: menuUid,
        enableTabs: false
    });
    console.log('   ✓ Ruta creada:', routeRes.data?.data?.id);

    // 4. Agregar Grid con x-async: true usando insertAdjacent
    console.log('\n4. Agregando Grid con x-async: true...');
    const gridSchema = {
        type: 'void',
        name: gridUid,
        'x-uid': gridUid,
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        'x-async': true,  // IMPORTANTE: true como "a"
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, {
        schema: gridSchema
    });
    console.log('   ✓ Grid agregado');

    // 5. Verificar
    console.log('\n5. Verificando...');

    // Schema
    const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('   Page schema:', JSON.stringify(schemaRes.data?.data));

    // Properties
    const propsRes = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    console.log('   Properties:', JSON.stringify(propsRes.data?.data));

    // Tree paths
    const pathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('   Tree paths:', pathsRes.data?.data?.length);

    // Verificar que menuSchema NO existe
    const menuCheck = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': menuUid } }
    });
    console.log('   MenuSchema existe en DB:', menuCheck.data?.data?.length > 0);

    console.log('\n✅ Test_03 creada');
    console.log('   URL: /admin/' + pageUid);
    console.log('   Recarga NocoBase y prueba.');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
