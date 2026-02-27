/**
 * add-table-blocks.ts - Add table blocks to UGCO pages
 *
 * Finds the correct Grid UID for each page and inserts table blocks.
 * Works with both existing pages (with tabs) and new pages.
 */

import { createClient } from '../../../../shared/scripts/ApiClient';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

function uid(): string {
    return Math.random().toString(36).substring(2, 13);
}

// ─── Find the Grid UID for a page ───────────────────────────────────────────
async function findGridUid(schemaUid: string): Promise<string | null> {
    try {
        const result = await api.get(`/uiSchemas:getJsonSchema/${schemaUid}`, { readPretty: true });
        const schema = result.data;

        // Direct grid check
        if (schema?.['x-component'] === 'Grid') return schema['x-uid'] || null;

        // Recursive search for Grid in properties
        function findGrid(obj: any): string | null {
            if (!obj || typeof obj !== 'object') return null;
            if (obj['x-component'] === 'Grid' && obj['x-initializer']) {
                return obj['x-uid'] || null;
            }
            if (obj.properties) {
                for (const key of Object.keys(obj.properties)) {
                    const found = findGrid(obj.properties[key]);
                    if (found) return found;
                }
            }
            return null;
        }

        return findGrid(schema);
    } catch {
        return null;
    }
}

// ─── Check if a grid already has block children ─────────────────────────────
async function gridHasBlocks(gridUid: string): Promise<boolean> {
    try {
        const result = await api.get(`/uiSchemas:getJsonSchema/${gridUid}`);
        const props = result.data?.properties;
        return props && Object.keys(props).length > 0;
    } catch {
        return false;
    }
}

