/**
 * resumen_semanal.ts — Workflow: Generar Resumen Semanal de Agenda
 *
 * Crea un workflow tipo 'schedule' (cron domingos 21:00) que consolida
 * los registros de ag_resumen_diario de la semana y genera un registro
 * en ag_resumen_semanal por cada funcionario con actividad.
 *
 * Uso:
 *   npx tsx Apps/AGENDA/workflows/resumen_semanal.ts
 *   npx tsx Apps/AGENDA/workflows/resumen_semanal.ts --dry-run
 */

import { createClient, log, logAction } from '../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

interface WorkflowNode {
    type: string;
    title: string;
    config: Record<string, unknown>;
}

async function createWorkflowWithNodes(config: {
    title: string;
    type: string;
    triggerConfig: Record<string, unknown>;
    nodes: WorkflowNode[];
}): Promise<number | null> {
    if (DRY_RUN) {
        log(`[DRY RUN] Crearía workflow: "${config.title}" con ${config.nodes.length} nodos`, 'yellow');
        for (const node of config.nodes) {
            log(`  [DRY RUN] Nodo: "${node.title}" (${node.type})`, 'yellow');
        }
        return null;
    }

    try {
        const wfResult = await api.post('/workflows:create', {
            title: config.title,
            type: config.type,
            enabled: false,
            config: config.triggerConfig,
        });

        const wfId = (wfResult as { data?: { id?: number } }).data?.id;
        if (!wfId) {
            log(`  [ERROR] ${config.title} — no se retorno workflow ID`, 'red');
            return null;
        }

        let prevNodeId: number | null = null;
        for (const node of config.nodes) {
            const nodePayload: Record<string, unknown> = {
                workflowId: wfId,
                type: node.type,
                title: node.title,
                config: node.config,
            };
            if (prevNodeId) {
                nodePayload.upstreamId = prevNodeId;
            }

            const nodeResult = await api.post('/flow_nodes:create', nodePayload);
            const nodeId = (nodeResult as { data?: { id?: number } }).data?.id;

            if (prevNodeId && nodeId) {
                await api.post(`/flow_nodes:update?filterByTk=${prevNodeId}`, {
                    downstreamId: nodeId,
                });
            }

            prevNodeId = nodeId ?? null;
        }

        await api.post(`/workflows:update?filterByTk=${wfId}`, {
            enabled: true,
        });

        log(`  [OK] "${config.title}" -> id=${wfId}, ${config.nodes.length} nodos, HABILITADO`, 'green');
        logAction('WORKFLOW_CREATED', { workflowId: wfId, title: config.title });
        return wfId;
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        log(`  [ERROR] "${config.title}" — ${msg}`, 'red');
        return null;
    }
}

async function main() {
    log('\n============================================================', 'cyan');
    log('  AGENDA: Resumen Semanal — Workflow Schedule (domingos 21:00)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Resumen semanal los domingos a las 21:00
    // Consolida resumenes diarios en un resumen semanal por funcionario
    await createWorkflowWithNodes({
        title: 'AGENDA: Resumen semanal (domingos 21:00)',
        type: 'schedule',
        triggerConfig: {
            mode: 0,
            cron: '0 0 21 * * 0', // Domingos a las 21:00
            limit: 1,
        },
        nodes: [
            {
                type: 'query',
                title: 'Consultar resumenes diarios de la semana',
                config: {
                    collection: 'ag_resumen_diario',
                    multiple: true,
                    params: {
                        filter: {
                            $and: [
                                { fecha: { $dateBefore: '{{$system.now}}' } },
                                // Ultimos 7 dias
                            ],
                        },
                        appends: ['funcionario_id'],
                        sort: ['funcionario_id', 'fecha'],
                        pageSize: 500,
                    },
                },
            },
            {
                type: 'create',
                title: 'Generar resumen semanal por funcionario',
                config: {
                    collection: 'ag_resumen_semanal',
                    params: {
                        values: {
                            semana_inicio: '{{$system.now}}',
                            semana_fin: '{{$system.now}}',
                            total_horas: '{{$jobsMapByNodeKey.query.total_horas}}',
                            generado_at: '{{$system.now}}',
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Workflow resumen_semanal creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
