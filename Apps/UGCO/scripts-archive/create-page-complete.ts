/**
 * create-page-complete.ts - Crear página completa con schema y ruta
 *
 * Enfoque híbrido:
 * 1. Primero crear el schema con uiSchemas:insert (incluyendo Grid como hijo)
 * 2. Luego crear la ruta con desktopRoutes:create apuntando al schema
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
    console.log('=== CREAR PÁGINA COMPLETA ===\n');

    const UGCO_PARENT_ID = 345392373628928;

    const pageUid = uid();
    const gridUid = uid();
    const menuUid = uid();
    const pageName = uid();
    const gridName = uid();

    // 1. Crear schema de página CON Grid incluido como propiedad
    console.log('1. Creando schema de página con Grid incluido...');
    console.log('   pageUid:', pageUid);
    console.log('   gridUid:', gridUid);

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
                'x-initializer': 'page:addBlock',
                'x-async': true,
                'x-index': 1
            }
        }
    };

    try {
        await client.post('/uiSchemas:insert', pageSchema);
        console.log('   ✓ Schema creado con Grid incluido');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
        return;
    }

    // 2. Crear la ruta apuntando al schema
    console.log('\n2. Creando ruta con desktopRoutes:create...');

    const routeResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_Complete',
        parentId: UGCO_PARENT_ID,
        schemaUid: pageUid,
        menuSchemaUid: menuUid,  // Solo referencia
        enableTabs: false
    });

    const routeData = routeResponse.data?.data;
    console.log('   ✓ Ruta creada:', routeData?.id);

    // 3. Verificar estructura
    console.log('\n3. Verificando estructura...');

    // Schema
    const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('\nSchema de página:');
    console.log(JSON.stringify(schemaRes.data?.data, null, 2));

    // Properties
    const propsRes = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    console.log('\nProperties:');
    console.log(JSON.stringify(propsRes.data?.data, null, 2));

    // Tree paths
    const treePaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('\nTree paths:', treePaths.data?.data?.length);
    for (const p of treePaths.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // 4. Comparar con página funcional "a"
    console.log('\n\n4. Comparando con página funcional "a"...');
    const A_PAGE_UID = '0h2vgqaifns';

    const aSchema = await client.get(`/uiSchemas:getJsonSchema/${A_PAGE_UID}`);
    console.log('\nSchema de "a":');
    console.log(JSON.stringify(aSchema.data?.data, null, 2));

    const aProps = await client.get(`/uiSchemas:getProperties/${A_PAGE_UID}`);
    console.log('\nProperties de "a":');
    console.log(JSON.stringify(aProps.data?.data, null, 2));

    const aPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: A_PAGE_UID } }
    });
    console.log('\nTree paths de "a":', aPaths.data?.data?.length);

    console.log('\n\n✅ Test_Complete creada');
    console.log('   URL: /admin/' + pageUid);
    console.log('   gridUid:', gridUid);
    console.log('\n   Prueba acceder y verificar si permite edición.');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
