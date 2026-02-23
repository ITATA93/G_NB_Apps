/**
 * verify-schema-structure.ts - Verificar estructura actual de schemas
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

const DASHBOARD_UID = 'xikvv7wkefy';
const DIGESTIVO_UID = 'y9z8atdl8r';

async function main() {
    console.log('=== VERIFICANDO ESTRUCTURA DE SCHEMAS ===\n');

    // 1. Comparar estructura completa
    console.log('1. Comparando Dashboard vs Digestivo...\n');

    const dashRes = await client.get(`/uiSchemas:getJsonSchema/${DASHBOARD_UID}`);
    const digRes = await client.get(`/uiSchemas:getJsonSchema/${DIGESTIVO_UID}`);

    const dash = dashRes.data?.data;
    const dig = digRes.data?.data;

    console.log('=== DASHBOARD ===');
    console.log(JSON.stringify(dash, null, 2));

    console.log('\n=== DIGESTIVO ===');
    console.log(JSON.stringify(dig, null, 2));

    // 2. Comparar diferencias clave
    console.log('\n=== DIFERENCIAS CLAVE ===');
    console.log('Dashboard x-async:', dash?.['x-async']);
    console.log('Digestivo x-async:', dig?.['x-async']);

    console.log('\nDashboard name:', dash?.name);
    console.log('Digestivo name:', dig?.name);

    console.log('\nDashboard tiene properties.grid:', !!dash?.properties?.grid);
    console.log('Digestivo tiene properties.grid:', !!dig?.properties?.grid);

    // 3. Verificar ruta de Digestivo
    console.log('\n=== RUTA DE DIGESTIVO ===');
    const routeRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345392373628934 }
    });
    const route = routeRes.data?.data;
    console.log('Route schemaUid:', route?.schemaUid);
    console.log('Schema actual UID:', DIGESTIVO_UID);
    console.log('Match:', route?.schemaUid === DIGESTIVO_UID);

    // 4. Verificar tree paths
    console.log('\n=== TREE PATHS ===');
    const dashPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: DASHBOARD_UID }, { descendant: DASHBOARD_UID }] } }
    });
    const digPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { $or: [{ ancestor: DIGESTIVO_UID }, { descendant: DIGESTIVO_UID }] } }
    });

    console.log('Dashboard paths:', dashPaths.data?.data?.length);
    for (const p of dashPaths.data?.data || []) {
        console.log(`  - ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
    }

    console.log('\nDigestivo paths:', digPaths.data?.data?.length);
    for (const p of digPaths.data?.data || []) {
        console.log(`  - ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
    }
}

main().catch(e => console.error('Error:', e.message));
