/**
 * create-agenda-workflows.ts — AGENDA: Crear workflows de automatización
 *
 * Workflows:
 *   1. calcular_duracion      — Calcular duracion_min y periodo al crear/actualizar bloque
 *   2. generar_resumen_diario — Cron 23:00 — agregar bloques del día por funcionario
 *   3. generar_resumen_semanal — Cron lunes 06:00 — agregar semana anterior
 *
 * Uso:
 *   npx tsx Apps/AGENDA/scripts/create-agenda-workflows.ts
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
      enabled: false, // Disabled — enable manually after testing
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
  log('║  CREATE AGENDA WORKFLOWS                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  // ── WF 1: Calcular duración al crear/actualizar bloque ─────────────────────
  log('── Workflow 1: Calcular duración de bloques ──\n', 'cyan');
  await createWorkflow({
    title: 'AGENDA: Calcular duración_min y período',
    type: 'collection',
    triggerConfig: {
      collection: 'ag_bloques_agenda',
      mode: 3, // on create or update
      changed: ['hora_inicio', 'hora_fin'],
    },
    nodes: [
      {
        type: 'update',
        title: 'Calcular duración y período AM/PM',
        config: {
          collection: 'ag_bloques_agenda',
          params: {
            filter: { $and: [{ id: '{{$context.data.id}}' }] },
            values: {
              duracion_min:
                '{{Math.round((new Date("1970-01-01T" + $context.data.hora_fin) - new Date("1970-01-01T" + $context.data.hora_inicio)) / 60000)}}',
              periodo: '{{$context.data.hora_inicio < "12:00" ? "AM" : "PM"}}',
            },
          },
        },
      },
    ],
  });

  // ── WF 2: Generar resumen diario (cron 23:00) ──────────────────────────────
  log('\n── Workflow 2: Generar resumen diario (cron 23:00) ──\n', 'cyan');
  await createWorkflow({
    title: 'AGENDA: Generar resumen diario',
    type: 'schedule',
    triggerConfig: {
      mode: 0,
      cron: '0 0 23 * * *', // Every day at 23:00
      limit: 1,
    },
    nodes: [
      {
        type: 'query',
        title: 'Consultar bloques del día',
        config: {
          collection: 'ag_bloques_agenda',
          multiple: true,
          params: {
            filter: { $and: [{ fecha: { $eq: '{{$system.today}}' } }] },
            sort: ['funcionario_id'],
          },
        },
      },
    ],
  });

  // ── WF 3: Generar resumen semanal (cron lunes 06:00) ──────────────────────
  log('\n── Workflow 3: Generar resumen semanal (cron lunes 06:00) ──\n', 'cyan');
  await createWorkflow({
    title: 'AGENDA: Generar resumen semanal',
    type: 'schedule',
    triggerConfig: {
      mode: 0,
      cron: '0 0 6 * * 1', // Every Monday at 06:00
      limit: 1,
    },
    nodes: [
      {
        type: 'query',
        title: 'Consultar resúmenes diarios de la semana anterior',
        config: {
          collection: 'ag_resumen_diario',
          multiple: true,
          params: {
            filter: {
              $and: [
                { fecha: { $gte: '{{$system.lastMondayDate}}' } },
                { fecha: { $lte: '{{$system.lastSundayDate}}' } },
              ],
            },
            sort: ['funcionario_id', 'fecha'],
          },
        },
      },
    ],
  });

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  AGENDA Workflows creados (disabled — habilitar en producción).', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
