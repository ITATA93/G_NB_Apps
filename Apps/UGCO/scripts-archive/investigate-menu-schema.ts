/**
 * investigate-menu-schema.ts - Investigar el menuSchemaUid de "a"
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
    console.log('=== INVESTIGACIÓN DEL MENU SCHEMA ===\n');

    const A_MENU_UID = '9bpb5x9pp7j';

    // 1. Ver si existe en uiSchemas
    console.log('1. Buscando menuSchema de "a" en uiSchemas...');
    const menuInSchemas = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': A_MENU_UID } }
    });
    console.log('   Encontrado en uiSchemas:', menuInSchemas.data?.data?.length > 0);
    if (menuInSchemas.data?.data?.length > 0) {
        console.log('   Datos:', JSON.stringify(menuInSchemas.data?.data?.[0], null, 2));
    }

    // 2. Ver getJsonSchema
    console.log('\n2. getJsonSchema del menuSchema...');
    try {
        const menuSchema = await client.get(`/uiSchemas:getJsonSchema/${A_MENU_UID}`);
        console.log('   Resultado:', JSON.stringify(menuSchema.data?.data));
    } catch (e: any) {
        console.log('   Error:', e.response?.status);
    }

    // 3. Ver tree paths del menuSchema
    console.log('\n3. Tree paths del menuSchema...');
    const menuPaths = await client.get('/uiSchemaTreePath:list', {
        params: {
            filter: {
                $or: [
                    { ancestor: A_MENU_UID },
                    { descendant: A_MENU_UID }
                ]
            }
        }
    });
    console.log('   Paths encontrados:', menuPaths.data?.data?.length);
    for (const p of menuPaths.data?.data || []) {
        console.log('   ', JSON.stringify(p));
    }

    // 4. Buscar en el menú principal de NocoBase
    console.log('\n4. Buscando en el menú principal (nocobase-admin-menu)...');
    try {
        const adminMenu = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menuData = adminMenu.data?.data;

        // Buscar recursivamente el menuSchemaUid
        function findInSchema(obj: any, targetUid: string, path: string = ''): string | null {
            if (!obj || typeof obj !== 'object') return null;
            if (obj['x-uid'] === targetUid) return path;
            for (const [key, value] of Object.entries(obj)) {
                const result = findInSchema(value, targetUid, `${path}.${key}`);
                if (result) return result;
            }
            return null;
        }

        const location = findInSchema(menuData, A_MENU_UID);
        console.log('   menuSchemaUid en admin-menu:', location || 'NO ENCONTRADO');
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 5. Crear un menuSchema igual que el de "a" (vacío pero existente)
    console.log('\n\n5. Creando página con menuSchema que SÍ existe en DB...');

    const pageUid = Math.random().toString(36).substring(2, 13);
    const gridUid = Math.random().toString(36).substring(2, 13);
    const menuUid = Math.random().toString(36).substring(2, 13);

    // Primero crear el menuSchema vacío en la DB
    console.log('   Creando menuSchema vacío...');
    try {
        await client.post('/uiSchemas:insert', {
            type: 'void',
            name: menuUid,
            'x-uid': menuUid
        });
        console.log('   ✓ menuSchema creado:', menuUid);
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // Crear page schema
    console.log('   Creando page schema...');
    await client.post('/uiSchemas:insert', {
        type: 'void',
        name: Math.random().toString(36).substring(2, 13),
        'x-uid': pageUid,
        'x-component': 'Page',
        properties: {
            [gridUid]: {
                type: 'void',
                name: gridUid,
                'x-uid': gridUid,
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock'
            }
        }
    });
    console.log('   ✓ Page creado:', pageUid);

    // Crear ruta
    console.log('   Creando ruta...');
    const routeRes = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_WithMenu',
        parentId: 345392373628932,  // Especialidades
        schemaUid: pageUid,
        menuSchemaUid: menuUid,  // AHORA SÍ EXISTE
        enableTabs: false
    });
    console.log('   ✓ Ruta creada:', routeRes.data?.data?.id);

    // Verificar que el menuSchema existe
    const verifyMenu = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': menuUid } }
    });
    console.log('   menuSchema existe:', verifyMenu.data?.data?.length > 0);

    // Comparar con "a"
    console.log('\n\n6. Comparación final...');
    console.log('   menuSchema de "a" existe:', menuInSchemas.data?.data?.length > 0);
    console.log('   menuSchema de Test_WithMenu existe:', verifyMenu.data?.data?.length > 0);

    console.log('\n✅ Test_WithMenu creada');
    console.log('   URL: /admin/' + pageUid);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
