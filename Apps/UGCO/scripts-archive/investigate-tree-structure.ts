/**
 * investigate-tree-structure.ts - Investigar estructura de árbol de schemas en NocoBase
 *
 * NocoBase usa una estructura de árbol para los schemas. Los schemas creados
 * con uiSchemas:insert pueden no estar conectados al árbol correctamente.
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
    console.log('=== INVESTIGANDO ESTRUCTURA DE ÁRBOL DE SCHEMAS ===\n');

    // 1. Listar todas las colecciones del sistema
    console.log('1. Buscando tablas relacionadas con schemas...');
    try {
        const res = await client.get('/collections:list', { params: { pageSize: 500 } });
        const collections = res.data?.data || [];

        const relevantCollections = collections.filter((c: any) =>
            c.name.includes('ui') ||
            c.name.includes('schema') ||
            c.name.includes('tree') ||
            c.name.includes('path') ||
            c.name.includes('route') ||
            c.name.includes('menu')
        );

        console.log('   Colecciones relevantes encontradas:');
        for (const c of relevantCollections) {
            console.log(`     - ${c.name} (${c.title || 'sin título'})`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 2. Buscar tabla ui_schema_tree_path o similar
    console.log('\n2. Intentando acceder a tablas de árbol...');
    const treeTables = [
        'uiSchemaTreePath',
        'ui_schema_tree_path',
        'uiSchemaNodes',
        'ui_schema_nodes',
        'schemaTree',
        'uiSchemas:getTree',
    ];

    for (const table of treeTables) {
        try {
            const res = await client.get(`/${table}:list`, { params: { pageSize: 10 } });
            if (res.data?.data) {
                console.log(`   ✓ ${table}: ${res.data.data.length} registros`);
                if (res.data.data.length > 0) {
                    console.log(`     Ejemplo:`, JSON.stringify(res.data.data[0]).substring(0, 200));
                }
            }
        } catch (e: any) {
            console.log(`   ✗ ${table}: ${e.response?.status || e.message}`);
        }
    }

    // 3. Verificar el schema del Dashboard (que debería funcionar)
    console.log('\n3. Obteniendo estructura completa del Dashboard...');
    try {
        // Usar getTree si existe
        const res = await client.get('/uiSchemas:getTree/xikvv7wkefy');
        console.log('   getTree response:', JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
        console.log('   getTree no disponible:', e.response?.status || e.message);
    }

    // 4. Verificar el menú principal
    console.log('\n4. Obteniendo estructura del menú principal...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        console.log('   Menu x-uid:', menu?.['x-uid']);
        console.log('   Menu x-component:', menu?.['x-component']);
        console.log('   Menu properties count:', Object.keys(menu?.properties || {}).length);

        // Listar items del menú
        const props = menu?.properties || {};
        console.log('   Items del menú:');
        for (const key of Object.keys(props).slice(0, 10)) {
            const item = props[key];
            console.log(`     - ${key}: ${item?.title || item?.['x-component'] || 'sin título'}`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 5. Verificar rutas desktop y su relación con schemas
    console.log('\n5. Verificando rutas UGCO y sus schemas...');
    try {
        const routesRes = await client.get('/desktopRoutes:list', {
            params: { pageSize: 100, filter: { parentId: 345392373628932 } }
        });
        const routes = routesRes.data?.data || [];

        console.log(`   Rutas UGCO encontradas: ${routes.length}`);
        for (const route of routes.slice(0, 5)) {
            console.log(`\n   Route: ${route.title} (ID: ${route.id})`);
            console.log(`     schemaUid: ${route.schemaUid || 'NULL'}`);

            if (route.schemaUid) {
                // Verificar si el schema existe
                try {
                    const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${route.schemaUid}`);
                    const schema = schemaRes.data?.data;
                    console.log(`     Schema existe: ${!!schema}`);
                    console.log(`     x-component: ${schema?.['x-component']}`);
                    console.log(`     Properties: ${Object.keys(schema?.properties || {}).join(', ')}`);
                } catch (e: any) {
                    console.log(`     ERROR obteniendo schema: ${e.message}`);
                }
            }
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 6. Verificar si hay un endpoint para "conectar" schemas
    console.log('\n6. Probando endpoints de conexión de schemas...');
    const endpoints = [
        'uiSchemas:insertInner',
        'uiSchemas:insertBeside',
        'uiSchemas:link',
        'uiSchemas:attach',
        'uiSchemas:mount',
    ];

    for (const endpoint of endpoints) {
        try {
            // Solo verificar si existe el endpoint (sin ejecutar)
            const res = await client.options(`/${endpoint}`);
            console.log(`   ${endpoint}: disponible (${res.status})`);
        } catch (e: any) {
            if (e.response?.status !== 404) {
                console.log(`   ${endpoint}: ${e.response?.status}`);
            }
        }
    }

    // 7. Obtener el schema padre de una página que funcione
    console.log('\n7. Buscando el schema padre (root) de páginas...');
    try {
        // El menú principal debería ser el root
        const menuRes = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        console.log('   Root (admin-menu) existe:', !!menuRes.data?.data);

        // Buscar si hay un "page root"
        const pageRoots = ['nocobase-page-root', 'page-root', 'root'];
        for (const root of pageRoots) {
            try {
                const res = await client.get(`/uiSchemas:getJsonSchema/${root}`);
                if (res.data?.data) {
                    console.log(`   ${root} existe:`, !!res.data.data);
                }
            } catch (e) {}
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 8. Probar insertAdjacent con un schema de test
    console.log('\n8. Probando insertAdjacent en el Dashboard...');
    const testUid = 'test_' + Math.random().toString(36).substring(2, 8);
    try {
        const testSchema = {
            type: 'void',
            'x-component': 'Markdown.Void',
            'x-component-props': {
                content: '# Test insertAdjacent'
            },
            'x-uid': testUid,
            name: testUid
        };

        // Intentar insertar adyacente al Dashboard
        const res = await client.post('/uiSchemas:insertAdjacent/xikvv7wkefy?position=afterBegin', {
            schema: testSchema
        });
        console.log('   insertAdjacent response:', res.status);
        console.log('   Response data:', JSON.stringify(res.data).substring(0, 300));

        // Limpiar
        try {
            await client.post(`/uiSchemas:remove/${testUid}`);
            console.log('   Test schema eliminado');
        } catch (e) {}
    } catch (e: any) {
        console.log('   Error insertAdjacent:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    console.log('\n=== FIN INVESTIGACIÓN ===');
}

main().catch(e => console.error('Error fatal:', e.message));
