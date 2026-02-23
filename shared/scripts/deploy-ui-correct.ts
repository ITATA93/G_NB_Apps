/**
 * deploy-ui-correct.ts — Deploy UI pages correctly replicating NocoBase's internal pattern
 *
 * Based on reverse-engineering of what NocoBase creates when a page is added via UI.
 * Pattern discovered via before/after snapshot diff:
 *
 *   1. desktopRoutes:  2 records (page + hidden tabs child)
 *   2. uiSchemas:      2 records (Page + Grid with page:addBlock initializer)
 *   3. uiSchemaTreePath: 3 records (2 self-refs + 1 parent-child link)
 *   4. menuSchemaUid:  1 record (Menu.Item schema linked to route)
 *   5. rolesDesktopRoutes: 6 records (3 roles × 2 routes)
 *
 * USO:
 *   npx tsx shared/scripts/deploy-ui-correct.ts --config Apps/AGENDA/ui-config.json
 *   npx tsx shared/scripts/deploy-ui-correct.ts --config Apps/AGENDA/ui-config.json --dry-run
 *   npx tsx shared/scripts/deploy-ui-correct.ts --config Apps/AGENDA/ui-config.json --cleanup
 *   npx tsx shared/scripts/deploy-ui-correct.ts --verify
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const CLEANUP = process.argv.includes('--cleanup');
const VERIFY = process.argv.includes('--verify');
const CONFIG_FLAG = process.argv.indexOf('--config');
const CONFIG_PATH = CONFIG_FLAG !== -1 ? process.argv[CONFIG_FLAG + 1] : null;

// ─── Types ──────────────────────────────────────────────────────────────────

interface PageConfig {
    title: string;
    icon?: string;
    collection?: string;
}

interface GroupConfig {
    title: string;
    icon?: string;
    pages: PageConfig[];
}

interface UIConfig {
    groups: GroupConfig[];
}

interface CreatedResource {
    type: string;
    id: string | number;
    title: string;
}

// The 3 roles that NocoBase binds to new routes
const ROLES = ['admin', 'member', 'root'];

// ─── Core: Create a single page exactly like the UI does ────────────────────

async function createPageLikeUI(
    page: PageConfig,
    parentRouteId: number,
    created: CreatedResource[]
): Promise<void> {
    log(`\n  📄 "${page.title}":`, 'white');

    if (DRY_RUN) {
        log('    [DRY] crearía page route + tabs route + 2 schemas + menu + tree paths + role bindings', 'gray');
        return;
    }

    // ─── Step 1: Create the Page schema ─────────────────────────────────
    const pageSchema = {
        type: 'void',
        'x-component': 'Page',
    };
    const pageSchemaResp = await client.post('/uiSchemas:insert', pageSchema);
    const pageSchemaData = (pageSchemaResp as Record<string, unknown>).data as Record<string, unknown>;
    const pageSchemaUid = pageSchemaData?.['x-uid'] as string;
    log(`    ✅ Page schema: ${pageSchemaUid}`, 'green');
    created.push({ type: 'schema', id: pageSchemaUid, title: `${page.title} page schema` });

    // ─── Step 2: Create the Grid schema (child of Page) ─────────────────
    const gridSchema = {
        type: 'void',
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
    };
    const gridSchemaResp = await client.post('/uiSchemas:insert', gridSchema);
    const gridSchemaData = (gridSchemaResp as Record<string, unknown>).data as Record<string, unknown>;
    const gridSchemaUid = gridSchemaData?.['x-uid'] as string;
    const gridSchemaName = gridSchemaData?.name as string;
    log(`    ✅ Grid schema: ${gridSchemaUid} (name: ${gridSchemaName})`, 'green');
    created.push({ type: 'schema', id: gridSchemaUid, title: `${page.title} grid schema` });

    // ─── Step 3: Create Menu.Item schema ────────────────────────────────
    const menuSchema = {
        type: 'void',
        'x-component': 'Menu.Item',
        'x-component-props': {},
        title: page.title,
    };
    const menuResp = await client.post('/uiSchemas:insert', menuSchema);
    const menuData = (menuResp as Record<string, unknown>).data as Record<string, unknown>;
    const menuSchemaUid = menuData?.['x-uid'] as string;
    log(`    ✅ Menu schema: ${menuSchemaUid}`, 'green');
    created.push({ type: 'schema', id: menuSchemaUid, title: `${page.title} menu schema` });

    // ─── Step 4: Create the page route ──────────────────────────────────
    const pageRouteResp = await client.post('/desktopRoutes:create', {
        parentId: parentRouteId,
        title: page.title,
        icon: page.icon || null,
        schemaUid: pageSchemaUid,
        menuSchemaUid: menuSchemaUid,
        type: 'page',
        enableTabs: false,
    });
    const pageRouteData = (pageRouteResp as Record<string, unknown>).data as Record<string, unknown>;
    const pageRouteId = pageRouteData?.id as number;
    log(`    ✅ Page route: #${pageRouteId}`, 'green');
    created.push({ type: 'route', id: pageRouteId, title: `${page.title} page route` });

    // ─── Step 5: Create the hidden tabs route (child of page) ───────────
    const tabsRouteResp = await client.post('/desktopRoutes:create', {
        parentId: pageRouteId,
        title: null,
        schemaUid: gridSchemaUid,
        tabSchemaName: gridSchemaName,
        type: 'tabs',
        hidden: true,
    });
    const tabsRouteData = (tabsRouteResp as Record<string, unknown>).data as Record<string, unknown>;
    const tabsRouteId = tabsRouteData?.id as number;
    log(`    ✅ Tabs route: #${tabsRouteId} (hidden)`, 'green');
    created.push({ type: 'route', id: tabsRouteId, title: `${page.title} tabs route` });

    // ─── Step 6: Create uiSchemaTreePath entries ────────────────────────
    // NocoBase uses these to track schema hierarchy
    // Path 1: Page self-reference (depth 0)
    // Path 2: Page → Grid (depth 1)
    // Path 3: Grid self-reference (depth 0, async: true, type: "properties")
    try {
        await client.post('/uiSchemaTreePath:create', {
            ancestor: pageSchemaUid,
            descendant: pageSchemaUid,
            depth: 0,
            async: false,
            type: null,
            sort: null,
        });
        await client.post('/uiSchemaTreePath:create', {
            ancestor: pageSchemaUid,
            descendant: gridSchemaUid,
            depth: 1,
            async: null,
            type: null,
            sort: 1,
        });
        await client.post('/uiSchemaTreePath:create', {
            ancestor: gridSchemaUid,
            descendant: gridSchemaUid,
            depth: 0,
            async: true,
            type: 'properties',
            sort: null,
        });
        log(`    ✅ Tree paths: 3 created`, 'green');
    } catch (e: unknown) {
        log(`    ⚠️ Tree paths error (may already exist): ${e instanceof Error ? e.message : String(e)}`, 'yellow');
    }

    // ─── Step 7: Create role bindings ───────────────────────────────────
    for (const role of ROLES) {
        try {
            await client.post('/rolesDesktopRoutes:create', {
                desktopRouteId: pageRouteId,
                roleName: role,
            });
            await client.post('/rolesDesktopRoutes:create', {
                desktopRouteId: tabsRouteId,
                roleName: role,
            });
        } catch (_e: unknown) {
            // Role binding may already exist
        }
    }
    log(`    ✅ Role bindings: ${ROLES.length} roles × 2 routes`, 'green');
}

// ─── Create group route ─────────────────────────────────────────────────────

async function createGroup(group: GroupConfig, created: CreatedResource[]): Promise<number> {
    log(`\n📁 Grupo: "${group.title}"`, 'cyan');

    if (DRY_RUN) {
        log('  [DRY] crearía grupo route + schema', 'gray');
        return 0;
    }

    // Create schema for group (empty Menu.SubMenu)
    const groupSchema = {
        type: 'void',
        'x-component': 'Menu.SubMenu',
        'x-component-props': {},
    };
    const schemaResp = await client.post('/uiSchemas:insert', groupSchema);
    const schemaData = (schemaResp as Record<string, unknown>).data as Record<string, unknown>;
    const groupSchemaUid = schemaData?.['x-uid'] as string;

    const routeResp = await client.post('/desktopRoutes:create', {
        title: group.title,
        icon: group.icon || null,
        schemaUid: groupSchemaUid,
        type: 'group',
    });
    const routeData = (routeResp as Record<string, unknown>).data as Record<string, unknown>;
    const routeId = routeData?.id as number;

    // Bind roles
    for (const role of ROLES) {
        try {
            await client.post('/rolesDesktopRoutes:create', {
                desktopRouteId: routeId,
                roleName: role,
            });
        } catch (_e: unknown) { /* may exist */ }
    }

    log(`  ✅ Route #${routeId}, schema: ${groupSchemaUid}`, 'green');
    created.push({ type: 'route', id: routeId, title: `${group.title} group` });
    created.push({ type: 'schema', id: groupSchemaUid, title: `${group.title} group schema` });
    return routeId;
}

