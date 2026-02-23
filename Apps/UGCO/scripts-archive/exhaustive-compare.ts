/**
 * exhaustive-compare.ts - Comparación EXHAUSTIVA entre página funcional y Test_02
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

// Página "a" que funciona
const A_ROUTE_ID = 345404482584576;
const A_SCHEMA_UID = '0h2vgqaifns';
const A_MENU_UID = '9bpb5x9pp7j';

// Test_02 que no funciona
const TEST_ROUTE_ID = 345408121143296;
const TEST_SCHEMA_UID = 'yz83359mv6j';
const TEST_MENU_UID = 'x1vabottgj';

async function main() {
    console.log('=== COMPARACIÓN EXHAUSTIVA ===\n');

    // 1. RUTAS COMPLETAS
    console.log('1. RUTAS (desktopRoutes):\n');

    const aRouteRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: A_ROUTE_ID }
    });
    const testRouteRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: TEST_ROUTE_ID }
    });

    const aRoute = aRouteRes.data?.data;
    const testRoute = testRouteRes.data?.data;

    console.log('Campo                    | Página "a"           | Test_02');
    console.log('-------------------------|----------------------|----------------------');

    const routeFields = ['id', 'parentId', 'title', 'type', 'schemaUid', 'menuSchemaUid',
                         'tabSchemaName', 'options', 'sort', 'hideInMenu', 'enableTabs',
                         'enableHeader', 'displayTitle', 'hidden', 'icon', 'tooltip'];

    for (const field of routeFields) {
        const aVal = JSON.stringify(aRoute?.[field]) || 'null';
        const testVal = JSON.stringify(testRoute?.[field]) || 'null';
        const match = aVal === testVal ? '✓' : '✗';
        console.log(`${match} ${field.padEnd(22)} | ${aVal.substring(0, 20).padEnd(20)} | ${testVal.substring(0, 20)}`);
    }

    // 2. PAGE SCHEMAS
    console.log('\n\n2. PAGE SCHEMAS (uiSchemas):\n');

    const aSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${A_SCHEMA_UID}`);
    const testSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${TEST_SCHEMA_UID}`);

    const aSchema = aSchemaRes.data?.data;
    const testSchema = testSchemaRes.data?.data;

    console.log('Página "a":');
    console.log(JSON.stringify(aSchema, null, 2));
    console.log('\nTest_02:');
    console.log(JSON.stringify(testSchema, null, 2));

    // 3. MENU SCHEMAS
    console.log('\n\n3. MENU SCHEMAS:\n');

    const aMenuRes = await client.get(`/uiSchemas:getJsonSchema/${A_MENU_UID}`);
    const testMenuRes = await client.get(`/uiSchemas:getJsonSchema/${TEST_MENU_UID}`);

    console.log('Menu "a":', JSON.stringify(aMenuRes.data?.data));
    console.log('Menu Test_02:', JSON.stringify(testMenuRes.data?.data));

    // 4. TREE PATHS - Page
    console.log('\n\n4. TREE PATHS (Page Schemas):\n');

    const aPagePaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: A_SCHEMA_UID }, { descendant: A_SCHEMA_UID }] } }
    });
    const testPagePaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: TEST_SCHEMA_UID }, { descendant: TEST_SCHEMA_UID }] } }
    });

    console.log('Página "a" tree paths:', aPagePaths.data?.data?.length);
    for (const p of aPagePaths.data?.data || []) {
        console.log(`  ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}, async: ${p.async}, type: ${p.type}`);
    }

    console.log('\nTest_02 tree paths:', testPagePaths.data?.data?.length);
    for (const p of testPagePaths.data?.data || []) {
        console.log(`  ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}, async: ${p.async}, type: ${p.type}`);
    }

    // 5. TREE PATHS - Menu
    console.log('\n\n5. TREE PATHS (Menu Schemas):\n');

    const aMenuPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: A_MENU_UID }, { descendant: A_MENU_UID }] } }
    });
    const testMenuPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: TEST_MENU_UID }, { descendant: TEST_MENU_UID }] } }
    });

    console.log('Menu "a" tree paths:', aMenuPaths.data?.data?.length);
    for (const p of aMenuPaths.data?.data || []) {
        console.log(`  ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
    }

    console.log('\nMenu Test_02 tree paths:', testMenuPaths.data?.data?.length);
    for (const p of testMenuPaths.data?.data || []) {
        console.log(`  ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
    }

    // 6. Buscar TODAS las tablas del sistema que puedan tener relación
    console.log('\n\n6. BUSCANDO EN OTRAS TABLAS DEL SISTEMA...\n');

    const systemTables = [
        'rolesResources',
        'rolesResourcesActions',
        'rolesResourcesScopes',
        'uiSchemaServerHooks',
        'dataSources',
        'dataSourcesRolesResources',
        'roles',
        'usersRoles'
    ];

    for (const table of systemTables) {
        try {
            const res = await client.get(`/${table}:list`, { params: { pageSize: 5 } });
            if (res.data?.data?.length > 0) {
                console.log(`${table}: ${res.data.data.length} registros`);
            }
        } catch (e) {}
    }

    // 7. ACL - Permisos
    console.log('\n\n7. VERIFICANDO ACL/PERMISOS...\n');
    try {
        const aclRes = await client.get('/roles:list');
        console.log('Roles disponibles:');
        for (const role of aclRes.data?.data || []) {
            console.log(`  - ${role.name}: ${role.title}`);
        }
    } catch (e: any) {
        console.log('Error obteniendo roles:', e.message);
    }

    // 8. Verificar si hay diferencia en cómo se obtiene via API
    console.log('\n\n8. PROBANDO DIFERENTES ENDPOINTS...\n');

    const endpoints = [
        `/uiSchemas:get?filter[x-uid]=${A_SCHEMA_UID}`,
        `/uiSchemas:get?filter[x-uid]=${TEST_SCHEMA_UID}`,
        `/uiSchemas:getTree/${A_SCHEMA_UID}`,
        `/uiSchemas:getTree/${TEST_SCHEMA_UID}`,
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await client.get(endpoint);
            console.log(`${endpoint.substring(0, 50)}: OK`);
        } catch (e: any) {
            console.log(`${endpoint.substring(0, 50)}: ${e.response?.status || e.message}`);
        }
    }

    // 9. Buscar registros en ui_schemas directamente
    console.log('\n\n9. REGISTROS EN uiSchemas (via list)...\n');

    const allSchemas = await client.get('/uiSchemas:list', {
        params: {
            filter: { 'x-uid': { $in: [A_SCHEMA_UID, TEST_SCHEMA_UID, A_MENU_UID, TEST_MENU_UID] } },
            pageSize: 10
        }
    });

    console.log('Schemas encontrados:', allSchemas.data?.data?.length);
    for (const s of allSchemas.data?.data || []) {
        console.log(`  ${s['x-uid']}: name=${s.name}, type=${s.type}`);
    }

    // 10. Ver si el Grid que agregué está bien
    console.log('\n\n10. VERIFICANDO GRID AGREGADO A TEST_02...\n');
    const testPropsRes = await client.get(`/uiSchemas:getProperties/${TEST_SCHEMA_UID}`);
    console.log('Properties de Test_02:');
    console.log(JSON.stringify(testPropsRes.data?.data, null, 2));

    // Comparar con properties de "a"
    const aPropsRes = await client.get(`/uiSchemas:getProperties/${A_SCHEMA_UID}`);
    console.log('\nProperties de "a":');
    console.log(JSON.stringify(aPropsRes.data?.data, null, 2));
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
