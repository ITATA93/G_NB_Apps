/**
 * deploy-ugco-full.ts — Full UGCO App Deployment Pipeline
 *
 * Orchestrates the complete deployment of UGCO (Oncología) to NocoBase:
 *   Phase 1: Verify API connection
 *   Phase 2: Deploy collections (create missing, skip existing)
 *   Phase 3: Deploy fields on each collection
 *   Phase 4: Deploy relationships (belongsTo, hasMany)
 *   Phase 5: Deploy roles and permissions
 *   Phase 6: Deploy UI pages with table blocks
 *   Phase 7: Inject simulated seed data
 *   Phase 8: Validate deployment (read-back verification)
 *
 * Usage:
 *   npx tsx Apps/UGCO/deploy-ugco-full.ts                    # Full deploy
 *   npx tsx Apps/UGCO/deploy-ugco-full.ts --dry-run           # Preview only
 *   npx tsx Apps/UGCO/deploy-ugco-full.ts --phase 2           # Run single phase
 *   npx tsx Apps/UGCO/deploy-ugco-full.ts --skip-seed         # Skip data injection
 *   npx tsx Apps/UGCO/deploy-ugco-full.ts --validate-only     # Only phase 8
 */

import { createClient, log, logAction } from '../../shared/scripts/ApiClient.ts';
import type { ApiClient } from '../../shared/scripts/ApiClient.ts';

// ─── Configuration ───────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_SEED = process.argv.includes('--skip-seed');
const VALIDATE_ONLY = process.argv.includes('--validate-only');
const PHASE_ARG = process.argv.indexOf('--phase');
const SINGLE_PHASE = PHASE_ARG !== -1 ? parseInt(process.argv[PHASE_ARG + 1]) : 0;

interface DeployResult {
    phase: string;
    success: number;
    skipped: number;
    errors: number;
    details: string[];
}

const results: DeployResult[] = [];
const decisions: string[] = [];

function decision(point: string, chosen: string, reason: string) {
    decisions.push(`${point} → ${chosen} (${reason})`);
}

// ─── UGCO Data Model Definition ──────────────────────────────────────────────

interface CollectionDef {
    name: string;
    title: string;
    fields: FieldDef[];
    relationships: RelationDef[];
}

interface FieldDef {
    name: string;
    type: string;
    interface: string;
    title: string;
    required?: boolean;
    options?: Array<{ value: string; label: string; color?: string }>;
}

interface RelationDef {
    name: string;
    type: 'belongsTo' | 'hasMany' | 'belongsToMany';
    target: string;
    foreignKey: string;
    title: string;
}

