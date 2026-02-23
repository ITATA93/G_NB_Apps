/**
 * analyze-menu-connection.ts - Analizar conexión entre menú y páginas funcionales
 *
 * Según el documento, la secuencia es:
 * 1. Crear registro en colección de menús
 * 2. Asociar a UID de UI Schema
 * 3. Añadir bloques
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'  // Añadir el rol como sugiere el documento
    },
});

async function main() {
    console.log('=== ANALIZANDO CONEXIÓN MENÚ-PÁGINAS ===\n');

    // 1. Ver todas las rutas de UGCO con detalles completos
    console.log('1. Rutas UGCO completas...\n');
    const routesRes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: 345392373628928 },  // UGCO parent
            pageSize: 50,
            appends: ['parent']  // Incluir relación con padre
        }
    });

    for (const route of routesRes.data?.data || []) {
        console.log(`${route.title}:`);
        console.log(`  ID: ${route.id}`);
        console.log(`  type: ${route.type}`);
        console.log(`  schemaUid: ${route.schemaUid || 'NULL'}`);
        console.log(`  menuSchemaUid: ${route.menuSchemaUid || 'NULL'}`);
        console.log('');
    }

    // 2. Buscar la colección de menús
    console.log('\n2. Buscando colecciones de menú...');
    try {
        const collectionsRes = await client.get('/collections:list', {
            params: { pageSize: 200 }
        });
        const collections = collectionsRes.data?.data || [];
        const menuCollections = collections.filter((c: any) =>
            c.name.toLowerCase().includes('menu') ||
            c.name.toLowerCase().includes('route')
        );

        console.log('Colecciones relacionadas con menú:');
        for (const c of menuCollections) {
            console.log(`  - ${c.name}: ${c.title || ''}`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 3. Analizar la ruta de página "a" que funciona
    console.log('\n\n3. Analizando página "a" (funciona)...');
    const aRouteRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345404482584576 }  // ID de ruta "a"
    });
    const aRoute = aRouteRes.data?.data;
    console.log('Ruta "a" completa:');
    console.log(JSON.stringify(aRoute, null, 2));

    // 4. Ver si hay una relación con uiSchemas via insertAdjacent
    console.log('\n\n4. Probando insertAdjacent en nocobase-admin-menu...');

    // Primero ver la estructura actual del menú
    const fullMenuRes = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
    const fullMenu = fullMenuRes.data?.data;
    console.log('Estructura del menú admin:');
    console.log('  x-component:', fullMenu?.['x-component']);
    console.log('  properties keys:', Object.keys(fullMenu?.properties || {}));

    // 5. Ver el árbol completo del menú con getProperties recursivo
    console.log('\n\n5. Árbol del menú (primera capa)...');
    const menuPropsRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');
    const menuProps = menuPropsRes.data?.data;

    function printTree(obj: any, indent: string = '') {
        if (!obj?.properties) return;
        for (const [key, value] of Object.entries(obj.properties)) {
            const item = value as any;
            console.log(`${indent}${item?.title || key} (${item?.['x-uid']}) - ${item?.['x-component']}`);
            if (item?.properties) {
                printTree(item, indent + '  ');
            }
        }
    }

    printTree(menuProps);

    // 6. Verificar endpoint de flowPage
    console.log('\n\n6. Probando endpoint de flowPage...');
    try {
        const flowRes = await client.get('/flowPages:list', { params: { pageSize: 10 } });
        console.log('flowPages:', flowRes.data?.data?.length, 'registros');
        if (flowRes.data?.data?.length > 0) {
            console.log('Ejemplo:', JSON.stringify(flowRes.data.data[0], null, 2));
        }
    } catch (e: any) {
        console.log('flowPages no disponible:', e.response?.status);
    }

    // 7. Ver menús (menus collection)
    console.log('\n\n7. Probando endpoint de menus...');
    try {
        const menusRes = await client.get('/menus:list', { params: { pageSize: 10 } });
        console.log('menus:', menusRes.data?.data?.length, 'registros');
        if (menusRes.data?.data?.length > 0) {
            console.log('Ejemplo:', JSON.stringify(menusRes.data.data[0], null, 2));
        }
    } catch (e: any) {
        console.log('menus no disponible:', e.response?.status);
    }
}

main().catch(e => console.error('Error:', e.message));
