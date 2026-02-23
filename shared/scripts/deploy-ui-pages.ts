/**
 * deploy-ui-pages.ts — Desplegar páginas UI completas en NocoBase via API
 *
 * Script genérico y reutilizable que crea la estructura completa de UI:
 *   1. Grupo de menú (sidebar)
 *   2. Páginas dentro del grupo
 *   3. Schema Page + Grid para cada página
 *   4. Vinculación route ↔ schema
 *   5. Bloques de contenido (Table, Markdown) dentro de cada página
 *
 * USO:
 *   npx tsx shared/scripts/deploy-ui-pages.ts --config <archivo.json>     # Desplegar desde config
 *   npx tsx shared/scripts/deploy-ui-pages.ts --config <archivo.json> --dry-run  # Preview sin crear
 *   npx tsx shared/scripts/deploy-ui-pages.ts --cleanup <groupId>         # Eliminar grupo y sus hijos
 *
 * CONFIG FORMAT: Ver docs/ui-config-schema.md o el tipo UiDeployConfig más abajo
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();

// ─── Types ──────────────────────────────────────────────────────────────────

/** Column definition for a table block */
interface ColumnDef {
    name: string;
    title: string;
    interface?: string;         // 'input' | 'select' | 'datetime' | 'number' | etc.
    component?: string;         // Override x-component (default: derived from interface)
}

/** Block definition inside a page */
interface BlockDef {
    type: 'table' | 'form' | 'details' | 'markdown' | 'calendar';
    collection?: string;        // Required for table/form/details
    title?: string;             // CardItem title
    columns?: ColumnDef[];      // For table blocks
    content?: string;           // For markdown blocks
    actions?: ('create' | 'update' | 'delete' | 'view' | 'filter' | 'refresh' | 'export')[];
}

/** Page definition */
interface PageDef {
    title: string;
    icon?: string;
    blocks: BlockDef[];
}

/** Group definition (top-level menu) */
interface GroupDef {
    title: string;
    icon?: string;
    pages: PageDef[];
}

/** Full deployment config */
interface UiDeployConfig {
    name: string;               // App name for logging
    groups: GroupDef[];
}

/** Tracking created resources for rollback */
interface CreatedResource {
    type: 'route' | 'schema';
    id: string | number;
    title: string;
}

const created: CreatedResource[] = [];

// ─── Schema Builders ────────────────────────────────────────────────────────

function buildPageSchema(): Record<string, unknown> {
    return {
        type: 'void',
        'x-component': 'Page',
        'x-async': true,
        properties: {
            grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                properties: {}
            }
        }
    };
}

function buildTableBlockSchema(block: BlockDef): Record<string, unknown> {
    const tableProperties: Record<string, unknown> = {};

    // Add columns
    if (block.columns) {
        block.columns.forEach((col, idx) => {
            tableProperties[col.name] = {
                type: 'void',
                'x-component': 'TableV2.Column',
                'x-component-props': { width: 200 },
                'x-decorator': 'TableV2.Column.Decorator',
                properties: {
                    [col.name]: {
                        type: 'string',
                        'x-component': col.component || 'CollectionField',
                        'x-read-pretty': true,
                        'x-collection-field': `${block.collection}.${col.name}`,
                        'x-decorator': 'FormItem',
                    }
                },
                'x-index': idx + 1,
            };
        });
    }

    // Add action column if actions include row-level ops
    const rowActions = (block.actions || []).filter(a => ['view', 'update', 'delete'].includes(a));
    if (rowActions.length > 0) {
        const actionProps: Record<string, unknown> = {};
        rowActions.forEach((action, idx) => {
            const label = action === 'view' ? 'Ver' : action === 'update' ? 'Editar' : 'Eliminar';
            actionProps[action] = {
                type: 'void',
                title: label,
                'x-component': 'Action.Link',
                'x-action': action,
                'x-decorator': 'ACLActionProvider',
                'x-index': idx + 1,
            };
        });

        tableProperties['__actions__'] = {
            type: 'void',
            title: 'Acciones',
            'x-component': 'TableV2.Column',
            'x-decorator': 'TableV2.Column.ActionBar',
            'x-component-props': { width: 150 },
            properties: {
                actions: {
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': { split: '|' },
                    properties: actionProps,
                }
            },
            'x-index': (block.columns?.length || 0) + 1,
        };
    }

    // Build the full table block
    const blockSchema: Record<string, unknown> = {
        type: 'void',
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
            collection: block.collection,
            dataSource: 'main',
            action: 'list',
            params: { pageSize: 20 },
        },
        'x-component': 'CardItem',
        'x-filter-targets': [],
        properties: {
            actions: {
                type: 'void',
                'x-component': 'ActionBar',
                'x-component-props': { style: { marginBottom: 16 } },
                properties: buildGlobalActions(block),
                'x-index': 1,
            },
            table: {
                type: 'array',
                'x-component': 'TableV2',
                'x-use-component-props': 'useTableBlockProps',
                'x-component-props': {
                    rowKey: 'id',
                    rowSelection: { type: 'checkbox' },
                },
                properties: tableProperties,
                'x-index': 2,
            }
        }
    };

    if (block.title) {
        (blockSchema['x-component-props'] as Record<string, unknown>) = { title: block.title };
    }

    return blockSchema;
}