const UGCO_COLLECTIONS: CollectionDef[] = [
    {
        name: 'onco_casos',
        title: 'Casos Oncológicos',
        fields: [
            { name: 'paciente_rut', type: 'string', interface: 'input', title: 'RUT Paciente', required: true },
            { name: 'paciente_nombre', type: 'string', interface: 'input', title: 'Nombre Paciente', required: true },
            { name: 'fecha_ingreso', type: 'date', interface: 'datetime', title: 'Fecha Ingreso' },
            { name: 'diagnostico_principal', type: 'text', interface: 'textarea', title: 'Diagnóstico Principal' },
            { name: 'codigo_cie10', type: 'string', interface: 'input', title: 'Código CIE-10' },
            {
                name: 'estado', type: 'string', interface: 'select', title: 'Estado del Caso',
                options: [
                    { value: 'activo', label: 'Activo', color: 'green' },
                    { value: 'en_tratamiento', label: 'En Tratamiento', color: 'blue' },
                    { value: 'seguimiento', label: 'Seguimiento', color: 'orange' },
                    { value: 'cerrado', label: 'Cerrado', color: 'gray' },
                    { value: 'fallecido', label: 'Fallecido', color: 'red' },
                ]
            },
            {
                name: 'estadio_clinico', type: 'string', interface: 'select', title: 'Estadio Clínico',
                options: [
                    { value: 'I', label: 'Estadio I' }, { value: 'II', label: 'Estadio II' },
                    { value: 'III', label: 'Estadio III' }, { value: 'IV', label: 'Estadio IV' },
                    { value: 'no_aplica', label: 'No Aplica' },
                ]
            },
            { name: 'observaciones', type: 'text', interface: 'textarea', title: 'Observaciones' },
        ],
        relationships: [
            { name: 'responsible_doctor', type: 'belongsTo', target: 'staff', foreignKey: 'responsible_doctor_id', title: 'Médico Responsable' },
            { name: 'episodios', type: 'hasMany', target: 'onco_episodios', foreignKey: 'caso_id', title: 'Episodios' },
            { name: 'comite_presentaciones', type: 'hasMany', target: 'onco_comite_casos', foreignKey: 'caso_id', title: 'Presentaciones en Comité' },
        ],
    },
    {
        name: 'onco_episodios',
        title: 'Episodios Oncológicos',
        fields: [
            { name: 'fecha', type: 'date', interface: 'datetime', title: 'Fecha', required: true },
            {
                name: 'tipo_episodio', type: 'string', interface: 'select', title: 'Tipo de Episodio',
                options: [
                    { value: 'cirugia', label: 'Cirugía' },
                    { value: 'quimioterapia', label: 'Quimioterapia' },
                    { value: 'radioterapia', label: 'Radioterapia' },
                    { value: 'inmunoterapia', label: 'Inmunoterapia' },
                    { value: 'biopsia', label: 'Biopsia' },
                    { value: 'consulta', label: 'Consulta' },
                    { value: 'control', label: 'Control' },
                    { value: 'imagen', label: 'Imagen' },
                    { value: 'laboratorio', label: 'Laboratorio' },
                ]
            },
            { name: 'descripcion', type: 'text', interface: 'textarea', title: 'Descripción' },
            {
                name: 'estado_episodio', type: 'string', interface: 'select', title: 'Estado',
                options: [
                    { value: 'programado', label: 'Programado', color: 'blue' },
                    { value: 'en_curso', label: 'En Curso', color: 'orange' },
                    { value: 'completado', label: 'Completado', color: 'green' },
                    { value: 'cancelado', label: 'Cancelado', color: 'red' },
                ]
            },
            { name: 'resultado', type: 'text', interface: 'textarea', title: 'Resultado' },
            { name: 'notas_clinicas', type: 'text', interface: 'textarea', title: 'Notas Clínicas' },
        ],
        relationships: [
            { name: 'caso', type: 'belongsTo', target: 'onco_casos', foreignKey: 'caso_id', title: 'Caso Oncológico' },
        ],
    },
    {
        name: 'onco_comite_sesiones',
        title: 'Sesiones de Comité Oncológico',
        fields: [
            { name: 'fecha', type: 'date', interface: 'datetime', title: 'Fecha de Sesión', required: true },
            { name: 'numero_sesion', type: 'string', interface: 'input', title: 'Número de Sesión' },
            {
                name: 'tipo_comite', type: 'string', interface: 'select', title: 'Tipo de Comité',
                options: [
                    { value: 'ordinario', label: 'Ordinario' },
                    { value: 'extraordinario', label: 'Extraordinario' },
                ]
            },
            {
                name: 'estado_sesion', type: 'string', interface: 'select', title: 'Estado',
                options: [
                    { value: 'programada', label: 'Programada', color: 'blue' },
                    { value: 'en_curso', label: 'En Curso', color: 'orange' },
                    { value: 'finalizada', label: 'Finalizada', color: 'green' },
                    { value: 'cancelada', label: 'Cancelada', color: 'red' },
                ]
            },
            { name: 'acta', type: 'text', interface: 'textarea', title: 'Acta' },
            { name: 'asistentes', type: 'text', interface: 'textarea', title: 'Asistentes' },
        ],
        relationships: [
            { name: 'casos_presentados', type: 'hasMany', target: 'onco_comite_casos', foreignKey: 'sesion_id', title: 'Casos Presentados' },
        ],
    },
    {
        name: 'onco_comite_casos',
        title: 'Casos Presentados en Comité',
        fields: [
            { name: 'fecha_presentacion', type: 'date', interface: 'datetime', title: 'Fecha de Presentación' },
            { name: 'decision', type: 'text', interface: 'textarea', title: 'Decisión del Comité' },
            { name: 'recomendacion', type: 'text', interface: 'textarea', title: 'Recomendación' },
            {
                name: 'prioridad', type: 'string', interface: 'select', title: 'Prioridad',
                options: [
                    { value: 'urgente', label: 'Urgente', color: 'red' },
                    { value: 'alta', label: 'Alta', color: 'orange' },
                    { value: 'normal', label: 'Normal', color: 'blue' },
                    { value: 'baja', label: 'Baja', color: 'gray' },
                ]
            },
            { name: 'seguimiento_requerido', type: 'boolean', interface: 'checkbox', title: 'Seguimiento Requerido' },
        ],
        relationships: [
            { name: 'caso', type: 'belongsTo', target: 'onco_casos', foreignKey: 'caso_id', title: 'Caso Oncológico' },
            { name: 'sesion', type: 'belongsTo', target: 'onco_comite_sesiones', foreignKey: 'sesion_id', title: 'Sesión del Comité' },
        ],
    },
];

// ─── UGCO Roles Definition ──────────────────────────────────────────────────

interface RoleDef {
    name: string;
    title: string;
    permissions: Array<{ collection: string; actions: string[] }>;
}

const UGCO_ROLES: RoleDef[] = [
    {
        name: 'medico_oncologo',
        title: 'Médico Oncólogo',
        permissions: [
            { collection: 'onco_casos', actions: ['list', 'view', 'create', 'update'] },
            { collection: 'onco_episodios', actions: ['list', 'view', 'create', 'update'] },
            { collection: 'onco_comite_sesiones', actions: ['list', 'view'] },
            { collection: 'onco_comite_casos', actions: ['list', 'view', 'create'] },
        ],
    },
    {
        name: 'enfermera_gestora_onco',
        title: 'Enfermera Gestora Oncología',
        permissions: [
            { collection: 'onco_casos', actions: ['list', 'view', 'create', 'update'] },
            { collection: 'onco_episodios', actions: ['list', 'view', 'create', 'update'] },
            { collection: 'onco_comite_sesiones', actions: ['list', 'view', 'create', 'update'] },
            { collection: 'onco_comite_casos', actions: ['list', 'view', 'create', 'update'] },
        ],
    },
    {
        name: 'admin_ugco',
        title: 'Administrador UGCO',
        permissions: [
            { collection: 'onco_casos', actions: ['list', 'view', 'create', 'update', 'destroy', 'export'] },
            { collection: 'onco_episodios', actions: ['list', 'view', 'create', 'update', 'destroy', 'export'] },
            { collection: 'onco_comite_sesiones', actions: ['list', 'view', 'create', 'update', 'destroy', 'export'] },
            { collection: 'onco_comite_casos', actions: ['list', 'view', 'create', 'update', 'destroy', 'export'] },
        ],
    },
];

// ─── Simulated Seed Data ─────────────────────────────────────────────────────

