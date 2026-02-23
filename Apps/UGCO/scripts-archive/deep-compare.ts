/**
 * deep-compare.ts - Comparación profunda entre página funcional y rota
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
    console.log('=== COMPARACIÓN PROFUNDA ===\n');

    // IDs de rutas
    const EJEMPLO_ROUTE_ID = 345403144601600;  // Ejemplo_01 - FUNCIONA
    const DIGESTIVO_ROUTE_ID = 345392373628934; // Digestivo Alto - NO FUNCIONA

    // 1. Obtener rutas completas
    console.log('1. RUTAS COMPLETAS:\n');

    const ejemploRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: EJEMPLO_ROUTE_ID }
    });
    console.log('=== EJEMPLO_01 (FUNCIONA) ===');
    console.log(JSON.stringify(ejemploRoute.data?.data, null, 2));

    const digestivoRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: DIGESTIVO_ROUTE_ID }
    });
    console.log('\n=== DIGESTIVO ALTO (NO FUNCIONA) ===');
    console.log(JSON.stringify(digestivoRoute.data?.data, null, 2));

    // 2. Comparar schemas
    const ejemploUid = ejemploRoute.data?.data?.schemaUid;
    const digestivoUid = digestivoRoute.data?.data?.schemaUid;

    console.log('\n\n2. SCHEMAS:\n');

    if (ejemploUid) {
        console.log('=== EJEMPLO_01 SCHEMA ===');
        const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${ejemploUid}`);
        console.log(JSON.stringify(schemaRes.data?.data, null, 2));
    }

    if (digestivoUid) {
        console.log('\n=== DIGESTIVO SCHEMA ===');
        const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${digestivoUid}`);
        console.log(JSON.stringify(schemaRes.data?.data, null, 2));
    }

    // 3. Comparar menuSchemaUid
    console.log('\n\n3. MENU SCHEMAS:\n');
    const ejemploMenuUid = ejemploRoute.data?.data?.menuSchemaUid;
    const digestivoMenuUid = digestivoRoute.data?.data?.menuSchemaUid;

    console.log('Ejemplo menuSchemaUid:', ejemploMenuUid);
    console.log('Digestivo menuSchemaUid:', digestivoMenuUid);

    if (ejemploMenuUid) {
        console.log('\n=== EJEMPLO MENU SCHEMA ===');
        try {
            const menuRes = await client.get(`/uiSchemas:getJsonSchema/${ejemploMenuUid}`);
            console.log(JSON.stringify(menuRes.data?.data, null, 2));
        } catch (e: any) {
            console.log('Error:', e.message);
        }
    }

    // 4. Verificar padres de las rutas
    console.log('\n\n4. JERARQUÍA DE RUTAS:\n');

    const ejemploParentId = ejemploRoute.data?.data?.parentId;
    const digestivoParentId = digestivoRoute.data?.data?.parentId;

    console.log('Ejemplo parentId:', ejemploParentId);
    console.log('Digestivo parentId:', digestivoParentId);

    // Obtener rutas padre
    if (ejemploParentId) {
        const parentRes = await client.get('/desktopRoutes:get', {
            params: { filterByTk: ejemploParentId }
        });
        console.log('\nPadre de Ejemplo_01:', parentRes.data?.data?.title);
    }

    if (digestivoParentId) {
        const parentRes = await client.get('/desktopRoutes:get', {
            params: { filterByTk: digestivoParentId }
        });
        console.log('Padre de Digestivo:', parentRes.data?.data?.title, `(schemaUid: ${parentRes.data?.data?.schemaUid})`);

        // También ver el abuelo
        const grandparentId = parentRes.data?.data?.parentId;
        if (grandparentId) {
            const gpRes = await client.get('/desktopRoutes:get', {
                params: { filterByTk: grandparentId }
            });
            console.log('Abuelo de Digestivo:', gpRes.data?.data?.title);
        }
    }

    // 5. Ver si hay diferencia en los tree paths del schema
    console.log('\n\n5. TREE PATHS DETALLADOS:\n');

    if (ejemploUid) {
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: ejemploUid } }
        });
        console.log('Ejemplo_01 tree paths (descendant):');
        for (const p of pathsRes.data?.data || []) {
            console.log(`  ancestor: ${p.ancestor}, depth: ${p.depth}, async: ${p.async}, type: ${p.type}`);
        }
    }

    if (digestivoUid) {
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: digestivoUid } }
        });
        console.log('\nDigestivo tree paths (descendant):');
        for (const p of pathsRes.data?.data || []) {
            console.log(`  ancestor: ${p.ancestor}, depth: ${p.depth}, async: ${p.async}, type: ${p.type}`);
        }
    }

    // 6. Verificar si el problema es el menuSchemaUid
    console.log('\n\n6. INTENTANDO COPIAR menuSchemaUid...\n');

    if (ejemploMenuUid && !digestivoMenuUid) {
        // Crear un menuSchema para Digestivo basado en el de Ejemplo
        console.log('Digestivo no tiene menuSchemaUid. Intentando crear uno...');

        // Obtener el menu schema de ejemplo para ver su estructura
        try {
            const menuSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${ejemploMenuUid}`);
            console.log('Estructura del menuSchema de Ejemplo:');
            console.log(JSON.stringify(menuSchemaRes.data?.data, null, 2));
        } catch (e: any) {
            console.log('Error obteniendo menu schema:', e.message);
        }
    }
}

main().catch(e => console.error('Error:', e.message));
