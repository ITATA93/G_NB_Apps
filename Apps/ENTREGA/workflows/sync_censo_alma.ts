/**
 * sync_censo_alma.ts — Workflow: Sincronizar Censo desde ALMA/TrakCare
 *
 * Crea un workflow tipo 'schedule' (cron cada 30 min) que consulta
 * la tabla ALMA mirror y sincroniza pacientes hospitalizados a
 * et_pacientes_censo en NocoBase.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/workflows/sync_censo_alma.ts
 *   npx tsx Apps/ENTREGA/workflows/sync_censo_alma.ts --dry-run
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
        // 1. Crear workflow
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

        // 2. Crear nodos secuencialmente enlazados
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

        // 3. Habilitar workflow
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
    log('  ENTREGA: Sync Censo ALMA — Workflow Schedule (cron 30min)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // Workflow: Sync Censo ALMA
    // Tipo schedule — cada 30 minutos consulta la tabla ALMA mirror
    // y sincroniza a et_pacientes_censo
    await createWorkflowWithNodes({
        title: 'ENTREGA: Sync Censo ALMA (cron 30min)',
        type: 'schedule',
        triggerConfig: {
            mode: 0,
            cron: '0 */30 * * * *', // Cada 30 minutos
            limit: 1,
        },
        nodes: [
            {
                type: 'query',
                title: 'Consultar pacientes ALMA mirror',
                config: {
                    collection: 'ALMA_pacientes',
                    multiple: true,
                    params: {
                        filter: {
                            $and: [
                                { estado_hospitalizacion: { $eq: 'activo' } },
                            ],
                        },
                        sort: ['-f_ingreso'],
                        pageSize: 500,
                    },
                },
            },
            {
                type: 'create',
                title: 'Upsert pacientes en et_pacientes_censo',
                config: {
                    collection: 'et_pacientes_censo',
                    params: {
                        values: {
                            id_episodio: '{{$jobsMapByNodeKey.query.id_episodio}}',
                            rut: '{{$jobsMapByNodeKey.query.rut}}',
                            nro_ficha: '{{$jobsMapByNodeKey.query.nro_ficha}}',
                            nombre: '{{$jobsMapByNodeKey.query.nombre}}',
                            edad: '{{$jobsMapByNodeKey.query.edad}}',
                            sexo: '{{$jobsMapByNodeKey.query.sexo}}',
                            sala: '{{$jobsMapByNodeKey.query.sala}}',
                            cama: '{{$jobsMapByNodeKey.query.cama}}',
                            medico_tratante_alma: '{{$jobsMapByNodeKey.query.medico_tratante}}',
                            especialidad_clinica: '{{$jobsMapByNodeKey.query.especialidad}}',
                            f_ingreso: '{{$jobsMapByNodeKey.query.f_ingreso}}',
                            dx_principal: '{{$jobsMapByNodeKey.query.dx_principal}}',
                            ultima_sync: '{{$system.now}}',
                        },
                    },
                },
            },
        ],
    });

    log('\n============================================================', 'green');
    log('  Sync Censo ALMA workflow creado.', 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
