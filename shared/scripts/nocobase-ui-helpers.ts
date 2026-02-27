/**
 * nocobase-ui-helpers.ts - Shared helpers for NocoBase UI schema generation
 *
 * Eliminates code duplication across UGCO deploy scripts.
 * Used by: deploy-ugco-dashboard.ts, deploy-ugco-reportes.ts, rebuild-ugco-pages.ts
 *
 * @module shared/scripts/nocobase-ui-helpers
 */

import { log } from './ApiClient.js';
import type { ApiClient } from './ApiClient.js';

// ─── UID Generation (collision-safe) ─────────────────────────────────────────

/** Generate a random UID for NocoBase schema elements (11 chars, a-z0-9) */
export function uid(): string {
    return Math.random().toString(36).substring(2, 13);
}

// ─── Schema Insertion ────────────────────────────────────────────────────────

/** Insert a schema block into a Grid as the last child */
export async function insertIntoGrid(
    api: ApiClient,
    gridUid: string,
    schema: Record<string, unknown>,
): Promise<boolean> {
    try {
        await api.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
            schema,
        } as Record<string, unknown>);
        return true;
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        log(`    [ERROR] insertIntoGrid(${gridUid}) — ${msg}`, 'red');
        return false;
    }
}

// ─── Grid Row Wrapper ────────────────────────────────────────────────────────

/** Wrap one or more blocks into a Grid.Row with N columns (one per block) */
export function wrapInRow(blocks: Record<string, unknown>[]): Record<string, unknown> {
    const rowUid = uid();
    const cols: Record<string, unknown> = {};

    for (const block of blocks) {
        cols[uid()] = {
            _isJSONSchemaObject: true, version: '2.0', type: 'void',
            'x-component': 'Grid.Col',
            properties: { [uid()]: block },
        };
    }

    return {
        _isJSONSchemaObject: true, version: '2.0', type: 'void',
        'x-component': 'Grid.Row',
        'x-uid': rowUid, name: rowUid,
        properties: cols,
    };
}

// ─── Table Block Builder ─────────────────────────────────────────────────────

export interface TableBlockOptions {
    /** Collection name (e.g. 'UGCO_casooncologico') */
    collection: string;
    /** Card title */
    title: string;
    /** Field names to show as columns */
    columns: string[];
    /** Extra params: pageSize, sort, filter, etc. */
    params?: Record<string, unknown>;
    /** Include export button in action bar */
    includeExport?: boolean;
    /** Include "Add new" button in action bar */
    includeCreate?: boolean;
}

/** Build a full TableV2 block schema ready for insertion into a Grid */
export function buildTableBlock(opts: TableBlockOptions): Record<string, unknown> {
    const { collection, title, columns, params = {}, includeExport = false, includeCreate = false } = opts;

    // Column schemas
    const colProps: Record<string, unknown> = {};
    for (const col of columns) {
        colProps[uid()] = {
            _isJSONSchemaObject: true, version: '2.0', type: 'void',
            'x-decorator': 'TableV2.Column.Decorator',
            'x-component': 'TableV2.Column',
            properties: {
                [col]: {
                    _isJSONSchemaObject: true, version: '2.0',
                    'x-collection-field': `${collection}.${col}`,
                    'x-component': 'CollectionField',
                    'x-component-props': {}, 'x-read-pretty': true,
                    'x-decorator': null, 'x-decorator-props': {},
                },
            },
        };
    }

    // Action bar items
    const actionItems: Record<string, unknown> = {
        filter: {
            _isJSONSchemaObject: true, version: '2.0', type: 'void',
            title: '{{ t("Filter") }}', 'x-action': 'filter',
            'x-component': 'Filter.Action',
            'x-use-component-props': 'useFilterActionProps',
            'x-component-props': { icon: 'FilterOutlined' },
            'x-align': 'left',
        },
    };

    if (includeCreate) {
        actionItems.create = {
            _isJSONSchemaObject: true, version: '2.0', type: 'void',
            title: '{{ t("Add new") }}', 'x-action': 'create',
            'x-component': 'Action',
            'x-component-props': { openMode: 'drawer', type: 'primary', icon: 'PlusOutlined' },
            'x-align': 'right',
            'x-acl-action': `${collection}:create`,
            properties: {
                drawer: {
                    _isJSONSchemaObject: true, version: '2.0', type: 'void',
                    title: '{{ t("Add record") }}', 'x-component': 'Action.Container',
                    'x-component-props': { className: 'nb-action-popup' },
                    properties: {
                        grid: {
                            _isJSONSchemaObject: true, version: '2.0', type: 'void',
                            'x-component': 'Grid', 'x-initializer': 'popup:addNew:addBlock',
                            properties: {},
                        },
                    },
                },
            },
        };
    }

    if (includeExport) {
        actionItems.export = {
            _isJSONSchemaObject: true, version: '2.0', type: 'void',
            title: '{{ t("Export") }}', 'x-action': 'export',
            'x-component': 'Action',
            'x-component-props': { icon: 'DownloadOutlined', useAction: '{{ useExportAction }}' },
            'x-align': 'right',
            'x-acl-action': `${collection}:export`,
        };
    }

    return {
        _isJSONSchemaObject: true, version: '2.0', type: 'void',
        'x-acl-action': `${collection}:list`,
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
            collection, dataSource: 'main', action: 'list',
            params: { pageSize: 20, ...params },
            showIndex: true, dragSort: false,
        },
        'x-component': 'CardItem',
        'x-component-props': { title },
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:table',
        properties: {
            actions: {
                _isJSONSchemaObject: true, version: '2.0', type: 'void',
                'x-initializer': 'table:configureActions',
                'x-component': 'ActionBar',
                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                properties: actionItems,
            },
            [uid()]: {
                _isJSONSchemaObject: true, version: '2.0', type: 'array',
                'x-initializer': 'table:configureColumns',
                'x-component': 'TableV2',
                'x-use-component-props': 'useTableBlockProps',
                'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                properties: {
                    actions: {
                        _isJSONSchemaObject: true, version: '2.0', type: 'void',
                        title: '{{ t("Actions") }}', 'x-action-column': 'actions',
                        'x-decorator': 'TableV2.Column.ActionBar',
                        'x-component': 'TableV2.Column',
                        'x-component-props': { width: 120, fixed: 'right' },
                        'x-initializer': 'table:configureItemActions',
                        properties: {},
                    },
                    ...colProps,
                },
            },
        },
    };
}

