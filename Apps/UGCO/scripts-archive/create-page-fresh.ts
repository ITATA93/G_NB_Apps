/**
 * create-page-fresh.ts - Crear una página completamente nueva
 *
 * Eliminar todo y empezar de cero, exactamente como lo hace NocoBase UI
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
    console.log('=== CREANDO PÁGINA DESDE CERO ===\n');

    // Primero, obtener información de una página que funciona para copiar la estructura
    console.log('1. Analizando página "a" que funciona...');

    const aRouteRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345404482584576 }
    });
    const aRoute = aRouteRes.data?.data;

    // Ver el menuSchema de "a"
    console.log('   menuSchemaUid de "a":', aRoute.menuSchemaUid);
    const aMenuRes = await client.get(`/uiSchemas:getJsonSchema/${aRoute.menuSchemaUid}`);
    console.log('   menuSchema de "a":', JSON.stringify(aMenuRes.data?.data));

    // Ver el pageSchema de "a"
    console.log('   schemaUid de "a":', aRoute.schemaUid);
    const aSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${aRoute.schemaUid}`);
    console.log('   pageSchema de "a":', JSON.stringify(aSchemaRes.data?.data));

    // Ver tree paths de "a"
    const aPagePaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: aRoute.schemaUid } }
    });
    console.log('   Tree paths del page:', aPagePaths.data?.data?.length);
    for (const p of aPagePaths.data?.data || []) {
        console.log(`     ancestor: ${p.ancestor}, depth: ${p.depth}, async: ${p.async}`);
    }

    const aMenuPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: aRoute.menuSchemaUid } }
    });
    console.log('   Tree paths del menu:', aMenuPaths.data?.data?.length);
    for (const p of aMenuPaths.data?.data || []) {
        console.log(`     ancestor: ${p.ancestor}, depth: ${p.depth}, async: ${p.async}`);
    }

    // 2. Eliminar la ruta de Digestivo completamente
    console.log('\n\n2. Eliminando ruta de Digestivo...');
    const DIGESTIVO_ROUTE_ID = 345392373628934;

    // Obtener datos actuales
    const digRouteRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: DIGESTIVO_ROUTE_ID }
    });
    const digRoute = digRouteRes.data?.data;

    // Eliminar schemas asociados
    if (digRoute?.schemaUid) {
        try {
            await client.post(`/uiSchemas:remove/${digRoute.schemaUid}`);
            console.log('   Schema eliminado:', digRoute.schemaUid);
        } catch (e) {}
    }
    if (digRoute?.menuSchemaUid) {
        try {
            await client.post(`/uiSchemas:remove/${digRoute.menuSchemaUid}`);
            console.log('   MenuSchema eliminado:', digRoute.menuSchemaUid);
        } catch (e) {}
    }

    // Eliminar la ruta
    try {
        await client.post(`/desktopRoutes:destroy?filterByTk=${DIGESTIVO_ROUTE_ID}`);
        console.log('   Ruta eliminada:', DIGESTIVO_ROUTE_ID);
    } catch (e: any) {
        console.log('   Error eliminando ruta:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Crear nueva ruta usando el mismo enfoque que NocoBase UI
    console.log('\n\n3. Creando nueva página...');

    const newPageUid = uid();
    const newMenuUid = uid();

    // Crear page schema (vacío como "a")
    console.log('   Creando page schema...');
    const pageSchema = {
        type: 'void',
        name: uid(),
        'x-uid': newPageUid,
        'x-component': 'Page'
    };
    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   Page schema creado:', newPageUid);

    // Crear menu schema (vacío como "a")
    console.log('   Creando menu schema...');
    const menuSchema = {
        type: 'void',
        name: newMenuUid,
        'x-uid': newMenuUid
    };
    await client.post('/uiSchemas:insert', menuSchema);
    console.log('   Menu schema creado:', newMenuUid);

    // Crear la ruta
    console.log('   Creando ruta...');
    const createRouteRes = await client.post('/desktopRoutes:create', {
        parentId: 345392373628932,  // Especialidades
        title: '🔶 Digestivo Alto',
        type: 'page',
        schemaUid: newPageUid,
        menuSchemaUid: newMenuUid,
        enableTabs: false,
        sort: 1
    });
    console.log('   Ruta creada:', createRouteRes.data?.data?.id);

    // 4. Verificar
    console.log('\n\n4. Verificando...');
    const newRouteRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: newPageUid } }
    });
    const newRoute = newRouteRes.data?.data?.[0];
    console.log('   Nueva ruta:');
    console.log(JSON.stringify(newRoute, null, 2));

    console.log('\n✅ Página creada. schemaUid:', newPageUid);
    console.log('   Por favor recarga NocoBase.');
}

main().catch(e => console.error('Error:', e.message));
