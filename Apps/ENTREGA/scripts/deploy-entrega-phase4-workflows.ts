/**
 * deploy-entrega-phase4-workflows.ts
 *
 * ENTREGA — Fase 4: Workflows nuevos del blueprint
 *
 *   WF-4: "ENTREGA: Ingreso de paciente"
 *         Trigger: et_pacientes_censo afterCreate
 *         → Crea nota automática tipo "Ingreso"
 *         → Incrementa total_ingresos del turno activo
 *
 *   WF-5: "ENTREGA: Alta de paciente"
 *         Trigger: et_pacientes_censo afterUpdate (alta_confirmada → true)
 *         → Crea nota automática tipo "Alta"
 *         → Incrementa total_altas del turno activo
 *
 *   WF-6: "ENTREGA: Alerta paciente crítico"
 *         Trigger: et_entrega_paciente afterUpdate (estado_paciente → crítico)
 *         → Notificación in-app al médico tratante + cirujano de guardia
 *
 *   WF-7: "ENTREGA: Alerta larga hospitalización"
 *         Trigger: Cron diario 06:00
 *         → Busca pacientes con dias_hospitalizacion >= CONFIG.dias_alerta_estancia
 *         → Notificación in-app a jefe_servicio
 *
 *   WF-3 EXTENDIDO: "ENTREGA: Cerrar turno con ambas firmas"
 *         (workflow existente — este script NO lo recrea, solo documenta)
 *         Ver sección NOTAS al final del archivo.
 *
 * IMPORTANTE: Este script crea los workflows con su trigger configurado.
 * Los nodos internos (cálculos, queries, updates) deben completarse en la UI de
 * NocoBase (Workflow → abrir → agregar nodos). Ver sección de nodos al final.
 *
 * Idempotente: skip si ya existe (por título).
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase4-workflows.ts
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase4-workflows.ts --dry-run
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// =============================================
// DEFINICIÓN DE WORKFLOWS
// =============================================

interface WorkflowDef {
  title: string;
  description: string;
  type: 'collection-event' | 'schedule';
  enabled: boolean;
  config: Record<string, any>;
  nodes: NodeDef[];
}

interface NodeDef {
  title: string;
  type: string;
  config: Record<string, any>;
  description?: string; // Solo documentación
}

// mode para collection-event:
//   1 = afterCreate
//   2 = afterUpdate
//   4 = afterDestroy
//   3 = afterCreate + afterUpdate

const WORKFLOWS: WorkflowDef[] = [
  // ────────────────────────────────────────────────────────
  // WF-4: Ingreso de paciente
  // ────────────────────────────────────────────────────────
  {
    title: 'ENTREGA: Ingreso de paciente',
    description: 'Al crear un registro en et_pacientes_censo: crea nota de ingreso y actualiza contador del turno activo',
    type: 'collection-event',
    enabled: true,
    config: {
      collection: 'et_pacientes_censo',
      mode: 1, // afterCreate
      appends: [],
    },
    nodes: [
      {
        title: 'Buscar turno activo',
        type: 'query',
        description: 'Busca el turno en estado borrador o en_curso más reciente',
        config: {
          collection: 'et_turnos',
          multiple: false,
          filter: {
            estado: { $in: ['borrador', 'en_curso'] },
          },
          sort: ['-fecha', '-createdAt'],
          limit: 1,
        },
      },
      {
        title: 'Crear nota de ingreso',
        type: 'create',
        description: 'Crea nota automática en et_notas_clinicas tipo Ingreso',
        config: {
          collection: 'et_notas_clinicas',
          params: {
            values: {
              // paciente_censo_id: '{{$context.data.id}}',
              // fecha_nota: '{{new Date().toISOString()}}',
              // turno_horario: 'Guardia',
              // contenido: 'Ingreso: {{$context.data.nombre}} — Sala: {{$context.data.sala}} {{$context.data.cama}}',
              // tipo_nota_id: '<ID del tipo "Ingreso" en et_tipos_nota>',
              // turno_id: '{{$jobsOf["Buscar turno activo"][0].id}}',
            },
          },
        },
      },
      {
        title: 'Incrementar total_ingresos',
        type: 'update',
        description: 'Incrementa total_ingresos del turno activo',
        config: {
          collection: 'et_turnos',
          // filterByTk: '{{$jobsOf["Buscar turno activo"][0].id}}',
          // params: {
          //   values: {
          //     total_ingresos: '{{$jobsOf["Buscar turno activo"][0].total_ingresos + 1}}',
          //   },
          // },
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────
  // WF-5: Alta de paciente
  // ────────────────────────────────────────────────────────
  {
    title: 'ENTREGA: Alta de paciente',
    description: 'Al marcar alta_confirmada=true en et_pacientes_censo: crea nota de alta y actualiza contador',
    type: 'collection-event',
    enabled: true,
    config: {
      collection: 'et_pacientes_censo',
      mode: 2, // afterUpdate
      appends: [],
      // condition: alta_confirmada cambia a true
      // Configurar condición en la UI: $context.data.alta_confirmada == true
    },
    nodes: [
      {
        title: 'Condición: ¿es alta?',
        type: 'condition',
        description: 'Solo procede si alta_confirmada cambió a true',
        config: {
          // engine: 'math.js',
          // calculation: '{{$context.data.alta_confirmada}} == true',
        },
      },
      {
        title: 'Buscar turno activo',
        type: 'query',
        description: 'Busca el turno en estado borrador o en_curso más reciente',
        config: {
          collection: 'et_turnos',
          multiple: false,
          filter: { estado: { $in: ['borrador', 'en_curso'] } },
          sort: ['-fecha', '-createdAt'],
          limit: 1,
        },
      },
      {
        title: 'Crear nota de alta',
        type: 'create',
        description: 'Crea nota automática tipo Alta',
        config: {
          collection: 'et_notas_clinicas',
          params: {
            values: {
              // paciente_censo_id: '{{$context.data.id}}',
              // fecha_nota: '{{new Date().toISOString()}}',
              // turno_horario: 'Guardia',
              // contenido: 'Alta médica confirmada para {{$context.data.nombre}}',
              // tipo_nota_id: '<ID del tipo "Alta" en et_tipos_nota>',
              // turno_id: '{{$jobsOf["Buscar turno activo"][0].id}}',
            },
          },
        },
      },
      {
        title: 'Incrementar total_altas',
        type: 'update',
        description: 'Incrementa total_altas del turno activo',
        config: {
          collection: 'et_turnos',
          // filterByTk: '{{$jobsOf["Buscar turno activo"][0].id}}',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────
  // WF-6: Alerta paciente crítico
  // ────────────────────────────────────────────────────────
  {
    title: 'ENTREGA: Alerta paciente crítico',
    description: 'Al cambiar estado_paciente a "crítico" en et_entrega_paciente: notifica al médico tratante y al cirujano de guardia',
    type: 'collection-event',
    enabled: true,
    config: {
      collection: 'et_entrega_paciente',
      mode: 2, // afterUpdate
      appends: ['paciente_censo_id', 'turno_id', 'medico_tratante_id'],
    },
    nodes: [
      {
        title: 'Condición: ¿estado es crítico?',
        type: 'condition',
        description: 'Solo procede si estado_paciente == "crítico"',
        config: {
          // calculation: '{{$context.data.estado_paciente}} == "crítico"',
        },
      },
      {
        title: 'Notificar al médico tratante',
        type: 'notice',
        description: 'Notificación in-app al médico tratante del paciente',
        config: {
          // receivers: ['{{$context.data.medico_tratante_id}}'],
          // title: 'Paciente crítico',
          // content: 'El paciente {{$context.data.paciente_censo_id.nombre}} ha cambiado a estado CRÍTICO',
        },
      },
      {
        title: 'Buscar cirujano de guardia',
        type: 'query',
        description: 'Obtiene el responsable del turno activo',
        config: {
          collection: 'et_turnos',
          multiple: false,
          filter: { estado: { $in: ['borrador', 'en_curso'] } },
          sort: ['-fecha'],
          limit: 1,
          appends: ['responsable_saliente_id', 'responsable_entrante_id'],
        },
      },
      {
        title: 'Notificar al cirujano de guardia',
        type: 'notice',
        description: 'Notificación in-app al responsable del turno activo',
        config: {
          // receivers: ['{{$jobsOf["Buscar cirujano de guardia"][0].responsable_saliente_id}}'],
          // title: 'Alerta crítico',
          // content: 'Paciente crítico: {{$context.data.paciente_censo_id.nombre}} en {{$context.data.paciente_censo_id.sala}}-{{$context.data.paciente_censo_id.cama}}',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────
  // WF-7: Alerta larga hospitalización (cron diario 06:00)
  // ────────────────────────────────────────────────────────
  {
    title: 'ENTREGA: Alerta larga hospitalización',
    description: 'Cron diario a las 06:00. Busca pacientes activos con días_hospitalizacion >= 30 y notifica a jefe_servicio',
    type: 'schedule',
    enabled: false, // Habilitar manualmente después de verificar configuración
    config: {
      mode: 0,      // 0 = cron expression
      cron: '0 6 * * *', // 06:00 todos los días
      startsOn: null,
      endsOn: null,
      repeat: null,
    },
    nodes: [
      {
        title: 'Leer umbral de alerta',
        type: 'query',
        description: 'Lee el parámetro dias_alerta_estancia de et_config_sistema',
        config: {
          collection: 'et_config_sistema',
          multiple: false,
          filter: { clave: 'dias_alerta_estancia' },
        },
      },
      {
        title: 'Buscar pacientes de larga estancia',
        type: 'query',
        description: 'Filtra pacientes activos con días ≥ umbral configurado',
        config: {
          collection: 'et_pacientes_censo',
          multiple: true,
          filter: {
            estado_turno: 'Activo',
            // dias_hospitalizacion: { $gte: '{{$jobsOf["Leer umbral de alerta"][0].valor}}' }
          },
          sort: ['-dias_hospitalizacion'],
        },
      },
      {
        title: 'Notificar a jefe_servicio',
        type: 'notice',
        description: 'Envía resumen de pacientes de larga estancia al jefe de servicio',
        config: {
          // receivers: [], // Roles: jefe_servicio — configurar en UI
          // title: 'Alerta: Pacientes de larga hospitalización',
          // content: 'Hay {{$jobsOf["Buscar pacientes de larga estancia"].length}} paciente(s) con ≥30 días de hospitalización',
        },
      },
    ],
  },
];

// =============================================
// HELPERS
// =============================================

async function getExistingWorkflows(): Promise<string[]> {
  try {
    const res = await api.get('/workflows:list', { pageSize: 200 } as any);
    return ((res.data || []) as any[]).map((w: any) => w.title);
  } catch {
    return [];
  }
}

async function createWorkflow(wf: WorkflowDef): Promise<number | null> {
  try {
    if (DRY_RUN) {
      log(`   [DRY] Crearía workflow: "${wf.title}" (${wf.type})`, 'gray');
      return null;
    }

    const res = await api.post('/workflows:create', {
      title: wf.title,
      description: wf.description,
      type: wf.type,
      enabled: wf.enabled,
      config: wf.config,
      options: {},
    } as any);

    const id = (res as any)?.id || (res as any)?.data?.id;
    log(`   ✅ "${wf.title}" (ID: ${id})`, 'green');
    return id;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  "${wf.title}" ya existe`, 'yellow');
      return null;
    }
    log(`   ❌ "${wf.title}": ${msg}`, 'red');
    return null;
  }
}

async function createNode(
  workflowId: number,
  node: NodeDef,
  upstreamId: number | null = null,
): Promise<number | null> {
  try {
    if (DRY_RUN) {
      log(`      [DRY] Nodo: "${node.title}" (${node.type})`, 'gray');
      return null;
    }

    const res = await api.post(`/workflows/${workflowId}/nodes:create`, {
      title: node.title,
      type: node.type,
      config: node.config,
      upstreamId,
    } as any);

    const id = (res as any)?.id || (res as any)?.data?.id;
    log(`      ✅ Nodo "${node.title}" (${node.type})`, 'green');
    return id;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    log(`      ⚠️  Nodo "${node.title}": ${msg}`, 'yellow');
    return null;
  }
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  ENTREGA FASE 4 — Workflows del Blueprint (4 nuevos)      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  if (DRY_RUN) log('🔍 MODO DRY RUN — no se crearán datos reales.\n', 'yellow');

  // Obtener workflows existentes para evitar duplicados
  const existing = await getExistingWorkflows();
  log(`  Workflows existentes encontrados: ${existing.length}\n`, 'gray');

  for (const wf of WORKFLOWS) {
    log(`\n── ${wf.title} ──`, 'cyan');

    if (existing.includes(wf.title)) {
      log(`   ⚠️  Ya existe, omitiendo.`, 'yellow');
      continue;
    }

    const wfId = await createWorkflow(wf);
    if (!wfId) continue;

    // Crear nodos en cadena (cada nodo referencia al anterior)
    log(`   📍 Creando ${wf.nodes.length} nodos...`, 'gray');
    let lastNodeId: number | null = null;
    for (const node of wf.nodes) {
      const nodeId = await createNode(wfId, node, lastNodeId);
      if (nodeId) lastNodeId = nodeId;
    }
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ ENTREGA FASE 4 WORKFLOWS — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════', 'green');

  printManualSteps();
}

function printManualSteps() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'yellow');
  log('║  ⚠️  PASOS MANUALES REQUERIDOS EN LA UI                   ║', 'yellow');
  log('╠════════════════════════════════════════════════════════════╣', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Los workflows se crearon con sus triggers configurados.   ║', 'yellow');
  log('║  Los nodos necesitan configuración de variables en la UI:  ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  1. WF "Ingreso de paciente"                              ║', 'yellow');
  log('║     Nodo "Crear nota de ingreso":                         ║', 'yellow');
  log('║       - paciente_censo_id = {{$context.data.id}}          ║', 'yellow');
  log('║       - turno_id = resultado de "Buscar turno activo"     ║', 'yellow');
  log('║       - tipo_nota_id = ID del registro "Ingreso"          ║', 'yellow');
  log('║     Nodo "Incrementar total_ingresos":                    ║', 'yellow');
  log('║       - Configurar la condición de filtro por turno ID    ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  2. WF "Alta de paciente"                                 ║', 'yellow');
  log('║     Nodo "Condición: ¿es alta?":                         ║', 'yellow');
  log('║       - Condition: $context.data.alta_confirmada == true  ║', 'yellow');
  log('║     (igual que WF Ingreso para nodos nota y contador)     ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  3. WF "Alerta paciente crítico"                          ║', 'yellow');
  log('║     Nodo condición: estado_paciente == "crítico"          ║', 'yellow');
  log('║     Nodo notificación: configurar destinatarios           ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  4. WF "Alerta larga hospitalización"                     ║', 'yellow');
  log('║     Estado: DESHABILITADO — habilitar tras verificar      ║', 'yellow');
  log('║     Nodo query: agregar filtro dias_hospitalizacion >= N  ║', 'yellow');
  log('║     Nodo notice: configurar rol jefe_servicio             ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  5. WF EXISTENTE "Cerrar turno con ambas firmas" (WF #3) ║', 'yellow');
  log('║     AGREGAR nodos al final del workflow existente:        ║', 'yellow');
  log('║     a) Calcular distribución: query COUNT por servicio    ║', 'yellow');
  log('║     b) Actualizar texto_distribucion y distribucion_JSON  ║', 'yellow');
  log('║     c) Registrar closed_at = now()                       ║', 'yellow');
  log('║     d) HTTP Request a webhook_n8n_url (si configurado)    ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('╚════════════════════════════════════════════════════════════╝\n', 'yellow');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
