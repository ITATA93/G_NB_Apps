/**
 * probe-ui-api.ts — Explorar y documentar las API de UI de NocoBase
 *
 * Prueba sistemáticamente cada endpoint de UI para determinar:
 *   1. ¿Qué endpoints existen y responden?
 *   2. ¿Qué estructura tienen las respuestas?
 *   3. ¿Qué parámetros requieren para crear bloques?
 *
 * USO:
 *   npx tsx shared/scripts/probe-ui-api.ts              # Ejecutar todas las pruebas
 *   npx tsx shared/scripts/probe-ui-api.ts routes        # Solo probar rutas
 *   npx tsx shared/scripts/probe-ui-api.ts schemas       # Solo probar schemas
 *   npx tsx shared/scripts/probe-ui-api.ts blocks        # Solo probar creación de bloques
 *   npx tsx shared/scripts/probe-ui-api.ts cleanup       # Limpiar objetos de prueba
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();
const REPORT_FILE = path.join(process.cwd(), 'docs', 'UI_API_PROBE_REPORT.md');

interface ProbeResult {
    endpoint: string;
    method: string;
    status: 'OK' | 'FAIL' | 'PARTIAL';
    statusCode?: number;
    responseKeys?: string[];
    notes: string;
    payload?: Record<string, unknown>;
    response?: unknown;
}

const results: ProbeResult[] = [];
const createdIds: { routes: number[]; schemaUids: string[] } = { routes: [], schemaUids: [] };

// ─── Helpers ────────────────────────────────────────────────────────────────

function record(result: ProbeResult) {
    results.push(result);
    const icon = result.status === 'OK' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    log(`  ${icon} [${result.method}] ${result.endpoint}: ${result.notes}`, result.status === 'OK' ? 'green' : result.status === 'PARTIAL' ? 'yellow' : 'red');
}

async function probe(method: 'GET' | 'POST', endpoint: string, data?: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown> | null; statusCode: number; error?: string }> {
    try {
        const resp = method === 'GET'
            ? await client.get(`/${endpoint}`, data || {})
            : await client.post(`/${endpoint}`, data || {});
        return { ok: true, data: resp as Record<string, unknown>, statusCode: 200 };
    } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        const resp = err.response as Record<string, unknown> | undefined;
        const statusCode = (resp?.status as number) || 0;
        const msg = ((resp?.data as Record<string, unknown>)?.errors as Array<Record<string, string>>)?.[0]?.message
            || (error instanceof Error ? error.message : String(error));
        return { ok: false, data: null, statusCode, error: msg };
    }
}

// ─── Probe: Routes API ──────────────────────────────────────────────────────

async function probeRoutes() {
    log('\n📍 === ROUTES API (desktopRoutes) ===\n', 'cyan');

    // 1. List routes
    const listRes = await probe('GET', 'desktopRoutes:list');
    record({
        endpoint: 'desktopRoutes:list', method: 'GET',
        status: listRes.ok ? 'OK' : 'FAIL',
        statusCode: listRes.statusCode,
        responseKeys: listRes.data ? Object.keys(listRes.data) : undefined,
        notes: listRes.ok ? `${(listRes.data?.data as unknown[])?.length || '?'} rutas existentes` : `Error: ${listRes.error}`,
        response: listRes.ok ? { totalRoutes: (listRes.data?.data as unknown[])?.length, sampleKeys: Object.keys((listRes.data?.data as unknown[])?.[0] || {}) } : undefined,
    });

    // 2. List with tree
    const treeRes = await probe('GET', 'desktopRoutes:list', { tree: true, paginate: false });
    record({
        endpoint: 'desktopRoutes:list?tree=true', method: 'GET',
        status: treeRes.ok ? 'OK' : 'FAIL',
        statusCode: treeRes.statusCode,
        notes: treeRes.ok ? `Tree mode: ${(treeRes.data?.data as unknown[])?.length || '?'} top-level` : `Error: ${treeRes.error}`,
    });

    // 3. Create a test group
    const groupRes = await probe('POST', 'desktopRoutes:create', {
        type: 'group',
        title: '__PROBE_GROUP__',
        icon: 'ExperimentOutlined',
    });
    const groupId = (groupRes.data?.data as Record<string, unknown>)?.id as number | undefined;
    if (groupId) createdIds.routes.push(groupId);
    record({
        endpoint: 'desktopRoutes:create (group)', method: 'POST',
        status: groupRes.ok ? 'OK' : 'FAIL',
        statusCode: groupRes.statusCode,
        responseKeys: groupRes.data?.data ? Object.keys(groupRes.data.data as Record<string, unknown>) : undefined,
        notes: groupRes.ok ? `Group created, ID=${groupId}, keys: ${Object.keys((groupRes.data?.data as Record<string, unknown>) || {}).join(', ')}` : `Error: ${groupRes.error}`,
        response: groupRes.data?.data,
    });

    // 4. Create a test page under group
    if (groupId) {
        const pageRes = await probe('POST', 'desktopRoutes:create', {
            type: 'page',
            title: '__PROBE_PAGE__',
            icon: 'FileOutlined',
            parentId: groupId,
        });
        const pageData = pageRes.data?.data as Record<string, unknown> | undefined;
        const pageId = pageData?.id as number | undefined;
        if (pageId) createdIds.routes.push(pageId);
        record({
            endpoint: 'desktopRoutes:create (page)', method: 'POST',
            status: pageRes.ok ? 'OK' : 'FAIL',
            statusCode: pageRes.statusCode,
            responseKeys: pageData ? Object.keys(pageData) : undefined,
            notes: pageRes.ok
                ? `Page created, ID=${pageId}, schemaUid=${pageData?.schemaUid || 'NONE'}, keys: ${Object.keys(pageData || {}).join(', ')}`
                : `Error: ${pageRes.error}`,
            response: pageData,
        });

        // 5. Try to get the page to see its schema binding
        if (pageId) {
            const getRes = await probe('GET', `desktopRoutes:get?filterByTk=${pageId}`);
            const getData = getRes.data?.data as Record<string, unknown> | undefined;
            record({
                endpoint: `desktopRoutes:get (page ${pageId})`, method: 'GET',
                status: getRes.ok ? 'OK' : 'FAIL',
                notes: getRes.ok
                    ? `schemaUid=${getData?.schemaUid || 'NONE'}, type=${getData?.type}`
                    : `Error: ${getRes.error}`,
                response: getData,
            });
        }
    }
}

// ─── Probe: UI Schemas API ──────────────────────────────────────────────────

async function probeSchemas() {
    log('\n🧩 === UI SCHEMAS API (uiSchemas) ===\n', 'cyan');

    // 1. Get admin menu schema
    const menuRes = await probe('GET', 'uiSchemas:getJsonSchema/nocobase-admin-menu');
    record({
        endpoint: 'uiSchemas:getJsonSchema/nocobase-admin-menu', method: 'GET',
        status: menuRes.ok ? 'OK' : 'FAIL',
        notes: menuRes.ok
            ? `Menu schema retrieved, ${Object.keys((menuRes.data?.data as Record<string, unknown>)?.properties || {}).length} top-level items`
            : `Error: ${menuRes.error}`,
    });

    // 2. Insert a simple void schema
    const insertRes = await probe('POST', 'uiSchemas:insert', {
        type: 'void',
        name: '__probe_schema_test__',
        'x-component': 'Page',
        'x-async': true,
        properties: {}
    });
    const insertedUid = (insertRes.data?.data as Record<string, unknown>)?.['x-uid'] as string | undefined;
    if (insertedUid) createdIds.schemaUids.push(insertedUid);
    record({
        endpoint: 'uiSchemas:insert', method: 'POST',
        status: insertRes.ok ? 'OK' : 'FAIL',
        statusCode: insertRes.statusCode,
        notes: insertRes.ok
            ? `Schema inserted, x-uid=${insertedUid}, keys: ${Object.keys((insertRes.data?.data as Record<string, unknown>) || {}).join(', ')}`
            : `Error: ${insertRes.error}`,
        response: insertRes.data?.data,
    });

    // 3. insertAdjacent — add child to existing schema
    if (insertedUid) {
        const adjRes = await probe('POST', `uiSchemas:insertAdjacent/${insertedUid}?position=beforeEnd`, {
            schema: {
                type: 'void',
                name: '__probe_grid__',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                properties: {}
            }
        });
        const adjData = adjRes.data?.data as Record<string, unknown> | undefined;
        const gridUid = adjData?.['x-uid'] as string | undefined;
        if (gridUid) createdIds.schemaUids.push(gridUid);
        record({
            endpoint: `uiSchemas:insertAdjacent (child of ${insertedUid})`, method: 'POST',
            status: adjRes.ok ? 'OK' : 'FAIL',
            notes: adjRes.ok
                ? `Grid added, x-uid=${gridUid}, keys: ${Object.keys(adjData || {}).join(', ')}`
                : `Error: ${adjRes.error}`,
            response: adjData,
        });
    }

    // 4. patch schema
    if (insertedUid) {
        const patchRes = await probe('POST', `uiSchemas:patch`, {
            'x-uid': insertedUid,
            title: '__PROBE_PATCHED__',
        });
        record({
            endpoint: 'uiSchemas:patch', method: 'POST',
            status: patchRes.ok ? 'OK' : 'FAIL',
            notes: patchRes.ok ? 'Patch successful' : `Error: ${patchRes.error}`,
        });
    }

    // 5. remove schema
    if (insertedUid) {
        const removeRes = await probe('POST', `uiSchemas:remove/${insertedUid}`);
        record({
            endpoint: 'uiSchemas:remove', method: 'POST',
            status: removeRes.ok ? 'OK' : 'FAIL',
            notes: removeRes.ok ? `Schema ${insertedUid} removed` : `Error: ${removeRes.error}`,
        });
        // Remove from tracking since it's gone
        createdIds.schemaUids = createdIds.schemaUids.filter(u => u !== insertedUid);
    }
}

// ─── Probe: Block Creation (the hard part) ──────────────────────────────────

async function probeBlocks() {
    log('\n🧱 === BLOCK CREATION (Table/Form inside Page) ===\n', 'cyan');

    // Create a real page with schema to test block insertion
    const pageRes = await probe('POST', 'desktopRoutes:create', {
        type: 'page',
        title: '__PROBE_BLOCK_PAGE__',
        icon: 'ExperimentOutlined',
    });
    const pageData = pageRes.data?.data as Record<string, unknown> | undefined;
    const pageId = pageData?.id as number | undefined;
    const pageSchemaUid = pageData?.schemaUid as string | undefined;
    if (pageId) createdIds.routes.push(pageId);

    record({
        endpoint: 'desktopRoutes:create (block test page)', method: 'POST',
        status: pageRes.ok ? 'OK' : 'FAIL',
        notes: pageRes.ok ? `Page ID=${pageId}, schemaUid=${pageSchemaUid || 'NONE'}` : `Error: ${pageRes.error}`,
        response: pageData,
    });

    // If no schema was auto-created, create one manually
    let gridUid = pageSchemaUid;
    if (!gridUid && pageId) {
        log('  ⚠️ No auto-schema. Creating manual Page schema...', 'yellow');
        const schemaRes = await probe('POST', 'uiSchemas:insert', {
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
        });
        const schemaData = schemaRes.data?.data as Record<string, unknown> | undefined;
        gridUid = schemaData?.['x-uid'] as string | undefined;

        if (gridUid) {
            createdIds.schemaUids.push(gridUid);
            // Bind to route
            await probe('POST', `desktopRoutes:update?filterByTk=${pageId}`, { schemaUid: gridUid });
            log(`  🔗 Bound schema ${gridUid} to route ${pageId}`, 'green');

            // Get the grid child UID
            const fullSchema = await probe('GET', `uiSchemas:getJsonSchema/${gridUid}`);
            const props = (fullSchema.data?.data as Record<string, unknown>)?.properties as Record<string, Record<string, unknown>> | undefined;
            if (props) {
                const gridChild = Object.values(props)[0];
                if (gridChild?.['x-uid']) {
                    gridUid = gridChild['x-uid'] as string;
                    log(`  📐 Grid child UID: ${gridUid}`, 'gray');
                }
            }
        }
    }

    if (!gridUid) {
        record({
            endpoint: 'Block creation', method: 'N/A',
            status: 'FAIL',
            notes: 'Cannot proceed — no grid UID available',
        });
        return;
    }

    // Try to get the full schema tree to understand the structure
    const treeRes = await probe('GET', `uiSchemas:getJsonSchema/${gridUid}`);
    record({
        endpoint: `uiSchemas:getJsonSchema (grid ${gridUid})`, method: 'GET',
        status: treeRes.ok ? 'OK' : 'FAIL',
        notes: treeRes.ok ? `Grid schema retrieved, keys: ${Object.keys((treeRes.data?.data as Record<string, unknown>) || {}).join(', ')}` : `Error: ${treeRes.error}`,
        response: treeRes.data?.data,
    });

    // Try Method A: insertAdjacent with a full Table block schema
    log('\n  🔬 Method A: insertAdjacent with full Table schema...', 'white');
    const tableSchemaA = {
        schema: {
            type: 'void',
            'x-component': 'Grid.Row',
            properties: {
                col1: {
                    type: 'void',
                    'x-component': 'Grid.Col',
                    properties: {
                        block1: {
                            type: 'void',
                            'x-decorator': 'TableBlockProvider',
                            'x-decorator-props': {
                                collection: 'ag_categorias_actividad',
                                dataSource: 'main',
                                action: 'list',
                            },
                            'x-component': 'CardItem',
                            'x-component-props': { title: 'Categorías de Actividad' },
                            properties: {
                                table: {
                                    type: 'array',
                                    'x-component': 'TableV2',
                                    'x-use-component-props': 'useTableBlockProps',
                                    'x-component-props': {
                                        rowKey: 'id',
                                        rowSelection: { type: 'checkbox' },
                                    },
                                    properties: {}
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const methodA = await probe('POST', `uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, tableSchemaA);
    const methodAData = methodA.data?.data as Record<string, unknown> | undefined;
    if (methodAData?.['x-uid']) createdIds.schemaUids.push(methodAData['x-uid'] as string);
    record({
        endpoint: `insertAdjacent/Grid.Row+TableBlockProvider`, method: 'POST',
        status: methodA.ok ? 'OK' : 'FAIL',
        notes: methodA.ok
            ? `Table block created! x-uid=${methodAData?.['x-uid']}`
            : `Error: ${methodA.error}`,
        response: methodAData,
    });

    // Try Method B: Simpler — just a CardItem with collection
    log('\n  🔬 Method B: Simple CardItem block...', 'white');
    const tableSchemaB = {
        schema: {
            type: 'void',
            'x-component': 'Grid.Row',
            properties: {
                col1: {
                    type: 'void',
                    'x-component': 'Grid.Col',
                    properties: {
                        block1: {
                            type: 'void',
                            'x-decorator': 'CardItem',
                            'x-component': 'Markdown.Void',
                            'x-component-props': {
                                content: '# Test Block\n\nThis is a probe test block for ag_tipos_inasistencia.'
                            },
                        }
                    }
                }
            }
        }
    };

    const methodB = await probe('POST', `uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, tableSchemaB);
    const methodBData = methodB.data?.data as Record<string, unknown> | undefined;
    if (methodBData?.['x-uid']) createdIds.schemaUids.push(methodBData['x-uid'] as string);
    record({
        endpoint: `insertAdjacent/CardItem+Markdown`, method: 'POST',
        status: methodB.ok ? 'OK' : 'FAIL',
        notes: methodB.ok
            ? `Markdown block created! x-uid=${methodBData?.['x-uid']}`
            : `Error: ${methodB.error}`,
        response: methodBData,
    });
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

async function cleanup() {
    log('\n🧹 === CLEANUP ===\n', 'cyan');

    // Remove test schemas
    for (const uid of createdIds.schemaUids) {
        try {
            await client.post(`/uiSchemas:remove/${uid}`, {});
            log(`  ✅ Removed schema ${uid}`, 'green');
        } catch {
            log(`  ⚠️ Could not remove schema ${uid}`, 'yellow');
        }
    }

    // Remove test routes (reverse order for children first)
    for (const id of [...createdIds.routes].reverse()) {
        try {
            await client.post(`/desktopRoutes:destroy?filterByTk=${id}`, {});
            log(`  ✅ Removed route ${id}`, 'green');
        } catch {
            log(`  ⚠️ Could not remove route ${id}`, 'yellow');
        }
    }
}

// ─── Report ─────────────────────────────────────────────────────────────────

function generateReport() {
    const lines: string[] = [
        '# UI API Probe Report',
        `\nGenerated: ${new Date().toISOString()}\n`,
        '## Summary\n',
        `| # | Endpoint | Method | Status | Notes |`,
        `|---|----------|--------|--------|-------|`,
    ];

    results.forEach((r, i) => {
        const icon = r.status === 'OK' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : '❌';
        lines.push(`| ${i + 1} | \`${r.endpoint}\` | ${r.method} | ${icon} ${r.status} | ${r.notes} |`);
    });

    lines.push('\n## Detailed Responses\n');
    results.forEach((r, i) => {
        if (r.response) {
            lines.push(`### ${i + 1}. ${r.endpoint}\n`);
            lines.push('```json');
            lines.push(JSON.stringify(r.response, null, 2));
            lines.push('```\n');
        }
    });

    const okCount = results.filter(r => r.status === 'OK').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    lines.push(`\n## Conclusion\n`);
    lines.push(`- **${okCount}/${results.length}** endpoints functional`);
    lines.push(`- **${failCount}** failures`);

    fs.writeFileSync(REPORT_FILE, lines.join('\n'));
    log(`\n📄 Report saved to ${REPORT_FILE}`, 'cyan');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const command = process.argv[2] || 'all';

    log('🔬 NocoBase UI API Probe\n', 'cyan');
    log(`   Servidor: ${process.env.NOCOBASE_URL || 'http://localhost:13000'}`, 'gray');
    log(`   Modo: ${command}\n`, 'gray');

    try {
        if (command === 'all' || command === 'routes') await probeRoutes();
        if (command === 'all' || command === 'schemas') await probeSchemas();
        if (command === 'all' || command === 'blocks') await probeBlocks();

        generateReport();

        if (command === 'all' || command === 'cleanup') await cleanup();
    } catch (error: unknown) {
        log(`\n❌ Fatal: ${error instanceof Error ? error.message : String(error)}`, 'red');
    }
}

main().catch(console.error);
