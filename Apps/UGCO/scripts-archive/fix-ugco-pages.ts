/**
 * fix-ugco-pages.ts - Reparar páginas UGCO
 *
 * Problemas identificados:
 * 1. x-async debería ser false, no true
 * 2. Las páginas necesitan menuSchemaUid
 * 3. Los tree paths están incompletos
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

async function main() {
    console.log('=== REPARANDO PÁGINAS UGCO ===\n');

    // 1. Primero buscar la ruta correcta del Dashboard
    console.log('1. Buscando ruta correcta del Dashboard...');
    try {
        const res = await client.get('/desktopRoutes:list', {
            params: { filter: { schemaUid: 'xikvv7wkefy' } }
        });
        const route = res.data?.data?.[0];
        if (route) {
            console.log('   Dashboard Route encontrada:');
            console.log('   ID:', route.id);
            console.log('   Title:', route.title);
            console.log('   schemaUid:', route.schemaUid);
        } else {
            console.log('   No se encontró ruta con schemaUid xikvv7wkefy');
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 2. Listar todas las rutas UGCO
    console.log('\n2. Listando todas las rutas UGCO...');
    try {
        // Primero encontrar la ruta padre UGCO
        const parentRes = await client.get('/desktopRoutes:list', {
            params: { filter: { title: { $like: '%UGCO%' } }, pageSize: 50 }
        });
        console.log('   Rutas con UGCO en título:', parentRes.data?.data?.length || 0);

        // Buscar por ID conocido del padre de especialidades
        const childrenRes = await client.get('/desktopRoutes:list', {
            params: { filter: { parentId: 345392373628932 }, pageSize: 50 }
        });
        console.log('   Hijos de Especialidades (345392373628932):', childrenRes.data?.data?.length || 0);

        // Listar todas las rutas principales de UGCO
        const mainUgcoRes = await client.get('/desktopRoutes:list', {
            params: { filter: { parentId: 345392373628928 }, pageSize: 50 }
        });
        console.log('   Rutas principales UGCO:', mainUgcoRes.data?.data?.length || 0);
        for (const r of mainUgcoRes.data?.data || []) {
            console.log(`     - ${r.title} (ID: ${r.id}, schema: ${r.schemaUid || 'NULL'})`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 3. Intentar arreglar x-async en Dashboard
    console.log('\n3. Cambiando x-async a false en Dashboard...');
    try {
        const res = await client.post('/uiSchemas:patch', {
            'x-uid': 'xikvv7wkefy',
            'x-async': false
        });
        console.log('   Patch response:', res.status);
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 4. Verificar si ahora funciona
    console.log('\n4. Verificando schema después de patch...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/xikvv7wkefy');
        const schema = res.data?.data;
        console.log('   x-async:', schema?.['x-async']);
        console.log('   properties:', Object.keys(schema?.properties || {}));
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 5. Intentar arreglar Digestivo también
    console.log('\n5. Cambiando x-async a false en Digestivo...');
    try {
        const res = await client.post('/uiSchemas:patch', {
            'x-uid': 'y9z8atdl8r',
            'x-async': false
        });
        console.log('   Patch response:', res.status);
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 6. Comparar de nuevo
    console.log('\n6. Estado final...');
    for (const uid of ['xikvv7wkefy', 'y9z8atdl8r']) {
        try {
            const res = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
            const schema = res.data?.data;
            console.log(`   ${uid}: x-async=${schema?.['x-async']}, properties=${Object.keys(schema?.properties || {}).length}`);
        } catch (e: any) {
            console.log(`   ${uid}: Error`);
        }
    }

    console.log('\n=== Por favor recarga las páginas en NocoBase ===');
}

main().catch(e => console.error('Error:', e.message));
