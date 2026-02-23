/**
 * create-page-v2.ts - Crear página funcional via API
 *
 * Investigación: Probar diferentes enfoques para hacer la página editable
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
    console.log('=== INVESTIGACIÓN: CREAR PÁGINA FUNCIONAL ===\n');

    // Primero, analizar una página funcional en detalle
    const WORKING_PAGE = '0h2vgqaifns';  // Página "a"
    const WORKING_GRID = 'wcwvfnle40g';

    console.log('1. Analizando página funcional "a"...\n');

    // Obtener el schema completo con getJsonSchema
    const fullSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${WORKING_PAGE}`);
    console.log('Schema completo de "a":');
    console.log(JSON.stringify(fullSchemaRes.data?.data, null, 2));

    // Ver si hay propiedades especiales en el Grid
    console.log('\n\n2. Schema del Grid funcional...');
    const gridSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${WORKING_GRID}`);
    console.log(JSON.stringify(gridSchemaRes.data?.data, null, 2));

    // Obtener registro raw del uiSchemas (no el JSON schema renderizado)
    console.log('\n\n3. Registro raw en tabla uiSchemas...');
    const rawPageRes = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': WORKING_PAGE } }
    });
    console.log('Page raw:', JSON.stringify(rawPageRes.data?.data?.[0], null, 2));

    const rawGridRes = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': WORKING_GRID } }
    });
    console.log('\nGrid raw:', JSON.stringify(rawGridRes.data?.data?.[0], null, 2));

    // Ver TODOS los campos de la ruta
    console.log('\n\n4. Ruta completa de "a"...');
    const routeRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: WORKING_PAGE } }
    });
    console.log(JSON.stringify(routeRes.data?.data?.[0], null, 2));

    // Ahora crear una nueva página replicando EXACTAMENTE la estructura
    console.log('\n\n5. CREANDO Test_05 replicando estructura exacta...\n');

    const pageUid = uid();
    const gridUid = uid();
    const menuUid = uid();
    const pageName = uid();
    const gridName = uid();

    // Crear page schema - copiar exactamente la estructura de "a"
    console.log('Creando page schema...');
    const pageSchema = {
        type: 'void',
        name: pageName,
        'x-uid': pageUid,
        'x-component': 'Page',
        // Agregamos properties inline como lo haría la UI
        properties: {
            [gridName]: {
                type: 'void',
                'x-uid': gridUid,
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                'x-async': true,
                'x-index': 1
            }
        }
    };

    try {
        await client.post('/uiSchemas:insert', pageSchema);
        console.log('   ✓ Page + Grid creados juntos');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
        // Si falla, intentar crear por separado
        console.log('   Intentando crear por separado...');

        const simplePageSchema = {
            type: 'void',
            name: pageName,
            'x-uid': pageUid,
            'x-component': 'Page'
        };
        await client.post('/uiSchemas:insert', simplePageSchema);
        console.log('   ✓ Page creado');

        // Agregar Grid usando insertAdjacent
        const gridSchema = {
            type: 'void',
            name: gridName,
            'x-uid': gridUid,
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
            'x-async': true,
            'x-index': 1
        };
        await client.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, {
            schema: gridSchema
        });
        console.log('   ✓ Grid agregado');
    }

    // Crear ruta
    console.log('\nCreando ruta...');
    const createRouteRes = await client.post('/desktopRoutes:create', {
        parentId: 345392373628928,  // UGCO
        title: 'Test_05',
        type: 'page',
        schemaUid: pageUid,
        menuSchemaUid: menuUid,  // No existe, solo referencia
        enableTabs: false,
        hideInMenu: false,
        hidden: false
    });
    console.log('   ✓ Ruta creada:', createRouteRes.data?.data?.id);

    // Verificar estructura creada
    console.log('\n\n6. Verificando estructura creada...');

    const newSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('Schema creado:');
    console.log(JSON.stringify(newSchemaRes.data?.data, null, 2));

    const newPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('\nTree paths:', newPathsRes.data?.data?.length);
    for (const p of newPathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // Comparar con "a"
    const aPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: WORKING_PAGE } }
    });
    console.log('\n"a" tree paths:', aPathsRes.data?.data?.length);
    for (const p of aPathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    console.log('\n✅ Test_05 creada');
    console.log('   URL: /admin/' + pageUid);
    console.log('\nPrueba navegar a la página y ver si permite edición.');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
