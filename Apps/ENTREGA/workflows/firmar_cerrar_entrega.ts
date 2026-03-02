/**
 * firmar_cerrar_entrega.ts — Workflow: Firmar y Cerrar Entrega de Turno
 *
 * Crea un workflow tipo 'collection' que al actualizar et_turnos
 * y ambas firmas (firma_saliente + firma_entrante) ser true,
 * cambia el estado a 'firmada' y registra un evento de cierre.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/workflows/firmar_cerrar_entrega.ts
 *   npx tsx Apps/ENTREGA/workflows/firmar_cerrar_entrega.ts --dry-run
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
    log('  ENTREGA: Firmar y Cerrar Entrega — Workflow Collection', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Al actualizar et_turnos con ambas firmas,
    // verificar condicion y cerrar la entrega
    await createWorkflowWithNodes({
        title: 'ENTREGA: Firmar y cerrar entrega (ambas firmas)',
        type: 'collection',
        triggerConfig: {
            collection: 'et_turnos',
            mode: 2, // on update
            changed: ['firma_saliente', 'firma_entrante'],
        },
        nodes: [
            {
                type: 'condition',
                title: 'Verificar ambas firmas presentes',
                config: {
                    rejectOnFalse: true,
                    calculation: {
                        group: {
                            type: 'and',
                            calculations: [
                                {
                                    left: '{{$context.data.firma_saliente}}',
                                    operator: 'eq',
                                    right: true,
                                },
                                {
                                    left: '{{$context.data.firma_entrante}}',
                                    operator: 'eq',
                                    right: true,
                                },
                            ],
                        },
                    },
                },
            },
            {
                type: 'update',
                title: 'Cerrar turno — estado firmada',
                config: {
                    collection: 'et_turnos',
                    params: {
                        filter: {
                            $and: [{ id: { $eq: '{{$context.data.id}}' } }],
                        },
                        values: {
                            estado: 'firmada',
                        },
                    },
                },
            },
            {
                type: 'create',
                title: 'Registrar evento de cierre de entrega',
                config: {
                    collection: 'et_eventos_turno',
                    params: {
                        values: {
                            turno_id: '{{$context.data.id}}',
                            tipo_evento: 'cierre_entrega',
                            descripcion: 'Entrega de turno firmada y cerrada por ambas partes',
                            fecha_hora: '{{$system.now}}',
                            source_alma: false,
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Workflow firmar_cerrar_entrega creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
