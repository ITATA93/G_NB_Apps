/**
 * calcular_duracion.ts — Workflow: Calcular Duracion de Bloque de Agenda
 *
 * Crea un workflow tipo 'collection' que al crear o actualizar un
 * bloque en ag_bloques_agenda, calcula automaticamente la duracion
 * en minutos (hora_fin - hora_inicio) y la almacena en duracion_min.
 *
 * Uso:
 *   npx tsx Apps/AGENDA/workflows/calcular_duracion.ts
 *   npx tsx Apps/AGENDA/workflows/calcular_duracion.ts --dry-run
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
    log('  AGENDA: Calcular Duracion de Bloque — Workflow Collection', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Al crear/actualizar bloque de agenda, calcular duracion
    // basado en hora_inicio y hora_fin
    await createWorkflowWithNodes({
        title: 'AGENDA: Calcular duracion de bloque (auto)',
        type: 'collection',
        triggerConfig: {
            collection: 'ag_bloques_agenda',
            mode: 3, // on create (1) + on update (2) = 3
            changed: ['hora_inicio', 'hora_fin'],
        },
        nodes: [
            {
                type: 'calculation',
                title: 'Calcular diferencia en minutos',
                config: {
                    engine: 'formula.js',
                    expression: '(new Date("1970-01-01T" + {{$context.data.hora_fin}}) - new Date("1970-01-01T" + {{$context.data.hora_inicio}})) / 60000',
                },
            },
            {
                type: 'update',
                title: 'Actualizar duracion_min en el bloque',
                config: {
                    collection: 'ag_bloques_agenda',
                    params: {
                        filter: {
                            $and: [{ id: { $eq: '{{$context.data.id}}' } }],
                        },
                        values: {
                            duracion_min: '{{$jobsMapByNodeKey.calculation}}',
                            periodo: '{{$context.data.hora_inicio < "12:00" ? "AM" : "PM"}}',
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Workflow calcular_duracion creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
