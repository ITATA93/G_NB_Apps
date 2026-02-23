/**
 * deploy-agenda-collections.ts
 *
 * Crea las 8 colecciones AGENDA + todos los campos + seed data en NocoBase.
 * Sigue el blueprint app-spec/app.yaml y PROMPT_AGENDA_MEDICA.md.
 *
 * Uso:
 *   npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts
 *   npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --dry-run
 *   npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --seed-only
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
  // 1. Categorias de Actividad (catalogo, sin FK)
  {
    name: 'ag_categorias_actividad',
    title: 'Categorias de Actividad Medica',
    description: 'Catalogo de tipos de actividad para agenda medica',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre', required: true },
      { name: 'codigo', type: 'string', title: 'Codigo', required: true, unique: true },
      { name: 'grupo', type: 'string', title: 'Grupo', enum: ['Clinica', 'Quirurgica', 'Policlinico', 'Oncologia', 'Administrativa', 'Otro'] },
      { name: 'orden', type: 'integer', title: 'Orden' },
      { name: 'color', type: 'string', title: 'Color Hex' },
      { name: 'activa', type: 'boolean', title: 'Activa', defaultValue: true },
    ],
  },
  // 2. Tipos de Inasistencia (catalogo, sin FK)
  {
    name: 'ag_tipos_inasistencia',
    title: 'Tipos de Inasistencia',
    description: 'Catalogo de tipos de ausencia laboral',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre', required: true },
      { name: 'codigo', type: 'string', title: 'Codigo', required: true, unique: true },
      { name: 'descripcion', type: 'text', title: 'Descripcion' },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 3. Servicios Hospitalarios (catalogo, sin FK)
  {
    name: 'ag_servicios',
    title: 'Servicios Hospitalarios (Agenda)',
    description: 'Servicios del hospital para contexto de actividades',
    fields: [
      { name: 'nombre', type: 'string', title: 'Nombre', required: true },
      { name: 'codigo', type: 'string', title: 'Codigo', required: true, unique: true },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 4. Funcionarios (FK -> ag_servicios)
  {
    name: 'ag_funcionarios',
    title: 'Funcionarios Medicos',
    description: 'Personal medico registrado en agenda',
    fields: [
      { name: 'nombre_completo', type: 'string', title: 'Nombre Completo', required: true },
      { name: 'rut', type: 'string', title: 'RUT', required: true, unique: true },
      { name: 'codigo_alma', type: 'string', title: 'Codigo ALMA' },
      { name: 'especialidad', type: 'string', title: 'Especialidad' },
      { name: 'servicio_id', type: 'belongsTo', title: 'Servicio', target: 'ag_servicios' },
      { name: 'cargo', type: 'string', title: 'Cargo', enum: ['Medico Cirujano', 'Medico Internista', 'Medico Especialista'] },
      { name: 'email', type: 'string', title: 'Email' },
      { name: 'jornada_horas', type: 'integer', title: 'Jornada Semanal (hrs)' },
      { name: 'activo', type: 'boolean', title: 'Activo', defaultValue: true },
    ],
  },
  // 5. Bloques de Agenda (tabla central, FK -> ag_funcionarios, ag_categorias_actividad, ag_servicios)
  {
    name: 'ag_bloques_agenda',
    title: 'Bloques de Agenda',
    description: 'Registro de actividades medicas por bloque horario',
    fields: [
      { name: 'fecha', type: 'date', title: 'Fecha', required: true },
      { name: 'funcionario_id', type: 'belongsTo', title: 'Funcionario', target: 'ag_funcionarios', required: true },
      { name: 'categoria_id', type: 'belongsTo', title: 'Categoria', target: 'ag_categorias_actividad', required: true },
      { name: 'subcategoria', type: 'string', title: 'Subcategoria' },
      { name: 'hora_inicio', type: 'time', title: 'Hora Inicio', required: true },
      { name: 'hora_fin', type: 'time', title: 'Hora Fin', required: true },
      { name: 'duracion_min', type: 'integer', title: 'Duracion (min)' },
      { name: 'periodo', type: 'string', title: 'Periodo', enum: ['AM', 'PM'] },
      { name: 'servicio_id', type: 'belongsTo', title: 'Servicio', target: 'ag_servicios' },
      { name: 'observaciones', type: 'text', title: 'Observaciones' },
    ],
  },
  // 6. Inasistencias (FK -> ag_funcionarios, ag_tipos_inasistencia)
  {
    name: 'ag_inasistencias',
    title: 'Inasistencias',
    description: 'Registro de ausencias de funcionarios',
    fields: [
      { name: 'fecha', type: 'date', title: 'Fecha', required: true },
      { name: 'funcionario_id', type: 'belongsTo', title: 'Funcionario', target: 'ag_funcionarios', required: true },
      { name: 'tipo_inasistencia_id', type: 'belongsTo', title: 'Tipo Inasistencia', target: 'ag_tipos_inasistencia', required: true },
      { name: 'periodo', type: 'string', title: 'Periodo', enum: ['Completo', 'AM', 'PM'] },
      { name: 'notas', type: 'text', title: 'Notas' },
    ],
  },
  // 7. Resumen Diario (FK -> ag_funcionarios)
  {
    name: 'ag_resumen_diario',
    title: 'Resumen Diario',
    description: 'Resumen generado por dia y funcionario',
    fields: [
      { name: 'fecha', type: 'date', title: 'Fecha', required: true },
      { name: 'funcionario_id', type: 'belongsTo', title: 'Funcionario', target: 'ag_funcionarios', required: true },
      { name: 'total_horas', type: 'double', title: 'Total Horas' },
      { name: 'hora_salida', type: 'time', title: 'Hora Salida' },
      { name: 'sala_count', type: 'integer', title: 'N Sala' },
      { name: 'pab_am', type: 'integer', title: 'N Pabellon AM' },
      { name: 'pab_pm', type: 'integer', title: 'N Pabellon PM' },
      { name: 'poli_am', type: 'integer', title: 'N Policlinico AM' },
      { name: 'poli_pm', type: 'integer', title: 'N Policlinico PM' },
      { name: 'inasistencias', type: 'integer', title: 'N Inasistencias' },
      { name: 'detalle_json', type: 'json', title: 'Detalle por Categoria' },
    ],
  },
  // 8. Resumen Semanal (FK -> ag_funcionarios)
  {
    name: 'ag_resumen_semanal',
    title: 'Resumen Semanal',
    description: 'Resumen generado por semana y funcionario',
    fields: [
      { name: 'semana_inicio', type: 'date', title: 'Semana Inicio (Lunes)', required: true },
      { name: 'semana_fin', type: 'date', title: 'Semana Fin (Domingo)', required: true },
      { name: 'funcionario_id', type: 'belongsTo', title: 'Funcionario', target: 'ag_funcionarios', required: true },
      { name: 'total_horas', type: 'double', title: 'Total Horas' },
      { name: 'detalle_json', type: 'json', title: 'Detalle por Categoria' },
      { name: 'generado_at', type: 'datetime', title: 'Generado' },
    ],
  },
];

// =============================================
// SEED DATA
// =============================================

const SEED_CATEGORIAS = [
  { nombre: 'Visita', codigo: 'VIS', grupo: 'Clinica', orden: 1, color: '#3B82F6', activa: true },
  { nombre: 'Sala', codigo: 'SALA', grupo: 'Clinica', orden: 2, color: '#10B981', activa: true },
  { nombre: 'ENT', codigo: 'ENT', grupo: 'Clinica', orden: 3, color: '#8B5CF6', activa: true },
  { nombre: 'Pabellon', codigo: 'PAB', grupo: 'Quirurgica', orden: 4, color: '#EF4444', activa: true },
  { nombre: 'Cirugia Menor', codigo: 'CX.MEN', grupo: 'Quirurgica', orden: 5, color: '#F97316', activa: true },
  { nombre: 'Poli General', codigo: 'POLI', grupo: 'Policlinico', orden: 6, color: '#06B6D4', activa: true },
  { nombre: 'Poli Vascular', codigo: 'P.VAS', grupo: 'Policlinico', orden: 7, color: '#0891B2', activa: true },
  { nombre: 'Poli Hidatidosis', codigo: 'POLI.HID', grupo: 'Policlinico', orden: 8, color: '#0E7490', activa: true },
  { nombre: 'Poli Oncologico', codigo: 'P.ONC', grupo: 'Oncologia', orden: 9, color: '#DB2777', activa: true },
  { nombre: 'Comite Oncologico', codigo: 'C.ONC', grupo: 'Oncologia', orden: 10, color: '#BE185D', activa: true },
  { nombre: 'Informe Oncologico', codigo: 'INF.ONC', grupo: 'Oncologia', orden: 11, color: '#9D174D', activa: true },
  { nombre: 'Gestion Interconsulta', codigo: 'G.INTER', grupo: 'Clinica', orden: 12, color: '#059669', activa: true },
  { nombre: 'Reuniones', codigo: 'R', grupo: 'Administrativa', orden: 13, color: '#D97706', activa: true },
  { nombre: 'Jefatura', codigo: 'JEF', grupo: 'Administrativa', orden: 14, color: '#92400E', activa: true },
  { nombre: 'Endoscopia', codigo: 'ENDO', grupo: 'Quirurgica', orden: 15, color: '#7C3AED', activa: true },
  { nombre: 'Teletrabajo', codigo: 'T.TRAB', grupo: 'Otro', orden: 16, color: '#6366F1', activa: true },
];

const SEED_TIPOS_INASISTENCIA = [
  { nombre: 'Permiso Administrativo', codigo: 'PA', descripcion: 'Permiso administrativo con goce de sueldo', activo: true },
  { nombre: 'Licencia Medica', codigo: 'LM', descripcion: 'Licencia medica por enfermedad', activo: true },
  { nombre: 'Comision de Servicio', codigo: 'CS', descripcion: 'Comision de servicio institucional', activo: true },
  { nombre: 'Capacitacion', codigo: 'CAP', descripcion: 'Actividad de capacitacion o formacion', activo: true },
  { nombre: 'Feriado Legal', codigo: 'FL', descripcion: 'Dia de feriado legal o vacaciones', activo: true },
  { nombre: 'Dia Compensatorio', codigo: 'DC', descripcion: 'Dia compensatorio por turno o guardia', activo: true },
];

const SEED_SERVICIOS = [
  { nombre: 'Cirugia General', codigo: 'CG', activo: true },
  { nombre: 'Medicina Interna', codigo: 'MI', activo: true },
  { nombre: 'Traumatologia', codigo: 'TRAU', activo: true },
  { nombre: 'Pediatria', codigo: 'PED', activo: true },
  { nombre: 'Ginecologia', codigo: 'GIN', activo: true },
  { nombre: 'UCI', codigo: 'UCI', activo: true },
  { nombre: 'UTI', codigo: 'UTI', activo: true },
  { nombre: 'Urgencias', codigo: 'URG', activo: true },
  { nombre: 'Oncologia', codigo: 'ONC', activo: true },
  { nombre: 'Neonatologia', codigo: 'NEO', activo: true },
];

// =============================================
// DEPLOYMENT FUNCTIONS
// =============================================

async function createCollectionSafe(col: CollectionDef): Promise<boolean> {
  try {
    log(`Creando coleccion "${col.name}" (${col.title})...`, 'cyan');
    if (DRY_RUN) {
      log(`   [DRY RUN] Crearia coleccion con ${col.fields.length} campos`, 'gray');
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
    log(`   Coleccion "${col.name}" creada.`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   Coleccion "${col.name}" ya existe, continuando...`, 'yellow');
      return true;
    }
    log(`   Error creando "${col.name}": ${msg}`, 'red');
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
      return true;
    }
    log(`   Error campo "${field.name}": ${msg}`, 'red');
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
    json: 'Input.JSON',
    belongsTo: 'AssociationField',
    hasMany: 'AssociationField',
  };
  return map[type] || 'Input';
}

async function seedData() {
  // Seed categorias
  log('\nSeeding categorias de actividad...', 'cyan');
  let created = 0;
  for (const cat of SEED_CATEGORIAS) {
    try {
      if (DRY_RUN) {
        log(`   [DRY RUN] ${cat.nombre} (${cat.codigo})`, 'gray');
        continue;
      }
      await client.post('/ag_categorias_actividad:create', cat);
      created++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
        log(`   "${cat.nombre}" ya existe`, 'yellow');
      } else {
        log(`   Error: ${msg}`, 'red');
      }
    }
  }
  log(`   ${created} categorias creadas.\n`, 'green');

  // Seed tipos inasistencia
  log('Seeding tipos de inasistencia...', 'cyan');
  created = 0;
  for (const tipo of SEED_TIPOS_INASISTENCIA) {
    try {
      if (DRY_RUN) {
        log(`   [DRY RUN] ${tipo.nombre} (${tipo.codigo})`, 'gray');
        continue;
      }
      await client.post('/ag_tipos_inasistencia:create', tipo);
      created++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
        log(`   "${tipo.nombre}" ya existe`, 'yellow');
      } else {
        log(`   Error: ${msg}`, 'red');
      }
    }
  }
  log(`   ${created} tipos de inasistencia creados.\n`, 'green');

  // Seed servicios
  log('Seeding servicios hospitalarios...', 'cyan');
  created = 0;
  for (const svc of SEED_SERVICIOS) {
    try {
      if (DRY_RUN) {
        log(`   [DRY RUN] ${svc.nombre} (${svc.codigo})`, 'gray');
        continue;
      }
      await client.post('/ag_servicios:create', svc);
      created++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
        log(`   "${svc.nombre}" ya existe`, 'yellow');
      } else {
        log(`   Error: ${msg}`, 'red');
      }
    }
  }
  log(`   ${created} servicios creados.\n`, 'green');
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('===============================================', 'cyan');
  log('  DEPLOY: AGENDA MEDICA — NocoBase Collections', 'cyan');
  log('===============================================\n', 'cyan');

  if (DRY_RUN) log('MODO DRY RUN — no se crearan datos reales.\n', 'yellow');

  if (!SEED_ONLY) {
    // Step 1: Create collections
    log('Paso 1: Crear colecciones...\n', 'cyan');
    let collectionsOk = 0;
    for (const col of COLLECTIONS) {
      const ok = await createCollectionSafe(col);
      if (ok) collectionsOk++;
    }
    log(`\n${collectionsOk}/${COLLECTIONS.length} colecciones listas.\n`, 'green');

    // Step 2: Add fields to each collection
    log('Paso 2: Crear campos...\n', 'cyan');
    let totalFields = 0;
    let fieldsOk = 0;
    for (const col of COLLECTIONS) {
      log(`\n  ${col.name} (${col.fields.length} campos)`, 'cyan');
      for (const field of col.fields) {
        totalFields++;
        const ok = await createFieldSafe(col.name, field);
        if (ok) fieldsOk++;
      }
    }
    log(`\n${fieldsOk}/${totalFields} campos creados.\n`, 'green');
  }

  // Step 3: Seed data
  await seedData();

  // Summary
  log('===============================================', 'green');
  log('  DEPLOY AGENDA COMPLETADO', 'green');
  log('===============================================', 'green');
}

main().catch(err => {
  log(`\nError fatal: ${err.message}`, 'red');
  process.exit(1);
});
