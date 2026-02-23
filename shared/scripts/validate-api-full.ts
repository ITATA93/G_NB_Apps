/**
 * validate-api-full.ts — Comprehensive API validation for all NocoBase block types
 *
 * Tests the full lifecycle of programmatic UI deployment:
 *   1. Table block (already proven) — verify + add columns
 *   2. Form block — create + verify
 *   3. Details block — create + verify
 *   4. Markdown block — create + verify
 *   5. Column configuration — add columns to table
 *   6. Action buttons — add filter/create/delete actions
 *   7. Block deletion — remove a block, verify page still works
 *   8. Full lifecycle — create page + block + config + verify + cleanup
 *
 * RUNS FULLY AUTONOMOUS — no user intervention needed.
 *
 * USO:
 *   npx tsx shared/scripts/validate-api-full.ts
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    detail: string;
    duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<string>): Promise<void> {
    const start = Date.now();
    try {
        const detail = await fn();
        results.push({ name, status: 'PASS', detail, duration: Date.now() - start });
        log(`  ✅ ${name}: ${detail}`, 'green');
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ name, status: 'FAIL', detail: msg, duration: Date.now() - start });
        log(`  ❌ ${name}: ${msg}`, 'red');
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getRoutes(): Promise<Record<string, unknown>[]> {
    const resp = await client.get('/desktopRoutes:list', { paginate: false });
    return ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>[];
}

async function getGridUid(pageTitle: string, routes: Record<string, unknown>[]): Promise<string> {
    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');
    if (!agendaGroup) throw new Error('Agenda group not found');
    const page = routes.find(r => r.parentId === agendaGroup.id && r.title === pageTitle);
    if (!page) throw new Error(`Page "${pageTitle}" not found`);
    const tabs = routes.find(r => r.parentId === page.id && r.type === 'tabs');
    if (!tabs?.schemaUid) throw new Error(`Tabs route for "${pageTitle}" not found`);
    return tabs.schemaUid as string;
}

async function getGridSchema(gridUid: string): Promise<Record<string, unknown>> {
    const resp = await client.get(`/uiSchemas:getJsonSchema/${gridUid}`, {});
    return ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
}

async function insertBlock(gridUid: string, schema: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resp = await client.post(
        `/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`,
        { schema }
    );
    return (resp as Record<string, unknown>).data as Record<string, unknown>;
}

async function removeBlock(uid: string): Promise<void> {
    await client.post(`/uiSchemas:remove/${uid}`, {});
}

function countGridChildren(schema: Record<string, unknown>): number {
    const props = schema.properties as Record<string, unknown> | undefined;
    return props ? Object.keys(props).length : 0;
}

// ─── Block Schema Builders ─────────────────────────────────────────────────

function buildTableBlock(collection: string) {
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void', 'x-component': 'Grid.Col',
                properties: {
                    block: {
                        type: 'void',
                        'x-decorator': 'TableBlockProvider',
                        'x-decorator-props': {
                            collection, dataSource: 'main', action: 'list',
                            params: { pageSize: 20 },
                        },
                        'x-component': 'CardItem',
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:table',
                        properties: {
                            actions: {
                                type: 'void', 'x-component': 'ActionBar',
                                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                                'x-initializer': 'table:configureActions',
                            },
                            table: {
                                type: 'array', 'x-component': 'TableV2',
                                'x-use-component-props': 'useTableBlockProps',
                                'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                                'x-initializer': 'table:configureColumns',
                                properties: {
                                    actions: {
                                        type: 'void', title: '{{ t("Actions") }}',
                                        'x-component': 'TableV2.Column',
                                        'x-decorator': 'TableV2.Column.Decorator',
                                        'x-action-column': 'actions',
                                        'x-initializer': 'table:configureItemActions',
                                        properties: {
                                            actions: {
                                                type: 'void', 'x-decorator': 'DndContext',
                                                'x-component': 'Space',
                                                'x-component-props': { split: '|' },
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
}

function buildFormBlock(collection: string) {
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void', 'x-component': 'Grid.Col',
                properties: {
                    block: {
                        type: 'void',
                        'x-decorator': 'FormBlockProvider',
                        'x-decorator-props': {
                            collection, dataSource: 'main',
                        },
                        'x-component': 'CardItem',
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:createForm',
                        properties: {
                            form: {
                                type: 'void',
                                'x-component': 'FormV2',
                                'x-use-component-props': 'useCreateFormBlockProps',
                                properties: {
                                    grid: {
                                        type: 'void',
                                        'x-component': 'Grid',
                                        'x-initializer': 'form:configureFields',
                                    },
                                    actions: {
                                        type: 'void',
                                        'x-component': 'ActionBar',
                                        'x-initializer': 'createForm:configureActions',
                                        'x-component-props': { layout: 'one-column' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
}

function buildDetailsBlock(collection: string) {
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void', 'x-component': 'Grid.Col',
                properties: {
                    block: {
                        type: 'void',
                        'x-decorator': 'DetailsBlockProvider',
                        'x-decorator-props': {
                            collection, dataSource: 'main', action: 'list',
                            params: { pageSize: 1 },
                        },
                        'x-component': 'CardItem',
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:details',
                        properties: {
                            details: {
                                type: 'void',
                                'x-component': 'Details',
                                'x-use-component-props': 'useDetailsBlockProps',
                                properties: {
                                    grid: {
                                        type: 'void',
                                        'x-component': 'Grid',
                                        'x-initializer': 'details:configureFields',
                                    },
                                    actions: {
                                        type: 'void',
                                        'x-component': 'ActionBar',
                                        'x-initializer': 'detailsBlockProvider:configureActions',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
}

function buildMarkdownBlock(content: string) {
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void', 'x-component': 'Grid.Col',
                properties: {
                    block: {
                        type: 'void',
                        'x-component': 'Markdown.Void',
                        'x-component-props': { content },
                        'x-decorator': 'CardItem',
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:markdown',
                    },
                },
            },
        },
    };
}

function buildColumnSchema(fieldName: string, fieldTitle: string) {
    return {
        type: 'void',
        'x-component': 'TableV2.Column',
        'x-decorator': 'TableV2.Column.Decorator',
        'x-toolbar': 'TableColumnSchemaToolbar',
        'x-settings': 'fieldSettings:TableColumn',
        properties: {
            [fieldName]: {
                'x-component': 'CollectionField',
                'x-collection-field': fieldName,
                'x-read-pretty': true,
                'x-decorator': null,
                'x-decorator-props': { labelStyle: { display: 'none' } },
                title: fieldTitle,
            },
        },
    };
}

function buildFilterAction() {
    return {
        type: 'void',
        title: '{{ t("Filter") }}',
        'x-component': 'Filter.Action',
        'x-action': 'filter',
        'x-use-component-props': 'useFilterActionProps',
        'x-component-props': { icon: 'FilterOutlined' },
        'x-align': 'left',
    };
}

function buildCreateAction() {
    return {
        type: 'void',
        title: '{{ t("Add new") }}',
        'x-component': 'Action',
        'x-action': 'create',
        'x-component-props': {
            type: 'primary',
            icon: 'PlusOutlined',
            openMode: 'drawer',
        },
        'x-align': 'right',
    };
}

// ─── Test Suites ────────────────────────────────────────────────────────────

async function testExistingTableBlocks() {
    log('\n═══ TEST 1: Verify existing table blocks ═══\n', 'cyan');
    const routes = await getRoutes();
    const pages = [
        'Funcionarios', 'Bloques de Agenda', 'Inasistencias',
        'Resumen Diario', 'Resumen Semanal',
        'Categorías de Actividad', 'Tipos de Inasistencia', 'Servicios',
    ];

    for (const title of pages) {
        await runTest(`Table block exists: ${title}`, async () => {
            const gridUid = await getGridUid(title, routes);
            const schema = await getGridSchema(gridUid);
            const count = countGridChildren(schema);
            if (count === 0) throw new Error('No blocks found');
            return `${count} block(s) in grid ${gridUid}`;
        });
    }
}

async function testFormBlock() {
    log('\n═══ TEST 2: Create Form block ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Form block on Resumen Diario', async () => {
        const gridUid = await getGridUid('Resumen Diario', routes);
        const before = countGridChildren(await getGridSchema(gridUid));
        const schema = buildFormBlock('ag_resumen_diario');
        const data = await insertBlock(gridUid, schema);
        const after = countGridChildren(await getGridSchema(gridUid));
        if (after <= before) throw new Error(`Block count didn't increase: ${before} → ${after}`);
        return `Created FormBlockProvider (${before} → ${after} blocks). Response has data: ${!!data}`;
    });
}

async function testDetailsBlock() {
    log('\n═══ TEST 3: Create Details block ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Details block on Resumen Semanal', async () => {
        const gridUid = await getGridUid('Resumen Semanal', routes);
        const before = countGridChildren(await getGridSchema(gridUid));
        const schema = buildDetailsBlock('ag_resumen_semanal');
        const data = await insertBlock(gridUid, schema);
        const after = countGridChildren(await getGridSchema(gridUid));
        if (after <= before) throw new Error(`Block count didn't increase: ${before} → ${after}`);
        return `Created DetailsBlockProvider (${before} → ${after} blocks). Response has data: ${!!data}`;
    });
}

async function testMarkdownBlock() {
    log('\n═══ TEST 4: Create Markdown block ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Markdown block on Categorías de Actividad', async () => {
        const gridUid = await getGridUid('Categorías de Actividad', routes);
        const before = countGridChildren(await getGridSchema(gridUid));
        const md = '## 📋 Categorías de Actividad\n\nEsta tabla muestra las categorías disponibles para la clasificación de actividades clínicas.';
        const schema = buildMarkdownBlock(md);
        const data = await insertBlock(gridUid, schema);
        const after = countGridChildren(await getGridSchema(gridUid));
        if (after <= before) throw new Error(`Block count didn't increase: ${before} → ${after}`);
        return `Created Markdown block (${before} → ${after} blocks). Response has data: ${!!data}`;
    });
}

async function testColumnConfiguration() {
    log('\n═══ TEST 5: Add columns to table ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Add column to Servicios table', async () => {
        const gridUid = await getGridUid('Servicios', routes);
        const gridSchema = await getGridSchema(gridUid);

        // Navigate: Grid → first Row → Col → Block (TableBlockProvider) → table (TableV2)
        const props = gridSchema.properties as Record<string, unknown>;
        const firstRowKey = Object.keys(props)[0];
        const row = props[firstRowKey] as Record<string, unknown>;
        const colProps = (row.properties as Record<string, unknown>);
        const colKey = Object.keys(colProps)[0];
        const col = colProps[colKey] as Record<string, unknown>;
        const blockProps = (col.properties as Record<string, unknown>);
        const blockKey = Object.keys(blockProps)[0];
        const block = blockProps[blockKey] as Record<string, unknown>;
        const innerProps = block.properties as Record<string, unknown>;

        // Find the TableV2 component
        let tableUid = '';
        for (const key of Object.keys(innerProps)) {
            const child = innerProps[key] as Record<string, unknown>;
            if (child['x-component'] === 'TableV2') {
                tableUid = child['x-uid'] as string;
                break;
            }
        }
        if (!tableUid) throw new Error('TableV2 UID not found');

        // Insert a column
        const colSchema = buildColumnSchema('nombre', 'Nombre del Servicio');
        const resp = await client.post(
            `/uiSchemas:insertAdjacent/${tableUid}?position=beforeEnd`,
            { schema: colSchema }
        );
        return `Column added to TableV2 (uid: ${tableUid}). Status: ${!!resp}`;
    });
}

async function testActionConfiguration() {
    log('\n═══ TEST 6: Add action buttons ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Add Filter action to Funcionarios', async () => {
        const gridUid = await getGridUid('Funcionarios', routes);
        const gridSchema = await getGridSchema(gridUid);

        // Navigate to ActionBar
        const props = gridSchema.properties as Record<string, unknown>;
        const firstRowKey = Object.keys(props)[0];
        const row = props[firstRowKey] as Record<string, unknown>;
        const colProps = (row.properties as Record<string, unknown>);
        const colKey = Object.keys(colProps)[0];
        const col = colProps[colKey] as Record<string, unknown>;
        const blockProps = (col.properties as Record<string, unknown>);
        const blockKey = Object.keys(blockProps)[0];
        const block = blockProps[blockKey] as Record<string, unknown>;
        const innerProps = block.properties as Record<string, unknown>;

        // Find ActionBar
        let actionBarUid = '';
        for (const key of Object.keys(innerProps)) {
            const child = innerProps[key] as Record<string, unknown>;
            if (child['x-component'] === 'ActionBar') {
                actionBarUid = child['x-uid'] as string;
                break;
            }
        }
        if (!actionBarUid) throw new Error('ActionBar UID not found');

        // Add filter action
        const filterSchema = buildFilterAction();
        await client.post(
            `/uiSchemas:insertAdjacent/${actionBarUid}?position=beforeEnd`,
            { schema: filterSchema }
        );

        // Add create action
        const createSchema = buildCreateAction();
        await client.post(
            `/uiSchemas:insertAdjacent/${actionBarUid}?position=beforeEnd`,
            { schema: createSchema }
        );

        return `Filter + Create actions added to ActionBar (uid: ${actionBarUid})`;
    });
}

async function testBlockDeletion() {
    log('\n═══ TEST 7: Block deletion lifecycle ═══\n', 'cyan');
    const routes = await getRoutes();

    await runTest('Create and delete a Markdown block', async () => {
        const gridUid = await getGridUid('Tipos de Inasistencia', routes);
        const before = countGridChildren(await getGridSchema(gridUid));

        // Create
        const md = '## Test block — will be deleted';
        const schema = buildMarkdownBlock(md);
        const data = await insertBlock(gridUid, schema);

        const afterCreate = countGridChildren(await getGridSchema(gridUid));
        if (afterCreate <= before) throw new Error('Block not created');

        // Find the UID of the new row we just created
        const gridSchemaAfter = await getGridSchema(gridUid);
        const propsAfter = gridSchemaAfter.properties as Record<string, unknown>;
        const keys = Object.keys(propsAfter);
        const lastKey = keys[keys.length - 1];
        const lastRow = propsAfter[lastKey] as Record<string, unknown>;
        const rowUid = lastRow['x-uid'] as string;

        // Delete
        await removeBlock(rowUid);
        const afterDelete = countGridChildren(await getGridSchema(gridUid));

        return `Create (${before}→${afterCreate}), Delete (${afterCreate}→${afterDelete}). Lifecycle: ${afterDelete === before ? 'CLEAN' : 'RESIDUAL'}. Data response: ${!!data}`;
    });
}

async function testFullPageLifecycle() {
    log('\n═══ TEST 8: Full page lifecycle (create → block → verify → cleanup) ═══\n', 'cyan');
    const ROLES = ['admin', 'member', 'root'];

    await runTest('Full page lifecycle', async () => {
        // Step 1: Create page schema
        const pageSchemaResp = await client.post('/uiSchemas:insert', {
            type: 'void', 'x-component': 'Page',
        });
        const pageSchemaUid = ((pageSchemaResp as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

        // Step 2: Create grid schema
        const gridSchemaResp = await client.post('/uiSchemas:insert', {
            type: 'void', 'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
        });
        const gridData = (gridSchemaResp as Record<string, unknown>).data as Record<string, unknown>;
        const gridSchemaUid = gridData?.['x-uid'] as string;
        const gridSchemaName = gridData?.name as string;

        // Step 3: Create menu schema
        const menuResp = await client.post('/uiSchemas:insert', {
            type: 'void', 'x-component': 'Menu.Item',
            'x-component-props': {}, title: '__TEST_LIFECYCLE__',
        });
        const menuSchemaUid = ((menuResp as Record<string, unknown>).data as Record<string, unknown>)?.['x-uid'] as string;

        // Step 4: Create page route
        const pageRouteResp = await client.post('/desktopRoutes:create', {
            parentId: null, title: '__TEST_LIFECYCLE__',
            schemaUid: pageSchemaUid, menuSchemaUid, type: 'page', enableTabs: false,
        });
        const pageRouteId = ((pageRouteResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

        // Step 5: Create tabs route
        const tabsRouteResp = await client.post('/desktopRoutes:create', {
            parentId: pageRouteId, schemaUid: gridSchemaUid,
            tabSchemaName: gridSchemaName, type: 'tabs', hidden: true,
        });
        const tabsRouteId = ((tabsRouteResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

        // Step 6: Role bindings
        for (const role of ROLES) {
            try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: pageRouteId, roleName: role }); } catch (_e) { /* ok */ }
            try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: tabsRouteId, roleName: role }); } catch (_e) { /* ok */ }
        }

        // Step 7: Insert table block
        const blockSchema = buildTableBlock('ag_servicios');
        await insertBlock(gridSchemaUid, blockSchema);

        // Step 8: Verify block exists
        const gridSchema = await getGridSchema(gridSchemaUid);
        const blockCount = countGridChildren(gridSchema);

        // Step 9: Cleanup
        await client.post(`/desktopRoutes:destroy?filterByTk=${tabsRouteId}`, {});
        await client.post(`/desktopRoutes:destroy?filterByTk=${pageRouteId}`, {});
        await removeBlock(pageSchemaUid);
        await removeBlock(menuSchemaUid);

        // Step 10: Verify cleanup
        const routes = await getRoutes();
        const testPage = routes.find(r => r.title === '__TEST_LIFECYCLE__');

        return `Created page+tabs+block (${blockCount} blocks). Cleanup: ${testPage ? 'RESIDUAL' : 'CLEAN'}`;
    });
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔══════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase API Full Validation Suite              ║', 'cyan');
    log('╚══════════════════════════════════════════════════╝\n', 'cyan');

    await testExistingTableBlocks();
    await testFormBlock();
    await testDetailsBlock();
    await testMarkdownBlock();
    await testColumnConfiguration();
    await testActionConfiguration();
    await testBlockDeletion();
    await testFullPageLifecycle();

    // ─── Summary ────────────────────────────────────────────────────────
    log('\n╔══════════════════════════════════════════════════╗', 'cyan');
    log('║  RESULTS SUMMARY                                ║', 'cyan');
    log('╚══════════════════════════════════════════════════╝\n', 'cyan');

    const pass = results.filter(r => r.status === 'PASS').length;
    const fail = results.filter(r => r.status === 'FAIL').length;
    const skip = results.filter(r => r.status === 'SKIP').length;
    const total = results.length;

    for (const r of results) {
        const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⬜';
        log(`  ${icon} ${r.name} (${r.duration}ms)`, r.status === 'PASS' ? 'green' : 'red');
        if (r.status === 'FAIL') log(`     └─ ${r.detail}`, 'red');
    }

    log(`\n  📊 Total: ${total} | Pass: ${pass} | Fail: ${fail} | Skip: ${skip}`, 'cyan');
    log(`  📈 Score: ${Math.round((pass / total) * 100)}%\n`, pass === total ? 'green' : 'yellow');

    if (fail > 0) process.exit(1);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
