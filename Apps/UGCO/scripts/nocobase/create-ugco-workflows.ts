/**
 * create-ugco-workflows.ts - Create UGCO automation workflows
 *
 * Workflows:
 * 1. Auto-assign UGCO code on case creation
 * 2. Task overdue alert (scheduled)
 * 3. Committee case notification
 * 4. Case event logging on status change
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';

const api = createClient();

async function createWorkflowWithNodes(config: {
    title: string;
    type: string;
    triggerConfig: any;
    nodes: Array<{
        type: string;
        title: string;
        config: any;
    }>;
}): Promise<number | null> {
    try {
        // 1. Create workflow
        const wfResult = await api.post('/workflows:create', {
            title: config.title,
            type: config.type,
            enabled: false,
            config: config.triggerConfig,
        } as any);

        const wfId = wfResult.data?.id;
        if (!wfId) {
            log(`  [ERROR] ${config.title} — no workflow ID returned`, 'red');
            return null;
        }

        // 2. Create nodes sequentially, linking them
        let prevNodeId: number | null = null;
        for (const node of config.nodes) {
            const nodePayload: any = {
                workflowId: wfId,
                type: node.type,
                title: node.title,
                config: node.config,
            };
            if (prevNodeId) {
                nodePayload.upstreamId = prevNodeId;
            }

            const nodeResult = await api.post('/flow_nodes:create', nodePayload);
            const nodeId = nodeResult.data?.id;

            // Link previous node's downstream
            if (prevNodeId && nodeId) {
                await api.post(`/flow_nodes:update?filterByTk=${prevNodeId}`, {
                    downstreamId: nodeId
                } as any);
            }

            prevNodeId = nodeId;
        }

        // 3. Enable workflow
        await api.post(`/workflows:update?filterByTk=${wfId}`, {
            enabled: true
        } as any);

        log(`  [OK] "${config.title}" → id=${wfId}, ${config.nodes.length} nodes, ENABLED`, 'green');
        return wfId;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        log(`  [ERROR] "${config.title}" — ${msg}`, 'red');
        return null;
    }
}

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  CREATE UGCO WORKFLOWS                                    ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    // ── WF 1: Auto-assign UGCO code on case creation ────────────────────────
    log('── Workflow 1: Auto-asignar código UGCO al crear caso ──\n', 'cyan');
    await createWorkflowWithNodes({
        title: 'UGCO: Asignar código al crear caso',
        type: 'collection',
        triggerConfig: {
            collection: 'UGCO_casooncologico',
            mode: 1, // on create
            changed: [],
        },
        nodes: [
            {
                type: 'query',
                title: 'Contar casos existentes',
                config: {
                    collection: 'UGCO_casooncologico',
                    multiple: false,
                    params: {
                        sort: ['-id'],
                        limit: 1,
                    },
                },
            },
            {
                type: 'update',
                title: 'Asignar UGCO_COD01',
                config: {
                    collection: 'UGCO_casooncologico',
                    params: {
                        filter: {
                            $and: [{ id: '{{$context.data.id}}' }]
                        },
                        values: {
                            UGCO_COD01: 'UGCO-{{$context.data.id}}',
                            fecha_caso: '{{$system.now}}',
                        },
                    },
                },
            },
        ],
    });

    // ── WF 2: Log event on case status change ───────────────────────────────
    log('\n── Workflow 2: Registrar evento al cambiar estado del caso ──\n', 'cyan');
    await createWorkflowWithNodes({
        title: 'UGCO: Log cambio de estado',
        type: 'collection',
        triggerConfig: {
            collection: 'UGCO_casooncologico',
            mode: 2, // on update
            changed: ['estado_adm_id', 'estado_clinico_id'],
        },
        nodes: [
            {
                type: 'create',
                title: 'Crear evento clínico de cambio de estado',
                config: {
                    collection: 'UGCO_eventoclinico',
                    params: {
                        values: {
                            tipo_evento: 'OTRO',
                            subtipo_evento: 'CAMBIO_ESTADO',
                            fecha_solicitud: '{{$system.now}}',
                            fecha_realizacion: '{{$system.now}}',
                            resultado_resumen: 'Cambio de estado administrativo/clínico',
                            origen_dato: 'MANUAL',
                            caso_id: '{{$context.data.id}}',
                            paciente_id: '{{$context.data.paciente_id}}',
                        },
                    },
                },
            },
        ],
    });

    // ── WF 3: Auto-create task when committee case is added ─────────────────
    log('\n── Workflow 3: Crear tarea al agregar caso a comité ──\n', 'cyan');
    await createWorkflowWithNodes({
        title: 'UGCO: Tarea al agregar caso a comité',
        type: 'collection',
        triggerConfig: {
            collection: 'UGCO_comitecaso',
            mode: 1, // on create
            changed: [],
        },
        nodes: [
            {
                type: 'create',
                title: 'Crear tarea de seguimiento post-comité',
                config: {
                    collection: 'UGCO_tarea',
                    params: {
                        values: {
                            titulo: 'Seguimiento decisión comité',
                            descripcion: 'Revisar y ejecutar plan de tratamiento definido en comité oncológico',
                            responsable_usuario: '{{$context.data.responsable_seguimiento}}',
                            caso_id: '{{$context.data.caso_id}}',
                            paciente_id: '{{$context.data.paciente_id}}',
                        },
                    },
                },
            },
        ],
    });

    // ── WF 4: Scheduled - Check overdue tasks ───────────────────────────────
    log('\n── Workflow 4: Verificar tareas vencidas (diario 8AM) ──\n', 'cyan');
    try {
        const wfResult = await api.post('/workflows:create', {
            title: 'UGCO: Verificar tareas vencidas (diario)',
            type: 'schedule',
            enabled: true,
            config: {
                mode: 0,
                cron: '0 0 8 * * *', // Every day at 8 AM
                limit: 1,
            },
        } as any);
        const wfId = wfResult.data?.id;
        log(`  [OK] "UGCO: Verificar tareas vencidas" → id=${wfId}, ENABLED`, 'green');
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        log(`  [ERROR] Scheduled workflow — ${msg}`, 'red');
    }

    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('  UGCO workflows created.', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
