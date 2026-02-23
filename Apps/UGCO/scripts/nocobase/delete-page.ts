/**
 * delete-page.ts - Eliminar una página de NocoBase via API
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/delete-page.ts <pageId>
 */

import { createClient, log, logAction } from '../../../../shared/scripts/ApiClient.js';

const client = createClient();

async function deletePage(pageId: number) {
    log('=== ELIMINANDO PÁGINA ===\n', 'cyan');
    log(`Page ID: ${pageId}`, 'white');

    // 1. Obtener info de la página
    const routeData = await client.get('/desktopRoutes:get', { filterByTk: pageId });

    if (!routeData.data) {
        log('❌ Página no encontrada', 'red');
        logAction('PAGE_DELETE_NOT_FOUND', { pageId });
        return;
    }

    const title = routeData.data.title;
    const schemaUid = routeData.data.schemaUid;

    log(`Título: ${title}`, 'white');
    log(`Schema UID: ${schemaUid}`, 'white');

    // 2. Eliminar children primero
    const childrenData = await client.get('/desktopRoutes:list', {
        filter: { parentId: pageId }
    });

    const children = childrenData.data || [];
    for (const child of children) {
        log(`\nEliminando child: ${child.id}`, 'gray');
        await client.post(`/desktopRoutes:destroy?filterByTk=${child.id}`, {});
    }

    // 3. Eliminar la ruta
    log('\nEliminando ruta principal...', 'cyan');
    await client.post(`/desktopRoutes:destroy?filterByTk=${pageId}`, {});

    // 4. Eliminar el schema
    if (schemaUid) {
        log('Eliminando schema...', 'cyan');
        try {
            await client.post(`/uiSchemas:remove/${schemaUid}`, {});
        } catch {
            // Schema might not exist, ignore
        }
    }

    log('\n✅ Página eliminada exitosamente', 'green');

    // Log the action
    logAction('PAGE_DELETED', {
        pageId,
        title,
        schemaUid,
        childrenDeleted: children.length
    });
}

async function main() {
    const pageId = process.argv[2];

    if (!pageId) {
        log('Uso: npx tsx delete-page.ts <pageId>', 'cyan');
        process.exit(1);
    }

    await deletePage(parseInt(pageId));
}

main().catch(e => {
    logAction('PAGE_DELETE_ERROR', { error: e.message });
    log(`\n❌ Error: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    process.exit(1);
});
