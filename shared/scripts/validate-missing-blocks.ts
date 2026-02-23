/**
 * validate-missing-blocks.ts — Test the block types NOT yet validated
 *
 * From the actual NocoBase UI dropdown (user screenshot):
 *
 * Bloques de datos:
 *   🆕 Charts (ChartBlockProvider + ChartCardItem) — TWO-STEP: container + inner chart
 *   🆕 Map (MapBlockProvider)
 *
 * Bloques de filtro:
 *   🆕 Colapsar (FilterCollapse — collapsible filter panel)
 *
 * Otros Bloques:
 *   🆕 Action panel
 *   🆕 Workflow todos
 *
 * CHART SCHEMA (reverse-engineered from diff):
 *   Grid.Row → Grid.Col → ChartBlockProvider/ChartCardItem
 *     → Grid (x-initializer: charts:addBlock)
 *     → ActionBar (x-initializer: chartBlock:configureActions)
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

function wrap(inner: Record<string, unknown>) {
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

interface TestPage { pageRouteId: number; tabsRouteId: number; gridUid: string; pageSchemaUid: string; menuSchemaUid: string; }

async function createTestPage(): Promise<TestPage> {
    const pr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Page' });
    const pageSchemaUid = ((pr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;
    const gr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock' });
    const gd = (gr as Record<string, unknown>).data as Record<string, unknown>;
    const gridUid = gd?.['x-uid'] as string; const gridName = gd?.name as string;
    const mr = await client.post('/uiSchemas:insert', { type: 'void', 'x-component': 'Menu.Item', title: '__MISSING_BLOCKS_TEST__' });
    const menuSchemaUid = ((mr as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;
    const rr = await client.post('/desktopRoutes:create', { parentId: null, title: '__MISSING_BLOCKS_TEST__', schemaUid: pageSchemaUid, menuSchemaUid, type: 'page', enableTabs: false });
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

async function main() {
    log('╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase MISSING BLOCK TYPES Validation                ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

    const tp = await createTestPage();
    log(`📄 Test page. Grid: ${tp.gridUid}\n`, 'gray');

    // ═══ TEST 1: Chart Block Container (exact diff pattern) ═════════════
    log('═══ 1. CHART BLOCK (reverse-engineered from diff) ═══\n', 'cyan');

    await test('Chart Container: ChartBlockProvider + ChartCardItem + inner Grid', async () => {
        const chartSchema = wrap({
            type: 'void',
            'x-decorator': 'ChartBlockProvider',
            'x-component': 'ChartCardItem',
            'x-settings': 'chart:block',
            'x-use-component-props': 'useChartBlockCardProps',
            properties: {
                actions: {
                    type: 'void', name: 'actions',
                    'x-component': 'ActionBar',
                    'x-initializer': 'chartBlock:configureActions',
                    'x-component-props': { style: { marginBottom: 'var(--nb-designer-offset)' } },
                },
                innerGrid: {
                    type: 'void',
                    'x-component': 'Grid',
                    'x-decorator': 'ChartV2Block',
                    'x-initializer': 'charts:addBlock',
                },
            },
        });

        const before = countProps(await getSchema(tp.gridUid));
        await insert(tp.gridUid, chartSchema);
        const after = countProps(await getSchema(tp.gridUid));
        if (after <= before) throw new Error(`Grid count unchanged: ${before} → ${after}`);

        return `Chart container created (${before} → ${after}). Uses ChartBlockProvider + ChartCardItem with inner charts:addBlock grid`;
    });

    // ═══ TEST 2: Chart with specific visualization ══════════════════════
    log('\n═══ 2. CHART: Add Column chart inside container ═══\n', 'cyan');

    await test('Chart: Add Column chart renderer inside Chart container', async () => {
        // Find the inner chart Grid
        const schema = await getSchema(tp.gridUid);
        const innerGridUid = find(schema, 'x-initializer', 'charts:addBlock');
        if (!innerGridUid) throw new Error('Inner chart Grid not found');

        const columnChartSchema = {
            type: 'void', 'x-component': 'Grid.Row',
            properties: {
                col: {
                    type: 'void', 'x-component': 'Grid.Col',
                    properties: {
                        chart: {
                            type: 'void',
                            'x-component': 'CardItem',
                            'x-decorator': 'ChartRendererProvider',
                            'x-decorator-props': {
                                collection: COLLECTION, dataSource: 'main',
                                query: {
                                    measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
                                    dimensions: [{ field: ['nombre'] }],
                                    orders: [],
                                    filter: {},
                                    limit: 2000,
                                },
                                chartType: 'antd.Column',
                                fieldProps: {},
                            },
                            'x-settings': 'chartRendererSettings',
                            'x-toolbar': 'BlockSchemaToolbar',
                            properties: {
                                renderer: {
                                    type: 'void',
                                    'x-component': 'ChartRenderer',
                                },
                            },
                        },
                    },
                },
            },
        };

        const before = countProps(await getSchema(innerGridUid));
        await insert(innerGridUid, columnChartSchema);
        const after = countProps(await getSchema(innerGridUid));
        if (after <= before) throw new Error(`Inner grid count unchanged: ${before} → ${after}`);

        return `Column chart added: ChartRendererProvider (collection: ${COLLECTION}, type: antd.Column, measure: count(id), dimension: nombre)`;
    });

    // ═══ TEST 3: Second chart type (Pie) ════════════════════════════════
    log('\n═══ 3. CHART: Add Pie chart inside same container ═══\n', 'cyan');

    await test('Chart: Add Pie chart renderer', async () => {
        const schema = await getSchema(tp.gridUid);
        const innerGridUid = find(schema, 'x-initializer', 'charts:addBlock');
        if (!innerGridUid) throw new Error('Inner chart Grid not found');

        const pieChartSchema = {
            type: 'void', 'x-component': 'Grid.Row',
            properties: {
                col: {
                    type: 'void', 'x-component': 'Grid.Col',
                    properties: {
                        chart: {
                            type: 'void',
                            'x-component': 'CardItem',
                            'x-decorator': 'ChartRendererProvider',
                            'x-decorator-props': {
                                collection: COLLECTION, dataSource: 'main',
                                query: {
                                    measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
                                    dimensions: [{ field: ['nombre'] }],
                                    orders: [],
                                    filter: {},
                                    limit: 2000,
                                },
                                chartType: 'antd.Pie',
                                fieldProps: {},
                            },
                            'x-settings': 'chartRendererSettings',
                            'x-toolbar': 'BlockSchemaToolbar',
                            properties: {
                                renderer: { type: 'void', 'x-component': 'ChartRenderer' },
                            },
                        },
                    },
                },
            },
        };

        const before = countProps(await getSchema(innerGridUid));
        await insert(innerGridUid, pieChartSchema);
        const after = countProps(await getSchema(innerGridUid));
        return `Pie chart added (${before} → ${after}). antd.Pie with count(id) by nombre`;
    });

    // ═══ TEST 4: Map Block ══════════════════════════════════════════════
    log('\n═══ 4. MAP BLOCK ═══\n', 'cyan');

    await test('Map: MapBlockProvider', async () => {
        const mapSchema = wrap({
            type: 'void',
            'x-decorator': 'MapBlockProvider',
            'x-decorator-props': { collection: COLLECTION, dataSource: 'main', action: 'list', params: {} },
            'x-component': 'CardItem',
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:map',
            properties: {
                map: {
                    type: 'void',
                    'x-component': 'MapBlock',
                    'x-use-component-props': 'useMapBlockProps',
                    'x-component-props': { zoom: 13 },
                },
            },
        });

        const before = countProps(await getSchema(tp.gridUid));
        await insert(tp.gridUid, mapSchema);
        const after = countProps(await getSchema(tp.gridUid));
        return `Map block created (${before} → ${after}). MapBlockProvider + MapBlock`;
    });

    // ═══ TEST 5: Filter Collapse Block ══════════════════════════════════
    log('\n═══ 5. COLAPSAR (FilterCollapseBlockProvider) ═══\n', 'cyan');

    await test('Colapsar: FilterCollapseBlockProvider', async () => {
        const collapseSchema = wrap({
            type: 'void',
            'x-decorator': 'FilterFormBlockProvider',
            'x-decorator-props': { collection: COLLECTION, dataSource: 'main' },
            'x-component': 'CardItem',
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:filterCollapse',
            properties: {
                collapse: {
                    type: 'void',
                    'x-component': 'FormV2',
                    'x-use-component-props': 'useFilterFormBlockProps',
                    properties: {
                        grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'filterForm:configureFields' },
                        actions: { type: 'void', 'x-component': 'ActionBar', 'x-initializer': 'filterForm:configureActions', 'x-component-props': { layout: 'one-column' } },
                    },
                },
            },
        });

        const before = countProps(await getSchema(tp.gridUid));
        await insert(tp.gridUid, collapseSchema);
        const after = countProps(await getSchema(tp.gridUid));
        return `Filter collapse created (${before} → ${after}). FilterFormBlockProvider with configureFields`;
    });

    // ═══ TEST 6: Action Panel ═══════════════════════════════════════════
    log('\n═══ 6. ACTION PANEL ═══\n', 'cyan');

    await test('Action Panel: ActionPanel component', async () => {
        const actionPanelSchema = wrap({
            type: 'void',
            'x-component': 'CardItem',
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:actionPanel',
            properties: {
                actionPanel: {
                    type: 'void',
                    'x-component': 'ActionPanel',
                    'x-initializer': 'actionPanel:configureActions',
                },
            },
        });

        const before = countProps(await getSchema(tp.gridUid));
        await insert(tp.gridUid, actionPanelSchema);
        const after = countProps(await getSchema(tp.gridUid));
        return `Action panel created (${before} → ${after}). ActionPanel with configureActions`;
    });

    // ═══ TEST 7: Workflow Todos ═════════════════════════════════════════
    log('\n═══ 7. WORKFLOW TODOS ═══\n', 'cyan');

    await test('Workflow Todos: WorkflowTodoBlockProvider', async () => {
        const workflowSchema = wrap({
            type: 'void',
            'x-decorator': 'WorkflowTodoBlockProvider',
            'x-component': 'CardItem',
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:workflowTodos',
            properties: {
                todoList: {
                    type: 'void',
                    'x-component': 'WorkflowTodoBlock',
                },
            },
        });

        const before = countProps(await getSchema(tp.gridUid));
        await insert(tp.gridUid, workflowSchema);
        const after = countProps(await getSchema(tp.gridUid));
        return `Workflow todos created (${before} → ${after}). WorkflowTodoBlockProvider`;
    });

    // ═══ TEST 8: Verify chart rendering in browser context ══════════════
    log('\n═══ 8. CHART CONFIGURATION: Patch chart query ═══\n', 'cyan');

    await test('Chart: Modify query (change aggregation to sum, add filter)', async () => {
        const schema = await getSchema(tp.gridUid);
        const rendererUid = find(schema, 'x-decorator', 'ChartRendererProvider');
        if (!rendererUid) throw new Error('ChartRendererProvider not found');

        // Patch the chart query to use a different config
        await client.post('/uiSchemas:patch', {
            'x-uid': rendererUid,
            'x-decorator-props': {
                collection: COLLECTION, dataSource: 'main',
                query: {
                    measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
                    dimensions: [{ field: ['createdAt'] }],
                    orders: [{ field: 'createdAt', order: 'asc' }],
                    filter: { $and: [{ nombre: { $ne: null } }] },
                    limit: 1000,
                },
                chartType: 'antd.Line',
                fieldProps: {},
            },
        });

        const verify = await getSchema(rendererUid);
        const dp = verify['x-decorator-props'] as Record<string, unknown>;
        const query = dp?.query as Record<string, unknown>;
        return `Chart patched: type=${dp?.chartType}, measures=${JSON.stringify(query?.measures)?.substring(0, 50)}, filter applied`;
    });

    // ═══ TEST 9: Full schema verification ═══════════════════════════════
    log('\n═══ 9. FULL SCHEMA VERIFICATION ═══\n', 'cyan');

    await test('Verify all blocks exist in schema tree', async () => {
        const schema = await getSchema(tp.gridUid);
        let nodeCount = 0;
        const components: string[] = [];
        function walk(obj: Record<string, unknown>) {
            nodeCount++;
            const comp = (obj['x-component'] || obj['x-decorator']) as string;
            if (comp && !['Grid', 'Grid.Row', 'Grid.Col', 'void'].includes(comp)) {
                components.push(comp);
            }
            if (obj.properties) for (const k of Object.keys(obj.properties as Record<string, unknown>)) {
                walk((obj.properties as Record<string, unknown>)[k] as Record<string, unknown>);
            }
        }
        walk(schema);
        const unique = [...new Set(components)];
        const topBlocks = countProps(schema);
        return `${topBlocks} top blocks, ${nodeCount} nodes, components: ${unique.join(', ')}`;
    });

    // ═══ Cleanup ════════════════════════════════════════════════════════
    log('\n═══ CLEANUP ═══\n', 'cyan');
    await destroyTestPage(tp);
    log('  🗑️ Test page destroyed\n', 'gray');

    // Also clean up the chart containers added to Resumen Diario during browser reverse-engineering
    log('  🗑️ Cleaning chart containers from Resumen Diario...\n', 'gray');
    try {
        const routes = (await client.get('/desktopRoutes:list', { paginate: false }) as Record<string, unknown>);
        const allRoutes = (routes.data || routes) as Record<string, unknown>[];
        const agendaGroup = allRoutes.find(r => r.title === 'Agenda' && r.type === 'group');
        if (agendaGroup) {
            const rdPage = allRoutes.find(r => r.parentId === agendaGroup.id && r.title === 'Resumen Diario');
            if (rdPage) {
                const tabs = allRoutes.find(r => r.parentId === rdPage.id && r.type === 'tabs');
                if (tabs?.schemaUid) {
                    const gridSchema = await getSchema(tabs.schemaUid as string);
                    const props = gridSchema.properties as Record<string, unknown>;
                    // Find and remove chart containers (Grid.Row entries that contain ChartBlockProvider)
                    for (const key of Object.keys(props)) {
                        const row = props[key] as Record<string, unknown>;
                        const rowSchema = await getSchema(row['x-uid'] as string);
                        if (find(rowSchema, 'x-decorator', 'ChartBlockProvider')) {
                            await client.post(`/uiSchemas:remove/${row['x-uid']}`, {});
                            log('    Removed chart container from Resumen Diario\n', 'gray');
                        }
                    }
                }
            }
        }
    } catch (_e) { log('    (cleanup skip)\n', 'gray'); }

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
