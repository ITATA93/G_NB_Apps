/**
 * Cleanup orphaned test route + Create visual verification page
 */
import { createClient, log } from '../ApiClient';

const client = createClient();

async function main() {
    // 1. CLEANUP orphaned route from failed delete test
    log('1. CLEANUP ruta huerfana (ID 349935494823936)...', 'cyan');
    try {
        await client.post('/desktopRoutes:destroy?filterByTk=349935494823936', {});
        log('   OK - Eliminada', 'green');
    } catch (err: unknown) {
        log('   SKIP - ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    // 2. CREATE a visible test page with route + schema for visual verification
    log('\n2. CREATE ruta visible para verificacion visual...', 'cyan');
    try {
        // Create route (visible in menu)
        const routeRes = await client.post('/desktopRoutes:create', {
            title: 'TEST_VISUAL_CHECK',
            type: 'page',
            icon: 'ExperimentOutlined',
            hideInMenu: false,
        });
        const routeId = routeRes.data?.id;
        log('   Route ID: ' + routeId, 'green');

        // Create schema with real content
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
                                        card: {
                                            type: 'void',
                                            'x-component': 'CardItem',
                                            'x-component-props': { title: 'Verificacion Visual del Agente' },
                                            properties: {
                                                markdown: {
                                                    type: 'void',
                                                    'x-component': 'Markdown.Void',
                                                    'x-component-props': {
                                                        content: [
                                                            '# Pagina de Verificacion Visual',
                                                            '',
                                                            'Esta pagina fue creada **automaticamente** por el agente via API.',
                                                            '',
                                                            '## Que se verifico:',
                                                            '- Creacion de ruta de navegacion (desktopRoutes:create)',
                                                            '- Creacion de esquema UI (uiSchemas:insert)',
                                                            '- Vinculacion de schema a ruta',
                                                            '- Renderizado visual en NocoBase',
                                                            '',
                                                            '## Datos del test:',
                                                            '- **Fecha**: ' + new Date().toISOString().split('T')[0],
                                                            '- **Agente**: Claude Opus 4.6',
                                                            '- **Server**: ' + (process.env.NOCOBASE_BASE_URL || 'N/A'),
                                                            '',
                                                            '> Si puedes leer esto, la creacion de paginas via API funciona correctamente.',
                                                            '',
                                                            '**Puedes eliminar esta pagina manualmente o via script.**',
                                                        ].join('\n')
                                                    }
                                                }
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

        const schemaRes = await client.post('/uiSchemas:insert', schema);
        const schemaUid = schemaRes.data?.data?.['x-uid'] || schemaRes.data?.['x-uid'];
        log('   Schema UID: ' + schemaUid, 'green');

        // Link schema to route
        if (schemaUid && routeId) {
            await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
                schemaUid: schemaUid,
            });
            log('   Schema vinculado a ruta', 'green');
        }

        log('\n   ========================================', 'white');
        log('   VERIFICACION VISUAL:', 'cyan');
        log('   Abre NocoBase y busca "TEST_VISUAL_CHECK" en el menu', 'white');
        log('   URL base: ' + (process.env.NOCOBASE_BASE_URL || '').replace('/api', ''), 'white');
        log('   Route ID: ' + routeId, 'gray');
        log('   Schema UID: ' + schemaUid, 'gray');
        log('   ========================================', 'white');

        log('\n   Para eliminar despues:', 'gray');
        log('   npx tsx -e "import {createClient} from \'./shared/scripts/ApiClient\'; const c = createClient(); c.post(\'/desktopRoutes:destroy?filterByTk=' + routeId + '\', {});"', 'gray');

    } catch (err: unknown) {
        log('   FAIL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    }

    // 3. TEST: Create a collection-based table block (more complex)
    log('\n3. TEST deploy-routes.ts con --dry-run...', 'cyan');
}

main().catch(err => {
    log('FATAL: ' + (err instanceof Error ? err.message : String(err)), 'red');
    process.exit(1);
});
