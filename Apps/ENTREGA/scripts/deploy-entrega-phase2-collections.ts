/**
 * deploy-entrega-phase2-collections.ts
 *
 * ENTREGA — Fase 2 del blueprint (modelo de datos completo):
 *   1. Agrega 4 campos editables a et_pacientes_censo
 *      (estado_turno, es_aislamiento, requiere_interconsulta, tipo_ingreso)
 *   2. Agrega 11 campos a et_turnos
 *      (contadores, snapshot JSON, texto_distribucion, pdf_generado, closed_at)
 *   3. Crea 4 nuevas colecciones:
 *      et_tipos_nota, et_notas_clinicas, et_operaciones_turno, et_config_sistema
 *   4. Seed de et_tipos_nota (9 tipos) y et_config_sistema (10 parámetros)
 *
 * Idempotente: seguro de re-ejecutar (skip si ya existe).
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase2-collections.ts
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase2-collections.ts --dry-run
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase2-collections.ts --skip-seed
 */

import { createClient, log } from '../../../shared/scripts/ApiClient';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_SEED = process.argv.includes('--skip-seed');

// =============================================
// TIPOS
// =============================================

interface FieldDef {
  name: string;
  type: string;
  title: string;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  target?: string;
  enum?: string[];
}

interface CollectionDef {
  name: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

// =============================================
// CAMPOS NUEVOS EN COLECCIONES EXISTENTES
// =============================================

/**
 * Campos editables en et_pacientes_censo.
 * IMPORTANTE: el sync ALMA (WF #1) NO debe sobreescribir estos campos.
 * En el script de sync, excluir estas columnas del UPSERT.
 */
const CENSO_NEW_FIELDS: FieldDef[] = [
  {
    name: 'estado_turno',
    type: 'string',
    title: 'Estado Turno',
    defaultValue: 'Activo',
    enum: ['Activo', 'Alta', 'Fallecido', 'Traslado', 'Seguimiento'],
  },
  {
    name: 'es_aislamiento',
    type: 'boolean',
    title: 'Aislamiento',
    defaultValue: false,
  },
  {
    name: 'requiere_interconsulta',
    type: 'boolean',
    title: 'Requiere IC',
    defaultValue: false,
  },
  {
    name: 'tipo_ingreso',
    type: 'string',
    title: 'Tipo Ingreso',
    enum: ['Electivo', 'Urgencia', 'Traslado', 'Reingreso'],
  },
];

/**
 * Campos nuevos en et_turnos:
 * - Contadores manuales (total_*): se incrementan via workflow o input directo
 * - distribucion_por_unidad: snapshot JSON generado al firmar turno
 * - texto_distribucion: texto legible "MQ1:(18) MQ2:(10)..." generado al firmar
 * - pdf_generado: adjunto del PDF del turno firmado
 * - closed_at: timestamp automático al cerrar
 */
const TURNOS_NEW_FIELDS: FieldDef[] = [
  { name: 'total_pacientes',     type: 'integer', title: 'Total Pacientes',    defaultValue: 0 },
  { name: 'total_altas',         type: 'integer', title: 'Total Altas',        defaultValue: 0 },
  { name: 'total_ingresos',      type: 'integer', title: 'Total Ingresos',     defaultValue: 0 },
  { name: 'total_fallecidos',    type: 'integer', title: 'Total Fallecidos',   defaultValue: 0 },
  { name: 'total_operados',      type: 'integer', title: 'Total Operados',     defaultValue: 0 },
  { name: 'total_evaluaciones',  type: 'integer', title: 'Total Evaluaciones', defaultValue: 0 },
  { name: 'total_interconsultas',type: 'integer', title: 'Total IC',           defaultValue: 0 },
  {
    name: 'distribucion_por_unidad',
    type: 'text',
    title: 'Distribución por Unidad (JSON)',
    // JSON: { "MQ1": 18, "MQ2": 10, "MQ3": 2, ... }
    // Se genera automáticamente al firmar el turno (ver WF fase 4)
  },
  {
    name: 'texto_distribucion',
    type: 'text',
    title: 'Texto Distribución (copiable)',
    // "MQ1:(18) MQ2:(10) MQ3:(2) UTIs:(1) UTIc:(3)..."
    // Se genera automáticamente al firmar el turno
  },
  {
    name: 'pdf_generado',
    type: 'attachment',
    title: 'PDF Generado',
    // Adjunto del PDF del documento de entrega
    // Se popula vía API externa / n8n al firmar
  },
  {
    name: 'closed_at',
    type: 'datetime',
    title: 'Fecha de Cierre',
    // Timestamp automático al firmarse el turno (WF #3 extendido)
  },
];

// =============================================
// NUEVAS COLECCIONES
// =============================================

const NEW_COLLECTIONS: CollectionDef[] = [
  // 11. Catálogo de tipos de nota clínica
  {
    name: 'et_tipos_nota',
    title: 'Tipos de Nota Clínica',
    description: 'Catálogo editable de tipos de nota. Admin puede agregar/desactivar sin código.',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre', required: true, unique: true },
      { name: 'activo',  type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },

  // 12. Historial de notas clínicas por paciente
  //     REGLA: registros inmutables — no editar, no eliminar.
  //     Si se requiere corrección, agregar nota tipo "Corrección".
  {
    name: 'et_notas_clinicas',
    title: 'Notas Clínicas',
    description: 'Historial evolutivo por paciente. Inmutable (solo create). Fuente auditada.',
    fields: [
      {
        name: 'paciente_censo_id',
        type: 'belongsTo',
        title: 'Paciente',
        target: 'et_pacientes_censo',
        required: true,
      },
      {
        name: 'fecha_nota',
        type: 'datetime',
        title: 'Fecha / Hora',
        required: true,
      },
      {
        name: 'turno_horario',
        type: 'string',
        title: 'Turno',
        required: true,
        enum: ['Mañana', 'Tarde', 'Noche', 'Guardia'],
      },
      {
        name: 'tipo_nota_id',
        type: 'belongsTo',
        title: 'Tipo de Nota',
        target: 'et_tipos_nota',
        required: true,
      },
      {
        name: 'contenido',
        type: 'richText',
        title: 'Contenido',
        required: true,
      },
      {
        name: 'es_procedimiento_cx',
        type: 'boolean',
        title: 'Es Procedimiento Qx',
        defaultValue: false,
        // Si true → workflow puede crear registro automático en et_operaciones_turno
      },
      {
        name: 'turno_id',
        type: 'belongsTo',
        title: 'Turno Asociado',
        target: 'et_turnos',
        // Para trazabilidad: a qué turno corresponde esta nota
      },
    ],
  },

  // 13. Operaciones quirúrgicas del turno
  {
    name: 'et_operaciones_turno',
    title: 'Operaciones del Turno',
    description: 'Registro de procedimientos quirúrgicos realizados o programados en el turno.',
    fields: [
      {
        name: 'paciente_censo_id',
        type: 'belongsTo',
        title: 'Paciente',
        target: 'et_pacientes_censo',
        required: true,
      },
      {
        name: 'turno_id',
        type: 'belongsTo',
        title: 'Turno',
        target: 'et_turnos',
      },
      {
        name: 'fecha_hora_cx',
        type: 'datetime',
        title: 'Fecha / Hora Cx',
        required: true,
      },
      {
        name: 'tipo_cirugia',
        type: 'string',
        title: 'Tipo Cirugía',
        enum: ['Electiva', 'Urgencia', 'Reoperación'],
      },
      {
        name: 'procedimiento',
        type: 'text',
        title: 'Procedimiento',
        required: true,
      },
      {
        name: 'cirujano_principal_id',
        type: 'belongsTo',
        title: 'Cirujano Principal',
        target: 'et_usuarios',
      },
      {
        name: 'ayudante_id',
        type: 'belongsTo',
        title: 'Ayudante',
        target: 'et_usuarios',
        // Opcional
      },
      {
        name: 'anestesiologo',
        type: 'string',
        title: 'Anestesiólogo',
        // Texto libre (puede no estar en et_usuarios)
      },
      {
        name: 'complicaciones',
        type: 'text',
        title: 'Complicaciones',
      },
      {
        name: 'estado_cx',
        type: 'string',
        title: 'Estado',
        defaultValue: 'Pendiente',
        enum: ['Pendiente', 'En Pabellón', 'Completada', 'Suspendida'],
      },
    ],
  },

  // 14. Configuración global del sistema
  {
    name: 'et_config_sistema',
    title: 'Configuración del Sistema',
    description: 'Parámetros globales ajustables sin código. Solo admin/administrativo puede editar.',
    fields: [
      { name: 'clave',       type: 'string',  title: 'Clave',        required: true, unique: true },
      { name: 'valor',       type: 'text',    title: 'Valor' },
      {
        name: 'tipo',
        type: 'string',
        title: 'Tipo',
        defaultValue: 'text',
        enum: ['text', 'number', 'boolean', 'json'],
      },
      { name: 'descripcion', type: 'text',    title: 'Descripción' },
    ],
  },
];

// =============================================
// SEED DATA
// =============================================

const SEED_TIPOS_NOTA = [
  { nombre: 'Evolución',          activo: true },
  { nombre: 'Procedimiento',      activo: true },
  { nombre: 'Interconsulta',      activo: true },
  { nombre: 'Pabellón',           activo: true },
  { nombre: 'Alta',               activo: true },
  { nombre: 'Corrección',         activo: true },
  { nombre: 'Enfermería',         activo: true },
  { nombre: 'Observación TENS',   activo: true },
  { nombre: 'Ingreso',            activo: true },
];

const SEED_CONFIG = [
  {
    clave: 'nombre_servicio',
    valor: 'Servicio de Cirugía',
    tipo: 'text',
    descripcion: 'Nombre del servicio (aparece en PDF y encabezados)',
  },
  {
    clave: 'nombre_hospital',
    valor: 'Hospital Dr. Antonio Tirado Lanas',
    tipo: 'text',
    descripcion: 'Nombre del hospital (aparece en documentos impresos)',
  },
  {
    clave: 'logo_url',
    valor: '',
    tipo: 'text',
    descripcion: 'URL del logo institucional para PDF',
  },
  {
    clave: 'dias_alerta_estancia',
    valor: '30',
    tipo: 'number',
    descripcion: 'Días de hospitalización para activar alerta de larga estancia',
  },
  {
    clave: 'capacidad_por_unidad',
    valor: JSON.stringify({
      MQ1: 20, MQ2: 20, MQ3: 20,
      UCI: 8,  UTI: 12,
      PED: 16, OBST: 20, GIN: 12, NEO: 10,
      TRAU: 20, PCER: 10, CIBU: 10,
    }),
    tipo: 'json',
    descripcion: 'Capacidad máxima de camas por unidad (para % ocupación)',
  },
  {
    clave: 'google_sheet_id',
    valor: '',
    tipo: 'text',
    descripcion: 'ID del Google Sheet de respaldo (sync al firmar turno)',
  },
  {
    clave: 'webhook_n8n_url',
    valor: '',
    tipo: 'text',
    descripcion: 'URL del webhook n8n para sincronización con Google Sheets',
  },
  {
    clave: 'turno_manana_hora',
    valor: '08:00',
    tipo: 'text',
    descripcion: 'Hora de inicio del turno mañana',
  },
  {
    clave: 'turno_tarde_hora',
    valor: '14:00',
    tipo: 'text',
    descripcion: 'Hora de inicio del turno tarde',
  },
  {
    clave: 'turno_noche_hora',
    valor: '21:00',
    tipo: 'text',
    descripcion: 'Hora de inicio del turno noche',
  },
];

// =============================================
// HELPERS
// =============================================

function getComponent(type: string): string {
  const map: Record<string, string> = {
    string:     'Input',
    text:       'Input.TextArea',
    richText:   'RichText',
    integer:    'InputNumber',
    double:     'InputNumber',
    boolean:    'Checkbox',
    date:       'DatePicker',
    datetime:   'DatePicker',
    attachment: 'Upload',
    belongsTo:  'AssociationField',
    hasMany:    'AssociationField',
  };
  return map[type] || 'Input';
}

async function addFieldSafe(colName: string, field: FieldDef): Promise<boolean> {
  try {
    if (DRY_RUN) {
      log(`   [DRY] ${colName}.${field.name} (${field.type})`, 'gray');
      return true;
    }

    const data: any = {
      name: field.name,
      type: field.type,
      uiSchema: {
        title: field.title,
        'x-component': getComponent(field.type),
      },
    };

    if (field.required)                         data.required = true;
    if (field.unique)                           data.unique = true;
    if (field.defaultValue !== undefined)       data.defaultValue = field.defaultValue;

    if (['belongsTo', 'hasMany', 'belongsToMany'].includes(field.type)) {
      data.target = field.target;
      data.uiSchema['x-component'] = 'AssociationField';
      data.uiSchema['x-component-props'] = {
        multiple: ['hasMany', 'belongsToMany'].includes(field.type),
      };
    }

    if (field.enum) {
      data.uiSchema.enum = field.enum.map(v => ({ value: v, label: v }));
    }

    await client.post(`/collections/${colName}/fields:create`, data);
    log(`   ✅ ${colName}.${field.name}`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  ${colName}.${field.name} ya existe`, 'yellow');
      return true;
    }
    log(`   ❌ ${colName}.${field.name}: ${msg}`, 'red');
    return false;
  }
}

async function createCollectionSafe(col: CollectionDef): Promise<boolean> {
  try {
    if (DRY_RUN) {
      log(`   [DRY] Crearía "${col.name}" (${col.fields.length} campos)`, 'gray');
      return true;
    }

    await client.post('/collections:create', {
      name: col.name,
      title: col.title,
      description: col.description || '',
      fields: [],
      autoGenId: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
      sortable: true,
    });

    log(`   ✅ Colección "${col.name}" creada`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  "${col.name}" ya existe, continuando con campos...`, 'yellow');
      return true;
    }
    log(`   ❌ Error "${col.name}": ${msg}`, 'red');
    return false;
  }
}

async function seedRecord(collection: string, data: any, uniqueKey: string): Promise<void> {
  if (DRY_RUN) {
    log(`   [DRY] ${collection}: ${data[uniqueKey]}`, 'gray');
    return;
  }
  try {
    await client.post(`/${collection}:create`, data);
    log(`   ✅ ${data[uniqueKey]}`, 'green');
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
      log(`   ⚠️  "${data[uniqueKey]}" ya existe`, 'yellow');
    } else {
      log(`   ❌ "${data[uniqueKey]}": ${msg}`, 'red');
    }
  }
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  ENTREGA FASE 2 — Colecciones y Campos (Blueprint Completo)', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  if (DRY_RUN)   log('🔍 MODO DRY RUN — no se crearán datos reales.\n', 'yellow');
  if (SKIP_SEED) log('⏩ SKIP SEED — se omitirá el seed de datos.\n', 'yellow');

