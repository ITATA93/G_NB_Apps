/**
 * compare-a-vs-digestivo.ts - Comparar página "a" que funciona con Digestivo que no
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

const A_UID = '0h2vgqaifns';  // Página "a" que FUNCIONA
const DIGESTIVO_UID = 'frfqwa13hv5';  // Digestivo Alto que NO funciona

async function main() {
    console.log('=== COMPARANDO PÁGINA "a" vs DIGESTIVO ALTO ===\n');

    // 1. Buscar rutas
    console.log('1. RUTAS:\n');

    // Buscar ruta de "a"
    const aRouteRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: A_UID } }
    });
    const aRoute = aRouteRes.data?.data?.[0];

    // Buscar ruta de Digestivo
    const digRouteRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: DIGESTIVO_UID } }
    });
    const digRoute = digRouteRes.data?.data?.[0];

    console.log('=== PÁGINA "a" (FUNCIONA) ===');
    console.log(JSON.stringify(aRoute, null, 2));

    console.log('\n=== DIGESTIVO ALTO (NO FUNCIONA) ===');
    console.log(JSON.stringify(digRoute, null, 2));

    // 2. Comparar schemas
    console.log('\n\n2. SCHEMAS:\n');

    console.log('=== SCHEMA "a" ===');
    const aSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${A_UID}`);
    console.log(JSON.stringify(aSchemaRes.data?.data, null, 2));

    console.log('\n=== SCHEMA DIGESTIVO ===');
    const digSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${DIGESTIVO_UID}`);
    console.log(JSON.stringify(digSchemaRes.data?.data, null, 2));

    // 3. Tree paths
    console.log('\n\n3. TREE PATHS:\n');

    const aPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: A_UID } }
    });
    console.log('"a" tree paths:', aPathsRes.data?.data?.length);

    const digPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: DIGESTIVO_UID } }
    });
    console.log('Digestivo tree paths:', digPathsRes.data?.data?.length);

    // 4. Diferencias clave
    console.log('\n\n4. DIFERENCIAS CLAVE:\n');
    console.log('"a" menuSchemaUid:', aRoute?.menuSchemaUid);
    console.log('Digestivo menuSchemaUid:', digRoute?.menuSchemaUid);

    console.log('\n"a" enableTabs:', aRoute?.enableTabs);
    console.log('Digestivo enableTabs:', digRoute?.enableTabs);

    console.log('\n"a" parentId:', aRoute?.parentId);
    console.log('Digestivo parentId:', digRoute?.parentId);

    console.log('\n"a" type:', aRoute?.type);
    console.log('Digestivo type:', digRoute?.type);

    // 5. Si "a" tiene menuSchemaUid, ver qué contiene
    if (aRoute?.menuSchemaUid) {
        console.log('\n\n5. MENU SCHEMA de "a":\n');
        try {
            const menuRes = await client.get(`/uiSchemas:getJsonSchema/${aRoute.menuSchemaUid}`);
            console.log(JSON.stringify(menuRes.data?.data, null, 2));

            // Ver tree paths del menuSchema
            const menuPathsRes = await client.get('/uiSchemaTreePath:list', {
                params: { filter: { descendant: aRoute.menuSchemaUid } }
            });
            console.log('\nMenu schema tree paths:');
            for (const p of menuPathsRes.data?.data || []) {
                console.log(`  ancestor: ${p.ancestor}, depth: ${p.depth}`);
            }
        } catch (e: any) {
            console.log('Error:', e.message);
        }
    }
}

main().catch(e => console.error('Error:', e.message));
