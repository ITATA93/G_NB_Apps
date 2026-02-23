/**
 * inspect-working-page.ts - Inspeccionar página funcional con tabla
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

const WORKING_PAGE_UID = '83spwnaehs3';

async function main() {
    console.log('=== INSPECCIONANDO PÁGINA FUNCIONAL ===\n');

    // 1. Obtener schema completo
    console.log('1. Obteniendo schema de la página funcional...');
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${WORKING_PAGE_UID}`);
        const schema = res.data?.data;
        console.log('\n=== SCHEMA COMPLETO ===');
        console.log(JSON.stringify(schema, null, 2));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 2. Verificar tree paths
    console.log('\n\n2. Verificando tree paths...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { $or: [{ ancestor: WORKING_PAGE_UID }, { descendant: WORKING_PAGE_UID }] } }
        });
        console.log('Paths encontrados:', res.data?.data?.length);
        for (const p of (res.data?.data || []).slice(0, 10)) {
            console.log(`  - ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 3. Buscar la ruta asociada
    console.log('\n3. Buscando ruta asociada...');
    try {
        const res = await client.get('/desktopRoutes:list', {
            params: { filter: { schemaUid: WORKING_PAGE_UID } }
        });
        const route = res.data?.data?.[0];
        if (route) {
            console.log('Ruta encontrada:');
            console.log('  ID:', route.id);
            console.log('  Title:', route.title);
            console.log('  Type:', route.type);
            console.log('  ParentId:', route.parentId);
        } else {
            console.log('No se encontró ruta asociada');
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 4. Comparar con Digestivo Alto
    console.log('\n4. Comparando con Digestivo Alto...');
    try {
        const digRes = await client.get('/uiSchemas:getJsonSchema/y9z8atdl8r');
        const dig = digRes.data?.data;

        const workingRes = await client.get(`/uiSchemas:getJsonSchema/${WORKING_PAGE_UID}`);
        const working = workingRes.data?.data;

        console.log('Digestivo x-component:', dig?.['x-component']);
        console.log('Working x-component:', working?.['x-component']);

        console.log('\nDigestivo x-async:', dig?.['x-async']);
        console.log('Working x-async:', working?.['x-async']);

        console.log('\nDigestivo properties:', Object.keys(dig?.properties || {}));
        console.log('Working properties:', Object.keys(working?.properties || {}));
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(e => console.error('Error:', e.message));
