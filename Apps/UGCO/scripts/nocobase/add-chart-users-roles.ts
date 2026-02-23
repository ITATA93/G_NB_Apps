/**
 * add-chart-users-roles.ts - Agregar gráfico de usuarios por rol a página
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/add-chart-users-roles.ts <pageId>
 */

import { createClient, log, logAction } from '../../../../shared/scripts/ApiClient.js';

const client = createClient();

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

function createChartBlock(): any {
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();
    const chartUid = uid();

    return {
        type: 'void',
        'x-component': 'Grid.Row',
        'x-uid': rowUid,
        properties: {
            [colUid]: {
                type: 'void',
                'x-component': 'Grid.Col',
                'x-uid': colUid,
                properties: {
                    [cardUid]: {
                        type: 'void',
                        'x-decorator': 'ChartBlockProvider',
                        'x-decorator-props': {
                            dataSource: 'main',
                            collection: 'users',
                            association: 'users.roles'
                        },
                        'x-component': 'CardItem',
                        'x-uid': cardUid,
                        'x-component-props': {
                            title: 'Usuarios por Rol'
                        },
                        properties: {
                            [chartUid]: {
                                type: 'void',
                                'x-component': 'G2Plot',
                                'x-uid': chartUid,
                                'x-component-props': {
                                    plot: 'Bar',
                                    config: {
                                        xField: 'count',
                                        yField: 'role',
                                        data: []
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

async function addChartToPage(pageId: number) {
    log(`=== AGREGANDO GRÁFICO DE USUARIOS POR ROL ===\n`, 'cyan');
    log(`Page ID: ${pageId}`, 'white');

    try {
        // 1. Obtener info de la página
        log('\n1. Obteniendo info de la página...', 'gray');
        const route = await client.get('/desktopRoutes:get', { filterByTk: pageId });

        if (!route.data) {
            log('❌ Página no encontrada', 'red');
            return;
        }

        const pageSchemaUid = route.data.schemaUid;
        log(`   Schema UID: ${pageSchemaUid}`, 'gray');

        // 2. Obtener el Grid de la página
        log('2. Obteniendo Grid de la página...', 'gray');
        const pageSchema = await client.get(`/uiSchemas:getProperties/${pageSchemaUid}`);

        if (!pageSchema.data?.properties) {
            log('❌ Schema de página no encontrado o sin Grid', 'red');
            return;
        }

        const gridKey = Object.keys(pageSchema.data.properties)[0];
        const gridUid = pageSchema.data.properties[gridKey]['x-uid'];
        log(`   Grid UID: ${gridUid}`, 'gray');

        // 3. Crear el bloque de gráfico
        log('3. Creando bloque de gráfico...', 'gray');
        const chartBlock = createChartBlock();

        // 4. Insertar el bloque
        log('4. Insertando gráfico en el Grid...', 'gray');
        await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
            schema: chartBlock
        });

        log(`\n✅ Gráfico agregado exitosamente`, 'green');
        log(`   Tipo: Barras - Usuarios por Rol`, 'white');

        logAction('CHART_ADDED', {
            pageId,
            chartType: 'bar',
            collection: 'users',
            gridUid
        });

    } catch (error: any) {
        log(`\n❌ Error: ${error.response?.data?.errors?.[0]?.message || error.message}`, 'red');
        if (error.response?.data) {
            log(`   Detalle: ${JSON.stringify(error.response.data)}`, 'yellow');
        }
        logAction('CHART_ADD_ERROR', { pageId, error: error.message });
    }
}

async function main() {
    const pageId = process.argv[2];

    if (!pageId) {
        log('Uso: add-chart-users-roles.ts <pageId>\n', 'cyan');
        log('Ejemplo:', 'white');
        log('  npx tsx Apps/UGCO/scripts/nocobase/add-chart-users-roles.ts 346098230951936', 'gray');
        process.exit(1);
    }

    await addChartToPage(parseInt(pageId));
}

main();
