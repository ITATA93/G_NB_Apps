/**
 * investigate-page-a-deep.ts - Investigación profunda de página "a"
 *
 * Buscar TODAS las referencias a la página "a" en el sistema
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

const A_SCHEMA_UID = '0h2vgqaifns';
const A_MENU_UID = '9bpb5x9pp7j';
const A_ROUTE_ID = 345404482584576;
const A_GRID_UID = 'wcwvfnle40g';

async function main() {
    console.log('=== INVESTIGACIÓN PROFUNDA DE PÁGINA "a" ===\n');

    // 1. Buscar en TODAS las tablas del sistema cualquier referencia a los UIDs
    console.log('1. Buscando referencias en todas las tablas...\n');

    const tables = [
        'uiSchemas',
        'uiSchemaTreePath',
        'uiSchemaServerHooks',
        'uiSchemaTemplates',
        'desktopRoutes',
        'rolesResources',
        'rolesResourcesActions',
        'collections',
        'fields',
        'applicationPlugins',
        'authenticators',
        'dataSources',
        'systemSettings',
        'users',
        'roles'
    ];

    for (const table of tables) {
        try {
            // Intentar buscar por diferentes campos
            for (const field of ['uid', 'schemaUid', 'x-uid', 'resourceName']) {
                try {
                    const res = await client.get(`/${table}:list`, {
                        params: {
                            filter: { [field]: A_SCHEMA_UID },
                            pageSize: 10
                        }
                    });
                    if (res.data?.data?.length > 0) {
                        console.log(`${table}.${field} = ${A_SCHEMA_UID}: ${res.data.data.length} registros`);
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }

    // 2. Ver serverHooks en detalle
    console.log('\n2. ServerHooks en detalle...');
    try {
        const hooksRes = await client.get('/uiSchemaServerHooks:list', { params: { pageSize: 50 } });
        console.log('Total hooks:', hooksRes.data?.data?.length);
        for (const hook of hooksRes.data?.data || []) {
            console.log(JSON.stringify(hook));
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 3. Ver el Grid de "a" en detalle
    console.log('\n\n3. Grid de "a" en detalle...');
    try {
        const gridRes = await client.get(`/uiSchemas:getJsonSchema/${A_GRID_UID}`);
        console.log('Grid schema:');
        console.log(JSON.stringify(gridRes.data?.data, null, 2));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 4. Ver tree paths del Grid
    console.log('\n4. Tree paths del Grid de "a"...');
    try {
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { $or: [{ ancestor: A_GRID_UID }, { descendant: A_GRID_UID }] } }
        });
        for (const p of pathsRes.data?.data || []) {
            console.log(JSON.stringify(p));
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 5. Comparar con Grid de Test_03
    const TEST_GRID_UID = 'n8mkt6int9';
    console.log('\n5. Tree paths del Grid de Test_03...');
    try {
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { $or: [{ ancestor: TEST_GRID_UID }, { descendant: TEST_GRID_UID }] } }
        });
        for (const p of pathsRes.data?.data || []) {
            console.log(JSON.stringify(p));
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 6. Ver registro raw del Grid de "a" vs Test_03
    console.log('\n\n6. Comparando registros raw de Grids...');
    const aGridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': A_GRID_UID } }
    });
    const testGridRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_GRID_UID } }
    });

    console.log('Grid "a" raw:', JSON.stringify(aGridRaw.data?.data?.[0]));
    console.log('Grid Test_03 raw:', JSON.stringify(testGridRaw.data?.data?.[0]));

    // 7. Verificar si hay algo especial en el menu schema
    console.log('\n\n7. Buscando menuSchema en tree paths...');
    const menuPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: A_MENU_UID }, { descendant: A_MENU_UID }] } }
    });
    console.log('Menu "a" paths:', menuPathsRes.data?.data?.length);

    // 8. Ver si hay una relación entre menuSchema y el menú principal
    console.log('\n8. Buscando en el menú principal...');
    const menuRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');

    function findUid(obj: any, targetUid: string, path: string = ''): string | null {
        if (!obj) return null;
        if (obj['x-uid'] === targetUid) return path;
        if (typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                const result = findUid(value, targetUid, `${path}.${key}`);
                if (result) return result;
            }
        }
        return null;
    }

    const menuLocation = findUid(menuRes.data?.data, A_MENU_UID);
    console.log('menuSchemaUid de "a" en menú principal:', menuLocation || 'NO ENCONTRADO');

    // 9. Ver si las páginas funcionales están en alguna tabla especial
    console.log('\n\n9. Buscando tablas con "page" en el nombre...');
    try {
        const collectionsRes = await client.get('/collections:list', { params: { pageSize: 200 } });
        const pageCollections = (collectionsRes.data?.data || []).filter((c: any) =>
            c.name.toLowerCase().includes('page') ||
            c.name.toLowerCase().includes('schema') ||
            c.name.toLowerCase().includes('route')
        );
        for (const c of pageCollections) {
            console.log(`  - ${c.name}`);
        }
    } catch (e) {}

    // 10. Intentar ver si hay endpoints especiales para páginas
    console.log('\n\n10. Probando endpoints especiales...');
    const specialEndpoints = [
        '/pages:list',
        '/pageSchemas:list',
        '/desktopPages:list',
        '/mobilePages:list',
        '/adminPages:list'
    ];

    for (const endpoint of specialEndpoints) {
        try {
            const res = await client.get(endpoint, { params: { pageSize: 5 } });
            console.log(`${endpoint}: ${res.data?.data?.length} registros`);
        } catch (e: any) {
            // No existe
        }
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
