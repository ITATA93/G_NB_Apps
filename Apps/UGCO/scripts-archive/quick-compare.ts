/**
 * quick-compare.ts - Comparación rápida de schemas RAW
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
    console.log('=== COMPARACIÓN RÁPIDA ===\n');

    // Obtener UIDs de los grids de Ejemplo_01
    const ejemplo01Props = await client.get('/uiSchemas:getProperties/83spwnaehs3');
    const ejemplo01GridUid = Object.keys(ejemplo01Props.data?.data?.properties || {})[0];

    console.log('Grid UID de Ejemplo_01:', ejemplo01GridUid);

    // Comparar GRIDS RAW
    console.log('\n--- GRIDS RAW ---');

    // Grid de Ejemplo_01
    if (ejemplo01GridUid) {
        const gridEjemplo = await client.get('/uiSchemas:list', {
            params: { filter: { 'x-uid': ejemplo01GridUid } }
        });
        console.log('Grid Ejemplo_01:', JSON.stringify(gridEjemplo.data?.data?.[0]));
    }

    // Grid de Test_Final
    const gridTest = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': 'u2o0d4crx5' } }
    });
    console.log('Grid Test_Final:', JSON.stringify(gridTest.data?.data?.[0]));

    // Grid de 'a'
    const gridA = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': 'wcwvfnle40g' } }
    });
    console.log('Grid "a":       ', JSON.stringify(gridA.data?.data?.[0]));

    // Comparar las RUTAS completas
    console.log('\n\n--- RUTAS COMPLETAS ---');

    // Ruta de Ejemplo_01
    const rutaEjemplo = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345403144601600 }
    });
    console.log('\nRuta Ejemplo_01:');
    const re = rutaEjemplo.data?.data;
    console.log('  schemaUid:', re?.schemaUid);
    console.log('  menuSchemaUid:', re?.menuSchemaUid);
    console.log('  enableTabs:', re?.enableTabs);
    console.log('  parentId:', re?.parentId);

    // Ruta de Test_Final
    const rutaTest = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345411644358656 }
    });
    console.log('\nRuta Test_Final:');
    const rt = rutaTest.data?.data;
    console.log('  schemaUid:', rt?.schemaUid);
    console.log('  menuSchemaUid:', rt?.menuSchemaUid);
    console.log('  enableTabs:', rt?.enableTabs);
    console.log('  parentId:', rt?.parentId);

    // Ruta de 'a'
    const rutaA = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345404482584576 }
    });
    console.log('\nRuta "a":');
    const ra = rutaA.data?.data;
    console.log('  schemaUid:', ra?.schemaUid);
    console.log('  menuSchemaUid:', ra?.menuSchemaUid);
    console.log('  enableTabs:', ra?.enableTabs);
    console.log('  parentId:', ra?.parentId);

    // Verificar si menuSchemaUid existe en DB
    console.log('\n\n--- MENU SCHEMAS EN DB ---');

    for (const item of [
        { name: 'Ejemplo_01', uid: re?.menuSchemaUid },
        { name: 'Test_Final', uid: rt?.menuSchemaUid },
        { name: '"a"', uid: ra?.menuSchemaUid }
    ]) {
        if (item.uid) {
            const menuSchema = await client.get('/uiSchemas:list', {
                params: { filter: { 'x-uid': item.uid } }
            });
            console.log(`${item.name} menuSchema (${item.uid}): existe=${menuSchema.data?.data?.length > 0}`);
            if (menuSchema.data?.data?.[0]) {
                console.log('  Datos:', JSON.stringify(menuSchema.data?.data?.[0]));
            }
        }
    }

    // Ver tree paths de los menuSchemas
    console.log('\n\n--- TREE PATHS DE MENU SCHEMAS ---');

    for (const item of [
        { name: 'Ejemplo_01', uid: re?.menuSchemaUid },
        { name: '"a"', uid: ra?.menuSchemaUid }
    ]) {
        if (item.uid) {
            const paths = await client.get('/uiSchemaTreePath:list', {
                params: { filter: { $or: [{ ancestor: item.uid }, { descendant: item.uid }] } }
            });
            console.log(`${item.name} menuSchema paths:`, paths.data?.data?.length);
            for (const p of paths.data?.data || []) {
                console.log('  ', JSON.stringify(p));
            }
        }
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
