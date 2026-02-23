/**
 * fix-old-pages.ts - Arreglar páginas antiguas para que sean editables
 *
 * Las páginas antiguas no tienen:
 * 1. Children en la ruta (type: tabs)
 * 2. Grid con x-async: true
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

// Páginas de Especialidades que necesitan arreglo
const PAGES_TO_FIX = [
    { id: 345392373628936, name: '🟤 Digestivo Bajo' },
    { id: 345392373628938, name: '🩷 Mama' },
    { id: 345392373628940, name: '💜 Ginecología' },
    { id: 345392375726081, name: '💙 Urología' },
    { id: 345392375726083, name: '🫁 Tórax' },
    { id: 345392375726085, name: '💛 Piel' },
    { id: 345392375726087, name: '💚 Endocrinología' },
    { id: 345392375726089, name: '❤️ Hematología' },
    { id: 345394644844546, name: '🦴 Sarcoma y Partes Blandas' },
    { id: 345394646941696, name: '🗣️ Cabeza y Cuello' },
    { id: 345407846416384, name: '🔶 Digestivo Alto' },
];

async function fixPage(pageId: number, pageName: string) {
    console.log(`\n--- Arreglando: ${pageName} ---`);

    try {
        // 1. Obtener la ruta
        const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);
        const schemaUid = route.data?.data?.schemaUid;

        if (!schemaUid) {
            console.log('  ❌ No tiene schemaUid');
            return;
        }

        // 2. Verificar si ya tiene children
        const children = await client.get('/desktopRoutes:list', {
            params: { filter: { parentId: pageId } }
        });

        if (children.data?.data?.length > 0) {
            console.log('  ✓ Ya tiene children, saltando');
            return;
        }

        // 3. Obtener el Grid del schema
        const props = await client.get(`/uiSchemas:getProperties/${schemaUid}`);
        const gridKey = Object.keys(props.data?.data?.properties || {})[0];

        if (!gridKey) {
            console.log('  ❌ No tiene Grid');
            return;
        }

        const grid = props.data?.data?.properties[gridKey];
        const gridUid = grid?.['x-uid'];

        console.log(`  Grid key: ${gridKey}, UID: ${gridUid}`);

        // 4. Agregar child a la ruta
        console.log('  Agregando child tabs...');
        await client.post('/desktopRoutes:create', {
            type: 'tabs',
            parentId: pageId,
            schemaUid: gridUid,
            tabSchemaName: gridKey,
            hidden: true
        });

        // 5. Actualizar Grid con x-async: true
        console.log('  Actualizando Grid x-async...');
        await client.post(`/uiSchemas:patch`, {
            'x-uid': gridUid,
            'x-async': true
        });

        console.log('  ✅ Arreglado');

    } catch (e: any) {
        console.log(`  ❌ Error: ${e.response?.data?.errors?.[0]?.message || e.message}`);
    }
}

async function main() {
    console.log('=== ARREGLANDO PÁGINAS ANTIGUAS ===');

    for (const page of PAGES_TO_FIX) {
        await fixPage(page.id, page.name);
    }

    console.log('\n=== PROCESO COMPLETADO ===');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
