/**
 * create-entrega-workflows.ts — ENTREGA: Crear workflows de automatización
 *
 * Workflows:
 *   1. sync_censo_alma     — Sync placeholder (trigger manual en ausencia de conexión ALMA)
 *   2. crear_entrega_turno — Snapshot de pacientes para nueva entrega
 *   3. firmar_entrega      — Bloquear edición cuando ambas firmas están presentes
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/create-entrega-workflows.ts
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
      enabled: false, // Disabled pending verification
      config: config.triggerConfig,
    } as any);

    const wfId = wfResult.data?.id;
    if (!wfId) {
      log(`  [ERROR] ${config.title} — no ID returned`, 'red');
      return null;
    }

    if (config.nodes) {
      let prevNodeId: number | null = null;
      for (const node of config.nodes) {
        const payload: any = {
          workflowId: wfId,
          type: node.type,
          title: node.title,
          config: node.config,
        };
        if (prevNodeId) payload.upstreamId = prevNodeId;
        const nr = await api.post('/flow_nodes:create', payload);
        const nodeId = nr.data?.id;
        if (prevNodeId && nodeId) {
          await api.post(`/flow_nodes:update?filterByTk=${prevNodeId}`, {
            downstreamId: nodeId,
          } as any);
        }
        prevNodeId = nodeId;
      }
    }

    log(`  [OK] "${config.title}" → id=${wfId} [disabled]`, 'green');
    return wfId;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    log(`  [ERROR] "${config.title}" — ${msg}`, 'red');
    return null;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  CREATE ENTREGA WORKFLOWS                                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  // ── WF 1: Sync censo ALMA (placeholder cron 30min) ─────────────────────────
  log('── Workflow 1: Sync censal desde ALMA (cron 30min placeholder) ──\n', 'cyan');
  await createWorkflow({
    title: 'ENTREGA: Sync censo ALMA → et_pacientes_censo',
    type: 'schedule',
    triggerConfig: {
      mode: 0,
      cron: '0 */30 * * * *', // Every 30 minutes
      limit: 1,
    },
    nodes: [
      {
        type: 'request',
        title: 'HTTP: Invocar ETL ALMA → NocoBase',
        config: {
          // Placeholder — configurar URL real del ETL cuando esté disponible
          url: 'http://localhost:3001/api/sync-censo',
          method: 'POST',
          timeout: 25000,
          data: {},
        },
      },
    ],
  });

  // ── WF 2: Crear entrega de turno ───────────────────────────────────────────
  log('\n── Workflow 2: Crear entrega de turno ──\n', 'cyan');
  await createWorkflow({
    title: 'ENTREGA: Registrar nueva entrega de turno',
    type: 'collection',
    triggerConfig: {
      collection: 'et_turnos',
      mode: 1, // on create
      changed: [],
    },
    nodes: [
      {
        type: 'query',
        title: 'Buscar pacientes del servicio activo',
        config: {
          collection: 'et_pacientes_censo',
          multiple: true,
          params: {
            filter: {
              $and: [{ alta_confirmada: { $ne: true } }],
            },
          },
        },
      },
    ],
  });

  // ── WF 3: Firmar y cerrar entrega ──────────────────────────────────────────
  log('\n── Workflow 3: Cerrar turno cuando ambas firmas presentes ──\n', 'cyan');
  await createWorkflow({
    title: 'ENTREGA: Cerrar turno con ambas firmas',
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
          type: 'basic',
          calculation: {
            calculator: 'equal',
            operands: [
              { type: 'ref', options: { path: '$context.data.firma_saliente' } },
              { type: 'constant', value: true },
            ],
          },
        },
      },
      {
        type: 'update',
        title: 'Marcar turno como firmado',
        config: {
          collection: 'et_turnos',
          params: {
            filter: { $and: [{ id: '{{$context.data.id}}' }] },
            values: { estado: 'firmada' },
          },
        },
      },
    ],
  });

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ENTREGA Workflows creados (disabled).', 'green');
  log('  NOTA: sync_censo_alma requiere URL real del ETL ALMA.', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
