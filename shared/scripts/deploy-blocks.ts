/**
 * deploy-blocks.ts — Deploy table blocks to all AGENDA pages via insertAdjacent API
 *
 * Uses the reverse-engineered pattern:
 *   POST /uiSchemas:insertAdjacent/{gridUid}?position=beforeEnd
 *   Body: { schema: <Grid.Row → Grid.Col → TableBlockProvider> }
 *
 * Key discovery: the Grid UID lives in the TABS child route, not the page route.
 *
 * USO:
 *   npx tsx shared/scripts/deploy-blocks.ts              # Deploy all
 *   npx tsx shared/scripts/deploy-blocks.ts --dry-run    # Preview only
 *   npx tsx shared/scripts/deploy-blocks.ts --verify     # Just verify
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify');

// Map of page title → collection name for table blocks
const PAGE_COLLECTION_MAP: Record<string, string> = {
    'Funcionarios': 'ag_funcionarios',
    'Bloques de Agenda': 'ag_bloques_agenda',
    'Inasistencias': 'ag_inasistencias',
    'Resumen Diario': 'ag_resumen_diario',
    'Resumen Semanal': 'ag_resumen_semanal',
    'Categorías de Actividad': 'ag_categorias_actividad',
    'Tipos de Inasistencia': 'ag_tipos_inasistencia',
    'Servicios': 'ag_servicios',
};

function buildTableBlockSchema(collection: string) {
    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col: {
                type: 'void',
                'x-component': 'Grid.Col',
                properties: {
                    block: {
                        type: 'void',
                        'x-decorator': 'TableBlockProvider',
                        'x-decorator-props': {
                            collection,
                            dataSource: 'main',
                            action: 'list',
                            params: { pageSize: 20 },
                        },
                        'x-component': 'CardItem',
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:table',
                        properties: {
                            actions: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                                'x-initializer': 'table:configureActions',
                            },
                            table: {
                                type: 'array',
                                'x-component': 'TableV2',
                                'x-use-component-props': 'useTableBlockProps',
                                'x-component-props': {
                                    rowKey: 'id',
                                    rowSelection: { type: 'checkbox' },
                                },
                                'x-initializer': 'table:configureColumns',
                                properties: {
                                    actions: {
                                        type: 'void',
                                        title: '{{ t("Actions") }}',
                                        'x-component': 'TableV2.Column',
                                        'x-decorator': 'TableV2.Column.Decorator',
                                        'x-action-column': 'actions',
                                        'x-initializer': 'table:configureItemActions',
                                        properties: {
                                            actions: {
                                                type: 'void',
                                                'x-decorator': 'DndContext',
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

async function findGridUid(pageRouteId: number, routes: Record<string, unknown>[]): Promise<string | null> {
    // The Grid lives in the hidden tabs child route
    const tabsRoute = routes.find(r => r.parentId === pageRouteId && r.type === 'tabs');
    if (!tabsRoute?.schemaUid) return null;
    return tabsRoute.schemaUid as string;
}

async function hasExistingBlock(gridUid: string): Promise<boolean> {
    try {
        const resp = await client.get(`/uiSchemas:getJsonSchema/${gridUid}`, {});
        const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
        // Check if grid has any properties (= blocks already added)
        return schema.properties ? Object.keys(schema.properties as Record<string, unknown>).length > 0 : false;
    } catch {
        return false;
    }
}

async function deploy() {
    log(`\n🚀 Deploy Table Blocks to AGENDA Pages${DRY_RUN ? ' [DRY RUN]' : ''}\n`, 'cyan');

    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routes = ((routesResp as Record<string, unknown>).data || routesResp) as Record<string, unknown>[];

    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');
    if (!agendaGroup) { log('❌ Agenda group not found', 'red'); return; }

    const pages = routes.filter(r => r.parentId === agendaGroup.id && r.type === 'page');
    log(`📋 Found ${pages.length} AGENDA pages\n`, 'white');

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const page of pages) {
        const title = page.title as string;
        const collection = PAGE_COLLECTION_MAP[title];

        if (!collection) {
            log(`  ⬜ "${title}" — no collection mapping, skipping`, 'gray');
            skipped++;
            continue;
        }

        const gridUid = await findGridUid(page.id as number, routes);
        if (!gridUid) {
            log(`  ❌ "${title}" — no tabs/grid route found`, 'red');
            failed++;
            continue;
        }

        // Check if block already exists
        const hasBlock = await hasExistingBlock(gridUid);
        if (hasBlock) {
            log(`  ✅ "${title}" — already has block, skipping`, 'green');
            skipped++;
            continue;
        }

        log(`  📦 "${title}" → collection: ${collection}, grid: ${gridUid}`, 'white');

        if (DRY_RUN) {
            log(`    [DRY] would insertAdjacent on ${gridUid}`, 'gray');
            success++;
            continue;
        }

        try {
            const schema = buildTableBlockSchema(collection);
            const resp = await client.post(
                `/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`,
                { schema }
            );
            const data = (resp as Record<string, unknown>).data as Record<string, unknown>;
            if (data) {
                log(`    ✅ Block created`, 'green');
                success++;
            } else {
                log(`    ⚠️ No data returned`, 'yellow');
                failed++;
            }
        } catch (e: unknown) {
            log(`    ❌ ${e instanceof Error ? e.message : String(e)}`, 'red');
            failed++;
        }
    }

    log(`\n📊 Results: ${success} created, ${skipped} skipped, ${failed} failed\n`, 'cyan');
}

async function verify() {
    log('\n🔍 Verifying table blocks on AGENDA pages...\n', 'cyan');

    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routes = ((routesResp as Record<string, unknown>).data || routesResp) as Record<string, unknown>[];

    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');
    if (!agendaGroup) { log('❌ Agenda group not found', 'red'); return; }

    const pages = routes.filter(r => r.parentId === agendaGroup.id && r.type === 'page');

    for (const page of pages) {
        const title = page.title as string;
        const gridUid = await findGridUid(page.id as number, routes);

        if (!gridUid) {
            log(`  ❌ "${title}" — no grid UID`, 'red');
            continue;
        }

        const hasBlock = await hasExistingBlock(gridUid);
        const collection = PAGE_COLLECTION_MAP[title] || 'unmapped';

        if (hasBlock) {
            // Get the schema to show what block type
            const resp = await client.get(`/uiSchemas:getJsonSchema/${gridUid}`, {});
            const schema = ((resp as Record<string, unknown>).data || resp) as Record<string, unknown>;
            const props = schema.properties as Record<string, unknown>;
            const firstKey = Object.keys(props)[0];
            const firstBlock = props[firstKey] as Record<string, unknown>;
            const blockProps = firstBlock?.properties as Record<string, unknown>;
            let blockCollection = '';
            if (blockProps) {
                const col = blockProps.col as Record<string, unknown>;
                if (col?.properties) {
                    const block = (col.properties as Record<string, unknown>).block as Record<string, unknown>;
                    if (block?.['x-decorator-props']) {
                        blockCollection = ((block['x-decorator-props'] as Record<string, unknown>).collection as string) || '';
                    }
                }
            }
            log(`  ✅ "${title}" → ${blockCollection || collection} (has block)`, 'green');
        } else {
            log(`  ⬜ "${title}" → ${collection} (empty — no block)`, 'yellow');
        }
    }
}

async function main() {
    if (VERIFY_ONLY) {
        await verify();
    } else {
        await deploy();
        log('─── Post-deploy verification ───\n', 'white');
        await verify();
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
