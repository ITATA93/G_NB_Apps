/**
 * compare-with-ejemplos.ts - Comparar ejemplos funcionales con páginas creadas por API
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

async function main() {
    console.log('=== COMPARACIÓN CON EJEMPLOS FUNCIONALES ===\n');

    // 1. Buscar las páginas Ejemplo_01, Ejemplo_02, Ejemplo_03
    console.log('1. Buscando páginas Ejemplo...');

    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: {
                title: { $like: '%Ejemplo%' }
            },
            pageSize: 20
        }
    });

    console.log('Ejemplos encontrados:', routes.data?.data?.length);

    for (const route of routes.data?.data || []) {
        console.log(`\n=== ${route.title} ===`);
        console.log('Route ID:', route.id);
        console.log('schemaUid:', route.schemaUid);
        console.log('menuSchemaUid:', route.menuSchemaUid);
        console.log('parentId:', route.parentId);
        console.log('type:', route.type);
        console.log('enableTabs:', route.enableTabs);

        if (route.schemaUid) {
            // Ver schema RAW
            const schemaRaw = await client.get('/uiSchemas:list', {
                params: { filter: { 'x-uid': route.schemaUid } }
            });
            console.log('\nSchema RAW:', JSON.stringify(schemaRaw.data?.data?.[0]));

            // Ver properties
            const props = await client.get(`/uiSchemas:getProperties/${route.schemaUid}`);
            console.log('Properties:', JSON.stringify(props.data?.data, null, 2));

            // Ver tree paths
            const paths = await client.get('/uiSchemaTreePath:list', {
                params: { filter: { ancestor: route.schemaUid } }
            });
            console.log('Tree paths:', paths.data?.data?.length);
            for (const p of paths.data?.data || []) {
                console.log('  ', JSON.stringify(p));
            }
        }
    }

    // 2. Buscar páginas Test que creamos
    console.log('\n\n=== PÁGINAS TEST CREADAS ===');

    const testRoutes = await client.get('/desktopRoutes:list', {
        params: {
            filter: {
                title: { $like: '%Test%' }
            },
            pageSize: 20
        }
    });

    for (const route of testRoutes.data?.data || []) {
        console.log(`\n=== ${route.title} ===`);
        console.log('Route ID:', route.id);
        console.log('schemaUid:', route.schemaUid);
        console.log('menuSchemaUid:', route.menuSchemaUid);

        if (route.schemaUid) {
            const schemaRaw = await client.get('/uiSchemas:list', {
                params: { filter: { 'x-uid': route.schemaUid } }
            });
            console.log('Schema RAW:', JSON.stringify(schemaRaw.data?.data?.[0]));

            const paths = await client.get('/uiSchemaTreePath:list', {
                params: { filter: { ancestor: route.schemaUid } }
            });
            console.log('Tree paths:', paths.data?.data?.length);
        }
    }

    // 3. Ver página "a" también
    console.log('\n\n=== PÁGINA "a" (funcional) ===');
    const aRoute = await client.get('/desktopRoutes:list', {
        params: { filter: { title: 'a' } }
    });

    for (const route of aRoute.data?.data || []) {
        console.log('Route ID:', route.id);
        console.log('schemaUid:', route.schemaUid);
        console.log('menuSchemaUid:', route.menuSchemaUid);

        if (route.schemaUid) {
            const schemaRaw = await client.get('/uiSchemas:list', {
                params: { filter: { 'x-uid': route.schemaUid } }
            });
            console.log('Schema RAW:', JSON.stringify(schemaRaw.data?.data?.[0]));
        }
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
