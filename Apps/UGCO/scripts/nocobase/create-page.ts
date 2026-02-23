/**
 * create-page.ts - Crear páginas funcionales en NocoBase via API
 *
 * Este script replica EXACTAMENTE lo que hace la UI de NocoBase al crear una página.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "Nombre de la Página"
 *   npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "Nombre" 345392373628932
 *
 * Parent IDs conocidos:
 *   - UGCO Oncología: 345392373628928
 *   - Especialidades: 345392373628932
 */

import { createClient, log, logAction } from '../../../../shared/scripts/ApiClient.js';

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

const client = createClient();

async function createPage(title: string, parentId: string) {
    log('=== CREANDO PÁGINA EN NOCOBASE ===\n', 'cyan');
    log(`Título: ${title}`, 'white');
    log(`Parent ID: ${parentId}`, 'white');

    // Generar UIDs únicos
    const pageUid = uid();
    const gridUid = uid();
    const gridName = uid();
    const menuSchemaUid = uid();

    log('\nUIDs generados:', 'gray');
    log(`  pageUid: ${pageUid}`, 'gray');
    log(`  gridUid: ${gridUid}`, 'gray');
    log(`  gridName: ${gridName}`, 'gray');
    log(`  menuSchemaUid: ${menuSchemaUid}`, 'gray');

    // 1. Crear la ruta CON children (como hace la UI)
    log('\n1. Creando desktopRoute con children...', 'cyan');
    const routeResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: title,
        parentId: parseInt(parentId),
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

    const routeId = routeResponse.data?.id;
    log(`   Route ID: ${routeId}`, 'white');

    // 2. Crear el schema del Page CON el Grid anidado (como hace la UI)
    log('\n2. Insertando uiSchema con Grid anidado...', 'cyan');
    const schemaResponse = await client.post('/uiSchemas:insert', {
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
    log(`   Schema creado: ${schemaResponse.data?.['x-uid']}`, 'white');

    const baseUrl = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || '';
    const pageUrl = `${baseUrl}/admin/${routeId}`;

    log('\n=== PÁGINA CREADA EXITOSAMENTE ===', 'green');
    log(`URL: ${pageUrl}`, 'white');
    log('\nNavega a la página para verificar que funciona.', 'gray');

    // Log the action
    logAction('PAGE_CREATED', {
        title,
        parentId,
        routeId,
        pageUid,
        gridUid,
        url: pageUrl
    });

    return {
        routeId,
        pageUid,
        gridUid,
        url: pageUrl
    };
}

async function main() {
    const title = process.argv[2];
    const parentId = process.argv[3] || '345392373628928'; // UGCO Oncología por defecto

    if (!title) {
        log('Uso: npx tsx create-page.ts "Nombre de la Página" [parentId]', 'cyan');
        log('\nParent IDs conocidos:', 'white');
        log('  - UGCO Oncología: 345392373628928', 'gray');
        log('  - Especialidades: 345392373628932', 'gray');
        process.exit(1);
    }

    await createPage(title, parentId);
}

main().catch(e => {
    logAction('PAGE_CREATE_ERROR', { error: e.message });
    log(`\n❌ Error: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    process.exit(1);
});
