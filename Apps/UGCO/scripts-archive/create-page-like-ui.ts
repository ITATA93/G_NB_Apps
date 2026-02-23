/**
 * create-page-like-ui.ts - Crear página exactamente como lo hace la UI
 *
 * Descubrimiento: La UI de NocoBase hace:
 * 1. desktopRoutes:create (primero la ruta)
 * 2. uiSchemas:insert (solo el Page, SIN Grid)
 *
 * El Grid se crea automáticamente cuando el usuario navega a la página.
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

async function main() {
    const title = process.argv[2] || 'Test_LikeUI_' + Date.now();
    const parentId = process.argv[3] || '345392373628928'; // UGCO Oncología

    console.log('=== CREANDO PÁGINA COMO LA UI ===\n');
    console.log('Título:', title);
    console.log('Parent ID:', parentId);

    const pageUid = uid();
    const pageName = uid();
    const menuSchemaUid = uid();

    console.log('\nUIDs generados:');
    console.log('  pageUid:', pageUid);
    console.log('  pageName:', pageName);
    console.log('  menuSchemaUid:', menuSchemaUid);

    // 1. Crear la ruta PRIMERO (como hace la UI)
    console.log('\n1. Creando desktopRoute...');
    const routeResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: title,
        parentId: parseInt(parentId),
        schemaUid: pageUid,
        menuSchemaUid: menuSchemaUid
    });
    console.log('   Route ID:', routeResponse.data?.data?.id);
    console.log('   Response:', JSON.stringify(routeResponse.data?.data).substring(0, 200));

    // 2. Crear el schema del Page DESPUÉS (sin Grid, sin properties)
    console.log('\n2. Insertando uiSchema (solo Page, sin Grid)...');
    const schemaResponse = await client.post('/uiSchemas:insert', {
        type: 'void',
        'x-component': 'Page',
        name: pageName,
        'x-uid': pageUid,
        'x-async': false  // La UI usa false, no true
    });
    console.log('   Schema:', JSON.stringify(schemaResponse.data?.data));

    console.log('\n=== PÁGINA CREADA ===');
    console.log(`URL: ${process.env.NOCOBASE_BASE_URL}/admin/${routeResponse.data?.data?.id}`);
    console.log('\nNavega a la página en NocoBase para ver si funciona.');
    console.log('El Grid debería crearse automáticamente al navegar.');
}

main().catch(e => {
    console.error('Error:', e.response?.data || e.message);
    process.exit(1);
});
