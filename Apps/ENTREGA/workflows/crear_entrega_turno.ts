/**
 * crear_entrega_turno.ts — Workflow: Crear Entrega de Turno
 *
 * Crea un workflow tipo 'collection' (trigger user_action) que al crear
 * un registro en et_turnos, auto-genera los registros de et_entrega_paciente
 * para todos los pacientes activos del servicio/especialidad correspondiente.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/workflows/crear_entrega_turno.ts
 *   npx tsx Apps/ENTREGA/workflows/crear_entrega_turno.ts --dry-run
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
    log('  ENTREGA: Crear Entrega de Turno — Workflow Collection', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Al crear un turno, consultar pacientes activos
    // del servicio y crear registros de entrega por paciente
    await createWorkflowWithNodes({
        title: 'ENTREGA: Crear entrega de turno (auto-poblar pacientes)',
        type: 'collection',
        triggerConfig: {
            collection: 'et_turnos',
            mode: 1, // on create
            changed: [],
        },
        nodes: [
            {
                type: 'query',
                title: 'Consultar pacientes censo del servicio',
                config: {
                    collection: 'et_pacientes_censo',
                    multiple: true,
                    params: {
                        filter: {
                            $and: [
                                { alta_confirmada: { $eq: false } },
                            ],
                        },
                        sort: ['sala', 'cama'],
                        pageSize: 200,
                    },
                },
            },
            {
                type: 'create',
                title: 'Crear entrega por cada paciente activo',
                config: {
                    collection: 'et_entrega_paciente',
                    params: {
                        values: {
                            turno_id: '{{$context.data.id}}',
                            paciente_censo_id: '{{$jobsMapByNodeKey.query.id}}',
                            tipo_inclusion: 'propio',
                            es_cotratancia: false,
                            estado_paciente: 'estable',
                            resumen_historia: '',
                            plan_tratamiento: '',
                            pendientes: '',
                        },
                    },
                },
            },
            {
                type: 'update',
                title: 'Marcar turno como en_curso',
                config: {
                    collection: 'et_turnos',
                    params: {
                        filter: {
                            $and: [{ id: { $eq: '{{$context.data.id}}' } }],
                        },
                        values: {
                            estado: 'en_curso',
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Workflow crear_entrega_turno creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
