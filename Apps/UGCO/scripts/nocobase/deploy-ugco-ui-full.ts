/**
 * deploy-ugco-ui-full.ts - Deploy complete UGCO UI (pages + blocks)
 *
 * Creates missing pages and adds table blocks to all UGCO pages.
 * Uses the shared ApiClient for auth.
 *
 * Usage:
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-ui-full.ts --dry-run
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-ui-full.ts
 */

import { createClient } from '../../../../shared/scripts/ApiClient';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Known IDs ──────────────────────────────────────────────────────────────
const UGCO_ROOT_ID = 349160760737793;

// ─── Specialties to create ──────────────────────────────────────────────────
const SPECIALTIES = [
    { title: 'Digestivo Alto', code: 'DIGESTIVO_ALTO', icon: '🔶' },
    { title: 'Digestivo Bajo', code: 'DIGESTIVO_BAJO', icon: '🟤' },
    { title: 'Mama', code: 'P._MAMARIA', icon: '🩷' },
    { title: 'Ginecología', code: 'P._CERVICAL', icon: '💜' },
    { title: 'Urología', code: 'UROLOGIA', icon: '💙' },
    { title: 'Tórax', code: 'TORAX', icon: '🫁' },
    { title: 'Piel y Partes Blandas', code: 'PIEL_Y_PARTES_BLANDAS', icon: '💛' },
    { title: 'Endocrinología', code: 'ENDOCRINOLOGIA', icon: '💚' },
    { title: 'Hematología', code: 'HEMATOLOGIA', icon: '❤️' },
];

// ─── Helper: generate random UID ────────────────────────────────────────────
function uid(): string {
    return Math.random().toString(36).substring(2, 13);
}

// ─── Helper: create a page route ────────────────────────────────────────────
async function createPage(title: string, parentId: number, type: string = 'page'): Promise<{ id: number; schemaUid: string } | null> {
    if (DRY_RUN) {
        console.log(`  [DRY] Create ${type}: "${title}" under ${parentId}`);
        return { id: 0, schemaUid: uid() };
    }

    try {
        const schemaUid = uid();

        // 1. Create the UI Schema (empty grid page)
        await api.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: {
                _isJSONSchemaObject: true,
                version: '2.0',
                type: 'void',
                'x-component': 'Menu.Item',
                'x-decorator': 'ACLMenuItemProvider',
                'x-component-props': {},
                'x-server-hooks': [
                    { type: 'onSelfCreate', method: 'bindMenuToRole' }
                ],
                properties: {
                    page: {
                        _isJSONSchemaObject: true,
                        version: '2.0',
                        type: 'void',
                        'x-component': 'Page',
                        'x-async': true,
                        properties: {
                            [uid()]: {
                                _isJSONSchemaObject: true,
                                version: '2.0',
                                type: 'void',
                                'x-component': 'Grid',
                                'x-initializer': 'page:addBlock',
                                properties: {}
                            }
                        }
                    }
                },
                'x-uid': schemaUid,
                name: schemaUid
            }
        } as any);

        // 2. Create the desktop route
        const routeResult = await api.post('/desktopRoutes:create', {
            title,
            type,
            parentId,
            schemaUid,
            enableTabs: type === 'page',
            hidden: false,
        } as any);

        const routeId = routeResult.data?.id;
        console.log(`  [OK] ${type}: "${title}" → route=${routeId}, schema=${schemaUid}`);
        return { id: routeId, schemaUid };
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        console.log(`  [ERROR] ${type}: "${title}" — ${msg}`);
        return null;
    }
}

// ─── Helper: create a group route ───────────────────────────────────────────
async function createGroup(title: string, parentId: number): Promise<number | null> {
    if (DRY_RUN) {
        console.log(`  [DRY] Create group: "${title}" under ${parentId}`);
        return 0;
    }

    try {
        const result = await api.post('/desktopRoutes:create', {
            title,
            type: 'group',
            parentId,
            hidden: false,
        } as any);
        const id = result.data?.id;
        console.log(`  [OK] group: "${title}" → id=${id}`);
        return id;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        console.log(`  [ERROR] group: "${title}" — ${msg}`);
        return null;
    }
}