// ─── Build and insert a table block ─────────────────────────────────────────
async function insertTableBlock(gridUid: string, collection: string, title: string, columns: string[]): Promise<boolean> {
    if (DRY_RUN) {
        console.log(`    [DRY] Insert table ${collection} (${columns.length} cols) → grid=${gridUid}`);
        return true;
    }

    // Build column schemas
    const columnProps: Record<string, any> = {};
    for (const col of columns) {
        columnProps[uid()] = {
            _isJSONSchemaObject: true,
            version: '2.0',
            type: 'void',
            'x-decorator': 'TableV2.Column.Decorator',
            'x-component': 'TableV2.Column',
            properties: {
                [col]: {
                    _isJSONSchemaObject: true,
                    version: '2.0',
                    'x-collection-field': `${collection}.${col}`,
                    'x-component': 'CollectionField',
                    'x-component-props': {},
                    'x-read-pretty': true,
                    'x-decorator': null,
                    'x-decorator-props': {}
                }
            }
        };
    }

    const rowUid = uid();
    const blockSchema = {
        _isJSONSchemaObject: true,
        version: '2.0',
        type: 'void',
        'x-component': 'Grid.Row',
        'x-uid': rowUid,
        name: rowUid,
        properties: {
            [uid()]: {
                _isJSONSchemaObject: true,
                version: '2.0',
                type: 'void',
                'x-component': 'Grid.Col',
                properties: {
                    [uid()]: {
                        _isJSONSchemaObject: true,
                        version: '2.0',
                        type: 'void',
                        'x-acl-action': `${collection}:list`,
                        'x-decorator': 'TableBlockProvider',
                        'x-decorator-props': {
                            collection,
                            dataSource: 'main',
                            action: 'list',
                            params: { pageSize: 20 },
                            showIndex: true,
                            dragSort: false
                        },
                        'x-component': 'CardItem',
                        'x-component-props': { title },
                        'x-toolbar': 'BlockSchemaToolbar',
                        'x-settings': 'blockSettings:table',
                        properties: {
                            actions: {
                                _isJSONSchemaObject: true,
                                version: '2.0',
                                type: 'void',
                                'x-initializer': 'table:configureActions',
                                'x-component': 'ActionBar',
                                'x-component-props': {
                                    style: { marginBottom: 'var(--nb-spacing)' }
                                },
                                properties: {
                                    filter: {
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        type: 'void',
                                        title: '{{ t("Filter") }}',
                                        'x-action': 'filter',
                                        'x-component': 'Filter.Action',
                                        'x-use-component-props': 'useFilterActionProps',
                                        'x-component-props': { icon: 'FilterOutlined' },
                                        'x-align': 'left'
                                    },
                                    create: {
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        type: 'void',
                                        title: '{{ t("Add new") }}',
                                        'x-action': 'create',
                                        'x-component': 'Action',
                                        'x-component-props': {
                                            openMode: 'drawer',
                                            type: 'primary',
                                            icon: 'PlusOutlined'
                                        },
                                        'x-align': 'right',
                                        'x-acl-action': `${collection}:create`,
                                        properties: {
                                            drawer: {
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                                type: 'void',
                                                title: '{{ t("Add record") }}',
                                                'x-component': 'Action.Container',
                                                'x-component-props': { className: 'nb-action-popup' },
                                                properties: {
                                                    grid: {
                                                        _isJSONSchemaObject: true,
                                                        version: '2.0',
                                                        type: 'void',
                                                        'x-component': 'Grid',
                                                        'x-initializer': 'popup:addNew:addBlock',
                                                        properties: {}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            [uid()]: {
                                _isJSONSchemaObject: true,
                                version: '2.0',
                                type: 'array',
                                'x-initializer': 'table:configureColumns',
                                'x-component': 'TableV2',
                                'x-use-component-props': 'useTableBlockProps',
                                'x-component-props': {
                                    rowKey: 'id',
                                    rowSelection: { type: 'checkbox' }
                                },
                                properties: {
                                    actions: {
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        type: 'void',
                                        title: '{{ t("Actions") }}',
                                        'x-action-column': 'actions',
                                        'x-decorator': 'TableV2.Column.ActionBar',
                                        'x-component': 'TableV2.Column',
                                        'x-component-props': { width: 150, fixed: 'right' },
                                        'x-initializer': 'table:configureItemActions',
                                        properties: {}
                                    },
                                    ...columnProps
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        await api.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
            schema: blockSchema
        } as any);
        console.log(`    [OK] Table: ${collection} (${columns.length} cols) → grid=${gridUid}`);
        return true;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        console.log(`    [ERROR] Table: ${collection} — ${msg}`);
        return false;
    }
}

// ─── Page configurations ────────────────────────────────────────────────────
interface PageConfig {
    routeId: number;
    title: string;
    tabSchemaUid: string;  // We'll resolve this dynamically
    collection: string;
    blockTitle: string;
    columns: string[];
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ADD TABLE BLOCKS TO UGCO PAGES                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (DRY_RUN) console.log('  ** DRY-RUN MODE **\n');

    // Step 1: Get all UGCO routes
    const allRoutes = await api.get('/desktopRoutes:listAccessible', { tree: true, sort: 'sort' });
    const routes = allRoutes.data || [];

    // Find UGCO root
    const ugcoRoot = routes.find((r: any) => r.title?.includes('UGCO') || r.title?.includes('Oncolog'));
    if (!ugcoRoot) {
        console.log('  [ERROR] UGCO root not found');
        return;
    }

    // Collect all pages recursively
    const pages: Array<{ id: number; title: string; schemaUid: string; children?: any[] }> = [];
    function collectPages(node: any) {
        if (node.type === 'page' && node.schemaUid) {
            pages.push(node);
        }
        if (node.children) {
            for (const child of node.children) {
                collectPages(child);
            }
        }
    }
    collectPages(ugcoRoot);

    console.log(`  Found ${pages.length} UGCO pages\n`);

    // Page → collection mapping
    const PAGE_BLOCKS: Record<string, { collection: string; title: string; columns: string[] }> = {
        'Casos Oncológicos': {
            collection: 'UGCO_casooncologico',
            title: 'Casos Oncológicos',
            columns: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'topografia_descripcion',
                       'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico', 'ecog_inicial']
        },
        'Episodios': {
            collection: 'UGCO_eventoclinico',
            title: 'Eventos Clínicos',
            columns: ['UGCO_COD01', 'tipo_evento', 'subtipo_evento', 'fecha_solicitud',
                       'fecha_realizacion', 'resultado_resumen', 'origen_dato']
        },
        'Sesiones de Comité': {
            collection: 'UGCO_comiteoncologico',
            title: 'Sesiones de Comité Oncológico',
            columns: ['UGCO_COD01', 'nombre', 'fecha_comite', 'tipo_comite', 'lugar', 'observaciones']
        },
        'Casos en Comité': {
            collection: 'UGCO_comitecaso',
            title: 'Casos Presentados en Comité',
            columns: ['es_caso_principal', 'decision_resumen', 'plan_tratamiento', 'responsable_seguimiento']
        },
        'Tareas Pendientes': {
            collection: 'UGCO_tarea',
            title: 'Tareas',
            columns: ['UGCO_COD01', 'titulo', 'fecha_vencimiento', 'responsable_usuario', 'comentarios']
        },
        'Especialidades': {
            collection: 'UGCO_REF_oncoespecialidad',
            title: 'Especialidades Oncológicas',
            columns: ['codigo_alma', 'codigo_oficial', 'nombre', 'activo']
        },
        'Equipos de Seguimiento': {
            collection: 'UGCO_equiposeguimiento',
            title: 'Equipos de Seguimiento',
            columns: ['nombre', 'descripcion', 'activo']
        },
        'Catálogos': {
            collection: 'UGCO_REF_oncoestadoadm',
            title: 'Estados Administrativos',
            columns: ['codigo', 'nombre', 'es_final', 'activo']
        },
    };

    // Add specialty mappings - all specialties show the cases table
    const specialtyNames = ['Digestivo Alto', 'Digestivo Bajo', 'Mama', 'Ginecología',
                            'Urología', 'Tórax', 'Piel y Partes Blandas', 'Endocrinología', 'Hematología'];
    for (const name of specialtyNames) {
        PAGE_BLOCKS[name] = {
            collection: 'UGCO_casooncologico',
            title: `Casos — ${name}`,
            columns: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico',
                       'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico', 'ecog_inicial']
        };
    }

    // Step 2: For each page, find grid and add block
    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const page of pages) {
        // Clean title (remove emoji prefix)
        const cleanTitle = page.title?.replace(/^[^\w\s]*\s*/, '').trim();
        const blockConfig = PAGE_BLOCKS[cleanTitle] || PAGE_BLOCKS[page.title];

        if (!blockConfig) {
            console.log(`  [SKIP] ${page.title} — no block configured (Dashboard/Reportes = manual)`);
            skipped++;
            continue;
        }

        console.log(`  Page: ${page.title} (schema=${page.schemaUid})`);

        // First try: direct schema grid
        let gridUid = await findGridUid(page.schemaUid);

        // Second try: look in tab children
        if (!gridUid && page.children) {
            for (const child of page.children) {
                if (child.type === 'tabs' && child.schemaUid) {
                    gridUid = await findGridUid(child.schemaUid);
                    if (gridUid) break;
                }
            }
        }

        if (!gridUid) {
            console.log(`    [WARN] No Grid found — page may need manual configuration`);
            failed++;
            continue;
        }

        // Check if already has blocks
        const hasBlocks = await gridHasBlocks(gridUid);
        if (hasBlocks) {
            console.log(`    [SKIP] Already has blocks`);
            skipped++;
            continue;
        }

        const ok = await insertTableBlock(gridUid, blockConfig.collection, blockConfig.title, blockConfig.columns);
        if (ok) success++;
        else failed++;
    }

    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`  Results: ${success} blocks added, ${skipped} skipped, ${failed} failed`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
}

main().catch(err => {
    console.error(`\n[FATAL] ${err.message}`);
    process.exit(1);
});
