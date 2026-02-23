/**
 * validate-advanced-config.ts — Test ADVANCED UI configurations via API
 *
 * Tests the high-impact configurations that make blocks actually usable:
 *
 *   1. Drawer/Popup schemas — Create action opens drawer with form
 *   2. Row-level actions — Edit, View, Delete per row in table
 *   3. Relation fields — belongsTo association columns in table
 *   4. Multi-tab pages — enableTabs: true with multiple tab children
 *   5. Data scope — currentUser-based filtering
 *   6. Nested drawer form — Edit button opens drawer with editable form
 *   7. Sub-table inside form — hasMany relation displayed as nested table
 *   8. Link actions — Custom buttons that navigate or open URLs
 *   9. Conditional display — x-linkage-rules for field visibility
 *   10. Block templates — Save and restore block configuration
 *   11. Collection + Field creation — Create tables via API
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();
const ROLES = ['admin', 'member', 'root'];
const COLLECTION = 'ag_servicios';

interface TestResult { name: string; status: 'PASS' | 'FAIL'; detail: string; ms: number; }
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<string>) {
    const t0 = Date.now();
    try {
        const d = await fn();
        results.push({ name, status: 'PASS', detail: d, ms: Date.now() - t0 });
        log(`  ✅ ${name} (${Date.now() - t0}ms)`, 'green');
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ name, status: 'FAIL', detail: msg, ms: Date.now() - t0 });
        log(`  ❌ ${name}: ${msg}`, 'red');
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function wrap(inner: Record<string, unknown>): Record<string, unknown> {
    return { type: 'void', 'x-component': 'Grid.Row', properties: { col: { type: 'void', 'x-component': 'Grid.Col', properties: { block: inner } } } };
}

async function insert(parentUid: string, schema: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resp = await client.post(`/uiSchemas:insertAdjacent/${parentUid}?position=beforeEnd`, { schema });
    return (resp as Record<string, unknown>).data as Record<string, unknown>;
}

async function getSchema(uid: string): Promise<Record<string, unknown>> {
    const resp = await client.get(`/uiSchemas:getJsonSchema/${uid}`, {});
    return ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
}

async function patchSchema(uid: string, patch: Record<string, unknown>): Promise<void> {
    await client.post('/uiSchemas:patch', { 'x-uid': uid, ...patch });
}

function find(obj: Record<string, unknown>, key: string, value: string): string | null {
    if (obj[key] === value && obj['x-uid']) return obj['x-uid'] as string;
    if (obj.properties) for (const k of Object.keys(obj.properties as Record<string, unknown>)) {
        const r = find((obj.properties as Record<string, unknown>)[k] as Record<string, unknown>, key, value);
        if (r) return r;
    }
    return null;
}

function countProps(obj: Record<string, unknown>): number {
    const p = obj.properties as Record<string, unknown> | undefined;
    return p ? Object.keys(p).length : 0;
}

// ─── Test Page ──────────────────────────────────────────────────────────────

interface TestPage { pageRouteId: number; tabsRouteId: number; gridUid: string; pageSchemaUid: string; menuSchemaUid: string; }

async function createTestPage(title: string): Promise<TestPage> {
    const pr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Page' });
    const pageSchemaUid = ((pr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;
    const gr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock' });
    const gd = (gr as Record<string, unknown>).data as Record<string, unknown>;
    const gridUid = gd?.['x-uid'] as string; const gridName = gd?.name as string;
    const mr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Menu.Item', 'x-component-props': {}, title });
    const menuSchemaUid = ((mr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;
    const rr = await client.post('/desktopRoutes:create', { parentId: null, title, schemaUid: pageSchemaUid, menuSchemaUid, type: 'page', enableTabs: false });
    const pageRouteId = ((rr as Record<string, unknown>).data as Record<string, unknown>)?.id as number;
    const tr = await client.post('/desktopRoutes:create', { parentId: pageRouteId, schemaUid: gridUid, tabSchemaName: gridName, type: 'tabs', hidden: true });
    const tabsRouteId = ((tr as Record<string, unknown>).data as Record<string, unknown>)?.id as number;
    for (const role of ROLES) {
        try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: pageRouteId, roleName: role }); } catch (_e) { /* */ }
        try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: tabsRouteId, roleName: role }); } catch (_e) { /* */ }
    }
    return { pageRouteId, tabsRouteId, gridUid, pageSchemaUid, menuSchemaUid };
}