// ─── Markdown Block Builder ──────────────────────────────────────────────────

/** Build a Markdown (rich text) block schema */
export function buildMarkdownBlock(content: string): Record<string, unknown> {
    return {
        _isJSONSchemaObject: true, version: '2.0', type: 'void',
        'x-decorator': 'BlockItem',
        'x-component': 'Markdown',
        'x-component-props': { content },
        'x-editable': false,
    };
}

// ─── Chart Block Builder ─────────────────────────────────────────────────────

export interface ChartBlockOptions {
    title: string;
    collection: string;
    measures: Array<{ field: string[]; aggregation: string; alias?: string }>;
    dimensions: Array<{ field: string[]; alias?: string }>;
    chartType: string; // 'Bar', 'Pie', 'Line', 'Area', 'Column'
    xField?: string;
    yField?: string;
    seriesField?: string;
}

/** Build a chart block schema (requires data-visualization plugin) */
export function buildChartBlock(opts: ChartBlockOptions): Record<string, unknown> {
    return {
        _isJSONSchemaObject: true, version: '2.0', type: 'void',
        'x-decorator': 'ChartV2Block',
        'x-decorator-props': {},
        'x-component': 'CardItem',
        'x-component-props': { title: opts.title },
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:chartV2',
        'x-uid': uid(),
        properties: {
            chart: {
                _isJSONSchemaObject: true, version: '2.0', type: 'void',
                'x-component': 'ChartRenderer',
                'x-component-props': {
                    collection: opts.collection,
                    dataSource: 'main',
                    query: {
                        measures: opts.measures,
                        dimensions: opts.dimensions,
                    },
                    config: {
                        chartType: opts.chartType,
                        general: {
                            xField: opts.xField,
                            yField: opts.yField,
                            seriesField: opts.seriesField,
                        },
                    },
                },
            },
        },
    };
}

// ─── Page & Route Helpers ────────────────────────────────────────────────────

export interface CreatePageResult {
    routeId: number;
    gridUid: string;
}

/** Create a NocoBase page with correct Page+Grid structure */
export async function createPage(
    api: ApiClient,
    title: string,
    parentId: number,
): Promise<CreatePageResult | null> {
    const pageUid = uid();
    const gridUid = uid();
    const gridName = uid();
    const menuSchemaUid = uid();

    try {
        const routeResult = await api.post('/desktopRoutes:create', {
            type: 'page', title, parentId,
            schemaUid: pageUid, menuSchemaUid,
            enableTabs: false,
            children: [{
                type: 'tabs', schemaUid: gridUid,
                tabSchemaName: gridName, hidden: true,
            }],
        } as Record<string, unknown>);

        const routeId = (routeResult as { data?: { id?: number } }).data?.id;

        await api.post('/uiSchemas:insert', {
            type: 'void', 'x-component': 'Page', 'x-uid': pageUid,
            properties: {
                [gridName]: {
                    type: 'void', 'x-component': 'Grid',
                    'x-initializer': 'page:addBlock',
                    'x-uid': gridUid, 'x-async': true,
                    properties: {},
                },
            },
        } as Record<string, unknown>);

        log(`  [OK] "${title}" → route=${routeId}, grid=${gridUid}`, 'green');
        return { routeId: routeId!, gridUid };
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        log(`  [ERROR] "${title}" — ${msg}`, 'red');
        return null;
    }
}