const SEED_CASOS = [
    { paciente_rut: '12.345.678-9', paciente_nombre: 'María González Pérez', fecha_ingreso: '2026-01-15', diagnostico_principal: 'Carcinoma ductal invasivo de mama', codigo_cie10: 'C50.9', estado: 'en_tratamiento', estadio_clinico: 'II', observaciones: 'Paciente derivada desde APS. Biopsia confirma CDI grado 2.' },
    { paciente_rut: '11.222.333-4', paciente_nombre: 'Juan Carlos Muñoz Silva', fecha_ingreso: '2026-01-20', diagnostico_principal: 'Adenocarcinoma de colon', codigo_cie10: 'C18.9', estado: 'activo', estadio_clinico: 'III', observaciones: 'Derivado por colonoscopia con lesión estenosante. TC TAP en curso.' },
    { paciente_rut: '15.678.901-2', paciente_nombre: 'Carmen Rosa Torres Díaz', fecha_ingreso: '2026-02-01', diagnostico_principal: 'Cáncer pulmonar de células no pequeñas', codigo_cie10: 'C34.9', estado: 'en_tratamiento', estadio_clinico: 'IV', observaciones: 'Metástasis óseas. Inicio quimioterapia paliativa.' },
    { paciente_rut: '9.876.543-K', paciente_nombre: 'Roberto Andrés Figueroa López', fecha_ingreso: '2026-02-10', diagnostico_principal: 'Linfoma de Hodgkin', codigo_cie10: 'C81.9', estado: 'activo', estadio_clinico: 'II', observaciones: 'Adulto joven. PET-CT confirma compromiso mediastínico.' },
    { paciente_rut: '14.567.890-1', paciente_nombre: 'Ana María Sepúlveda Cortés', fecha_ingreso: '2026-02-15', diagnostico_principal: 'Carcinoma cervicouterino', codigo_cie10: 'C53.9', estado: 'seguimiento', estadio_clinico: 'I', observaciones: 'Tratamiento QT-RT completado. En controles cada 3 meses.' },
];

const SEED_EPISODIOS = [
    { fecha: '2026-01-20', tipo_episodio: 'biopsia', descripcion: 'Biopsia core guiada por ecografía mamaria', estado_episodio: 'completado', resultado: 'CDI grado 2, RE+, RP+, HER2-', notas_clinicas: 'Muestra enviada a anatomía patológica' },
    { fecha: '2026-02-05', tipo_episodio: 'cirugia', descripcion: 'Mastectomía parcial + biopsia ganglio centinela', estado_episodio: 'completado', resultado: 'Márgenes libres. GC negativo (0/3)', notas_clinicas: 'Sin complicaciones post-operatorias' },
    { fecha: '2026-02-20', tipo_episodio: 'quimioterapia', descripcion: 'Ciclo 1 AC (Adriamicina + Ciclofosfamida)', estado_episodio: 'completado', resultado: 'Tolerancia adecuada. Neutropenia grado 1', notas_clinicas: 'Control hemograma en 7 días' },
    { fecha: '2026-01-25', tipo_episodio: 'consulta', descripcion: 'Evaluación inicial por equipo oncológico', estado_episodio: 'completado', resultado: 'Se indica TC TAP y CEA', notas_clinicas: 'Paciente informado del diagnóstico' },
    { fecha: '2026-02-08', tipo_episodio: 'imagen', descripcion: 'TC Tórax-Abdomen-Pelvis con contraste', estado_episodio: 'completado', resultado: 'Lesión en colon ascendente. Sin metástasis a distancia', notas_clinicas: 'Programar cirugía' },
    { fecha: '2026-03-01', tipo_episodio: 'quimioterapia', descripcion: 'Ciclo 1 Cisplatino + Pemetrexed', estado_episodio: 'programado', resultado: '', notas_clinicas: 'Esquema paliativo. Premedicación con dexametasona' },
    { fecha: '2026-02-12', tipo_episodio: 'biopsia', descripcion: 'Biopsia de ganglio mediastínico por EBUS', estado_episodio: 'completado', resultado: 'Linfoma de Hodgkin clásico, esclerosis nodular', notas_clinicas: 'Derivar a hematología' },
    { fecha: '2026-02-20', tipo_episodio: 'control', descripcion: 'Control post-tratamiento 3 meses', estado_episodio: 'completado', resultado: 'Sin evidencia de recurrencia', notas_clinicas: 'PAP normal. Próximo control en 3 meses' },
];

const SEED_SESIONES = [
    { fecha: '2026-02-05', numero_sesion: 'COM-2026-001', tipo_comite: 'ordinario', estado_sesion: 'finalizada', acta: 'Se revisaron 3 casos nuevos. Decisiones registradas en casos individuales.', asistentes: 'Dr. Pérez (Onc), Dr. Morales (Cir), Dra. Soto (Rad), Enf. López (GC)' },
    { fecha: '2026-02-19', numero_sesion: 'COM-2026-002', tipo_comite: 'ordinario', estado_sesion: 'finalizada', acta: 'Se revisaron 2 casos en seguimiento y 1 caso nuevo.', asistentes: 'Dr. Pérez (Onc), Dr. Morales (Cir), Dra. Soto (Rad), Enf. López (GC), Dr. Ríos (Hem)' },
    { fecha: '2026-03-05', numero_sesion: 'COM-2026-003', tipo_comite: 'ordinario', estado_sesion: 'programada', acta: '', asistentes: '' },
];

const SEED_COMITE_CASOS = [
    { fecha_presentacion: '2026-02-05', decision: 'Iniciar QT neoadyuvante AC x4 seguida de Taxanos x4', recomendacion: 'Control con mamografía post-QT para evaluar respuesta', prioridad: 'alta', seguimiento_requerido: true },
    { fecha_presentacion: '2026-02-05', decision: 'Cirugía: hemicolectomía derecha. QT adyuvante posterior', recomendacion: 'FOLFOX x6 meses post-cirugía', prioridad: 'urgente', seguimiento_requerido: true },
    { fecha_presentacion: '2026-02-05', decision: 'QT paliativa con Cisplatino-Pemetrexed. Cuidados paliativos', recomendacion: 'Interconsulta a unidad del dolor', prioridad: 'urgente', seguimiento_requerido: true },
    { fecha_presentacion: '2026-02-19', decision: 'Protocolo ABVD x6 ciclos', recomendacion: 'PET-CT interim post ciclo 2', prioridad: 'alta', seguimiento_requerido: true },
    { fecha_presentacion: '2026-02-19', decision: 'Mantener seguimiento trimestral', recomendacion: 'PAP + colposcopía cada 6 meses', prioridad: 'normal', seguimiento_requerido: false },
];

