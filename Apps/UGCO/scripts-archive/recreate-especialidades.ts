/**
 * recreate-especialidades.ts - Eliminar y recrear todas las páginas de Especialidades
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

const ESPECIALIDADES_ID = 345392373628932;

const ESPECIALIDADES = [
    { name: '🟤 Digestivo Bajo', icon: '🟤' },
    { name: '🔶 Digestivo Alto', icon: '🔶' },
    { name: '🩷 Mama', icon: '🩷' },
    { name: '💜 Ginecología', icon: '💜' },
    { name: '💙 Urología', icon: '💙' },
    { name: '🫁 Tórax', icon: '🫁' },
    { name: '💛 Piel', icon: '💛' },
    { name: '💚 Endocrinología', icon: '💚' },
    { name: '❤️ Hematología', icon: '❤️' },
    { name: '🦴 Sarcoma y Partes Blandas', icon: '🦴' },
    { name: '🗣️ Cabeza y Cuello', icon: '🗣️' },
];

async function deleteAllEspecialidades() {
    console.log('=== ELIMINANDO PÁGINAS EXISTENTES ===\n');

    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: ESPECIALIDADES_ID },
            pageSize: 100
        }
    });

    for (const route of routes.data?.data || []) {
        console.log(`Eliminando: ${route.title}`);
        try {
            // Eliminar children primero
            const children = await client.get('/desktopRoutes:list', {
                params: { filter: { parentId: route.id } }
            });
            for (const child of children.data?.data || []) {
                await client.post(`/desktopRoutes:destroy?filterByTk=${child.id}`);
            }

            // Eliminar la ruta
            await client.post(`/desktopRoutes:destroy?filterByTk=${route.id}`);

            // Eliminar el schema
            if (route.schemaUid) {
                await client.post(`/uiSchemas:remove/${route.schemaUid}`).catch(() => {});
            }
        } catch (e: any) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

async function createPage(title: string, parentId: number) {
    const pageUid = uid();
    const gridUid = uid();
    const gridName = uid();
    const menuSchemaUid = uid();

    // 1. Crear la ruta CON children
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

    // 2. Crear el schema CON el Grid anidado
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
    // 1. Eliminar todas las páginas existentes
    await deleteAllEspecialidades();

    // 2. Crear nuevas páginas
    console.log('\n=== CREANDO NUEVAS PÁGINAS ===\n');

    for (const esp of ESPECIALIDADES) {
        console.log(`Creando: ${esp.name}`);
        const id = await createPage(esp.name, ESPECIALIDADES_ID);
        console.log(`  ✅ ID: ${id}`);
    }

    console.log('\n=== PROCESO COMPLETADO ===');

    // Mostrar resultado
    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: ESPECIALIDADES_ID },
            pageSize: 100
        }
    });

    console.log('\nPáginas creadas:');
    for (const route of routes.data?.data || []) {
        console.log(`  ${route.id} | ${route.title}`);
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