/** Create a menu group (folder) */
export async function createGroup(
    api: ApiClient,
    title: string,
    parentId: number,
): Promise<number | null> {
    try {
        const result = await api.post('/desktopRoutes:create', {
            type: 'group', title, parentId,
            hidden: false,
        } as Record<string, unknown>);
        const id = (result as { data?: { id?: number } }).data?.id;
        log(`  [OK] group: "${title}" → id=${id}`, 'green');
        return id ?? null;
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        log(`  [ERROR] group: "${title}" — ${msg}`, 'red');
        return null;
    }
}

// ─── Dynamic UID Discovery ──────────────────────────────────────────────────

/** Find the grid UID for a page given its schema UID (from desktopRoutes listing) */
export async function findGridUid(api: ApiClient, pageSchemaUid: string): Promise<string | null> {
    try {
        const result = await api.get(`/uiSchemas:getProperties/${pageSchemaUid}`);
        const props = (result as { data?: { properties?: Record<string, { 'x-component'?: string; 'x-uid'?: string }> } })
            .data?.properties || {};
        for (const [, v] of Object.entries(props)) {
            if (v['x-component'] === 'Grid' && v['x-uid']) {
                return v['x-uid'];
            }
        }
        return null;
    } catch {
        return null;
    }
}

/** Find a page route by title under a parent ID */
export async function findRouteByTitle(
    api: ApiClient,
    parentId: number,
    title: string,
): Promise<{ id: number; schemaUid: string } | null> {
    try {
        const result = await api.get('/desktopRoutes:list', {
            filter: { parentId },
            pageSize: 100,
        });
        const routes = (result as { data?: Array<{ id: number; title: string; schemaUid: string }> }).data || [];
        const match = routes.find(r => r.title === title);
        return match ? { id: match.id, schemaUid: match.schemaUid } : null;
    } catch {
        return null;
    }
}

// ─── Field Definition Helpers ────────────────────────────────────────────────

type FieldInterface = 'input' | 'textarea' | 'integer' | 'checkbox' | 'datetime' |
    'createdAt' | 'updatedAt' | 'select' | 'number' | 'url' | 'email' | 'phone';

interface FieldDef {
    name: string;
    type: string;
    interface: FieldInterface;
    uiSchema: { title: string; type: string; 'x-component'?: string; enum?: Array<{ value: string; label: string }> };
    required?: boolean;
    unique?: boolean;
    defaultValue?: unknown;
}

export function fieldStr(name: string, title: string, required = false): FieldDef {
    return { name, type: 'string', interface: 'input', uiSchema: { title, type: 'string', 'x-component': 'Input' }, required };
}

export function fieldTxt(name: string, title: string): FieldDef {
    return { name, type: 'text', interface: 'textarea', uiSchema: { title, type: 'string', 'x-component': 'Input.TextArea' } };
}

export function fieldInt(name: string, title: string): FieldDef {
    return { name, type: 'integer', interface: 'integer', uiSchema: { title, type: 'number', 'x-component': 'InputNumber' } };
}

export function fieldBool(name: string, title: string, defaultValue = false): FieldDef {
    return { name, type: 'boolean', interface: 'checkbox', uiSchema: { title, type: 'boolean', 'x-component': 'Checkbox' }, defaultValue };
}

export function fieldDate(name: string, title: string): FieldDef {
    return { name, type: 'date', interface: 'datetime', uiSchema: { title, type: 'string', 'x-component': 'DatePicker' } };
}

export function fieldDatetime(name: string, title: string): FieldDef {
    return { name, type: 'date', interface: 'datetime', uiSchema: { title, type: 'string', 'x-component': 'DatePicker', } };
}

export function fieldSelect(name: string, title: string, options: string[]): FieldDef {
    return {
        name, type: 'string', interface: 'select',
        uiSchema: {
            title, type: 'string', 'x-component': 'Select',
            enum: options.map(o => ({ value: o, label: o })),
        },
    };
}

/** Create a belongsTo relationship field */
export function fieldBelongsTo(foreignKey: string, title: string, target: string) {
    return {
        name: foreignKey.replace(/_id$/, ''),
        type: 'belongsTo',
        interface: 'obo' as FieldInterface,
        foreignKey,
        target,
        uiSchema: { title, type: 'object', 'x-component': 'AssociationField' },
    };
}
