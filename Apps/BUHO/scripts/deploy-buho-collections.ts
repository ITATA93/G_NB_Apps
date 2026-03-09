/**
 * deploy-buho-collections.ts — BUHO: Desplegar colecciones completas en NocoBase
 *
 * Colecciones:
 *   1. buho_pacientes      — Pacientes hospitalizados (sincronizados desde ALMA)
 *   2. buho_camas          — Catálogo de camas por servicio/sala
 *   3. buho_alertas        — Alertas clínicas generadas por motor de reglas
 *   4. buho_planes_trabajo — Plan de trabajo por paciente
 *   5. buho_parametros_riesgo — Configuración del motor de riesgo
 *
 * Uso:
 *   npx tsx Apps/BUHO/scripts/deploy-buho-collections.ts
 *   npx tsx Apps/BUHO/scripts/deploy-buho-collections.ts --dry-run
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Definición de Colecciones ──────────────────────────────────────────────

const COLLECTIONS: Array<{
  name: string;
  title: string;
  description?: string;
  fields: Array<{ name: string; type: string; [key: string]: unknown }>;
}> = [
  // 1. BUHO_Pacientes — Pacientes hospitalizados
  {
    name: 'buho_pacientes',
    title: 'Pacientes Hospitalizados',
    description: 'Registro de pacientes hospitalizados. Sincronizable desde ALMA/IRIS.',
    fields: [
      { name: 'nombre', type: 'string', required: true, uiSchema: { title: 'Nombre Completo' } },
      { name: 'rut', type: 'string', uiSchema: { title: 'RUT' } },
      { name: 'episodio', type: 'string', unique: true, uiSchema: { title: 'ID Episodio (ALMA)' } },
      { name: 'nro_ficha', type: 'string', uiSchema: { title: 'Nro Ficha' } },
      { name: 'edad', type: 'integer', uiSchema: { title: 'Edad' } },
      { name: 'sexo', type: 'string', uiSchema: { title: 'Sexo' } },
      { name: 'servicio', type: 'string', uiSchema: { title: 'Servicio' } },
      { name: 'sala', type: 'string', uiSchema: { title: 'Sala' } },
      { name: 'cama', type: 'string', uiSchema: { title: 'Cama' } },
      { name: 'tipo_cama', type: 'string', uiSchema: { title: 'Tipo Cama' } },
      { name: 'diagnostico_principal', type: 'text', uiSchema: { title: 'Diagnóstico Principal' } },
      { name: 'medico_tratante', type: 'string', uiSchema: { title: 'Médico Tratante' } },
      { name: 'especialidad', type: 'string', uiSchema: { title: 'Especialidad Clínica' } },
      { name: 'fecha_ingreso', type: 'datetime', uiSchema: { title: 'Fecha Ingreso' } },
      { name: 'dias_hospitalizacion', type: 'integer', uiSchema: { title: 'Días Hospitalizados' } },
      { name: 'fecha_probable_alta', type: 'date', uiSchema: { title: 'Fecha Probable Alta' } },
      {
        name: 'alta_confirmada',
        type: 'boolean',
        default: false,
        uiSchema: { title: 'Alta Confirmada' },
      },
      { name: 'estudios_pendientes', type: 'text', uiSchema: { title: 'Estudios Pendientes' } },
      { name: 'alergias', type: 'text', uiSchema: { title: 'Alergias' } },
      { name: 'telefono', type: 'string', uiSchema: { title: 'Teléfono' } },
      // Campos de gestión (BUHO)
      { name: 'categorizacion', type: 'string', uiSchema: { title: 'Categorización (C1/C2/C3)' } },
      {
        name: 'estado_plan',
        type: 'string',
        uiSchema: {
          title: 'Estado Plan',
          enum: ['Pendiente', 'En Curso', 'Listo para Alta', 'Alta'],
        },
      },
      {
        name: 'riesgo_detectado',
        type: 'string',
        uiSchema: { title: 'Riesgo', enum: ['Alto', 'Medio', 'Bajo'] },
      },
      { name: 'proxima_accion', type: 'text', uiSchema: { title: 'Próxima Acción' } },
      { name: 'caso_social', type: 'boolean', default: false, uiSchema: { title: 'Caso Social' } },
      { name: 'vip', type: 'boolean', default: false, uiSchema: { title: 'VIP / Autoridad' } },
      { name: 'ultima_sync', type: 'datetime', uiSchema: { title: 'Última Sync ALMA' } },
    ],
  },

  // 2. BUHO_Camas — Catálogo de camas
  {
    name: 'buho_camas',
    title: 'Catálogo de Camas',
    description: 'Camas disponibles por servicio y sala.',
    fields: [
      { name: 'servicio', type: 'string', required: true, uiSchema: { title: 'Servicio' } },
      { name: 'sala', type: 'string', uiSchema: { title: 'Sala' } },
      { name: 'cama', type: 'string', required: true, uiSchema: { title: 'Identificador Cama' } },
      {
        name: 'tipo',
        type: 'string',
        uiSchema: {
          title: 'Tipo',
          enum: ['adulto', 'pediatrica', 'basculante', 'uci', 'aislamiento'],
        },
      },
      { name: 'disponible', type: 'boolean', default: true, uiSchema: { title: 'Disponible' } },
      { name: 'observacion', type: 'text', uiSchema: { title: 'Observación' } },
    ],
  },

  // 3. BUHO_Alertas — Alertas clínicas
  {
    name: 'buho_alertas',
    title: 'Alertas Clínicas',
    description: 'Alertas generadas por el motor de reglas de BUHO.',
    fields: [
      {
        name: 'tipo_alerta',
        type: 'string',
        required: true,
        uiSchema: {
          title: 'Tipo Alerta',
          enum: [
            'riesgo_alto',
            'alta_proxima',
            'estudio_pendiente',
            'caso_social',
            'vencimiento_medicamento',
          ],
        },
      },
      { name: 'mensaje', type: 'text', required: true, uiSchema: { title: 'Mensaje' } },
      {
        name: 'severidad',
        type: 'string',
        uiSchema: { title: 'Severidad', enum: ['critica', 'alta', 'media', 'baja'] },
      },
      { name: 'resuelta', type: 'boolean', default: false, uiSchema: { title: 'Resuelta' } },
      { name: 'fecha_resolucion', type: 'datetime', uiSchema: { title: 'Fecha Resolución' } },
      { name: 'resuelta_por', type: 'string', uiSchema: { title: 'Resuelta Por' } },
      { name: 'paciente_id', type: 'bigInt', uiSchema: { title: 'Paciente (FK)' } },
    ],
  },

  // 4. BUHO_Planes de Trabajo
  {
    name: 'buho_planes_trabajo',
    title: 'Planes de Trabajo',
    description: 'Plan de trabajo por paciente, editable durante el turno.',
    fields: [
      { name: 'paciente_id', type: 'bigInt', required: true, uiSchema: { title: 'Paciente (FK)' } },
      { name: 'resumen_historia', type: 'text', uiSchema: { title: 'Resumen Historia' } },
      { name: 'plan_tratamiento', type: 'text', uiSchema: { title: 'Plan Tratamiento' } },
      { name: 'pendientes', type: 'text', uiSchema: { title: 'Pendientes' } },
      { name: 'estudios_solicitados', type: 'text', uiSchema: { title: 'Estudios Solicitados' } },
      { name: 'interconsultas', type: 'text', uiSchema: { title: 'Interconsultas' } },
      { name: 'indicaciones_alta', type: 'text', uiSchema: { title: 'Indicaciones de Alta' } },
      { name: 'fue_operado', type: 'boolean', default: false, uiSchema: { title: 'Fue Operado' } },
      { name: 'procedimiento_qx', type: 'text', uiSchema: { title: 'Procedimiento Quirúrgico' } },
      { name: 'actualizado_por', type: 'string', uiSchema: { title: 'Actualizado Por' } },
    ],
  },

  // 5. BUHO_Parametros de Riesgo — Motor de reglas
  {
    name: 'buho_parametros_riesgo',
    title: 'Parámetros Motor de Riesgo',
    description: 'Configuración del motor de clasificación automática de riesgo.',
    fields: [
      { name: 'criterio', type: 'string', required: true, uiSchema: { title: 'Criterio' } },
      { name: 'descripcion', type: 'text', uiSchema: { title: 'Descripción' } },
      { name: 'valor_umbral', type: 'string', uiSchema: { title: 'Valor Umbral' } },
      { name: 'peso', type: 'integer', default: 1, uiSchema: { title: 'Peso (1-10)' } },
      {
        name: 'resultado_riesgo',
        type: 'string',
        uiSchema: { title: 'Resultado Riesgo', enum: ['Alto', 'Medio', 'Bajo'] },
      },
      { name: 'activo', type: 'boolean', default: true, uiSchema: { title: 'Activo' } },
    ],
  },
];

// ─── Funciones ───────────────────────────────────────────────────────────────

async function ensureCollection(col: (typeof COLLECTIONS)[0]): Promise<boolean> {
  try {
    await api.post('/collections:create', {
      name: col.name,
      title: col.title,
      description: col.description,
      template: '',
    } as any);
    log(`  [OK] Collection: ${col.name}`, 'green');
    return true;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
      log(`  [SKIP] Collection: ${col.name} — ya existe`, 'yellow');
      return true;
    }
    log(`  [ERROR] Collection: ${col.name} — ${msg}`, 'red');
    return false;
  }
}

async function ensureField(colName: string, field: Record<string, unknown>): Promise<boolean> {
  try {
    await api.post(`/collections/${colName}/fields:create`, field as any);
    return true;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
      return true; // Skip silently
    }
    log(`    [WARN] Field ${colName}.${field.name} — ${msg}`, 'yellow');
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  DEPLOY BUHO COLLECTIONS — mira.imedicina.cl              ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  if (DRY_RUN) log('[DRY-RUN] Simulando — sin cambios reales\n', 'yellow');

  let totalCols = 0;
  let totalFields = 0;

  for (const col of COLLECTIONS) {
    log(`\n📦 ${col.name} — ${col.title}`, 'cyan');

    if (!DRY_RUN) {
      await ensureCollection(col);
      for (const field of col.fields) {
        const ok = await ensureField(col.name, field);
        if (ok) totalFields++;
      }
    } else {
      log(`  [DRY] ${col.fields.length} campos a crear`, 'gray');
      totalFields += col.fields.length;
    }
    totalCols++;
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log(`  BUHO Collections desplegadas:`, 'green');
  log(`  → ${totalCols} colecciones`, 'green');
  log(`  → ${totalFields} campos (aprox)`, 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
