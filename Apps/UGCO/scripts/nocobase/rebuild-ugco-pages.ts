/**
 * rebuild-ugco-pages.ts - Delete bad pages and recreate them correctly
 *
 * Uses the same method as create-page.ts (desktopRoutes with children + uiSchemas:insert)
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const UGCO_ROOT_ID = 349160760737793;

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

// ─── Routes to delete (created with bad schema method) ──────────────────────
const BAD_ROUTE_IDS = [
    350480265707520, // Dashboard
    350480265707522, // Digestivo Alto
    350480265707523, // Digestivo Bajo
    350480265707524, // Mama
    350480265707525, // Ginecología
    350480267804672, // Urología
    350480267804673, // Tórax
    350480267804674, // Piel y Partes Blandas
    350480267804676, // Endocrinología
    350480267804677, // Hematología
    350480267804678, // Tareas Pendientes
    350480267804680, // Reportes
    350480269901824, // Especialidades (config)
    350480269901826, // Equipos de Seguimiento
    350480269901828, // Catálogos
    350480267804682, // Configuración group
    350480265707521, // Especialidades group
];

// ─── Correct page creation (same as create-page.ts) ─────────────────────────
async function createCorrectPage(title: string, parentId: number): Promise<{ routeId: number; gridUid: string } | null> {
    const pageUid = uid();
    const gridUid = uid();
    const gridName = uid();
    const menuSchemaUid = uid();

    try {
        // 1. Create route with children
        const routeResult = await api.post('/desktopRoutes:create', {
            type: 'page',
            title,
            parentId,
            schemaUid: pageUid,
            menuSchemaUid,
            enableTabs: false,
            children: [{
                type: 'tabs',
                schemaUid: gridUid,
                tabSchemaName: gridName,
                hidden: true
            }]
        } as any);

        const routeId = routeResult.data?.id;

        // 2. Create Page+Grid schema
        await api.post('/uiSchemas:insert', {
            type: 'void',
            'x-component': 'Page',
            'x-uid': pageUid,
            properties: {
                [gridName]: {
                    type: 'void',
                    'x-component': 'Grid',
                    'x-initializer': 'page:addBlock',
                    'x-uid': gridUid,
                    'x-async': true,
                    properties: {}
                }
            }
        } as any);

        log(`  [OK] "${title}" → route=${routeId}, grid=${gridUid}`, 'green');
        return { routeId, gridUid };
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        log(`  [ERROR] "${title}" — ${msg}`, 'red');
        return null;
    }
}

async function createGroup(title: string, parentId: number): Promise<number | null> {
    try {
        const result = await api.post('/desktopRoutes:create', {
            type: 'group',
            title,
            parentId,
            hidden: false,
        } as any);
        const id = result.data?.id;
        log(`  [OK] group: "${title}" → id=${id}`, 'green');
        return id;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        log(`  [ERROR] group: "${title}" — ${msg}`, 'red');
        return null;
    }
}

// ─── Add table block to a grid ──────────────────────────────────────────────
async function addTableBlock(gridUid: string, collection: string, title: string, columns: string[]) {
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
                                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
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
                                        'x-component-props': { openMode: 'drawer', type: 'primary', icon: 'PlusOutlined' },
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
                                                    grid: { _isJSONSchemaObject: true, version: '2.0', type: 'void',
                                                            'x-component': 'Grid', 'x-initializer': 'popup:addNew:addBlock', properties: {} }
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
                                'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
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
        log(`    [OK] Table: ${collection} (${columns.length} cols)`, 'green');
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        log(`    [ERROR] Table: ${collection} — ${msg}`, 'red');
    }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  REBUILD UGCO PAGES — Correct Page+Grid Structure         ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    if (DRY_RUN) {
        log('  ** DRY-RUN MODE **\n', 'yellow');
        return;
    }

    // ── Step 1: Delete bad routes ───────────────────────────────────────────
    log('── Step 1: Cleaning up bad routes ──\n', 'cyan');
    for (const routeId of BAD_ROUTE_IDS) {
        try {
            await api.post(`/desktopRoutes:destroy?filterByTk=${routeId}`, {} as any);
            log(`  [DEL] Route ${routeId}`, 'yellow');
        } catch {
            log(`  [SKIP] Route ${routeId} (not found or already deleted)`, 'gray');
        }
    }

    // Also clean up the bad Menu.Item schemas
    const BAD_SCHEMAS = [
        'y7gr7dr2vf', 'lalj02ytpqr', 'hmx2mbseftv', 'scnkl73m55',
        'fpogip4s53g', 's6sh2jrn9v', 'fv50udaxeih', '2cp2vmvfrc2',
        'd1nxzabwho7', 't1jyozgkv6', 'b4ocgz6di08', 'd22d3e59mk9',
        '28wga93zsnn', 'y0zdsd4f0j8', '03xwsltp93p'
    ];
    for (const schemaUid of BAD_SCHEMAS) {
        try {
            await api.post(`/uiSchemas:remove/${schemaUid}`, {} as any);
        } catch { /* ignore */ }
    }

    log('\n── Step 2: Create Dashboard ──\n', 'cyan');
    await createCorrectPage('📊 Dashboard', UGCO_ROOT_ID);

    log('\n── Step 3: Create Especialidades group + pages ──\n', 'cyan');
    const especGroupId = await createGroup('📁 Especialidades', UGCO_ROOT_ID);
    if (!especGroupId) return;

    const SPECIALTIES = [
        { title: '🔶 Digestivo Alto', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '🟤 Digestivo Bajo', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '🩷 Mama', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '💜 Ginecología', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico', 'figo'] },
        { title: '💙 Urología', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '🫁 Tórax', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '💛 Piel y Partes Blandas', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '💚 Endocrinología', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
        { title: '❤️ Hematología', cols: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico'] },
    ];

    for (const spec of SPECIALTIES) {
        const page = await createCorrectPage(spec.title, especGroupId);
        if (page) {
            await addTableBlock(page.gridUid, 'UGCO_casooncologico', `Casos — ${spec.title.replace(/^[^\w]+ /, '')}`, spec.cols);
        }
    }

    log('\n── Step 4: Create Tareas page ──\n', 'cyan');
    const tareas = await createCorrectPage('✅ Tareas Pendientes', UGCO_ROOT_ID);
    if (tareas) {
        await addTableBlock(tareas.gridUid, 'UGCO_tarea', 'Tareas',
            ['UGCO_COD01', 'titulo', 'fecha_vencimiento', 'responsable_usuario', 'comentarios']);
    }

    log('\n── Step 5: Create Reportes page ──\n', 'cyan');
    await createCorrectPage('📈 Reportes', UGCO_ROOT_ID);

    log('\n── Step 6: Create Configuración group + pages ──\n', 'cyan');
    const configGroupId = await createGroup('⚙️ Configuración', UGCO_ROOT_ID);
    if (!configGroupId) return;

    const configPages = [
        { title: 'Especialidades', collection: 'UGCO_REF_oncoespecialidad', cols: ['codigo_alma', 'codigo_oficial', 'nombre', 'activo'] },
        { title: 'Equipos de Seguimiento', collection: 'UGCO_equiposeguimiento', cols: ['nombre', 'descripcion', 'activo'] },
        { title: 'Catálogos REF', collection: 'UGCO_REF_oncoestadoadm', cols: ['codigo', 'nombre', 'es_final', 'activo'] },
    ];

    for (const cp of configPages) {
        const page = await createCorrectPage(cp.title, configGroupId);
        if (page) {
            await addTableBlock(page.gridUid, cp.collection, cp.title, cp.cols);
        }
    }

    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('  UGCO pages rebuilt successfully.', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
