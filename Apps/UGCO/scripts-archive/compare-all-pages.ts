/**
 * compare-all-pages.ts - Comparar páginas funcionales con las rotas
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

// Páginas funcionales
const WORKING_TABLE = '83spwnaehs3';  // Ejemplo_01 con tabla
const WORKING_FORM = 'yax52o6dhwx';   // Página con formulario

// Páginas rotas (UGCO)
const DASHBOARD_UID = 'xikvv7wkefy';
const DIGESTIVO_UID = 'y9z8atdl8r';

async function analyzeSchema(uid: string, name: string) {
    console.log(`\n=== ${name} (${uid}) ===`);

    // 1. getJsonSchema
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
        const schema = res.data?.data;
        console.log('getJsonSchema:');
        console.log('  x-component:', schema?.['x-component']);
        console.log('  x-async:', schema?.['x-async']);
        console.log('  name:', schema?.name);
        console.log('  properties keys:', Object.keys(schema?.properties || {}));
    } catch (e: any) {
        console.log('  Error:', e.message);
    }

    // 2. Tree paths count
    try {
        const res = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { ancestor: uid }, pageSize: 100 }
        });
        console.log('  Tree paths:', res.data?.data?.length || 0);
    } catch (e: any) {}

    // 3. Route info
    try {
        const res = await client.get('/desktopRoutes:list', {
            params: { filter: { schemaUid: uid } }
        });
        const route = res.data?.data?.[0];
        if (route) {
            console.log('  Route:', route.title, `(ID: ${route.id})`);
            console.log('  Route type:', route.type);
            console.log('  Route parentId:', route.parentId);
        } else {
            console.log('  Route: NOT FOUND');
        }
    } catch (e: any) {}
}

async function main() {
    console.log('=== COMPARACIÓN COMPLETA DE PÁGINAS ===');

    // Analizar páginas funcionales
    await analyzeSchema(WORKING_TABLE, 'Ejemplo_01 (Tabla - FUNCIONA)');
    await analyzeSchema(WORKING_FORM, 'Formulario (FUNCIONA)');

    // Analizar páginas UGCO
    await analyzeSchema(DASHBOARD_UID, 'Dashboard UGCO');
    await analyzeSchema(DIGESTIVO_UID, 'Digestivo Alto');

    // Buscar diferencias en la ruta
    console.log('\n\n=== COMPARANDO RUTAS ===');

    const routeIds = [
        { id: 345403144601600, name: 'Ejemplo_01' },  // Funciona
        { id: 345392373628933, name: 'Dashboard UGCO' },  // Roto
        { id: 345392373628934, name: 'Digestivo Alto' },  // Roto
    ];

    for (const r of routeIds) {
        console.log(`\n${r.name} (Route ID: ${r.id}):`);
        try {
            const res = await client.get('/desktopRoutes:get', {
                params: { filterByTk: r.id }
            });
            const route = res.data?.data;
            console.log('  schemaUid:', route?.schemaUid);
            console.log('  type:', route?.type);
            console.log('  icon:', route?.icon);
            console.log('  menuSchemaUid:', route?.menuSchemaUid);
            console.log('  enableTabs:', route?.enableTabs);
            console.log('  enableHeader:', route?.enableHeader);
            console.log('  hideInMenu:', route?.hideInMenu);
            console.log('  options:', JSON.stringify(route?.options));
        } catch (e: any) {
            console.log('  Error:', e.message);
        }
    }

    // Ver la ruta del formulario
    console.log('\n\nBuscando ruta del formulario...');
    try {
        const res = await client.get('/desktopRoutes:list', {
            params: { filter: { schemaUid: WORKING_FORM } }
        });
        const route = res.data?.data?.[0];
        if (route) {
            console.log('Formulario Route ID:', route.id);
            console.log('  type:', route.type);
            console.log('  parentId:', route.parentId);
            console.log('  schemaUid:', route.schemaUid);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(e => console.error('Error:', e.message));