  let ok = 0;
  let fail = 0;

  // ── PASO 1: Campos nuevos en et_pacientes_censo ──────────────────────
  log('📋 Paso 1: Campos editables en et_pacientes_censo\n', 'cyan');
  log('   (No serán sobreescritos por sync ALMA)\n', 'gray');
  for (const field of CENSO_NEW_FIELDS) {
    const r = await addFieldSafe('et_pacientes_censo', field);
    r ? ok++ : fail++;
  }

  // ── PASO 2: Campos nuevos en et_turnos ───────────────────────────────
  log('\n📋 Paso 2: Campos de conteo y snapshot en et_turnos\n', 'cyan');
  for (const field of TURNOS_NEW_FIELDS) {
    const r = await addFieldSafe('et_turnos', field);
    r ? ok++ : fail++;
  }

  // ── PASO 3: Crear 4 nuevas colecciones ──────────────────────────────
  log('\n📋 Paso 3: Crear nuevas colecciones\n', 'cyan');
  for (const col of NEW_COLLECTIONS) {
    log(`\n  📦 ${col.name} — ${col.title}`, 'cyan');
    const colOk = await createCollectionSafe(col);
    if (!colOk) { fail++; continue; }
    for (const field of col.fields) {
      const r = await addFieldSafe(col.name, field);
      r ? ok++ : fail++;
    }
  }

