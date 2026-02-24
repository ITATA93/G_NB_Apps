/**
 * Temporary round-trip API test — creates, verifies, and deletes a test route.
 * Safe to run against production (creates with hideInMenu: true, cleans up after).
 */
import { createClient, log } from '../ApiClient';

const client = createClient();

async function testRouteRoundTrip() {
    log('\n=== TEST: Route CRUD Round-Trip ===\n', 'cyan');

    // 1. CREATE
    log('1. CREATE ruta de prueba...', 'white');
    try {
        const res = await client.post('/desktopRoutes:create', {
            title: '__TEST_AGENT_ROUTE__',
            type: 'page',
            icon: 'ExperimentOutlined',
            hideInMenu: true,
        });
        const routeId = res.data?.id;
        if (!routeId) {
            log('   FAIL - No se obtuvo ID. Response: ' + JSON.stringify(res.data), 'red');
            return;
        }
        log('   OK - ID: ' + routeId, 'green');

        // 2. VERIFY
        log('2. VERIFY ruta existe...', 'white');
        const check = await client.get('/desktopRoutes:get', { filterByTk: routeId });
        if (check.data?.title === '__TEST_AGENT_ROUTE__') {
            log('   OK - Titulo correcto', 'green');
        } else {
            log('   FAIL - Titulo: ' + check.data?.title, 'red');
        }

        // 3. DELETE
        log('3. DELETE ruta de prueba...', 'white');
        await client.post('/desktopRoutes:destroy', { filterByTk: routeId });
        log('   OK - Eliminada', 'green');

        // 4. CONFIRM
        log('4. CONFIRM eliminacion...', 'white');
        try {
            const gone = await client.get('/desktopRoutes:get', { filterByTk: routeId });
            if (gone.data) {
                log('   WARN - Ruta aun existe (puede tardar en purgar)', 'yellow');
            } else {
                log('   OK - Confirmado eliminada', 'green');
            }
        } catch {
            log('   OK - Confirmado eliminada (404)', 'green');
        }
    } catch (err: unknown) {
        log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    }
}

async function testSchemaCreation() {
    log('\n=== TEST: UI Schema Creation ===\n', 'cyan');

    log('1. CREATE schema de pagina...', 'white');
    try {
        const schema = {
            type: 'void',
            'x-component': 'Page',
            'x-async': true,
            properties: {
                grid: {
                    type: 'void',
                    'x-component': 'Grid',
                    'x-initializer': 'page:addBlock',
                    properties: {
                        row1: {
                            type: 'void',
                            'x-component': 'Grid.Row',
                            properties: {
                                col1: {
                                    type: 'void',
                                    'x-component': 'Grid.Col',
                                    properties: {
                                        markdown: {
                                            type: 'void',
                                            'x-component': 'Markdown.Void',
                                            'x-component-props': {
                                                content: '# Test Page\n\nThis is a test page created by the agent.'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const res = await client.post('/uiSchemas:insert', schema);
        const uid = res.data?.data?.['x-uid'] || res.data?.['x-uid'];
        if (uid) {
            log('   OK - Schema UID: ' + uid, 'green');

            // Cleanup
            log('2. DELETE schema...', 'white');
            try {
                await client.post(`/uiSchemas:remove/${uid}`, {});
                log('   OK - Schema eliminado', 'green');
            } catch {
                log('   WARN - No se pudo eliminar schema (puede requerir endpoint diferente)', 'yellow');
            }
        } else {
            log('   FAIL - No se obtuvo UID. Response: ' + JSON.stringify(res.data).slice(0, 200), 'red');
        }
    } catch (err: unknown) {
        log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    }
}

async function testCollectionRead() {
    log('\n=== TEST: Data CRUD (Read) ===\n', 'cyan');

    log('1. READ records from et_turnos...', 'white');
    try {
        const res = await client.get('/et_turnos:list', { pageSize: 3 });
        const records = res.data || [];
        log('   OK - Records: ' + records.length, 'green');
        if (records.length > 0) {
            log('   Sample: ' + JSON.stringify(records[0]).slice(0, 150), 'gray');
        }
    } catch (err: unknown) {
        log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    }
}

async function testChartQuery() {
    log('\n=== TEST: Chart/Analytics Query ===\n', 'cyan');

    log('1. QUERY aggregate data (count by collection)...', 'white');
    try {
        const res = await client.post('/charts:query', {
            collection: 'et_turnos',
            measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
            dimensions: [{ field: ['turno'] }],
        });
        log('   OK - Chart data: ' + JSON.stringify(res.data).slice(0, 300), 'green');
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        if (axiosErr.response?.status === 404) {
            log('   SKIP - Plugin charts no instalado (404)', 'yellow');
        } else {
            log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
        }
    }
}

async function testWorkflowList() {
    log('\n=== TEST: Workflow List ===\n', 'cyan');

    log('1. LIST workflows...', 'white');
    try {
        const res = await client.get('/workflows:list', { pageSize: 10 });
        const workflows = res.data || [];
        log('   OK - Workflows: ' + workflows.length, 'green');
        for (const w of workflows) {
            log(`   - [${w.id}] ${w.title} (${w.enabled ? 'activo' : 'inactivo'})`, 'gray');
        }
    } catch (err: unknown) {
        log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    }
}

async function main() {
    log('╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase API Real Verification Test                     ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝', 'cyan');
    log('  Server: ' + process.env.NOCOBASE_BASE_URL, 'gray');

    await testRouteRoundTrip();
    await testSchemaCreation();
    await testCollectionRead();
    await testChartQuery();
    await testWorkflowList();

    log('\n=== ALL TESTS COMPLETE ===\n', 'cyan');
}

main().catch(err => {
    log('FATAL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    process.exit(1);
});