// ─── Phase 1: Verify Connection ──────────────────────────────────────────────

async function phase1_verifyConnection(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 1: Verify API Connection', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '1-connection', success: 0, skipped: 0, errors: 0, details: [] };

    if (DRY_RUN) {
        log('  [DRY-RUN] Skipping connection check', 'yellow');
        result.skipped = 1;
        result.details.push('Connection check skipped (dry-run)');
        results.push(result);
        return true;
    }

    try {
        const resp = await api.get('/app:getLang');
        log(`  API connected: ${api.getBaseUrl()}`, 'green');
        log(`  Language: ${resp.data || 'N/A'}`, 'gray');
        result.success = 1;
        result.details.push(`Connected to ${api.getBaseUrl()}`);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  Connection FAILED: ${msg}`, 'red');
        result.errors = 1;
        result.details.push(`Connection failed: ${msg}`);
        results.push(result);
        return false;
    }

    // Verify collections endpoint is accessible
    try {
        const colResp = await api.get('/collections:list', { pageSize: 5 });
        const count = (colResp.data || []).length;
        log(`  Collections API OK (${count}+ collections visible)`, 'green');
        result.success++;
        result.details.push(`Collections API accessible (${count}+ visible)`);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  Collections API failed: ${msg}`, 'red');
        result.errors++;
        result.details.push(`Collections API error: ${msg}`);
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 2: Deploy Collections ─────────────────────────────────────────────

async function phase2_deployCollections(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 2: Deploy Collections', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '2-collections', success: 0, skipped: 0, errors: 0, details: [] };

    // Fetch existing collections
    let existingNames: Set<string> = new Set();
    if (!DRY_RUN) {
        try {
            const resp = await api.get('/collections:list', { pageSize: 200 });
            const cols = resp.data || [];
            existingNames = new Set(cols.map((c: Record<string, unknown>) => c.name as string));
            log(`  Existing collections: ${existingNames.size}`, 'gray');
        } catch {
            log('  Warning: could not fetch existing collections', 'yellow');
        }
    }

    for (const col of UGCO_COLLECTIONS) {
        if (existingNames.has(col.name)) {
            log(`  [SKIP] ${col.name} — already exists`, 'yellow');
            result.skipped++;
            result.details.push(`${col.name}: skipped (exists)`);
            continue;
        }

        if (DRY_RUN) {
            log(`  [DRY-RUN] Would create: ${col.name} (${col.title})`, 'yellow');
            result.skipped++;
            continue;
        }

        try {
            await api.post('/collections:create', {
                name: col.name,
                title: col.title,
                fields: [],
                autoGenId: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
                sortable: true,
            });
            log(`  [OK] ${col.name} (${col.title})`, 'green');
            result.success++;
            result.details.push(`${col.name}: created`);
            logAction('Created collection', { name: col.name, title: col.title });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`  [ERR] ${col.name}: ${msg}`, 'red');
            result.errors++;
            result.details.push(`${col.name}: error — ${msg}`);
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 3: Deploy Fields ──────────────────────────────────────────────────

function buildUiSchema(field: FieldDef): Record<string, unknown> {
    const schema: Record<string, unknown> = { title: field.title, type: 'string' };

    const componentMap: Record<string, string> = {
        input: 'Input', textarea: 'Input.TextArea', datetime: 'DatePicker',
        select: 'Select', checkbox: 'Checkbox', integer: 'InputNumber',
    };
    schema['x-component'] = componentMap[field.interface] || 'Input';

    if (field.options) {
        schema.enum = field.options;
    }

    return schema;
}

async function phase3_deployFields(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 3: Deploy Fields', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '3-fields', success: 0, skipped: 0, errors: 0, details: [] };

    for (const col of UGCO_COLLECTIONS) {
        log(`\n  Collection: ${col.name}`, 'white');

        // Fetch existing fields
        let existingFields: Set<string> = new Set();
        if (!DRY_RUN) {
            try {
                const resp = await api.get(`/collections/${col.name}/fields:list`, { pageSize: 200 });
                existingFields = new Set((resp.data || []).map((f: Record<string, unknown>) => f.name as string));
            } catch { /* collection might not exist yet in dry-run */ }
        }

        for (const field of col.fields) {
            if (existingFields.has(field.name)) {
                log(`    [SKIP] ${field.name} — exists`, 'yellow');
                result.skipped++;
                continue;
            }

            if (DRY_RUN) {
                log(`    [DRY-RUN] Would create: ${field.name} (${field.type}/${field.interface})`, 'yellow');
                result.skipped++;
                continue;
            }

            try {
                const data: Record<string, unknown> = {
                    name: field.name,
                    type: field.type,
                    interface: field.interface,
                    uiSchema: buildUiSchema(field),
                };
                if (field.required) data.required = true;

                await api.post(`/collections/${col.name}/fields:create`, data);
                log(`    [OK] ${field.name} (${field.type})`, 'green');
                result.success++;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                log(`    [ERR] ${field.name}: ${msg}`, 'red');
                result.errors++;
                result.details.push(`${col.name}.${field.name}: error — ${msg}`);
            }
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 4: Deploy Relationships ───────────────────────────────────────────

async function phase4_deployRelationships(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 4: Deploy Relationships', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '4-relationships', success: 0, skipped: 0, errors: 0, details: [] };

    for (const col of UGCO_COLLECTIONS) {
        if (col.relationships.length === 0) continue;
        log(`\n  Collection: ${col.name}`, 'white');

        // Fetch existing fields to check for existing relationships
        let existingFields: Set<string> = new Set();
        if (!DRY_RUN) {
            try {
                const resp = await api.get(`/collections/${col.name}/fields:list`, { pageSize: 200 });
                existingFields = new Set((resp.data || []).map((f: Record<string, unknown>) => f.name as string));
            } catch { /* ignore */ }
        }

        for (const rel of col.relationships) {
            if (existingFields.has(rel.name) || existingFields.has(rel.foreignKey)) {
                log(`    [SKIP] ${rel.name} → ${rel.target} — exists`, 'yellow');
                result.skipped++;
                continue;
            }

            if (DRY_RUN) {
                log(`    [DRY-RUN] Would create: ${rel.name} (${rel.type}) → ${rel.target}`, 'yellow');
                result.skipped++;
                continue;
            }

            try {
                const data: Record<string, unknown> = {
                    name: rel.name,
                    type: rel.type,
                    target: rel.target,
                    foreignKey: rel.foreignKey,
                    uiSchema: {
                        title: rel.title,
                        'x-component': 'AssociationField',
                        'x-component-props': { multiple: rel.type === 'hasMany' },
                    },
                };
                if (rel.type === 'belongsTo') {
                    data.interface = 'obo';
                } else if (rel.type === 'hasMany') {
                    data.interface = 'o2m';
                }

                await api.post(`/collections/${col.name}/fields:create`, data);
                log(`    [OK] ${rel.name} (${rel.type}) → ${rel.target}`, 'green');
                result.success++;
                logAction('Created relationship', { collection: col.name, name: rel.name, target: rel.target });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                log(`    [ERR] ${rel.name}: ${msg}`, 'red');
                result.errors++;
                result.details.push(`${col.name}.${rel.name}: error — ${msg}`);
            }
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 5: Deploy Roles & Permissions ─────────────────────────────────────

async function phase5_deployRoles(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 5: Deploy Roles & Permissions', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '5-roles', success: 0, skipped: 0, errors: 0, details: [] };

    // Fetch existing roles
    let existingRoles: Set<string> = new Set();
    if (!DRY_RUN) {
        try {
            const resp = await api.get('/roles:list', { pageSize: 200 });
            existingRoles = new Set((resp.data || []).map((r: Record<string, unknown>) => r.name as string));
        } catch { /* ignore */ }
    }

    for (const role of UGCO_ROLES) {
        // Create role
        if (existingRoles.has(role.name)) {
            log(`  [SKIP] Role ${role.name} — exists`, 'yellow');
            result.skipped++;
        } else if (DRY_RUN) {
            log(`  [DRY-RUN] Would create role: ${role.name} (${role.title})`, 'yellow');
            result.skipped++;
        } else {
            try {
                await api.post('/roles:create', { name: role.name, title: role.title });
                log(`  [OK] Role ${role.name} (${role.title})`, 'green');
                result.success++;
                logAction('Created role', { name: role.name, title: role.title });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                log(`  [ERR] Role ${role.name}: ${msg}`, 'red');
                result.errors++;
                continue;
            }
        }

        // Grant permissions
        if (DRY_RUN) {
            for (const perm of role.permissions) {
                log(`    [DRY-RUN] Would grant ${perm.actions.join(',')} on ${perm.collection}`, 'yellow');
            }
            continue;
        }

        for (const perm of role.permissions) {
            try {
                await api.post(`/roles/${role.name}/resources:create`, {
                    name: perm.collection,
                    usingActionsConfig: true,
                    actions: perm.actions.map(name => ({ name, fields: [] })),
                });
                log(`    [OK] ${role.name} → ${perm.collection}: ${perm.actions.join(', ')}`, 'green');
                result.success++;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                // Permission might already exist — log as warning
                log(`    [WARN] ${role.name} → ${perm.collection}: ${msg}`, 'yellow');
                result.skipped++;
            }
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 6: Deploy UI Pages ────────────────────────────────────────────────

async function phase6_deployUI(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 6: Deploy UI Pages & Blocks', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '6-ui', success: 0, skipped: 0, errors: 0, details: [] };

    if (DRY_RUN) {
        log('  [DRY-RUN] Would create UGCO menu group with 4 pages', 'yellow');
        log('    - Casos Oncológicos (table)', 'yellow');
        log('    - Episodios (table)', 'yellow');
        log('    - Comité Sesiones (table)', 'yellow');
        log('    - Comité Casos (table)', 'yellow');
        result.skipped = 5;
        results.push(result);
        return true;
    }

    // 1. Create menu group
    let groupId: number;
    try {
        const resp = await api.post('/desktopRoutes:create', {
            type: 'group',
            title: 'UGCO - Oncología',
            icon: 'MedicineBoxOutlined',
        });
        const data = (resp as Record<string, unknown>).data as Record<string, unknown>;
        groupId = data.id as number;
        log(`  [OK] Menu group created: UGCO - Oncología (ID: ${groupId})`, 'green');
        result.success++;
        logAction('Created menu group', { title: 'UGCO - Oncología', id: groupId });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  [ERR] Menu group: ${msg}`, 'red');
        result.errors++;
        results.push(result);
        return false;
    }

    // 2. Create pages with table blocks
    const pageDefs = [
        { title: 'Casos Oncológicos', icon: 'FileTextOutlined', collection: 'onco_casos',
          columns: ['paciente_rut', 'paciente_nombre', 'diagnostico_principal', 'estado', 'estadio_clinico', 'fecha_ingreso'] },
        { title: 'Episodios', icon: 'CalendarOutlined', collection: 'onco_episodios',
          columns: ['fecha', 'tipo_episodio', 'descripcion', 'estado_episodio', 'resultado'] },
        { title: 'Sesiones Comité', icon: 'TeamOutlined', collection: 'onco_comite_sesiones',
          columns: ['fecha', 'numero_sesion', 'tipo_comite', 'estado_sesion', 'asistentes'] },
        { title: 'Casos en Comité', icon: 'AuditOutlined', collection: 'onco_comite_casos',
          columns: ['fecha_presentacion', 'decision', 'prioridad', 'seguimiento_requerido'] },
    ];

    for (const pageDef of pageDefs) {
        try {
            // Create route
            const routeResp = await api.post('/desktopRoutes:create', {
                type: 'page', title: pageDef.title, icon: pageDef.icon, parentId: groupId,
            });
            const routeData = (routeResp as Record<string, unknown>).data as Record<string, unknown>;
            const routeId = routeData.id as number;

            // Create Page schema with Grid
            const pageSchema = {
                type: 'void', 'x-component': 'Page', 'x-async': true,
                properties: {
                    grid: {
                        type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock',
                        properties: {}
                    }
                }
            };
            const schemaResp = await api.post('/uiSchemas:insert', pageSchema);
            const schemaData = schemaResp as Record<string, unknown>;
            const pageUid = (schemaData.data as Record<string, unknown>)?.['x-uid'] as string;

            // Bind schema to route
            await api.post(`/desktopRoutes:update?filterByTk=${routeId}`, { schemaUid: pageUid });

            // Get Grid UID
            const fullSchema = await api.get(`/uiSchemas:getJsonSchema/${pageUid}`);
            const fullData = (fullSchema as Record<string, unknown>).data as Record<string, unknown>;
            const props = fullData?.properties as Record<string, Record<string, unknown>> | undefined;
            let gridUid = pageUid;
            if (props) {
                const gridChild = Object.values(props)[0];
                if (gridChild?.['x-uid']) gridUid = gridChild['x-uid'] as string;
            }

            // Build table block columns
            const colProps: Record<string, unknown> = {};
            pageDef.columns.forEach((colName, idx) => {
                colProps[colName] = {
                    type: 'void', 'x-component': 'TableV2.Column',
                    'x-decorator': 'TableV2.Column.Decorator',
                    'x-component-props': { width: 180 },
                    properties: {
                        [colName]: {
                            type: 'string', 'x-component': 'CollectionField',
                            'x-read-pretty': true,
                            'x-collection-field': `${pageDef.collection}.${colName}`,
                            'x-decorator': 'FormItem',
                        }
                    },
                    'x-index': idx + 1,
                };
            });

            // Build and insert table block
            const tableBlock = {
                type: 'void', 'x-component': 'Grid.Row',
                properties: {
                    col1: {
                        type: 'void', 'x-component': 'Grid.Col',
                        properties: {
                            block1: {
                                type: 'void',
                                'x-decorator': 'TableBlockProvider',
                                'x-decorator-props': {
                                    collection: pageDef.collection, dataSource: 'main',
                                    action: 'list', params: { pageSize: 20 },
                                },
                                'x-component': 'CardItem',
                                'x-component-props': { title: pageDef.title },
                                properties: {
                                    actions: {
                                        type: 'void', 'x-component': 'ActionBar',
                                        'x-component-props': { style: { marginBottom: 16 } },
                                        properties: {
                                            filter: { type: 'void', title: 'Filtrar', 'x-component': 'Filter.Action', 'x-action': 'filter', 'x-component-props': { icon: 'FilterOutlined' } },
                                            create: { type: 'void', title: 'Nuevo', 'x-component': 'Action', 'x-action': 'create', 'x-component-props': { type: 'primary', icon: 'PlusOutlined' }, 'x-decorator': 'ACLActionProvider' },
                                            export: { type: 'void', title: 'Exportar', 'x-component': 'Action', 'x-action': 'export', 'x-component-props': { icon: 'DownloadOutlined' } },
                                        },
                                    },
                                    table: {
                                        type: 'array', 'x-component': 'TableV2',
                                        'x-use-component-props': 'useTableBlockProps',
                                        'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                                        properties: colProps,
                                    }
                                }
                            }
                        }
                    }
                }
            };

            await api.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, { schema: tableBlock });

            log(`  [OK] Page: ${pageDef.title} (route=${routeId}, grid=${gridUid})`, 'green');
            result.success++;
            result.details.push(`${pageDef.title}: route=${routeId}`);
            logAction('Created page', { title: pageDef.title, routeId, gridUid });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`  [ERR] Page ${pageDef.title}: ${msg}`, 'red');
            result.errors++;
            result.details.push(`${pageDef.title}: error — ${msg}`);
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 7: Inject Seed Data ───────────────────────────────────────────────

async function phase7_seedData(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 7: Inject Simulated Seed Data', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    if (SKIP_SEED) {
        log('  [SKIP] Seed data injection skipped (--skip-seed)', 'yellow');
        results.push({ phase: '7-seed', success: 0, skipped: 1, errors: 0, details: ['Skipped by flag'] });
        return true;
    }

    const result: DeployResult = { phase: '7-seed', success: 0, skipped: 0, errors: 0, details: [] };

    // Seed cases
    const casoIds: number[] = [];
    log('  Seeding onco_casos...', 'white');
    for (const caso of SEED_CASOS) {
        if (DRY_RUN) {
            log(`    [DRY-RUN] Would create: ${caso.paciente_nombre}`, 'yellow');
            result.skipped++;
            continue;
        }
        try {
            const resp = await api.post('/onco_casos:create', caso as unknown as Record<string, unknown>);
            const id = (resp.data as Record<string, unknown>)?.id as number;
            casoIds.push(id);
            log(`    [OK] ${caso.paciente_nombre} (ID: ${id})`, 'green');
            result.success++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`    [ERR] ${caso.paciente_nombre}: ${msg}`, 'red');
            result.errors++;
        }
    }

    // Seed episodes (linked to first 2 cases for the first episodes, etc.)
    log('\n  Seeding onco_episodios...', 'white');
    const casoMapping = [0, 0, 0, 1, 1, 2, 3, 4]; // episode index → caso index
    for (let i = 0; i < SEED_EPISODIOS.length; i++) {
        const ep = SEED_EPISODIOS[i];
        const casoId = casoIds[casoMapping[i]] || casoIds[0];

        if (DRY_RUN) {
            log(`    [DRY-RUN] Would create: ${ep.tipo_episodio} (${ep.fecha})`, 'yellow');
            result.skipped++;
            continue;
        }
        try {
            const resp = await api.post('/onco_episodios:create', { ...ep, caso_id: casoId } as unknown as Record<string, unknown>);
            const id = (resp.data as Record<string, unknown>)?.id as number;
            log(`    [OK] ${ep.tipo_episodio} ${ep.fecha} → caso ${casoId} (ID: ${id})`, 'green');
            result.success++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`    [ERR] ${ep.tipo_episodio}: ${msg}`, 'red');
            result.errors++;
        }
    }

    // Seed committee sessions
    const sesionIds: number[] = [];
    log('\n  Seeding onco_comite_sesiones...', 'white');
    for (const sesion of SEED_SESIONES) {
        if (DRY_RUN) {
            log(`    [DRY-RUN] Would create: ${sesion.numero_sesion}`, 'yellow');
            result.skipped++;
            continue;
        }
        try {
            const resp = await api.post('/onco_comite_sesiones:create', sesion as unknown as Record<string, unknown>);
            const id = (resp.data as Record<string, unknown>)?.id as number;
            sesionIds.push(id);
            log(`    [OK] ${sesion.numero_sesion} (ID: ${id})`, 'green');
            result.success++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`    [ERR] ${sesion.numero_sesion}: ${msg}`, 'red');
            result.errors++;
        }
    }

    // Seed committee cases (linked to cases and sessions)
    log('\n  Seeding onco_comite_casos...', 'white');
    const comiteCasoMapping = [
        { caso: 0, sesion: 0 }, { caso: 1, sesion: 0 }, { caso: 2, sesion: 0 },
        { caso: 3, sesion: 1 }, { caso: 4, sesion: 1 },
    ];
    for (let i = 0; i < SEED_COMITE_CASOS.length; i++) {
        const cc = SEED_COMITE_CASOS[i];
        const mapping = comiteCasoMapping[i];
        const casoId = casoIds[mapping.caso] || casoIds[0];
        const sesionId = sesionIds[mapping.sesion] || sesionIds[0];

        if (DRY_RUN) {
            log(`    [DRY-RUN] Would create: caso→${mapping.caso} sesion→${mapping.sesion}`, 'yellow');
            result.skipped++;
            continue;
        }
        try {
            const resp = await api.post('/onco_comite_casos:create', {
                ...cc, caso_id: casoId, sesion_id: sesionId,
            } as unknown as Record<string, unknown>);
            const id = (resp.data as Record<string, unknown>)?.id as number;
            log(`    [OK] Comité caso → caso=${casoId}, sesion=${sesionId} (ID: ${id})`, 'green');
            result.success++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`    [ERR] ${msg}`, 'red');
            result.errors++;
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Phase 8: Validate Deployment ────────────────────────────────────────────

async function phase8_validate(api: ApiClient): Promise<boolean> {
    log('\n══════════════════════════════════════════════════════', 'cyan');
    log('  PHASE 8: Validate Deployment (Visual API Verification)', 'cyan');
    log('══════════════════════════════════════════════════════\n', 'cyan');

    const result: DeployResult = { phase: '8-validation', success: 0, skipped: 0, errors: 0, details: [] };

    if (DRY_RUN) {
        log('  [DRY-RUN] Validation skipped', 'yellow');
        result.skipped = 1;
        results.push(result);
        return true;
    }

    // Validate collections exist
    log('  Checking collections...', 'white');
    for (const col of UGCO_COLLECTIONS) {
        try {
            const resp = await api.get('/collections:get', { filterByTk: col.name, appends: ['fields'] });
            const data = resp.data as Record<string, unknown>;
            const fieldCount = ((data.fields || []) as unknown[]).length;
            log(`    [OK] ${col.name}: ${fieldCount} fields`, 'green');
            result.success++;
            result.details.push(`${col.name}: ${fieldCount} fields verified`);
        } catch {
            log(`    [FAIL] ${col.name}: NOT FOUND`, 'red');
            result.errors++;
            result.details.push(`${col.name}: MISSING`);
        }
    }

    // Validate data counts
    log('\n  Checking record counts...', 'white');
    const expectedCounts: Record<string, number> = {
        onco_casos: SEED_CASOS.length,
        onco_episodios: SEED_EPISODIOS.length,
        onco_comite_sesiones: SEED_SESIONES.length,
        onco_comite_casos: SEED_COMITE_CASOS.length,
    };

    for (const [colName, expected] of Object.entries(expectedCounts)) {
        try {
            const resp = await api.get(`/${colName}:list`, { pageSize: 1 });
            const meta = resp.meta as Record<string, unknown> | undefined;
            const count = meta?.count ?? ((resp.data || []) as unknown[]).length;
            const match = Number(count) >= expected;
            log(`    ${match ? '[OK]' : '[WARN]'} ${colName}: ${count} records (expected ≥${expected})`, match ? 'green' : 'yellow');
            if (match) result.success++; else result.skipped++;
            result.details.push(`${colName}: ${count} records`);
        } catch {
            log(`    [FAIL] ${colName}: could not count`, 'red');
            result.errors++;
        }
    }

    // Validate roles
    log('\n  Checking roles...', 'white');
    for (const role of UGCO_ROLES) {
        try {
            await api.get('/roles:get', { filterByTk: role.name });
            log(`    [OK] Role: ${role.name}`, 'green');
            result.success++;
        } catch {
            log(`    [FAIL] Role: ${role.name} NOT FOUND`, 'red');
            result.errors++;
            result.details.push(`Role ${role.name}: MISSING`);
        }
    }

    // Validate UI routes
    log('\n  Checking UI routes...', 'white');
    try {
        const routeResp = await api.get('/desktopRoutes:list', { pageSize: 200 });
        const routes = (routeResp.data || []) as Array<Record<string, unknown>>;
        const ugcoGroup = routes.find(r => r.title === 'UGCO - Oncología');
        if (ugcoGroup) {
            log(`    [OK] Menu group: UGCO - Oncología (ID: ${ugcoGroup.id})`, 'green');
            result.success++;

            // Check child pages
            const children = routes.filter(r => r.parentId === ugcoGroup.id);
            log(`    [OK] Child pages: ${children.length}`, 'green');
            for (const child of children) {
                log(`      - ${child.title} (schema: ${child.schemaUid || 'none'})`, 'gray');
            }
            result.success++;
            result.details.push(`UI: ${children.length} pages under UGCO group`);
        } else {
            log(`    [FAIL] Menu group UGCO - Oncología NOT FOUND`, 'red');
            result.errors++;
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`    [FAIL] Routes check: ${msg}`, 'red');
        result.errors++;
    }

    // Visual data preview
    log('\n  Visual Data Preview (first 3 records per collection)...', 'white');
    for (const col of UGCO_COLLECTIONS) {
        try {
            const resp = await api.get(`/${col.name}:list`, { pageSize: 3 });
            const records = (resp.data || []) as Array<Record<string, unknown>>;
            log(`\n    ${col.title} (${col.name}):`, 'cyan');
            if (records.length === 0) {
                log('      (empty)', 'yellow');
            } else {
                for (const record of records) {
                    const keys = Object.keys(record).filter(k =>
                        !['createdAt', 'updatedAt', 'createdById', 'updatedById', 'sort'].includes(k)
                    ).slice(0, 5);
                    const vals = keys.map(k => `${k}=${String(record[k]).slice(0, 25)}`).join(' | ');
                    log(`      [${record.id}] ${vals}`, 'white');
                }
            }
        } catch {
            log(`    ${col.name}: could not fetch preview`, 'yellow');
        }
    }

    results.push(result);
    return result.errors === 0;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
    log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║    UGCO Full Deployment Pipeline                              ║', 'cyan');
    log('║    Hospital de Ovalle — Sistema de Gestión Oncológica         ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');

    if (DRY_RUN) log('\n  MODE: DRY-RUN (no changes will be applied)\n', 'yellow');
    if (SKIP_SEED) log('  FLAG: --skip-seed (seed data will be skipped)\n', 'yellow');
    if (VALIDATE_ONLY) log('  FLAG: --validate-only (only validation)\n', 'yellow');
    if (SINGLE_PHASE) log(`  FLAG: --phase ${SINGLE_PHASE} (single phase)\n`, 'yellow');

    const api = createClient();
    const startTime = Date.now();

    const phases = [
        { num: 1, fn: () => phase1_verifyConnection(api), name: 'Connection' },
        { num: 2, fn: () => phase2_deployCollections(api), name: 'Collections' },
        { num: 3, fn: () => phase3_deployFields(api), name: 'Fields' },
        { num: 4, fn: () => phase4_deployRelationships(api), name: 'Relationships' },
        { num: 5, fn: () => phase5_deployRoles(api), name: 'Roles' },
        { num: 6, fn: () => phase6_deployUI(api), name: 'UI Pages' },
        { num: 7, fn: () => phase7_seedData(api), name: 'Seed Data' },
        { num: 8, fn: () => phase8_validate(api), name: 'Validation' },
    ];

    let allOk = true;
    for (const phase of phases) {
        if (VALIDATE_ONLY && phase.num < 8) continue;
        if (SINGLE_PHASE && phase.num !== SINGLE_PHASE) continue;

        const ok = await phase.fn();
        if (!ok && phase.num === 1) {
            log('\n  ABORT: Cannot proceed without API connection', 'red');
            break;
        }
        if (!ok) allOk = false;
    }

    // ─── Summary ─────────────────────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║    DEPLOYMENT SUMMARY                                          ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝\n', 'cyan');

    let totalSuccess = 0, totalSkipped = 0, totalErrors = 0;
    for (const r of results) {
        totalSuccess += r.success;
        totalSkipped += r.skipped;
        totalErrors += r.errors;
        const status = r.errors > 0 ? 'PARTIAL' : r.success > 0 ? 'OK' : 'SKIPPED';
        log(`  Phase ${r.phase}: ${status} (${r.success} ok, ${r.skipped} skip, ${r.errors} err)`, r.errors > 0 ? 'yellow' : 'green');
    }

    log(`\n  Total: ${totalSuccess} succeeded | ${totalSkipped} skipped | ${totalErrors} errors`, allOk ? 'green' : 'yellow');
    log(`  Duration: ${elapsed}s`, 'gray');

    if (decisions.length > 0) {
        log('\n  Decisions:', 'white');
        for (const d of decisions) {
            log(`    - ${d}`, 'gray');
        }
    }

    log(`\n  Status: ${allOk ? 'COMPLETED' : totalErrors > 0 ? 'PARTIAL' : 'COMPLETED WITH WARNINGS'}`, allOk ? 'green' : 'yellow');

    process.exit(allOk ? 0 : 1);
}

main().catch(err => {
    log(`\nFATAL: ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