  // ── PASO 4: Seed et_tipos_nota ───────────────────────────────────────
  if (!SKIP_SEED) {
    log('\n🌱 Paso 4: Seed et_tipos_nota (9 tipos)\n', 'cyan');
    for (const tipo of SEED_TIPOS_NOTA) {
      await seedRecord('et_tipos_nota', tipo, 'nombre');
    }
  }

  // ── PASO 5: Seed et_config_sistema ──────────────────────────────────
  if (!SKIP_SEED) {
    log('\n🌱 Paso 5: Seed et_config_sistema (10 parámetros)\n', 'cyan');
    for (const cfg of SEED_CONFIG) {
      await seedRecord('et_config_sistema', cfg, 'clave');
    }
  }

  // ── RESUMEN ──────────────────────────────────────────────────────────
  log('\n═══════════════════════════════════════════════════════════', fail > 0 ? 'yellow' : 'green');
  log('  ✅ ENTREGA FASE 2 — COMPLETADO', 'green');
  log(`  Campos procesados: ${ok} OK / ${fail} errores`, fail > 0 ? 'yellow' : 'green');
  log('═══════════════════════════════════════════════════════════', 'green');
  log('\nPróximos pasos:', 'cyan');
  log('  npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase2-roles.ts', 'gray');
  log('  npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase4-workflows.ts', 'gray');
}

main().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
