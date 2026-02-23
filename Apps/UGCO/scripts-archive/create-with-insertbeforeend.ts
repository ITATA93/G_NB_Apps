/**
 * create-with-insertbeforeend.ts - Usar insertBeforeEnd como NocoBase UI
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
    console.log('=== CREANDO Test_04 CON insertBeforeEnd ===\n');

    const pageUid = uid();
    const menuUid = uid();
    const gridUid = uid();
    const gridName = uid();  // Nombre diferente del UID como en "a"

    // 1. Crear page schema
    console.log('1. Creando page schema...');
    const pageSchema = {
        type: 'void',
        name: uid(),
        'x-uid': pageUid,
        'x-component': 'Page'
    };
    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Page:', pageUid);

    // 2. Crear ruta
    console.log('\n2. Creando ruta...');
    const routeRes = await client.post('/desktopRoutes:create', {
        parentId: 345392373628928,
        title: 'Test_04',
        type: 'page',
        schemaUid: pageUid,
        menuSchemaUid: menuUid,  // No existe, solo referencia
        enableTabs: false
    });
    console.log('   ✓ Ruta:', routeRes.data?.data?.id);

    // 3. Agregar Grid usando insertBeforeEnd (diferente de insertAdjacent)
    console.log('\n3. Agregando Grid con insertBeforeEnd...');
    const gridSchema = {
        type: 'void',
        name: gridName,  // Nombre diferente del UID
        'x-uid': gridUid,
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        'x-async': true
    };

    // Usar insertBeforeEnd directamente
    await client.post(`/uiSchemas:insertBeforeEnd/${pageUid}`, {
        schema: gridSchema,
        wrap: null
    });
    console.log('   ✓ Grid:', gridUid);

    // 4. Verificar
    console.log('\n4. Verificando...');

    const propsRes = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    console.log('Properties:', JSON.stringify(propsRes.data?.data, null, 2));

    const pathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log('\nTree paths:', pathsRes.data?.data?.length);
    for (const p of pathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // Comparar con "a"
    console.log('\n\nComparando con "a":');
    const aPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: '0h2vgqaifns' } }
    });
    console.log('"a" tree paths:', aPathsRes.data?.data?.length);
    for (const p of aPathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    console.log('\n✅ Test_04 creada');
    console.log('   URL: /admin/' + pageUid);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