// ─── Helper: add a table block to a page schema ─────────────────────────────
async function addTableBlock(schemaUid: string, collection: string, title: string, columns: string[]): Promise<boolean> {
    if (DRY_RUN) {
        console.log(`    [DRY] Add table block: ${collection} (${columns.length} cols) to schema ${schemaUid}`);
        return true;
    }

    try {
        // Get the page schema to find the Grid node
        const schemaResult = await api.get(`/uiSchemas:getJsonSchema/${schemaUid}`);
        const schema = schemaResult.data;

        if (!schema?.properties?.page?.properties) {
            console.log(`    [WARN] Schema ${schemaUid} has no page.properties — skipping block`);
            return false;
        }

        // Find the grid node (first property under page, or under the first tab)
        const pageProps = schema.properties.page.properties;
        let gridUid: string | null = null;

        for (const key of Object.keys(pageProps)) {
            const node = pageProps[key];
            if (node['x-component'] === 'Grid') {
                gridUid = node['x-uid'] || key;
                break;
            }
            // Check inside tabs
            if (node['x-component'] === 'Tabs' && node.properties) {
                for (const tabKey of Object.keys(node.properties)) {
                    const tab = node.properties[tabKey];
                    if (tab.properties) {
                        for (const gKey of Object.keys(tab.properties)) {
                            if (tab.properties[gKey]['x-component'] === 'Grid') {
                                gridUid = tab.properties[gKey]['x-uid'] || gKey;
                                break;
                            }
                        }
                    }
                    if (gridUid) break;
                }
            }
            if (gridUid) break;
        }

        if (!gridUid) {
            console.log(`    [WARN] No Grid found in schema ${schemaUid} — skipping block`);
            return false;
        }

        // Check if grid already has children (blocks)
        const gridSchema = await api.get(`/uiSchemas:getJsonSchema/${gridUid}`);
        const existingProps = gridSchema.data?.properties;
        if (existingProps && Object.keys(existingProps).length > 0) {
            console.log(`    [SKIP] Schema ${schemaUid} already has ${Object.keys(existingProps).length} block(s)`);
            return true;
        }

        // Build column schemas
        const columnProperties: Record<string, any> = {};
        for (const col of columns) {
            const colUid = uid();
            columnProperties[colUid] = {
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

        // Build the table block schema
        const rowUid = uid();
        const colUid = uid();
        const blockUid = uid();
        const tableUid = uid();

        const blockSchema = {
            _isJSONSchemaObject: true,
            version: '2.0',
            type: 'void',
            'x-component': 'Grid.Row',
            'x-uid': rowUid,
            name: rowUid,
            properties: {
                [colUid]: {
                    _isJSONSchemaObject: true,
                    version: '2.0',
                    type: 'void',
                    'x-component': 'Grid.Col',
                    properties: {
                        [blockUid]: {
                            _isJSONSchemaObject: true,
                            version: '2.0',
                            type: 'void',
                            'x-acl-action': `${collection}:list`,
                            'x-decorator': 'TableBlockProvider',
                            'x-decorator-props': {
                                collection,
                                dataSource: 'main',
                                action: 'list',
                                params: {
                                    pageSize: 20
                                },
                                showIndex: true,
                                dragSort: false
                            },
                            'x-component': 'CardItem',
                            'x-component-props': {
                                title: title
                            },
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
                                [tableUid]: {
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
                                            properties: {
                                                [uid()]: {
                                                    _isJSONSchemaObject: true,
                                                    version: '2.0',
                                                    type: 'void',
                                                    'x-decorator': 'DndContext',
                                                    'x-component': 'Space',
                                                    'x-component-props': { split: '|' },
                                                    properties: {
                                                        view: {
                                                            _isJSONSchemaObject: true,
                                                            version: '2.0',
                                                            type: 'void',
                                                            title: '{{ t("View") }}',
                                                            'x-action': 'view',
                                                            'x-component': 'Action.Link',
                                                            'x-component-props': { openMode: 'drawer' },
                                                            'x-decorator': 'ACLActionProvider',
                                                            properties: {
                                                                drawer: {
                                                                    _isJSONSchemaObject: true,
                                                                    version: '2.0',
                                                                    type: 'void',
                                                                    title: '{{ t("View record") }}',
                                                                    'x-component': 'Action.Container',
                                                                    'x-component-props': { className: 'nb-action-popup' },
                                                                    properties: {
                                                                        grid: {
                                                                            _isJSONSchemaObject: true,
                                                                            version: '2.0',
                                                                            type: 'void',
                                                                            'x-component': 'Grid',
                                                                            'x-initializer': 'popup:common:addBlock',
                                                                            properties: {}
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        edit: {
                                                            _isJSONSchemaObject: true,
                                                            version: '2.0',
                                                            type: 'void',
                                                            title: '{{ t("Edit") }}',
                                                            'x-action': 'update',
                                                            'x-component': 'Action.Link',
                                                            'x-component-props': { openMode: 'drawer' },
                                                            'x-decorator': 'ACLActionProvider',
                                                            'x-acl-action': `${collection}:update`,
                                                            properties: {
                                                                drawer: {
                                                                    _isJSONSchemaObject: true,
                                                                    version: '2.0',
                                                                    type: 'void',
                                                                    title: '{{ t("Edit record") }}',
                                                                    'x-component': 'Action.Container',
                                                                    'x-component-props': { className: 'nb-action-popup' },
                                                                    properties: {
                                                                        grid: {
                                                                            _isJSONSchemaObject: true,
                                                                            version: '2.0',
                                                                            type: 'void',
                                                                            'x-component': 'Grid',
                                                                            'x-initializer': 'popup:common:addBlock',
                                                                            properties: {}
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        ...columnProperties
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        // Insert the block into the grid
        await api.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
            schema: blockSchema
        } as any);

        console.log(`    [OK] Table block: ${collection} (${columns.length} cols) → grid=${gridUid}`);
        return true;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        console.log(`    [ERROR] Table block: ${collection} — ${msg}`);
        return false;
    }
}

// ─── Page definitions with their table blocks ───────────────────────────────
interface PageBlock {
    collection: string;
    title: string;
    columns: string[];
}

interface PageDef {
    schemaUid?: string;  // existing schema
    routeId?: number;    // existing route
    blocks: PageBlock[];
}

const EXISTING_PAGES: Record<string, PageDef> = {
    'Casos Oncológicos': {
        schemaUid: '4jwmen74y6r',
        blocks: [{
            collection: 'UGCO_casooncologico',
            title: 'Casos Oncológicos',
            columns: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'topografia_descripcion',
                       'morfologia_descripcion', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m',
                       'estadio_clinico', 'ecog_inicial', 'fecha_caso']
        }]
    },
    'Episodios': {
        schemaUid: '580nmzj3e1l',
        blocks: [{
            collection: 'UGCO_eventoclinico',
            title: 'Eventos Clínicos',
            columns: ['UGCO_COD01', 'tipo_evento', 'subtipo_evento', 'fecha_solicitud',
                       'fecha_realizacion', 'resultado_resumen', 'centro_realizacion', 'origen_dato']
        }]
    },
    'Sesiones de Comité': {
        schemaUid: 'rbu9w0uzn67',
        blocks: [{
            collection: 'UGCO_comiteoncologico',
            title: 'Sesiones de Comité Oncológico',
            columns: ['UGCO_COD01', 'nombre', 'fecha_comite', 'tipo_comite', 'lugar', 'observaciones']
        }]
    },
    'Casos en Comité': {
        schemaUid: 'n6gnh4eyceu',
        blocks: [{
            collection: 'UGCO_comitecaso',
            title: 'Casos Presentados en Comité',
            columns: ['es_caso_principal', 'decision_resumen', 'plan_tratamiento', 'responsable_seguimiento']
        }]
    },
};

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  DEPLOY UGCO UI — Full Page & Block Configuration         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    if (DRY_RUN) {
        console.log('\n  ** DRY-RUN MODE **\n');
    }

    // ── Step 1: Add table blocks to existing pages ──────────────────────────
    console.log('\n── Step 1: Configure existing pages with table blocks ──\n');

    for (const [pageName, pageDef] of Object.entries(EXISTING_PAGES)) {
        console.log(`  Page: ${pageName} (schema=${pageDef.schemaUid})`);
        for (const block of pageDef.blocks) {
            await addTableBlock(pageDef.schemaUid!, block.collection, block.title, block.columns);
        }
    }

    // ── Step 2: Create Dashboard page ───────────────────────────────────────
    console.log('\n── Step 2: Create Dashboard page ──\n');
    const dashboard = await createPage('📊 Dashboard', UGCO_ROOT_ID);

    // ── Step 3: Create Especialidades group + 9 specialty pages ─────────────
    console.log('\n── Step 3: Create Especialidades group + specialty pages ──\n');
    const especGroup = await createGroup('📁 Especialidades', UGCO_ROOT_ID);
    const especGroupId = especGroup || 0;

    for (const spec of SPECIALTIES) {
        const page = await createPage(`${spec.icon} ${spec.title}`, especGroupId);
        if (page && !DRY_RUN) {
            // Add a table block filtered by specialty
            await addTableBlock(page.schemaUid, 'UGCO_casooncologico',
                `Casos — ${spec.title}`,
                ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico',
                 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico', 'ecog_inicial']
            );
        }
    }

    // ── Step 4: Create Tareas page ──────────────────────────────────────────
    console.log('\n── Step 4: Create Tareas page ──\n');
    const tareas = await createPage('✅ Tareas Pendientes', UGCO_ROOT_ID);
    if (tareas && !DRY_RUN) {
        await addTableBlock(tareas.schemaUid, 'UGCO_tarea',
            'Tareas',
            ['UGCO_COD01', 'titulo', 'descripcion', 'fecha_vencimiento', 'fecha_cierre',
             'responsable_usuario', 'comentarios']
        );
    }

    // ── Step 5: Create Reportes page ────────────────────────────────────────
    console.log('\n── Step 5: Create Reportes page ──\n');
    await createPage('📈 Reportes', UGCO_ROOT_ID);

    // ── Step 6: Create Configuración group ──────────────────────────────────
    console.log('\n── Step 6: Create Configuración group ──\n');
    const configGroup = await createGroup('⚙️ Configuración', UGCO_ROOT_ID);
    const configGroupId = configGroup || 0;

    // Configuración sub-pages
    const configPages = [
        { title: 'Especialidades', collection: 'UGCO_REF_oncoespecialidad',
          columns: ['codigo_alma', 'codigo_oficial', 'nombre', 'activo'] },
        { title: 'Equipos de Seguimiento', collection: 'UGCO_equiposeguimiento',
          columns: ['nombre', 'descripcion', 'activo'] },
        { title: 'Catálogos', collection: 'UGCO_REF_oncoestadoadm',
          columns: ['codigo', 'nombre', 'es_final', 'activo'] },
    ];

    for (const cp of configPages) {
        const page = await createPage(cp.title, configGroupId);
        if (page && !DRY_RUN) {
            await addTableBlock(page.schemaUid, cp.collection, cp.title, cp.columns);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  UGCO UI deployment complete.');
    console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error(`\n[FATAL] ${err.message}`);
    process.exit(1);
});
