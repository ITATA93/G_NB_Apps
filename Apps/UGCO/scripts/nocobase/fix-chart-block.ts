/**
 * fix-chart-block.ts - Corregir bloque de chart existente
 */

import { createClient, log, logAction } from '../../../../shared/scripts/ApiClient.js';

const client = createClient();

async function main() {
    const chartUid = 'qs18o50sax';

    log(`=== CORRIGIENDO BLOQUE DE CHART ===\n`, 'cyan');
    log(`Chart UID: ${chartUid}`, 'white');

    try {
        // Patch para agregar dataSource
        log('\n1. Aplicando patch al schema...', 'gray');

        await client.post('/uiSchemas:patch', {
            'x-uid': chartUid,
            'x-decorator-props': {
                dataSource: 'main',
                mode: 'builder',
                collection: 'users',
                query: {
                    measures: [
                        {
                            alias: 'total',
                            field: ['id'],
                            aggregation: 'count'
                        }
                    ],
                    dimensions: [
                        {
                            field: ['roles', 'name']
                        }
                    ]
                },
                config: {
                    chartType: 'g2plot.Bar',
                    general: {
                        xField: 'total',
                        yField: 'roles.name'
                    },
                    advanced: {}
                }
            }
        });

        log(`\n✅ Patch aplicado exitosamente`, 'green');
        log(`   Recarga la página para ver el gráfico`, 'white');

        logAction('CHART_FIXED', { chartUid });

    } catch (error: any) {
        log(`\n❌ Error: ${error.response?.data?.errors?.[0]?.message || error.message}`, 'red');
        if (error.response?.data) {
            log(`   Detalle: ${JSON.stringify(error.response.data)}`, 'yellow');
        }
    }
}

main();