// ─── Verify ─────────────────────────────────────────────────────────────────

async function verifyAll() {
    log('\n🔍 === VERIFICACIÓN ===\n', 'cyan');
    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routesData = routesResp as Record<string, unknown>;
    const routes = ((routesData.data || routesData) as Record<string, unknown>[]) || [];

    for (const route of routes) {
        if (route.type === 'group') {
            const hasSchema = !!route.schemaUid;
            log(`📁 "${route.title}" (group) schema: ${route.schemaUid || 'NULL'} ${hasSchema ? '✅' : '❌'}`, hasSchema ? 'green' : 'red');

            const children = routes.filter(r => r.parentId === route.id);
            for (const child of children) {
                if (child.type === 'page') {
                    const ok = !!child.schemaUid && !!child.menuSchemaUid && child.enableTabs !== null;
                    log(`  📄 "${child.title}" schema:${child.schemaUid || 'NULL'} menu:${child.menuSchemaUid || 'NULL'} tabs:${child.enableTabs} ${ok ? '✅' : '❌'}`, ok ? 'green' : 'red');

                    // Check for tabs child
                    const tabsChild = routes.find(r => r.parentId === child.id && r.type === 'tabs');
                    if (tabsChild) {
                        log(`    📑 tabs: schema:${tabsChild.schemaUid} hidden:${tabsChild.hidden} ✅`, 'green');
                    } else {
                        log(`    📑 tabs: MISSING ❌`, 'red');
                    }
                }
            }
        }
    }
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

async function cleanup(configPath: string) {
    const manifestPath = configPath.replace('.json', '-manifest.json');
    if (!fs.existsSync(manifestPath)) {
        log(`❌ No manifest found: ${manifestPath}`, 'red');
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as CreatedResource[];
    log(`\n🗑️ Cleaning up ${manifest.length} resources...\n`, 'cyan');

    // Delete in reverse order (routes first, then schemas)
    const routes = manifest.filter(r => r.type === 'route').reverse();
    const schemas = manifest.filter(r => r.type === 'schema').reverse();

    for (const route of routes) {
        try {
            await client.post(`/desktopRoutes:destroy?filterByTk=${route.id}`, {});
            log(`  ✅ Deleted route #${route.id}: ${route.title}`, 'green');
        } catch (_e: unknown) {
            log(`  ⚠️ Could not delete route #${route.id}`, 'yellow');
        }
    }

    for (const schema of schemas) {
        try {
            await client.post(`/uiSchemas:remove/${schema.id}`, {});
            log(`  ✅ Deleted schema ${schema.id}: ${schema.title}`, 'green');
        } catch (_e: unknown) {
            log(`  ⚠️ Could not delete schema ${schema.id}`, 'yellow');
        }
    }

    fs.unlinkSync(manifestPath);
    log(`\n✅ Cleanup complete`, 'green');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('🚀 NocoBase UI Deployer (Correct Pattern)\n', 'cyan');

    if (VERIFY) {
        await verifyAll();
        return;
    }

    if (!CONFIG_PATH) {
        log('USO: npx tsx deploy-ui-correct.ts --config <path-to-config.json> [--dry-run] [--cleanup] [--verify]', 'white');
        return;
    }

    if (CLEANUP) {
        await cleanup(CONFIG_PATH);
        return;
    }

    if (!fs.existsSync(CONFIG_PATH)) {
        log(`❌ Config not found: ${CONFIG_PATH}`, 'red');
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as UIConfig;
    const created: CreatedResource[] = [];

    log(`📋 Config: ${path.basename(CONFIG_PATH)}${DRY_RUN ? ' [DRY RUN]' : ''}`, 'white');
    log(`   ${config.groups.length} grupo(s)`, 'gray');

    for (const group of config.groups) {
        const groupId = await createGroup(group, created);

        for (const page of group.pages) {
            await createPageLikeUI(page, groupId, created);
        }
    }

    // Save manifest
    if (!DRY_RUN) {
        const manifestPath = CONFIG_PATH.replace('.json', '-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(created, null, 2));
        log(`\n📁 Manifest: ${manifestPath} (${created.length} resources)`, 'cyan');
    }

    log('\n─── Verificación ───', 'white');
    await verifyAll();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