function buildGlobalActions(block: BlockDef): Record<string, unknown> {
    const actions: Record<string, unknown> = {};
    const blockActions = block.actions || [];
    let idx = 1;

    if (blockActions.includes('filter')) {
        actions['filter'] = {
            type: 'void',
            title: 'Filtrar',
            'x-component': 'Filter.Action',
            'x-action': 'filter',
            'x-component-props': { icon: 'FilterOutlined' },
            'x-index': idx++,
        };
    }

    if (blockActions.includes('refresh')) {
        actions['refresh'] = {
            type: 'void',
            title: 'Actualizar',
            'x-component': 'Action',
            'x-action': 'refresh',
            'x-component-props': { icon: 'ReloadOutlined' },
            'x-index': idx++,
        };
    }

    if (blockActions.includes('create')) {
        actions['create'] = {
            type: 'void',
            title: 'Nuevo',
            'x-component': 'Action',
            'x-action': 'create',
            'x-component-props': {
                type: 'primary',
                icon: 'PlusOutlined',
                openMode: 'drawer',
            },
            'x-decorator': 'ACLActionProvider',
            'x-index': idx++,
        };
    }

    if (blockActions.includes('export')) {
        actions['export'] = {
            type: 'void',
            title: 'Exportar',
            'x-component': 'Action',
            'x-action': 'export',
            'x-component-props': { icon: 'DownloadOutlined' },
            'x-index': idx++,
        };
    }

    return actions;
}

function buildMarkdownBlockSchema(block: BlockDef): Record<string, unknown> {
    return {
        type: 'void',
        'x-decorator': 'CardItem',
        'x-component': 'Markdown.Void',
        'x-component-props': {
            content: block.content || `# ${block.title || 'Contenido'}\n\n*Editar en modo diseño*`,
        },
    };
}

function buildBlockSchemaRow(block: BlockDef): Record<string, unknown> {
    let innerBlock: Record<string, unknown>;

    switch (block.type) {
        case 'table':
            innerBlock = buildTableBlockSchema(block);
            break;
        case 'markdown':
            innerBlock = buildMarkdownBlockSchema(block);
            break;
        // TODO: form, details, calendar
        default:
            innerBlock = buildMarkdownBlockSchema({
                ...block,
                content: `# ${block.title || block.type}\n\n*Block type "${block.type}" — placeholder*`,
            });
    }

    return {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
            col1: {
                type: 'void',
                'x-component': 'Grid.Col',
                properties: {
                    block1: innerBlock
                }
            }
        }
    };
}

// ─── API Operations ─────────────────────────────────────────────────────────

async function createGroup(group: GroupDef, dryRun: boolean): Promise<number | null> {
    log(`\n📁 Grupo: ${group.title}`, 'cyan');
    if (dryRun) { log('   [DRY-RUN] Se crearía grupo', 'yellow'); return null; }

    const resp = await client.post('/desktopRoutes:create', {
        type: 'group',
        title: group.title,
        icon: group.icon || 'FolderOutlined',
    });
    const data = (resp as Record<string, unknown>).data as Record<string, unknown>;
    const id = data.id as number;
    created.push({ type: 'route', id, title: group.title });
    log(`   ✅ ID: ${id}`, 'green');
    return id;
}

async function createPage(page: PageDef, parentId: number, dryRun: boolean): Promise<{ routeId: number; gridUid: string } | null> {
    log(`\n  📄 Página: ${page.title}`, 'white');
    if (dryRun) {
        log(`     [DRY-RUN] Se crearía página con ${page.blocks.length} bloque(s)`, 'yellow');
        return null;
    }

    // 1. Create route
    const routeResp = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: page.title,
        icon: page.icon || 'FileOutlined',
        parentId,
    });
    const routeData = (routeResp as Record<string, unknown>).data as Record<string, unknown>;
    const routeId = routeData.id as number;
    created.push({ type: 'route', id: routeId, title: page.title });

    // 2. Create Page schema with Grid
    const pageSchema = buildPageSchema();
    const schemaResp = await client.post('/uiSchemas:insert', pageSchema);
    const schemaData = schemaResp as Record<string, unknown>;
    const pageUid = (schemaData.data as Record<string, unknown>)?.['x-uid'] as string;
    created.push({ type: 'schema', id: pageUid, title: `${page.title} schema` });

    // 3. Bind schema to route
    await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, { schemaUid: pageUid });

    // 4. Get the Grid UID (child of Page schema)
    const fullSchema = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    const fullData = (fullSchema as Record<string, unknown>).data as Record<string, unknown>;
    const props = fullData?.properties as Record<string, Record<string, unknown>> | undefined;
    let gridUid = pageUid;
    if (props) {
        const gridChild = Object.values(props)[0];
        if (gridChild?.['x-uid']) {
            gridUid = gridChild['x-uid'] as string;
        }
    }

    log(`     ✅ Route: ${routeId} | Schema: ${pageUid} | Grid: ${gridUid}`, 'green');
    return { routeId, gridUid };
}

