/**
 * recreate-main-pages.ts - Recrear páginas principales con problemas
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

const UGCO_ROOT = 345392373628928;

// Páginas a recrear
const PAGES_TO_RECREATE = [
    { id: 345392373628930, name: '📊 Dashboard' },
    { id: 345392375726091, name: '📅 Comités' },
    { id: 345392375726093, name: '✅ Tareas' },
    { id: 345392375726095, name: '📄 Reportes' },
];

async function deletePage(pageId: number) {
    // Eliminar children
    const children = await client.get('/desktopRoutes:list', {
        params: { filter: { parentId: pageId } }
    });
    for (const child of children.data?.data || []) {
        await client.post(`/desktopRoutes:destroy?filterByTk=${child.id}`);
    }

    // Obtener schemaUid
    const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);
    const schemaUid = route.data?.data?.schemaUid;

    // Eliminar ruta
    await client.post(`/desktopRoutes:destroy?filterByTk=${pageId}`);

    // Eliminar schema
    if (schemaUid) {
        await client.post(`/uiSchemas:remove/${schemaUid}`).catch(() => {});
    }
}

async function createPage(title: string, parentId: number) {
    const pageUid = uid();
    const gridUid = uid();
    const gridName = uid();
    const menuSchemaUid = uid();

    // 1. Crear ruta con children
    const routeResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: title,
        parentId: parentId,
        schemaUid: pageUid,
        menuSchemaUid: menuSchemaUid,
        enableTabs: false,
        children: [{
            type: 'tabs',
            schemaUid: gridUid,
            tabSchemaName: gridName,
            hidden: true
        }]
    });

    // 2. Crear schema con Grid
    await client.post('/uiSchemas:insert', {
        type: 'void',
        'x-component': 'Page',
        'x-uid': pageUid,
        properties: {
            [gridName]: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                'x-uid': gridUid,
                'x-async': true,
                properties: {}
            }
        }
    });

    return routeResponse.data?.data?.id;
}

async function main() {
    console.log('=== RECREANDO PÁGINAS PRINCIPALES ===\n');

    for (const page of PAGES_TO_RECREATE) {
        console.log(`\n--- ${page.name} ---`);

        // Eliminar
        console.log('  Eliminando...');
        try {
            await deletePage(page.id);
            console.log('  ✓ Eliminada');
        } catch (e: any) {
            console.log(`  ⚠️ Error al eliminar: ${e.message}`);
        }

        // Crear
        console.log('  Creando...');
        try {
            const newId = await createPage(page.name, UGCO_ROOT);
            console.log(`  ✅ Creada con ID: ${newId}`);
        } catch (e: any) {
            console.log(`  ❌ Error al crear: ${e.message}`);
        }
    }

    console.log('\n=== PROCESO COMPLETADO ===');
}

main().catch(e => {
    console.error('Error:', e.response?.data || e.message);
    process.exit(1);
});