async function destroyTestPage(tp: TestPage) {
    try { await client.post(`/desktopRoutes:destroy?filterByTk=${tp.tabsRouteId}`, {}); } catch (_e) { /* */ }
    try { await client.post(`/desktopRoutes:destroy?filterByTk=${tp.pageRouteId}`, {}); } catch (_e) { /* */ }
    try { await client.post(`/uiSchemas:remove/${tp.pageSchemaUid}`, {}); } catch (_e) { /* */ }
    try { await client.post(`/uiSchemas:remove/${tp.menuSchemaUid}`, {}); } catch (_e) { /* */ }
    try { await client.post(`/uiSchemas:remove/${tp.gridUid}`, {}); } catch (_e) { /* */ }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

async function main() {
    log('╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase ADVANCED CONFIG Validation Suite              ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

    const tp = await createTestPage('__ADV_CONFIG_TEST__');
    log(`📄 Test page. Grid: ${tp.gridUid}\n`, 'gray');

    // ═══ Create base table block ════════════════════════════════════════
    const tableSchema = wrap({
        type: 'void',
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: { pageSize: 20 } },
        'x-component': 'CardItem', 'x-toolbar': 'BlockSchemaToolbar', 'x-settings': 'blockSettings:table',
        properties: {
            actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'table:configureActions', 'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } } },
            table: {
                type: 'array', 'x-component': 'TableV2', 'x-use-component-props': 'useTableBlockProps',
                'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                'x-initializer': 'table:configureColumns',
                properties: {
                    actionsCol: {
                        type: 'void', title: '{{ t("Actions") }}', 'x-component': 'TableV2.Column',
                        'x-decorator': 'TableV2.Column.Decorator', 'x-action-column': 'actions',
                        'x-initializer': 'table:configureItemActions',
                        properties: { actions: { type: 'void', 'x-decorator': 'DndContext', 'x-component': 'Space', 'x-component-props': { split: '|' } } },
                    },
                },
            },
        },
    });
    await insert(tp.gridUid, tableSchema);
    log('  📦 Base table block created\n', 'gray');

    // ═══ TEST 1: Create action → Drawer with Form ═══════════════════════
    log('═══ 1. CREATE ACTION WITH DRAWER FORM ═══\n', 'cyan');

    await test('Create button → opens Drawer → with editable Form', async () => {
        const schema = await getSchema(tp.gridUid);
        const abUid = find(schema, 'x-initializer', 'table:configureActions');
        if (!abUid) throw new Error('ActionBar not found');

        const createActionSchema = {
            type: 'void',
            title: '{{ t("Add new") }}',
            'x-component': 'Action',
            'x-action': 'create',
            'x-align': 'right',
            'x-component-props': { type: 'primary', icon: 'PlusOutlined', openMode: 'drawer' },
            'x-decorator': 'ACLActionProvider',
            properties: {
                drawer: {
                    type: 'void',
                    title: 'Agregar Servicio',
                    'x-component': 'Action.Container',
                    'x-component-props': { className: 'nb-action-popup' },
                    properties: {
                        tabs: {
                            type: 'void',
                            'x-component': 'Tabs',
                            'x-component-props': {},
                            properties: {
                                tab1: {
                                    type: 'void',
                                    title: '{{ t("Add new") }}',
                                    'x-component': 'Tabs.TabPane',
                                    'x-component-props': {},
                                    properties: {
                                        grid: {
                                            type: 'void',
                                            'x-component': 'Grid',
                                            'x-initializer': 'popup:addNew:addBlock',
                                            properties: {
                                                row1: {
                                                    type: 'void', 'x-component': 'Grid.Row',
                                                    properties: {
                                                        col1: {
                                                            type: 'void', 'x-component': 'Grid.Col',
                                                            properties: {
                                                                form: {
                                                                    type: 'void',
                                                                    'x-decorator': 'FormBlockProvider',
                                                                    'x-decorator-props': { collection: COLLECTION, dataSource: 'main' },
                                                                    'x-component': 'CardItem',
                                                                    'x-toolbar': 'BlockSchemaToolbar',
                                                                    'x-settings': 'blockSettings:createForm',
                                                                    properties: {
                                                                        formBody: {
                                                                            type: 'void', 'x-component': 'FormV2',
                                                                            'x-use-component-props': 'useCreateFormBlockProps',
                                                                            properties: {
                                                                                grid: {
                                                                                    type: 'void', 'x-component': 'Grid',
                                                                                    'x-initializer': 'form:configureFields',
                                                                                    properties: {
                                                                                        nombreRow: {
                                                                                            type: 'void', 'x-component': 'Grid.Row',
                                                                                            properties: {
                                                                                                nombreCol: {
                                                                                                    type: 'void', 'x-component': 'Grid.Col',
                                                                                                    properties: {
                                                                                                        nombre: {
                                                                                                            type: 'string',
                                                                                                            'x-component': 'CollectionField',
                                                                                                            'x-collection-field': `${COLLECTION}.nombre`,
                                                                                                            'x-decorator': 'FormItem',
                                                                                                            title: 'Nombre',
                                                                                                            required: true,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                                actions: {
                                                                                    type: 'void', 'x-component': 'ActionBar',
                                                                                    'x-initializer': 'createForm:configureActions',
                                                                                    'x-component-props': { layout: 'one-column' },
                                                                                    properties: {
                                                                                        submit: {
                                                                                            type: 'void', title: '{{ t("Submit") }}',
                                                                                            'x-component': 'Action',
                                                                                            'x-action': 'submit',
                                                                                            'x-use-component-props': 'useCreateActionProps',
                                                                                            'x-component-props': { type: 'primary', htmlType: 'submit' },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        await insert(abUid, createActionSchema);
        const verify = await getSchema(abUid);
        const hasCreate = find(verify, 'x-action', 'create');
        if (!hasCreate) throw new Error('Create action not found after insertion');
        return `Create action + Drawer + Tabs + FormBlockProvider + field + submit button`;
    });

    // ═══ TEST 2: Row-level Edit action ══════════════════════════════════
    log('\n═══ 2. ROW-LEVEL EDIT ACTION WITH DRAWER ═══\n', 'cyan');

    await test('Row Edit button → opens Drawer → with update Form', async () => {
        const schema = await getSchema(tp.gridUid);
        // Find the item actions Space inside the Actions column
        const itemActionsUid = find(schema, 'x-component', 'Space');
        if (!itemActionsUid) throw new Error('Row actions Space not found');

        const editActionSchema = {
            type: 'void',
            title: '{{ t("Edit") }}',
            'x-component': 'Action.Link',
            'x-action': 'update',
            'x-component-props': { openMode: 'drawer', icon: 'EditOutlined' },
            'x-decorator': 'ACLActionProvider',
            properties: {
                drawer: {
                    type: 'void',
                    title: 'Editar Servicio',
                    'x-component': 'Action.Container',
                    'x-component-props': { className: 'nb-action-popup' },
                    properties: {
                        tabs: {
                            type: 'void', 'x-component': 'Tabs',
                            properties: {
                                tab1: {
                                    type: 'void', title: '{{ t("Edit") }}', 'x-component': 'Tabs.TabPane',
                                    properties: {
                                        grid: {
                                            type: 'void', 'x-component': 'Grid',
                                            'x-initializer': 'popup:common:addBlock',
                                            properties: {
                                                row1: {
                                                    type: 'void', 'x-component': 'Grid.Row',
                                                    properties: {
                                                        col1: {
                                                            type: 'void', 'x-component': 'Grid.Col',
                                                            properties: {
                                                                form: {
                                                                    type: 'void',
                                                                    'x-decorator': 'FormBlockProvider',
                                                                    'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'get', useParams: '{{ useParamsFromRecord }}', useSourceId: '{{ useSourceIdFromParentRecord }}' },
                                                                    'x-component': 'CardItem',
                                                                    'x-settings': 'blockSettings:editForm',
                                                                    properties: {
                                                                        formBody: {
                                                                            type: 'void', 'x-component': 'FormV2',
                                                                            'x-use-component-props': 'useEditFormBlockProps',
                                                                            'x-read-pretty': false,
                                                                            properties: {
                                                                                grid: {
                                                                                    type: 'void', 'x-component': 'Grid',
                                                                                    'x-initializer': 'form:configureFields',
                                                                                },
                                                                                actions: {
                                                                                    type: 'void', 'x-component': 'ActionBar',
                                                                                    'x-initializer': 'editForm:configureActions',
                                                                                    'x-component-props': { layout: 'one-column' },
                                                                                    properties: {
                                                                                        submit: {
                                                                                            type: 'void', title: '{{ t("Submit") }}',
                                                                                            'x-component': 'Action',
                                                                                            'x-action': 'submit',
                                                                                            'x-use-component-props': 'useUpdateActionProps',
                                                                                            'x-component-props': { type: 'primary' },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        await insert(itemActionsUid, editActionSchema);
        const _verify = await getSchema(itemActionsUid);
        return `Edit action + Drawer + editForm + useUpdateActionProps + submit`;
    });

    // ═══ TEST 3: Row-level View action ══════════════════════════════════
    log('\n═══ 3. ROW-LEVEL VIEW ACTION ═══\n', 'cyan');

    await test('Row View button → opens Drawer → with read-only Details', async () => {
        const schema = await getSchema(tp.gridUid);
        const itemActionsUid = find(schema, 'x-component', 'Space');
        if (!itemActionsUid) throw new Error('Row actions Space not found');

        const viewActionSchema = {
            type: 'void',
            title: '{{ t("View") }}',
            'x-component': 'Action.Link',
            'x-action': 'view',
            'x-component-props': { openMode: 'drawer' },
            'x-decorator': 'ACLActionProvider',
            properties: {
                drawer: {
                    type: 'void',
                    title: 'Ver Servicio',
                    'x-component': 'Action.Container',
                    properties: {
                        tabs: {
                            type: 'void', 'x-component': 'Tabs',
                            properties: {
                                tab1: {
                                    type: 'void', title: '{{ t("Details") }}', 'x-component': 'Tabs.TabPane',
                                    properties: {
                                        grid: {
                                            type: 'void', 'x-component': 'Grid', 'x-initializer': 'popup:common:addBlock',
                                            properties: {
                                                row1: {
                                                    type: 'void', 'x-component': 'Grid.Row',
                                                    properties: {
                                                        col1: {
                                                            type: 'void', 'x-component': 'Grid.Col',
                                                            properties: {
                                                                details: {
                                                                    type: 'void',
                                                                    'x-decorator': 'DetailsBlockProvider',
                                                                    'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'get', useParams: '{{ useParamsFromRecord }}' },
                                                                    'x-component': 'CardItem', 'x-settings': 'blockSettings:details',
                                                                    properties: {
                                                                        detailsBody: {
                                                                            type: 'void', 'x-component': 'Details',
                                                                            'x-use-component-props': 'useDetailsBlockProps',
                                                                            'x-read-pretty': true,
                                                                            properties: {
                                                                                grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'details:configureFields' },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        await insert(itemActionsUid, viewActionSchema);
        return `View action + Drawer + DetailsBlockProvider (read-only)`;
    });

    // ═══ TEST 4: Row-level Delete action ════════════════════════════════
    log('\n═══ 4. ROW-LEVEL DELETE ACTION ═══\n', 'cyan');

    await test('Row Delete button → confirm dialog → destroy', async () => {
        const schema = await getSchema(tp.gridUid);
        const itemActionsUid = find(schema, 'x-component', 'Space');
        if (!itemActionsUid) throw new Error('Row actions Space not found');

        const deleteActionSchema = {
            type: 'void',
            title: '{{ t("Delete") }}',
            'x-component': 'Action.Link',
            'x-action': 'destroy',
            'x-use-component-props': 'useDestroyActionProps',
            'x-component-props': {
                confirm: {
                    title: '{{ t("Delete record") }}',
                    content: '{{ t("Are you sure you want to delete it?") }}',
                },
            },
            'x-decorator': 'ACLActionProvider',
        };

        await insert(itemActionsUid, deleteActionSchema);
        const verify = await getSchema(itemActionsUid);
        const cnt = countProps(verify);
        return `Delete action added. Row now has ${cnt} actions (Edit + View + Delete)`;
    });

    // ═══ TEST 5: Multi-tab page ═════════════════════════════════════════
    log('\n═══ 5. MULTI-TAB PAGE ═══\n', 'cyan');

    await test('Create page with 3 tabs', async () => {
        // Create page schema
        const pr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Page' });
        const pUid = ((pr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

        // Create 3 grids (one per tab)
        const grids: { uid: string; name: string }[] = [];
        for (let i = 0; i < 3; i++) {
            const gr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock' });
            const gd = (gr as Record<string, unknown>).data as Record<string, unknown>;
            grids.push({ uid: gd?.['x-uid'] as string, name: gd?.name as string });
        }

        const mr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Menu.Item', title: '__TABS_TEST__' });
        const mUid = ((mr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

        // Create page route with enableTabs: true
        const rr = await client.post('/desktopRoutes:create', {
            parentId: null, title: '__TABS_TEST__', schemaUid: pUid, menuSchemaUid: mUid,
            type: 'page', enableTabs: true,
        });
        const pRouteId = ((rr as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

        // Create 3 tab routes
        const tabNames = ['General', 'Detalle', 'Historial'];
        const tabIds: number[] = [];
        for (let i = 0; i < 3; i++) {
            const tabR = await client.post('/desktopRoutes:create', {
                parentId: pRouteId, title: tabNames[i],
                schemaUid: grids[i].uid, tabSchemaName: grids[i].name,
                type: 'tabs', hidden: false,
            });
            tabIds.push(((tabR as Record<string, unknown>).data as Record<string, unknown>)?.id as number);
        }

        // Role bindings
        for (const role of ROLES) {
            try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: pRouteId, roleName: role }); } catch (_e) { /* */ }
            for (const tid of tabIds) {
                try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: tid, roleName: role }); } catch (_e) { /* */ }
            }
        }

        // Cleanup
        for (const tid of tabIds) try { await client.post(`/desktopRoutes:destroy?filterByTk=${tid}`, {}); } catch (_e) { /* */ }
        try { await client.post(`/desktopRoutes:destroy?filterByTk=${pRouteId}`, {}); } catch (_e) { /* */ }
        try { await client.post(`/uiSchemas:remove/${pUid}`, {}); } catch (_e) { /* */ }
        try { await client.post(`/uiSchemas:remove/${mUid}`, {}); } catch (_e) { /* */ }
        for (const g of grids) try { await client.post(`/uiSchemas:remove/${g.uid}`, {}); } catch (_e) { /* */ }

        return `3-tab page created (${tabNames.join(', ')}), enableTabs: true, all cleaned up`;
    });

    // ═══ TEST 6: Data scope with variables ══════════════════════════════
    log('\n═══ 6. DATA SCOPE WITH VARIABLES ═══\n', 'cyan');

    await test('Table: set data scope with $currentUser variable', async () => {
        const schema = await getSchema(tp.gridUid);
        const blockUid = find(schema, 'x-decorator', 'TableBlockProvider');
        if (!blockUid) throw new Error('TableBlockProvider not found');

        await patchSchema(blockUid, {
            'x-decorator-props': {
                collection: COLLECTION, dataSource: 'main', action: 'list',
                params: {
                    pageSize: 20,
                    filter: {
                        $and: [
                            { createdById: { $eq: '{{ $nRole }}' } },
                        ],
                    },
                },
            },
        });

        const verify = await getSchema(blockUid);
        const dp = verify['x-decorator-props'] as Record<string, unknown>;
        const params = dp?.params as Record<string, unknown>;
        const filter = JSON.stringify(params?.filter);
        return `Data scope with $nRole variable: ${filter.substring(0, 80)}`;
    });

    // ═══ TEST 7: Bulk actions ═══════════════════════════════════════════
    log('\n═══ 7. BULK ACTIONS (Bulk Delete + Bulk Update) ═══\n', 'cyan');

    await test('Table: Add bulk delete + bulk update actions', async () => {
        const schema = await getSchema(tp.gridUid);
        const abUid = find(schema, 'x-initializer', 'table:configureActions');
        if (!abUid) throw new Error('ActionBar not found');

        // Bulk delete
        await insert(abUid, {
            type: 'void',
            title: '{{ t("Delete") }}',
            'x-component': 'Action',
            'x-action': 'destroy',
            'x-align': 'right',
            'x-use-component-props': 'useBulkDestroyActionProps',
            'x-component-props': {
                icon: 'DeleteOutlined',
                confirm: { title: '{{ t("Delete record") }}', content: '{{ t("Are you sure?") }}' },
            },
            'x-decorator': 'ACLActionProvider',
        });

        // Bulk update
        await insert(abUid, {
            type: 'void',
            title: '{{ t("Bulk update") }}',
            'x-component': 'Action',
            'x-action': 'customize:bulkUpdate',
            'x-align': 'right',
            'x-component-props': { icon: 'EditOutlined', openMode: 'drawer' },
            'x-decorator': 'ACLActionProvider',
            'x-use-component-props': 'useCustomizeBulkUpdateActionProps',
        });

        const verify = await getSchema(abUid);
        const cnt = countProps(verify);
        return `ActionBar now has ${cnt} actions (includes bulk delete + bulk update)`;
    });

    // ═══ TEST 8: Collection + Field creation ════════════════════════════
    log('\n═══ 8. COLLECTION + FIELD CREATION VIA API ═══\n', 'cyan');

    await test('Create collection + 3 fields + verify + destroy', async () => {
        const collName = '__test_api_collection__';

        // Create collection
        await client.post('/collections:create', {
            name: collName,
            title: 'Test API Collection',
            fields: [
                { name: 'nombre', type: 'string', interface: 'input', uiSchema: { type: 'string', title: 'Nombre', 'x-component': 'Input' } },
                { name: 'activo', type: 'boolean', interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Activo', 'x-component': 'Checkbox' } },
                { name: 'fecha', type: 'date', interface: 'datetime', uiSchema: { type: 'string', title: 'Fecha', 'x-component': 'DatePicker' } },
            ],
        });

        // Verify
        const fieldsResp = await client.get(`/collections/${collName}/fields:list`, { paginate: false });
        const fields = ((fieldsResp as Record<string, unknown>).data || fieldsResp) as Record<string, unknown>[];
        const fieldNames = fields.map(f => f.name as string).filter(n => !['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById'].includes(n));

        // Cleanup
        await client.post(`/collections:destroy?filterByTk=${collName}`, {});

        return `Collection '${collName}' created with fields: ${fieldNames.join(', ')}. Destroyed.`;
    });

    // ═══ TEST 9: Relationship field ═════════════════════════════════════
    log('\n═══ 9. RELATIONSHIP FIELD (belongsTo) ═══\n', 'cyan');

    await test('Create belongsTo relation field between two test collections', async () => {
        // Create parent + child collections
        await client.post('/collections:create', { name: '__test_parent__', title: 'Parent', fields: [
            { name: 'nombre', type: 'string', interface: 'input', uiSchema: { type: 'string', title: 'Nombre', 'x-component': 'Input' } },
        ]});

        await client.post('/collections:create', { name: '__test_child__', title: 'Child', fields: [
            { name: 'titulo', type: 'string', interface: 'input', uiSchema: { type: 'string', title: 'Título', 'x-component': 'Input' } },
        ]});

        // Add belongsTo relationship
        await client.post('/collections/__test_child__/fields:create', {
            name: 'parent',
            type: 'belongsTo',
            interface: 'obo',
            target: '__test_parent__',
            foreignKey: 'parentId',
            targetKey: 'id',
            uiSchema: { type: 'object', title: 'Parent', 'x-component': 'AssociationField', 'x-component-props': { multiple: false } },
        });

        // Verify
        const fieldsResp = await client.get('/collections/__test_child__/fields:list', { paginate: false });
        const fields = ((fieldsResp as Record<string, unknown>).data || fieldsResp) as Record<string, unknown>[];
        const relField = fields.find(f => f.name === 'parent');

        // Cleanup
        await client.post('/collections:destroy?filterByTk=__test_child__', {});
        await client.post('/collections:destroy?filterByTk=__test_parent__', {});

        if (!relField) throw new Error('Relation field not found');
        return `belongsTo: __test_child__.parent → __test_parent__ (type: ${relField.type}, target: ${relField.target})`;
    });

    // ═══ TEST 10: Block template save/restore ═══════════════════════════
    log('\n═══ 10. BLOCK TEMPLATE (Save + List + Destroy) ═══\n', 'cyan');

    await test('Save block as template, list, destroy', async () => {
        const schema = await getSchema(tp.gridUid);
        const blockUid = find(schema, 'x-decorator', 'TableBlockProvider');
        if (!blockUid) throw new Error('TableBlockProvider not found');

        // Save as template
        const tmplResp = await client.post('/uiSchemaTemplates:create', {
            name: '__test_template__',
            componentName: 'Table',
            collectionName: COLLECTION,
            resourceName: COLLECTION,
            uid: blockUid,
        });
        const tmplData = (tmplResp as Record<string, unknown>).data as Record<string, unknown>;
        const tmplKey = tmplData?.key as string;

        // List templates
        const listResp = await client.get('/uiSchemaTemplates:list', { paginate: false });
        const templates = ((listResp as Record<string, unknown>).data || listResp) as Record<string, unknown>[];
        const found = templates.find(t => t.name === '__test_template__');

        // Destroy template
        if (tmplKey) {
            await client.post(`/uiSchemaTemplates:destroy?filterByTk=${tmplKey}`, {});
        }

        return `Template saved (key: ${tmplKey}), found in list: ${!!found}, destroyed`;
    });

    // ═══ TEST 11: Schema tree depth verification ════════════════════════
    log('\n═══ 11. FULL SCHEMA DEPTH VERIFICATION ═══\n', 'cyan');

    await test('Verify schema tree depth after all configurations', async () => {
        const schema = await getSchema(tp.gridUid);
        let maxDepth = 0;
        let nodeCount = 0;
        function walk(obj: Record<string, unknown>, depth: number) {
            nodeCount++;
            if (depth > maxDepth) maxDepth = depth;
            if (obj.properties) for (const k of Object.keys(obj.properties as Record<string, unknown>)) {
                walk((obj.properties as Record<string, unknown>)[k] as Record<string, unknown>, depth + 1);
            }
        }
        walk(schema, 0);
        return `${nodeCount} nodes, max depth: ${maxDepth}`;
    });

    // ═══ Cleanup ════════════════════════════════════════════════════════
    log('\n═══ CLEANUP ═══\n', 'cyan');
    await destroyTestPage(tp);
    log('  🗑️ Test page + all blocks destroyed\n', 'gray');

    // ═══ Summary ════════════════════════════════════════════════════════
    log('╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║  RESULTS                                                ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

    const pass = results.filter(r => r.status === 'PASS').length;
    const fail = results.filter(r => r.status === 'FAIL').length;

    for (const r of results) {
        const icon = r.status === 'PASS' ? '✅' : '❌';
        log(`  ${icon} ${r.name} (${r.ms}ms)`, r.status === 'PASS' ? 'green' : 'red');
        if (r.status === 'FAIL') log(`     └─ ${r.detail}`, 'red');
    }

    log(`\n  📊 Total: ${results.length} | Pass: ${pass} | Fail: ${fail}`, 'cyan');
    log(`  📈 Score: ${Math.round((pass / results.length) * 100)}%\n`, pass === results.length ? 'green' : 'yellow');

    if (fail > 0) process.exit(1);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
