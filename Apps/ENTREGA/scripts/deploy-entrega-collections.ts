/**
 * deploy-entrega-collections.ts
 * 
 * Crea las 10 colecciones ENTREGA + todos los campos + seed data en NocoBase.
 * Sigue el blueprint app-spec/app.yaml y PROMPT_ENTREGA_TURNO.md.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-collections.ts
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-collections.ts --dry-run
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-collections.ts --seed-only
 */

import { createClient, log } from '../../../shared/scripts/ApiClient';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const SEED_ONLY = process.argv.includes('--seed-only');

// =============================================
// COLLECTION DEFINITIONS (order matters for FK)
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

const COLLECTIONS: CollectionDef[] = [
  // 1. Especialidades (catálogo, no tiene FK)
  {
    name: 'et_especialidades',
    title: 'Especialidades Médicas',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre', required: true, unique: true },
      { name: 'codigo', type: 'string', title: 'Código', unique: true },
      { name: 'activa', type: 'boolean', title: 'Activa', defaultValue: true },
    ],
  },
  // 2. Servicios (FK → et_especialidades)
  {
    name: 'et_servicios',
    title: 'Servicios Hospitalarios',
    fields: [
      { name: 'codigo', type: 'string', title: 'Código ALMA', required: true, unique: true },
      { name: 'nombre', type: 'string', title: 'Nombre' },
      { name: 'codigo_padre', type: 'string', title: 'Servicio Padre' },
      { name: 'especialidad_id', type: 'belongsTo', title: 'Especialidad', target: 'et_especialidades' },
      { name: 'capacidad_camas', type: 'integer', title: 'Capacidad Camas' },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 3. Usuarios
  {
    name: 'et_usuarios',
    title: 'Usuarios Entrega',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre Completo', required: true },
      { name: 'rut', type: 'string', title: 'RUT', unique: true },
      { name: 'codigo_alma', type: 'string', title: 'Código ALMA' },
      { name: 'cargo', type: 'string', title: 'Cargo', enum: ['Médico', 'Enfermero/a', 'Interno', 'Becado'] },
      { name: 'especialidad', type: 'string', title: 'Especialidad' },
      { name: 'email', type: 'string', title: 'Email' },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 4. Pacientes Censo (FK → et_servicios)
  {
    name: 'et_pacientes_censo',
    title: 'Censo Hospitalizados (Sync ALMA)',
    description: 'Tabla read-only sincronizada desde Q1 ALMA',
    fields: [
      { name: 'id_episodio', type: 'string', title: 'ID Episodio', required: true, unique: true },
      { name: 'rut', type: 'string', title: 'RUT' },
      { name: 'nro_ficha', type: 'string', title: 'Nro Ficha' },
      { name: 'nombre', type: 'string', title: 'Nombre' },
      { name: 'edad', type: 'integer', title: 'Edad' },
      { name: 'sexo', type: 'string', title: 'Sexo' },
      { name: 'servicio_id', type: 'belongsTo', title: 'Servicio', target: 'et_servicios' },
      { name: 'sala', type: 'string', title: 'Sala' },
      { name: 'cama', type: 'string', title: 'Cama' },
      { name: 'medico_tratante_alma', type: 'string', title: 'Médico Tratante' },
      { name: 'cod_medico', type: 'string', title: 'Código Médico' },
      { name: 'especialidad_clinica', type: 'string', title: 'Especialidad Clínica' },
      { name: 'f_ingreso', type: 'datetime', title: 'Fecha Ingreso' },
      { name: 'dias_hospitalizacion', type: 'integer', title: 'Días Hosp.' },
      { name: 'dx_principal', type: 'text', title: 'Dx Principal' },
      { name: 'f_probable_alta', type: 'date', title: 'Fecha Prob. Alta' },
      { name: 'alta_confirmada', type: 'boolean', title: 'Alta Confirmada' },
      { name: 'f_alta_medica', type: 'date', title: 'Fecha Alta Médica' },
      { name: 'alergias', type: 'text', title: 'Alergias' },
      { name: 'vip', type: 'boolean', title: 'VIP' },
      { name: 'telefono', type: 'string', title: 'Teléfono' },
      { name: 'servicio_padre', type: 'string', title: 'Servicio Padre' },
      { name: 'caso_social', type: 'boolean', title: 'Caso Social', defaultValue: false },
      { name: 'motivo_caso_social', type: 'text', title: 'Motivo Caso Social' },
      { name: 'ultima_sync', type: 'datetime', title: 'Última Sync' },
    ],
  },
  // 5. Diagnósticos (FK → et_pacientes_censo)
  {
    name: 'et_diagnosticos',
    title: 'Diagnósticos por Paciente (Sync Q2)',
    fields: [
      { name: 'paciente_censo_id', type: 'belongsTo', title: 'Paciente', target: 'et_pacientes_censo' },
      { name: 'tipo_dx', type: 'string', title: 'Tipo Dx' },
      { name: 'diagnostico', type: 'text', title: 'Diagnóstico' },
      { name: 'cod_cie', type: 'string', title: 'CIE-10' },
      { name: 'fecha_dx', type: 'date', title: 'Fecha Dx' },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 6. Cotratancia (FK → et_pacientes_censo, et_usuarios)
  {
    name: 'et_cotratancia',
    title: 'Cotratancia / Seguimiento',
    fields: [
      { name: 'paciente_censo_id', type: 'belongsTo', title: 'Paciente', target: 'et_pacientes_censo' },
      { name: 'especialidad_origen', type: 'string', title: 'Especialidad Origen' },
      { name: 'especialidad_destino', type: 'string', title: 'Especialidad Destino' },
      { name: 'tipo', type: 'string', title: 'Tipo', enum: ['cotratancia', 'seguimiento'] },
      { name: 'motivo', type: 'text', title: 'Motivo' },
      { name: 'solicitado_por_id', type: 'belongsTo', title: 'Solicitado Por', target: 'et_usuarios' },
      { name: 'fecha_inicio', type: 'date', title: 'Fecha Inicio' },
      { name: 'fecha_fin', type: 'date', title: 'Fecha Fin' },
      { name: 'activa', type: 'boolean', title: 'Activa', defaultValue: true },
      { name: 'notas', type: 'text', title: 'Notas' },
    ],
  },
  // 7. Turnos (FK → et_usuarios)
  {
    name: 'et_turnos',
    title: 'Entregas de Turno',
    fields: [
      { name: 'fecha', type: 'date', title: 'Fecha', required: true },
      { name: 'turno', type: 'string', title: 'Turno', enum: ['Mañana', 'Tarde', 'Noche'] },
      { name: 'especialidad', type: 'string', title: 'Especialidad', required: true },
      { name: 'responsable_saliente_id', type: 'belongsTo', title: 'Responsable Saliente', target: 'et_usuarios' },
      { name: 'responsable_entrante_id', type: 'belongsTo', title: 'Responsable Entrante', target: 'et_usuarios' },
      { name: 'estado', type: 'string', title: 'Estado', enum: ['borrador', 'en_curso', 'completada', 'firmada'] },
      { name: 'observaciones_generales', type: 'text', title: 'Observaciones Generales' },
      { name: 'firma_saliente', type: 'boolean', title: 'Firma Saliente', defaultValue: false },
      { name: 'firma_entrante', type: 'boolean', title: 'Firma Entrante', defaultValue: false },
    ],
  },
  // 8. Entrega por Paciente (FK → et_turnos, et_pacientes_censo, et_usuarios)
  {
    name: 'et_entrega_paciente',
    title: 'Detalle Entrega por Paciente',
    description: 'Registro editable por paciente dentro de cada entrega de turno',
    fields: [
      { name: 'turno_id', type: 'belongsTo', title: 'Turno', target: 'et_turnos' },
      { name: 'paciente_censo_id', type: 'belongsTo', title: 'Paciente', target: 'et_pacientes_censo' },
      { name: 'es_cotratancia', type: 'boolean', title: 'Es Cotratancia', defaultValue: false },
      { name: 'tipo_inclusion', type: 'string', title: 'Tipo Inclusión', enum: ['propio', 'cotratancia', 'seguimiento'] },
      { name: 'resumen_historia', type: 'text', title: 'Resumen Historia' },
      { name: 'plan_tratamiento', type: 'text', title: 'Plan Tratamiento' },
      { name: 'pendientes', type: 'text', title: 'Pendientes' },
      { name: 'medico_tratante_id', type: 'belongsTo', title: 'Médico Tratante', target: 'et_usuarios' },
      { name: 'estado_paciente', type: 'string', title: 'Estado Paciente', enum: ['estable', 'inestable', 'grave', 'crítico', 'alta_programada'] },
      { name: 'eventos_turno', type: 'text', title: 'Eventos del Turno' },
      { name: 'fue_operado', type: 'boolean', title: 'Fue Operado', defaultValue: false },
      { name: 'procedimiento', type: 'text', title: 'Procedimiento' },
      { name: 'interconsulta', type: 'text', title: 'Interconsultas' },
      { name: 'modificado_por_id', type: 'belongsTo', title: 'Modificado Por', target: 'et_usuarios' },
    ],
  },
  // 9. Eventos Turno (FK → et_turnos, et_pacientes_censo, et_servicios)
  {
    name: 'et_eventos_turno',
    title: 'Eventos Relevantes del Turno',
    fields: [
      { name: 'turno_id', type: 'belongsTo', title: 'Turno', target: 'et_turnos' },
      { name: 'tipo_evento', type: 'string', title: 'Tipo Evento', enum: ['ingreso', 'alta', 'fallecimiento', 'cirugia', 'interconsulta'] },
      { name: 'paciente_censo_id', type: 'belongsTo', title: 'Paciente', target: 'et_pacientes_censo' },
      { name: 'descripcion', type: 'text', title: 'Descripción' },
      { name: 'fecha_hora', type: 'datetime', title: 'Fecha/Hora' },
      { name: 'servicio_id', type: 'belongsTo', title: 'Servicio', target: 'et_servicios' },
      { name: 'source_alma', type: 'boolean', title: 'Desde ALMA', defaultValue: false },
    ],
  },
  // 10. Entrega Enfermería (FK → et_servicios, et_usuarios, et_pacientes_censo)
  {
    name: 'et_entrega_enfermeria',
    title: 'Entrega de Enfermería (por Servicio)',
    description: 'Organizada por servicio físico. Campos ZEN sincronizados desde ALMA.',
    fields: [
      // Cabecera
      { name: 'fecha', type: 'date', title: 'Fecha', required: true },
      { name: 'turno', type: 'string', title: 'Turno', enum: ['Mañana', 'Tarde', 'Noche'] },
      { name: 'servicio_id', type: 'belongsTo', title: 'Servicio', target: 'et_servicios' },
      { name: 'enfermera_saliente_id', type: 'belongsTo', title: 'Enfermera Saliente', target: 'et_usuarios' },
      { name: 'enfermera_entrante_id', type: 'belongsTo', title: 'Enfermera Entrante', target: 'et_usuarios' },
      { name: 'firma_saliente', type: 'boolean', title: 'Firma Saliente', defaultValue: false },
      { name: 'firma_entrante', type: 'boolean', title: 'Firma Entrante', defaultValue: false },
      // Por paciente
      { name: 'paciente_censo_id', type: 'belongsTo', title: 'Paciente', target: 'et_pacientes_censo' },
      { name: 'enfermera_cargo_id', type: 'belongsTo', title: 'Enfermera a Cargo', target: 'et_usuarios' },
      // Dx y Cirugía (ZEN cols 9-15)
      { name: 'dx_confirmados', type: 'text', title: 'Dx Confirmados' },
      { name: 'dx_preoperatorio', type: 'text', title: 'Dx Preoperatorio' },
      { name: 'cirugia_procedimiento', type: 'text', title: 'Cirugía/Procedimiento' },
      { name: 'fecha_agendada', type: 'date', title: 'Fecha Agendada Cirugía' },
      { name: 'hora_agendada', type: 'string', title: 'Hora Agendada' },
      { name: 'quirofano', type: 'string', title: 'Quirófano' },
      { name: 'estado_cirugia', type: 'string', title: 'Estado Cirugía' },
      // Dispositivos Invasivos (ZEN cols 16-20)
      { name: 'dispositivo_invasivo', type: 'text', title: 'Dispositivo Invasivo' },
      { name: 'fecha_instalacion', type: 'date', title: 'Fecha Instalación' },
      { name: 'ubicacion_lateralidad', type: 'string', title: 'Ubicación/Lateralidad' },
      { name: 'dias_instalado', type: 'integer', title: 'Días Instalado' },
      { name: 'comentarios_instalacion', type: 'text', title: 'Comentarios Instalación' },
      // Egresos/Drenajes (ZEN cols 21, 41-44)
      { name: 'egreso_diuresis', type: 'double', title: 'Egreso Diuresis (ml)' },
      { name: 'egreso_drenaje', type: 'double', title: 'Egreso Drenaje (ml)' },
      { name: 'egreso_drenaje_3', type: 'double', title: 'Egreso Drenaje 3' },
      { name: 'egreso_drenaje_4', type: 'double', title: 'Egreso Drenaje 4' },
      { name: 'egreso_drenaje_5', type: 'double', title: 'Egreso Drenaje 5' },
      // Lab e Imagenología (ZEN cols 22-23)
      { name: 'lab_pendientes', type: 'text', title: 'Laboratorio Pendiente' },
      { name: 'img_pendientes', type: 'text', title: 'Imagenología Pendiente' },
      // Signos Vitales (ZEN cols 24-31)
      { name: 'fc', type: 'double', title: 'FC (lpm)' },
      { name: 'pa_sistolica', type: 'double', title: 'PA Sistólica' },
      { name: 'pa_diastolica', type: 'double', title: 'PA Diastólica' },
      { name: 'fr', type: 'double', title: 'FR (rpm)' },
      { name: 'sat_o2', type: 'double', title: 'SatO2 (%)' },
      { name: 'temperatura', type: 'double', title: 'Temperatura (°C)' },
      { name: 'hgt', type: 'double', title: 'HGT' },
      { name: 'eva_dolor', type: 'double', title: 'EVA Dolor' },
      // Insulina (ZEN cols 32-37)
      { name: 'hgt_insulina', type: 'double', title: 'HGT Insulina' },
      { name: 'clasificacion_insulina', type: 'string', title: 'Clasificación Insulina' },
      { name: 'tipo_insulina', type: 'string', title: 'Tipo Insulina' },
      { name: 'dosis_insulina', type: 'double', title: 'Dosis Insulina' },
      { name: 'sitio_puncion_insulina', type: 'string', title: 'Sitio Punción' },
      { name: 'comentarios_insulina', type: 'text', title: 'Comentarios Insulina' },
      // Otros Clínicos (ZEN cols 38-47)
      { name: 'ic_internas_pendientes', type: 'text', title: 'IC Internas Pendientes' },
      { name: 'medicamentos', type: 'text', title: 'Medicamentos' },
      { name: 'alergias', type: 'text', title: 'Alergias' },
      { name: 'escala_caidas', type: 'string', title: 'Escala Caídas (Downton)' },
      { name: 'riesgo_dependencia', type: 'string', title: 'Riesgo Dependencia' },
      { name: 'regimen', type: 'text', title: 'Régimen Alimentario' },
      // Campos manuales enfermería
      { name: 'observaciones', type: 'text', title: 'Observaciones' },
      { name: 'cuidados_especiales', type: 'text', title: 'Cuidados Especiales' },
      { name: 'incidentes', type: 'text', title: 'Incidentes' },
    ],
  },
];

// =============================================
// SEED DATA
// =============================================

const SEED_ESPECIALIDADES = [
  { nombre: 'Medicina Interna', codigo: 'MI', activa: true },
  { nombre: 'Cirugía General', codigo: 'CG', activa: true },
  { nombre: 'Medicina Intensiva', codigo: 'MINT', activa: true },
  { nombre: 'Pediatría', codigo: 'PED', activa: true },
  { nombre: 'Obstetricia/Ginecología', codigo: 'OBG', activa: true },
  { nombre: 'Traumatología', codigo: 'TRAU', activa: true },
  { nombre: 'Neonatología', codigo: 'NEO', activa: true },
  { nombre: 'Cirugía Infantil', codigo: 'CI', activa: true },
  { nombre: 'Multidisciplinario', codigo: 'MULTI', activa: true },
];

const SEED_SERVICIOS = [
  { codigo: 'MQ1', nombre: 'Medicina Quirúrgica 1', codigo_padre: 'MEDICINA', activo: true },
  { codigo: 'MQ2', nombre: 'Medicina Quirúrgica 2', codigo_padre: 'MEDICINA', activo: true },
  { codigo: 'MQ3', nombre: 'Medicina Quirúrgica 3', codigo_padre: 'CIRUGIA', activo: true },
  { codigo: 'PCER', nombre: 'Pensionado Cerrado', codigo_padre: 'MULTI', activo: true },
  { codigo: 'UCI', nombre: 'Unidad Cuidados Intensivos', codigo_padre: 'INTENSIVA', activo: true },
  { codigo: 'UTI', nombre: 'Unidad Tratamiento Intermedio', codigo_padre: 'INTENSIVA', activo: true },
  { codigo: 'CIBU', nombre: 'Cirugía Infantil', codigo_padre: 'PEDIATRIA', activo: true },
  { codigo: 'PED', nombre: 'Pediatría', codigo_padre: 'PEDIATRIA', activo: true },
  { codigo: 'OBST', nombre: 'Obstetricia', codigo_padre: 'OBST_GIN', activo: true },
  { codigo: 'GIN', nombre: 'Ginecología', codigo_padre: 'OBST_GIN', activo: true },
  { codigo: 'NEO', nombre: 'Neonatología', codigo_padre: 'NEONATOLOGIA', activo: true },
  { codigo: 'TRAU', nombre: 'Traumatología', codigo_padre: 'TRAUMATOLOGIA', activo: true },
];

// =============================================
// DEPLOYMENT FUNCTIONS
// =============================================

async function createCollectionSafe(col: CollectionDef): Promise<boolean> {
  try {
    log(`📦 Creando colección "${col.name}" (${col.title})...`, 'cyan');
    if (DRY_RUN) {
      log(`   [DRY RUN] Crearía colección con ${col.fields.length} campos`, 'gray');
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
    log(`   ✅ Colección "${col.name}" creada.`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  Colección "${col.name}" ya existe, continuando...`, 'yellow');
      return true;
    }
    log(`   ❌ Error creando "${col.name}": ${msg}`, 'red');
    return false;
  }
}

async function createFieldSafe(colName: string, field: FieldDef): Promise<boolean> {
  try {
    if (DRY_RUN) {
      log(`   [DRY RUN] Campo "${field.name}" (${field.type})`, 'gray');
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

    if (field.required) data.required = true;
    if (field.unique) data.unique = true;
    if (field.defaultValue !== undefined) data.defaultValue = field.defaultValue;

    // Relations
    if (['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'].includes(field.type)) {
      data.target = field.target;
      data.uiSchema['x-component'] = 'AssociationField';
      data.uiSchema['x-component-props'] = {
        multiple: ['hasMany', 'belongsToMany'].includes(field.type),
      };
    }

    // Enum
    if (field.enum) {
      data.uiSchema.enum = field.enum.map(v => ({ value: v, label: v }));
    }

    await client.post(`/collections/${colName}/fields:create`, data);
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      return true; // Field already exists, skip silently
    }
    log(`   ❌ Error campo "${field.name}": ${msg}`, 'red');
    return false;
  }
}

function getComponent(type: string): string {
  const map: Record<string, string> = {
    string: 'Input',
    text: 'Input.TextArea',
    integer: 'InputNumber',
    double: 'InputNumber',
    decimal: 'InputNumber',
    boolean: 'Checkbox',
    date: 'DatePicker',
    datetime: 'DatePicker',
    time: 'TimePicker',
    belongsTo: 'AssociationField',
    hasMany: 'AssociationField',
  };
  return map[type] || 'Input';
}

async function seedData() {
  log('\n🌱 Seeding especialidades...', 'cyan');
  let created = 0;
  for (const esp of SEED_ESPECIALIDADES) {
    try {
      if (DRY_RUN) {
        log(`   [DRY RUN] ${esp.nombre} (${esp.codigo})`, 'gray');
        continue;
      }
      await client.post('/et_especialidades:create', esp);
      created++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
        log(`   ⚠️  "${esp.nombre}" ya existe`, 'yellow');
      } else {
        log(`   ❌ Error: ${msg}`, 'red');
      }
    }
  }
  log(`   ✅ ${created} especialidades creadas.\n`, 'green');

  log('🌱 Seeding servicios...', 'cyan');
  created = 0;
  for (const svc of SEED_SERVICIOS) {
    try {
      if (DRY_RUN) {
        log(`   [DRY RUN] ${svc.nombre} (${svc.codigo})`, 'gray');
        continue;
      }
      await client.post('/et_servicios:create', svc);
      created++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
        log(`   ⚠️  "${svc.nombre}" ya existe`, 'yellow');
      } else {
        log(`   ❌ Error: ${msg}`, 'red');
      }
    }
  }
  log(`   ✅ ${created} servicios creados.\n`, 'green');
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('═══════════════════════════════════════════════', 'cyan');
  log('  DEPLOY: ENTREGA DE TURNO — NocoBase Collections', 'cyan');
  log('═══════════════════════════════════════════════\n', 'cyan');

  if (DRY_RUN) log('🔍 MODO DRY RUN — no se crearán datos reales.\n', 'yellow');

  if (!SEED_ONLY) {
    // Step 1: Create collections
    log('📋 Paso 1: Crear colecciones...\n', 'cyan');
    let collectionsOk = 0;
    for (const col of COLLECTIONS) {
      const ok = await createCollectionSafe(col);
      if (ok) collectionsOk++;
    }
    log(`\n✅ ${collectionsOk}/${COLLECTIONS.length} colecciones listas.\n`, 'green');

    // Step 2: Add fields to each collection
    log('📋 Paso 2: Crear campos...\n', 'cyan');
    let totalFields = 0;
    let fieldsOk = 0;
    for (const col of COLLECTIONS) {
      log(`\n  📦 ${col.name} (${col.fields.length} campos)`, 'cyan');
      for (const field of col.fields) {
        totalFields++;
        const ok = await createFieldSafe(col.name, field);
        if (ok) fieldsOk++;
      }
    }
    log(`\n✅ ${fieldsOk}/${totalFields} campos creados.\n`, 'green');
  }

  // Step 3: Seed data
  await seedData();

  // Summary
  log('═══════════════════════════════════════════════', 'green');
  log('  ✅ DEPLOY ENTREGA COMPLETADO', 'green');
  log('═══════════════════════════════════════════════', 'green');
}

main().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
