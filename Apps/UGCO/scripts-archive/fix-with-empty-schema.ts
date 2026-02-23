/**
 * fix-with-empty-schema.ts - Recrear página con schema VACÍO como las que funcionan
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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    console.log('=== RECREANDO DIGESTIVO CON SCHEMA VACÍO ===\n');

    const DIGESTIVO_ROUTE_ID = 345392373628934;
    const ESPECIALIDADES_MENU_UID = 'kflzqpn2qgb'; // UID del submenu Especialidades

    // 1. Obtener ruta actual
    const routeRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: DIGESTIVO_ROUTE_ID }
    });
    const currentRoute = routeRes.data?.data;
    console.log('Ruta actual:', currentRoute?.title);
    console.log('Schema actual:', currentRoute?.schemaUid);
    console.log('Menu actual:', currentRoute?.menuSchemaUid);

    // 2. Eliminar schema actual
    if (currentRoute?.schemaUid) {
        console.log('\n2. Eliminando schema actual...');
        try {
            await client.post(`/uiSchemas:remove/${currentRoute.schemaUid}`);
            console.log('   ✓ Schema eliminado');
        } catch (e) {
            console.log('   Schema no existía');
        }
    }

    // 3. Eliminar menuSchema actual
    if (currentRoute?.menuSchemaUid) {
        console.log('\n3. Eliminando menuSchema actual...');
        try {
            await client.post(`/uiSchemas:remove/${currentRoute.menuSchemaUid}`);
            console.log('   ✓ MenuSchema eliminado');
        } catch (e) {
            console.log('   MenuSchema no existía');
        }
    }

    // 4. Crear nuevo schema VACÍO (como página "a")
    const newPageUid = uid();
    const newMenuUid = uid();

    console.log('\n4. Creando schema de página VACÍO...');
    const pageSchema = {
        type: 'void',
        name: uid(),
        'x-uid': newPageUid,
        'x-component': 'Page'
        // SIN x-async, SIN properties - exactamente como "a"
    };

    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Schema creado:', newPageUid);

    // 5. Crear menuSchema vacío
    console.log('\n5. Creando menuSchema...');
    const menuSchema = {
        type: 'void',
        name: newMenuUid,
        'x-uid': newMenuUid,
        'x-component': 'Menu.Item',
        'x-component-props': {},
        'x-designer': 'Menu.Designer',
        title: '🔶 Digestivo Alto'
    };

    // Buscar el UID del submenú Especialidades
    console.log('   Buscando submenú Especialidades...');
    const menuRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');
    const ugcoMenu = menuRes.data?.data?.properties?.im75usfnpl5;

    if (ugcoMenu?.properties) {
        // Buscar Especialidades dentro de UGCO
        for (const [key, value] of Object.entries(ugcoMenu.properties)) {
            const item = value as any;
            if (item?.title?.includes('Especialidades')) {
                console.log('   Encontrado Especialidades:', item['x-uid']);

                // Insertar el menuSchema en Especialidades
                await client.post(`/uiSchemas:insertAdjacent/${item['x-uid']}?position=beforeEnd`, {
                    schema: menuSchema
                });
                console.log('   ✓ MenuSchema insertado');
                break;
            }
        }
    }

    // 6. Actualizar la ruta
    console.log('\n6. Actualizando ruta...');
    await client.post(`/desktopRoutes:update?filterByTk=${DIGESTIVO_ROUTE_ID}`, {
        schemaUid: newPageUid,
        menuSchemaUid: newMenuUid,
        enableTabs: false
    });
    console.log('   ✓ Ruta actualizada');

    // 7. Verificar
    console.log('\n7. Verificando...');
    const verifyRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: DIGESTIVO_ROUTE_ID }
    });
    console.log('   schemaUid:', verifyRoute.data?.data?.schemaUid);
    console.log('   menuSchemaUid:', verifyRoute.data?.data?.menuSchemaUid);

    const verifySchema = await client.get(`/uiSchemas:getJsonSchema/${newPageUid}`);
    console.log('   Schema x-async:', verifySchema.data?.data?.['x-async']);
    console.log('   Schema properties:', Object.keys(verifySchema.data?.data?.properties || {}));

    console.log('\n✅ Digestivo Alto recreado con schema vacío');
    console.log('   Nuevo schemaUid:', newPageUid);
    console.log('\n   Por favor recarga la página.');
}

main().catch(e => console.error('Error:', e.message));
