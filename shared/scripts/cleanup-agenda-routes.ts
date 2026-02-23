/**
 * cleanup-agenda-routes.ts — Remove all AGENDA routes and XXX test page
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();

async function main() {
    log('🗑️ Cleaning old AGENDA routes + XXX test page...\n', 'cyan');

    const resp = await client.get('/desktopRoutes:list', { paginate: false });
    const routes = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>[];

    // Find Agenda group
    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');
    const xxxPage = routes.find(r => r.title === 'XXX' && r.type === 'page');

    const toClean = [agendaGroup, xxxPage].filter(Boolean) as Record<string, unknown>[];

    for (const root of toClean) {
        log(`\n📁 Cleaning "${root.title}" (#${root.id})...`, 'white');

        // Find children
        const children = routes.filter(r => r.parentId === root.id);
        for (const child of children) {
            // Find grandchildren
            const grandchildren = routes.filter(r => r.parentId === child.id);
            for (const gc of grandchildren) {
                await safeDelete(gc);
            }
            await safeDelete(child);
        }
        await safeDelete(root);
    }

    log('\n✅ Cleanup complete.\n', 'green');

    // Verify
    const resp2 = await client.get('/desktopRoutes:list', { paginate: false });
    const routes2 = ((resp2 as Record<string, unknown>).data || resp2) as Record<string, unknown>[];
    log(`Remaining routes: ${routes2.length}`, 'gray');
    for (const r of routes2) {
        log(`  #${r.id} ${r.type} "${r.title}"`, 'gray');
    }
}

async function safeDelete(route: Record<string, unknown>) {
    try {
        await client.post(`/desktopRoutes:destroy?filterByTk=${route.id}`, {});
        if (route.schemaUid) {
            try { await client.post(`/uiSchemas:remove/${route.schemaUid}`, {}); } catch (_e) { /* ok */ }
        }
        if (route.menuSchemaUid) {
            try { await client.post(`/uiSchemas:remove/${route.menuSchemaUid}`, {}); } catch (_e) { /* ok */ }
        }
        log(`  ✅ Deleted #${route.id} "${route.title || route.type}"`, 'green');
    } catch (e: unknown) {
        log(`  ❌ #${route.id}: ${e instanceof Error ? e.message : String(e)}`, 'red');
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
