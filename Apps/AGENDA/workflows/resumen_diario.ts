/**
 * resumen_diario.ts — Workflow: Generar Resumen Diario de Agenda
 *
 * Crea un workflow tipo 'schedule' (cron diario a las 20:00) que
 * consulta ag_bloques_agenda del dia actual y genera/actualiza
 * registros en ag_resumen_diario por cada funcionario con actividad.
 *
 * Uso:
 *   npx tsx Apps/AGENDA/workflows/resumen_diario.ts
 *   npx tsx Apps/AGENDA/workflows/resumen_diario.ts --dry-run
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
    log('  AGENDA: Resumen Diario — Workflow Schedule (cron 20:00)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Resumen diario a las 20:00 — consolida bloques del dia
    // y genera resumen por funcionario
    await createWorkflowWithNodes({
        title: 'AGENDA: Resumen diario (cron 20:00)',
        type: 'schedule',
        triggerConfig: {
            mode: 0,
            cron: '0 0 20 * * *', // Cada dia a las 20:00
            limit: 1,
        },
        nodes: [
            {
                type: 'query',
                title: 'Consultar bloques del dia actual',
                config: {
                    collection: 'ag_bloques_agenda',
                    multiple: true,
                    params: {
                        filter: {
                            $and: [
                                { fecha: { $dateOn: '{{$system.now}}' } },
                            ],
                        },
                        appends: ['funcionario_id', 'categoria_id', 'servicio_id'],
                        sort: ['funcionario_id', 'hora_inicio'],
                        pageSize: 500,
                    },
                },
            },
            {
                type: 'query',
                title: 'Consultar inasistencias del dia',
                config: {
                    collection: 'ag_inasistencias',
                    multiple: true,
                    params: {
                        filter: {
                            $and: [
                                { fecha: { $dateOn: '{{$system.now}}' } },
                            ],
                        },
                        sort: ['funcionario_id'],
                        pageSize: 100,
                    },
                },
            },
            {
                type: 'create',
                title: 'Crear/actualizar resumen diario por funcionario',
                config: {
                    collection: 'ag_resumen_diario',
                    params: {
                        values: {
                            fecha: '{{$system.now}}',
                            total_horas: '{{$jobsMapByNodeKey.query.total_horas}}',
                            sala_count: '{{$jobsMapByNodeKey.query.sala_count}}',
                            pab_am: '{{$jobsMapByNodeKey.query.pab_am}}',
                            pab_pm: '{{$jobsMapByNodeKey.query.pab_pm}}',
                            poli_am: '{{$jobsMapByNodeKey.query.poli_am}}',
                            poli_pm: '{{$jobsMapByNodeKey.query.poli_pm}}',
                            inasistencias: '{{$jobsMapByNodeKey.query_1.length}}',
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Workflow resumen_diario creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
