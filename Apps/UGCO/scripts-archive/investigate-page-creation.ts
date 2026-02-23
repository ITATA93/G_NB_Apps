/**
 * investigate-page-creation.ts - Investigar cómo crear páginas reales via API
 *
 * Las páginas funcionales tienen menuSchemaUid que apunta a un schema en el menú.
 * Necesitamos entender la relación entre:
 * - desktopRoutes (la ruta/navegación)
 * - uiSchemas (el contenido de la página)
 * - El menú principal (nocobase-admin-menu)
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
    console.log('=== INVESTIGANDO CREACIÓN DE PÁGINAS ===\n');

    // 1. Analizar el menuSchema de una página funcional
    console.log('1. Analizando menuSchema de Ejemplo_01...');
    const EJEMPLO_MENU_UID = 'b9elpw8w5u5';

    try {
        // Ver el schema del menú
        const menuRes = await client.get(`/uiSchemas:getJsonSchema/${EJEMPLO_MENU_UID}`);
        console.log('   menuSchema:', JSON.stringify(menuRes.data?.data, null, 2));

        // Ver tree paths del menuSchema
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: EJEMPLO_MENU_UID } }
        });
        console.log('\n   Tree paths del menuSchema:');
        for (const p of pathsRes.data?.data || []) {
            console.log(`     ancestor: ${p.ancestor}, depth: ${p.depth}`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 2. Ver la estructura del menú principal
    console.log('\n\n2. Estructura del menú principal (nocobase-admin-menu)...');
    try {
        const menuRes = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = menuRes.data?.data;
        console.log('   x-component:', menu?.['x-component']);
        console.log('   properties count:', Object.keys(menu?.properties || {}).length);

        // Listar items del menú
        const props = menu?.properties || {};
        console.log('\n   Items del menú principal:');
        for (const [key, value] of Object.entries(props)) {
            const item = value as any;
            console.log(`     - ${key}: ${item?.title || item?.['x-component']}`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 3. Ver si el menuSchema de Ejemplo_01 está conectado al menú principal
    console.log('\n\n3. Buscando conexión entre menuSchema y menú principal...');
    try {
        const pathsRes = await client.get('/uiSchemaTreePath:list', {
            params: {
                filter: {
                    descendant: EJEMPLO_MENU_UID,
                    ancestor: 'nocobase-admin-menu'
                }
            }
        });
        console.log('   Conexión directa:', pathsRes.data?.data?.length || 0, 'paths');

        // Buscar ancestros del menuSchema
        const ancestorsRes = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: EJEMPLO_MENU_UID } }
        });
        console.log('\n   Todos los ancestros de menuSchema:');
        for (const p of ancestorsRes.data?.data || []) {
            console.log(`     ${p.ancestor} (depth: ${p.depth})`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 4. Buscar el item de menú de UGCO
    console.log('\n\n4. Buscando item de menú UGCO...');
    try {
        // El menú UGCO debería estar en nocobase-admin-menu
        const menuRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');
        const props = menuRes.data?.data?.properties || {};

        for (const [key, value] of Object.entries(props)) {
            const item = value as any;
            if (item?.title?.includes('UGCO') || key.includes('ugco')) {
                console.log('   Encontrado item UGCO:');
                console.log('   Key:', key);
                console.log('   x-uid:', item?.['x-uid']);
                console.log('   title:', item?.title);
                console.log('   x-component:', item?.['x-component']);

                // Ver sus propiedades (submenús)
                if (item?.properties) {
                    console.log('   Sub-items:');
                    for (const [subKey, subValue] of Object.entries(item.properties)) {
                        const subItem = subValue as any;
                        console.log(`     - ${subKey}: ${subItem?.title || subItem?.['x-component']}`);
                    }
                }
            }
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 5. Probar crear una página correctamente
    console.log('\n\n5. Intentando crear una página de prueba...');

    // El flujo parece ser:
    // 1. Crear el schema de la página (uiSchemas:insert)
    // 2. Crear el schema del item de menú y conectarlo al menú principal (uiSchemas:insertAdjacent)
    // 3. Crear la ruta (desktopRoutes:create) con schemaUid y menuSchemaUid

    const testPageUid = 'test_page_' + Math.random().toString(36).substring(2, 8);
    const testMenuUid = 'test_menu_' + Math.random().toString(36).substring(2, 8);

    try {
        // Paso 1: Crear schema de la página
        console.log('   Paso 1: Creando schema de página...');
        const pageSchema = {
            type: 'void',
            name: testPageUid,
            'x-uid': testPageUid,
            'x-component': 'Page'
        };
        await client.post('/uiSchemas:insert', pageSchema);
        console.log('   ✓ Schema de página creado:', testPageUid);

        // Paso 2: Crear schema del item de menú
        console.log('\n   Paso 2: Creando schema de menú...');
        const menuItemSchema = {
            type: 'void',
            name: testMenuUid,
            'x-uid': testMenuUid,
            'x-component': 'Menu.Item',
            'x-component-props': {},
            'x-designer': 'Menu.Designer',
            title: 'Test Page API'
        };

        // Insertar en el menú UGCO (necesitamos el UID del menú UGCO)
        // Primero buscar el UID
        const ugcoMenuRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');
        const ugcoProps = ugcoMenuRes.data?.data?.properties || {};
        let ugcoMenuUid = null;
        for (const [key, value] of Object.entries(ugcoProps)) {
            const item = value as any;
            if (item?.title?.includes('UGCO')) {
                ugcoMenuUid = item?.['x-uid'];
                break;
            }
        }

        if (ugcoMenuUid) {
            console.log('   Insertando en menú UGCO:', ugcoMenuUid);
            await client.post(`/uiSchemas:insertAdjacent/${ugcoMenuUid}?position=beforeEnd`, {
                schema: menuItemSchema
            });
            console.log('   ✓ Schema de menú insertado:', testMenuUid);
        } else {
            console.log('   ⚠ No se encontró menú UGCO, insertando en menú principal');
            await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
                schema: menuItemSchema
            });
        }

        // Paso 3: Crear la ruta
        console.log('\n   Paso 3: Creando ruta...');
        const routeRes = await client.post('/desktopRoutes:create', {
            parentId: 345392373628928, // UGCO Oncología
            title: 'Test Page API',
            type: 'page',
            schemaUid: testPageUid,
            menuSchemaUid: testMenuUid,
            enableTabs: false
        });
        console.log('   ✓ Ruta creada:', routeRes.data?.data?.id);

        // Verificar
        console.log('\n   Verificando página creada...');
        const verifyRes = await client.get('/desktopRoutes:list', {
            params: { filter: { schemaUid: testPageUid } }
        });
        const route = verifyRes.data?.data?.[0];
        console.log('   Route ID:', route?.id);
        console.log('   schemaUid:', route?.schemaUid);
        console.log('   menuSchemaUid:', route?.menuSchemaUid);

        console.log('\n   ✅ Página de prueba creada. Recarga NocoBase y busca "Test Page API"');

    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
        console.log('   Full error:', JSON.stringify(e.response?.data, null, 2));
    }
}

main().catch(e => console.error('Error fatal:', e.message));
