/**
 * validate-all-blocks.ts — Test ALL NocoBase block types via API
 *
 * Tests every block type available in NocoBase's "Añadir bloque" menu:
 *
 * DATA BLOCKS (Bloques de datos):
 *   ✅ Table (TableBlockProvider)
 *   ✅ Form (FormBlockProvider)
 *   ✅ Details (DetailsBlockProvider)
 *   🆕 List (ListBlockProvider)
 *   🆕 Grid Card (GridCardBlockProvider)
 *   🆕 Calendar (CalendarBlockProvider)
 *   🆕 Kanban (KanbanBlockProvider)
 *   🆕 Gantt (GanttBlockProvider)
 *   🆕 Filter Form (FilterFormBlockProvider)
 *
 * OTHER BLOCKS (Otros bloques):
 *   ✅ Markdown (Markdown.Void)
 *   🆕 Iframe
 *
 * Each test: create block → verify grid child count increased → report
 * Uses a TEST PAGE to avoid polluting production pages.
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();
const ROLES = ['admin', 'member', 'root'];

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    detail: string;
    ms: number;
}

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

async function insertBlock(gridUid: string, schema: Record<string, unknown>): Promise<unknown> {
    const resp = await client.post(
        `/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`,
        { schema }
    );
    return (resp as Record<string, unknown>).data;
}

async function gridChildCount(gridUid: string): Promise<number> {
    const resp = await client.get(`/uiSchemas:getJsonSchema/${gridUid}`, {});
    const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
    const props = schema.properties as Record<string, unknown> | undefined;
    return props ? Object.keys(props).length : 0;
}

function wrap(inner: Record<string, unknown>): Record<string, unknown> {
    // Wraps a block in the standard Grid.Row → Grid.Col container
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void',
                'x-component': 'Grid.Col',
                properties: { block: inner },
            },
        },
    };
}

// ─── Block Schema Builders ─────────────────────────────────────────────────

const COLLECTION = 'ag_servicios'; // Has data, good for testing

function tableBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: { pageSize: 20 } },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:table',
        properties: {
            actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'table:configureActions', 'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } } },
            table: {
                type: 'array', 'x-component': 'TableV2', 'x-use-component-props': 'useTableBlockProps',
                'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                'x-initializer': 'table:configureColumns',
                properties: {
                    actions: {
                        type: 'void', title: '{{ t("Actions") }}', 'x-component': 'TableV2.Column',
                        'x-decorator': 'TableV2.Column.Decorator', 'x-action-column': 'actions',
                        'x-initializer': 'table:configureItemActions',
                        properties: { actions: { type: 'void', 'x-decorator': 'DndContext', 'x-component': 'Space', 'x-component-props': { split: '|' } } },
                    },
                },
            },
        },
    });
}

function formBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'FormBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main' },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:createForm',
        properties: {
            form: {
                type: 'void', 'x-component': 'FormV2', 'x-use-component-props': 'useCreateFormBlockProps',
                properties: {
                    grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'form:configureFields' },
                    actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'createForm:configureActions', 'x-component-props': { layout: 'one-column' } },
                },
            },
        },
    });
}

function detailsBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'DetailsBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: { pageSize: 1 } },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:details',
        properties: {
            details: {
                type: 'void', 'x-component': 'Details', 'x-use-component-props': 'useDetailsBlockProps',
                properties: {
                    grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'details:configureFields' },
                    actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'detailsBlockProvider:configureActions' },
                },
            },
        },
    });
}

function listBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'ListBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: { pageSize: 10 } },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:list',
        properties: {
            list: {
                type: 'void', 'x-component': 'List',
                'x-use-component-props': 'useListBlockProps',
                properties: {
                    item: {
                        type: 'object', 'x-component': 'List.Item',
                        'x-read-pretty': true,
                        'x-use-component-props': 'useListItemProps',
                        properties: {
                            grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'details:configureFields' },
                            actionBar: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'list:configureItemActions', 'x-component-props': { layout: 'one-column' } },
                        },
                    },
                },
            },
            actionBar: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'list:configureActions', 'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } } },
        },
    });
}

function gridCardBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'GridCardBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: { pageSize: 12 } },
        'x-component': 'BlockItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:gridCard',
        properties: {
            actionBar: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'gridCard:configureActions', 'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } } },
            list: {
                type: 'void', 'x-component': 'GridCard',
                'x-use-component-props': 'useGridCardBlockProps',
                properties: {
                    item: {
                        type: 'object', 'x-component': 'GridCard.Item',
                        'x-read-pretty': true,
                        'x-use-component-props': 'useGridCardItemProps',
                        properties: {
                            grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'details:configureFields' },
                            actionBar: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'gridCard:configureItemActions', 'x-component-props': { layout: 'one-column' } },
                        },
                    },
                },
            },
        },
    });
}

function calendarBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'CalendarBlockProvider',
        'x-decorator-props': {
            collection: COLLECTION, dataSource: 'main', action: 'list',
            params: {},
            fieldNames: { id: 'id', title: 'nombre', start: 'createdAt', end: 'createdAt' },
        },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:calendar',
        properties: {
            calendar: {
                type: 'void', 'x-component': 'CalendarV2',
                'x-use-component-props': 'useCalendarBlockProps',
                properties: {
                    toolBar: { type: 'void', 'x-component': 'CalendarV2.ActionBar', 'x-initializer': 'calendar:configureActions', 'x-component-props': { style: { marginBottom: 24 } } },
                },
            },
        },
    });
}

function kanbanBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'KanbanBlockProvider',
        'x-decorator-props': {
            collection: COLLECTION, dataSource: 'main', action: 'list',
            params: {},
            groupField: 'id',
        },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:kanban',
        properties: {
            actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'kanban:configureActions', 'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } } },
            kanban: {
                type: 'void', 'x-component': 'Kanban',
                'x-use-component-props': 'useKanbanBlockProps',
                properties: {
                    card: {
                        type: 'void', 'x-component': 'Kanban.Card',
                        'x-read-pretty': true, 'x-decorator': 'BlockItem',
                        'x-label-disabled': true,
                        properties: {
                            grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'details:configureFields' },
                        },
                    },
                },
            },
        },
    });
}

function ganttBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'GanttBlockProvider',
        'x-decorator-props': {
            collection: COLLECTION, dataSource: 'main', action: 'list',
            params: {},
            fieldNames: { id: 'id', title: 'nombre', start: 'createdAt', end: 'updatedAt', progress: null, range: 'day' },
        },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:gantt',
        properties: {
            gantt: {
                type: 'void', 'x-component': 'Gantt',
                'x-use-component-props': 'useGanttBlockProps',
                properties: {
                    toolBar: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'gantt:configureActions', 'x-component-props': { style: { marginBottom: 24 } } },
                    table: {
                        type: 'void', 'x-component': 'TableV2',
                        'x-use-component-props': 'useTableBlockProps',
                        'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                        'x-initializer': 'table:configureColumns',
                    },
                },
            },
        },
    });
}

function filterFormBlock() {
    return wrap({
        type: 'void',
        'x-decorator': 'FilterFormBlockProvider',
        'x-decorator-props': { collection: COLLECTION, dataSource: 'main' },
        'x-component': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:filterForm',
        properties: {
            form: {
                type: 'void', 'x-component': 'FormV2',
                'x-use-component-props': 'useFilterFormBlockProps',
                properties: {
                    grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'filterForm:configureFields' },
                    actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'filterForm:configureActions', 'x-component-props': { layout: 'one-column' } },
                },
            },
        },
    });
}

function markdownBlock(content: string) {
    return wrap({
        type: 'void',
        'x-component': 'Markdown.Void',
        'x-component-props': { content },
        'x-decorator': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:markdown',
    });
}

function iframeBlock(url: string) {
    return wrap({
        type: 'void',
        'x-component': 'Iframe',
        'x-component-props': { url, height: '400px' },
        'x-decorator': 'CardItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:iframe',
    });
}

// ─── Test Page Setup / Teardown ─────────────────────────────────────────────

interface TestPage {
    pageRouteId: number;
    tabsRouteId: number;
    gridUid: string;
    pageSchemaUid: string;
    menuSchemaUid: string;
}

async function createTestPage(title: string): Promise<TestPage> {
    const pageSchemaResp = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Page' });
    const pageSchemaUid = ((pageSchemaResp as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

    const gridSchemaResp = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock' });
    const gridData = (gridSchemaResp as Record<string, unknown>).data as Record<string, unknown>;
    const gridUid = gridData?.['x-uid'] as string;
    const gridName = gridData?.name as string;

    const menuResp = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Menu.Item', 'x-component-props': {}, title });
    const menuSchemaUid = ((menuResp as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

    const pageRouteResp = await client.post('/desktopRoutes:create', { parentId: null, title, schemaUid: pageSchemaUid, menuSchemaUid, type: 'page', enableTabs: false });
    const pageRouteId = ((pageRouteResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

    const tabsRouteResp = await client.post('/desktopRoutes:create', { parentId: pageRouteId, schemaUid: gridUid, tabSchemaName: gridName, type: 'tabs', hidden: true });
    const tabsRouteId = ((tabsRouteResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

    for (const role of ROLES) {
        try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: pageRouteId, roleName: role }); } catch (_e) { /* ok */ }
        try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: tabsRouteId, roleName: role }); } catch (_e) { /* ok */ }
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

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase ALL BLOCK TYPES Validation Suite              ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

    // Create a dedicated test page
    log('📄 Creating test page "__API_BLOCK_TEST__"...\n', 'white');
    const tp = await createTestPage('__API_BLOCK_TEST__');
    log(`   Grid UID: ${tp.gridUid}\n`, 'gray');

    const blockTests: [string, () => Record<string, unknown>][] = [
        ['Table (TableBlockProvider)', tableBlock],
        ['Form (FormBlockProvider)', formBlock],
        ['Details (DetailsBlockProvider)', detailsBlock],
        ['List (ListBlockProvider)', listBlock],
        ['Grid Card (GridCardBlockProvider)', gridCardBlock],
        ['Calendar (CalendarBlockProvider)', calendarBlock],
        ['Kanban (KanbanBlockProvider)', kanbanBlock],
        ['Gantt (GanttBlockProvider)', ganttBlock],
        ['Filter Form (FilterFormBlockProvider)', filterFormBlock],
        ['Markdown (Markdown.Void)', () => markdownBlock('## Test Markdown\n\nAPI-created block.')],
        ['Iframe', () => iframeBlock('https://www.hospitaldeovalle.cl')],
    ];

    log('═══ BLOCK INSERTION TESTS ═══\n', 'cyan');

    for (const [name, builder] of blockTests) {
        await test(name, async () => {
            const before = await gridChildCount(tp.gridUid);
            const schema = builder();
            await insertBlock(tp.gridUid, schema);
            const after = await gridChildCount(tp.gridUid);
            if (after <= before) throw new Error(`Grid count unchanged: ${before} → ${after}`);
            return `OK (${before} → ${after} children)`;
        });
    }

    // ─── Column, Action, Deletion tests ─────────────────────────────────
    log('\n═══ CONFIGURATION TESTS ═══\n', 'cyan');

    await test('Column insert on Table', async () => {
        // Get grid schema, find first TableV2
        const resp = await client.get(`/uiSchemas:getJsonSchema/${tp.gridUid}`, {});
        const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
        let tableUid = '';
        function findComponent(obj: Record<string, unknown>, comp: string) {
            if (obj['x-component'] === comp && obj['x-uid']) { tableUid = obj['x-uid'] as string; return; }
            if (obj.properties) {
                for (const k of Object.keys(obj.properties as Record<string, unknown>)) {
                    findComponent((obj.properties as Record<string, unknown>)[k] as Record<string, unknown>, comp);
                    if (tableUid) return;
                }
            }
        }
        findComponent(schema, 'TableV2');
        if (!tableUid) throw new Error('TableV2 not found');
        const col = {
            type: 'void', 'x-component': 'TableV2.Column',
            'x-decorator': 'TableV2.Column.Decorator',
            'x-toolbar': 'TableColumnSchemaToolbar',
            'x-settings': 'fieldSettings:TableColumn',
            properties: { id: { 'x-component': 'CollectionField', 'x-collection-field': 'id', 'x-read-pretty': true, title: 'ID' } },
        };
        await client.post(`/uiSchemas:insertAdjacent/${tableUid}?position=beforeEnd`, { schema: col });
        return `Column added to TableV2 ${tableUid}`;
    });

    await test('Filter action on Table ActionBar', async () => {
        const resp = await client.get(`/uiSchemas:getJsonSchema/${tp.gridUid}`, {});
        const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
        let actionBarUid = '';
        function findAB(obj: Record<string, unknown>) {
            if (obj['x-component'] === 'ActionBar' && obj['x-uid']) { actionBarUid = obj['x-uid'] as string; return; }
            if (obj.properties) {
                for (const k of Object.keys(obj.properties as Record<string, unknown>)) {
                    findAB((obj.properties as Record<string, unknown>)[k] as Record<string, unknown>);
                    if (actionBarUid) return;
                }
            }
        }
        findAB(schema);
        if (!actionBarUid) throw new Error('ActionBar not found');
        const filter = { type: 'void', title: '{{ t("Filter") }}', 'x-component': 'Filter.Action', 'x-action': 'filter', 'x-use-component-props': 'useFilterActionProps', 'x-component-props': { icon: 'FilterOutlined' }, 'x-align': 'left' };
        await client.post(`/uiSchemas:insertAdjacent/${actionBarUid}?position=beforeEnd`, { schema: filter });
        return `Filter action added to ActionBar ${actionBarUid}`;
    });

    await test('Block deletion (remove Grid.Row)', async () => {
        const before = await gridChildCount(tp.gridUid);
        const resp = await client.get(`/uiSchemas:getJsonSchema/${tp.gridUid}`, {});
        const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
        const props = schema.properties as Record<string, unknown>;
        const lastKey = Object.keys(props).pop()!;
        const lastRow = props[lastKey] as Record<string, unknown>;
        const uid = lastRow['x-uid'] as string;
        await client.post(`/uiSchemas:remove/${uid}`, {});
        const after = await gridChildCount(tp.gridUid);
        return `Removed row ${uid} (${before} → ${after})`;
    });

    // ─── Cleanup ────────────────────────────────────────────────────────
    log('\n═══ CLEANUP ═══\n', 'cyan');
    await destroyTestPage(tp);
    log('  🗑️ Test page destroyed\n', 'gray');

    // ─── Summary ────────────────────────────────────────────────────────
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
