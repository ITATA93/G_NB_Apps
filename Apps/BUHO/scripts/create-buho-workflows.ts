/**
 * create-buho-workflows.ts — BUHO: Crear workflows de automatización
 *
 * Workflows:
 *   1. Clasificación automática de riesgo al crear/actualizar paciente
 *   2. Alerta cuando fecha probable de alta está próxima (< 2 días)
 *
 * Uso:
 *   npx tsx Apps/BUHO/scripts/create-buho-workflows.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();

async function createWorkflow(config: {
  title: string;
  type: string;
  triggerConfig: any;
  nodes?: Array<{ type: string; title: string; config: any }>;
}): Promise<number | null> {
  try {
    const wfResult = await api.post('/workflows:create', {
      title: config.title,
      type: config.type,
      enabled: false, // Start disabled — enable manually after verification
      config: config.triggerConfig,
    } as any);

    const wfId = wfResult.data?.id;
    if (!wfId) {
      log(`  [ERROR] ${config.title} — no workflow ID returned`, 'red');
      return null;
    }

    // Create nodes if defined
    if (config.nodes) {
      let prevNodeId: number | null = null;
      for (const node of config.nodes) {
        const nodePayload: any = {
          workflowId: wfId,
          type: node.type,
          title: node.title,
          config: node.config,
        };
        if (prevNodeId) nodePayload.upstreamId = prevNodeId;

        const nodeResult = await api.post('/flow_nodes:create', nodePayload);
        const nodeId = nodeResult.data?.id;

        if (prevNodeId && nodeId) {
          await api.post(`/flow_nodes:update?filterByTk=${prevNodeId}`, {
            downstreamId: nodeId,
          } as any);
        }
        prevNodeId = nodeId;
      }
    }

    log(`  [OK] "${config.title}" → id=${wfId} [disabled — enable manually]`, 'green');
    return wfId;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    log(`  [ERROR] "${config.title}" — ${msg}`, 'red');
    return null;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  CREATE BUHO WORKFLOWS                                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  // ── WF 1: Clasificación de riesgo al crear/actualizar paciente ─────────────
  log('── Workflow 1: Clasificar riesgo al crear/actualizar paciente ──\n', 'cyan');
  await createWorkflow({
    title: 'BUHO: Clasificar riesgo automáticamente',
    type: 'collection',
    triggerConfig: {
      collection: 'buho_pacientes',
      mode: 3, // on create OR update
      changed: ['categorizacion', 'estudios_pendientes', 'fecha_probable_alta'],
    },
    nodes: [
      {
        type: 'update',
        title: 'Actualizar riesgo_detectado según categorización',
        config: {
          collection: 'buho_pacientes',
          params: {
            filter: { $and: [{ id: '{{$context.data.id}}' }] },
            values: {
              // Motor de reglas simplificado: C1/C2 → Alto, C3 → Medio, resto → Bajo
              riesgo_detectado:
                '{{$context.data.categorizacion === "C1" || $context.data.categorizacion === "C2" ? "Alto" : $context.data.categorizacion === "C3" ? "Medio" : "Bajo"}}',
              proxima_accion:
                '{{$context.data.estudios_pendientes ? "Revisar estudios pendientes" : "Control rutinario"}}',
            },
          },
        },
      },
    ],
  });

  // ── WF 2: Alerta alta próxima (cron diario 7AM) ────────────────────────────
  log('\n── Workflow 2: Alerta alta próxima (cron 7AM) ──\n', 'cyan');
  await createWorkflow({
    title: 'BUHO: Alertar alta en < 2 días (diario)',
    type: 'schedule',
    triggerConfig: {
      mode: 0,
      cron: '0 0 7 * * *', // Every day 7 AM
      limit: 1,
    },
    nodes: [
      {
        type: 'query',
        title: 'Buscar pacientes con alta próxima',
        config: {
          collection: 'buho_pacientes',
          multiple: true,
          params: {
            filter: {
              $and: [
                { alta_confirmada: { $ne: true } },
                { fecha_probable_alta: { $lte: '{{$system.now | addDays:2}}' } },
              ],
            },
          },
        },
      },
    ],
  });

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  BUHO Workflows creados (disabled — habilitar manualmente).', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