async function addBlockToPage(gridUid: string, block: BlockDef, index: number, dryRun: boolean): Promise<void> {
    const label = block.type === 'table' ? `Table(${block.collection})` : block.type;
    log(`     🧱 Block ${index + 1}: ${label}`, 'white');
    if (dryRun) {
        log(`        [DRY-RUN] Se agregaría bloque ${block.type}`, 'yellow');
        return;
    }

    const rowSchema = buildBlockSchemaRow(block);

    const resp = await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
        schema: rowSchema
    });
    const data = (resp as Record<string, unknown>).data as Record<string, unknown>;
    const uid = data?.['x-uid'] as string;
    if (uid) created.push({ type: 'schema', id: uid, title: label });
    log(`        ✅ UID: ${uid || 'unknown'}`, 'green');
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

async function cleanupGroup(groupId: string): Promise<void> {
    log(`\n🧹 Eliminando grupo ${groupId} y sus hijos...\n`, 'cyan');

    // Get group details with children
    const resp = await client.get('/desktopRoutes:list', { filter: { parentId: groupId } });
    const children = ((resp as Record<string, unknown>).data as Record<string, unknown>[]) || [];

    for (const child of children) {
        const childId = child.id as number;
        const schemaUid = child.schemaUid as string | null;

        // Remove schema first
        if (schemaUid) {
            try {
                await client.post(`/uiSchemas:remove/${schemaUid}`, {});
                log(`  ✅ Schema ${schemaUid} removed`, 'green');
            } catch {
                log(`  ⚠️ Schema ${schemaUid} not found`, 'yellow');
            }
        }

        // Remove route
        try {
            await client.post(`/desktopRoutes:destroy?filterByTk=${childId}`, {});
            log(`  ✅ Route ${childId} (${child.title}) removed`, 'green');
        } catch {
            log(`  ⚠️ Route ${childId} not found`, 'yellow');
        }
    }

    // Remove group itself
    try {
        await client.post(`/desktopRoutes:destroy?filterByTk=${groupId}`, {});
        log(`  ✅ Group ${groupId} removed`, 'green');
    } catch {
        log(`  ⚠️ Group ${groupId} not found`, 'yellow');
    }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const configIdx = args.indexOf('--config');
    const cleanupIdx = args.indexOf('--cleanup');

    if (cleanupIdx !== -1) {
        const groupId = args[cleanupIdx + 1];
        if (!groupId) { log('❌ --cleanup requiere un groupId', 'red'); process.exit(1); }
        await cleanupGroup(groupId);
        return;
    }

    if (configIdx === -1) {
        log('❌ Se requiere --config <archivo.json>', 'red');
        log('\nUso:', 'white');
        log('  npx tsx shared/scripts/deploy-ui-pages.ts --config config.json', 'gray');
        log('  npx tsx shared/scripts/deploy-ui-pages.ts --config config.json --dry-run', 'gray');
        log('  npx tsx shared/scripts/deploy-ui-pages.ts --cleanup <groupId>', 'gray');
        process.exit(1);
    }

    const configPath = path.resolve(args[configIdx + 1]);
    if (!fs.existsSync(configPath)) {
        log(`❌ Archivo no encontrado: ${configPath}`, 'red');
        process.exit(1);
    }

    const config: UiDeployConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    log(`🚀 Deploy UI: ${config.name}${dryRun ? ' [DRY-RUN]' : ''}\n`, 'cyan');

    let totalPages = 0;
    let totalBlocks = 0;

    for (const group of config.groups) {
        try {
            const groupId = await createGroup(group, dryRun);

            for (const page of group.pages) {
                try {
                    const result = groupId ? await createPage(page, groupId, dryRun) : null;

                    for (let i = 0; i < page.blocks.length; i++) {
                        try {
                            if (result) {
                                await addBlockToPage(result.gridUid, page.blocks[i], i, dryRun);
                            }
                            totalBlocks++;
                        } catch (error: unknown) {
                            log(`        ❌ Block error: ${error instanceof Error ? error.message : String(error)}`, 'red');
                        }
                    }
                    totalPages++;
                } catch (error: unknown) {
                    log(`     ❌ Page error: ${error instanceof Error ? error.message : String(error)}`, 'red');
                }
            }
        } catch (error: unknown) {
            log(`   ❌ Group error: ${error instanceof Error ? error.message : String(error)}`, 'red');
        }
    }

    log(`\n📊 Resultado: ${config.groups.length} grupo(s), ${totalPages} página(s), ${totalBlocks} bloque(s)`, 'green');

    // Save manifest of created resources
    if (!dryRun && created.length > 0) {
        const manifestPath = configPath.replace('.json', '-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify({ deployedAt: new Date().toISOString(), resources: created }, null, 2));
        log(`📝 Manifest guardado en ${manifestPath}`, 'cyan');
    }
}

main().catch(console.error);
