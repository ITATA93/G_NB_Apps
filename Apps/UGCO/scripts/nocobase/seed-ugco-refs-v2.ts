/**
 * SEED UGCO REFERENCES v2 - Cargar datos en colecciones UGCO_REF_*
 *
 * Uses shared ApiClient (authenticated via .env).
 *
 * Data sources:
 *   1. Backup JSON files from Apps/UGCO/backups/mira-oncologia-20260128/data/
 *   2. Hardcoded static reference data (ECOG, estados, TNM, etc.)
 *
 * Usage:
 *   npx tsx Apps/UGCO/scripts/nocobase/seed-ugco-refs-v2.ts
 *   npx tsx Apps/UGCO/scripts/nocobase/seed-ugco-refs-v2.ts --dry-run
 *
 * @module UGCO/scripts/seed-ugco-refs-v2
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient, log } from '../../../../shared/scripts/ApiClient';
import type { ApiClient } from '../../../../shared/scripts/ApiClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ══════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════

const BACKUP_DIR = path.resolve(__dirname, '../../backups/mira-oncologia-20260128/data');
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 50;

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════

interface RefRecord {
    codigo: string;
    nombre: string;
    descripcion?: string;
    orden?: number;
    activo?: boolean;
    [key: string]: unknown;
}

interface BackupFile {
    collection: string;
    count: number;
    exportedAt: string;
    records: Record<string, unknown>[];
}

interface SeedResult {
    collection: string;
    action: 'seeded' | 'skipped' | 'error';
    count: number;
    errors: number;
    reason?: string;
}

// ══════════════════════════════════════════════════════════════════════
// BACKUP LOADER
// ══════════════════════════════════════════════════════════════════════

function loadBackupJson(filename: string): Record<string, unknown>[] {
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        log(`  [WARN] Backup file not found: ${filename}`, 'yellow');
        return [];
    }
    const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8')) as BackupFile;
    if (raw.records && Array.isArray(raw.records)) {
        return raw.records;
    }
    return Array.isArray(raw) ? raw : [];
}

// ══════════════════════════════════════════════════════════════════════
// CHECK EXISTING RECORDS
// ══════════════════════════════════════════════════════════════════════

async function collectionCount(api: ApiClient, collection: string): Promise<number> {
    try {
        const result = await api.get(`${collection}:list`, { pageSize: 1 });
        return result?.data?.meta?.count
            ?? result?.meta?.count
            ?? (Array.isArray(result?.data) ? result.data.length : 0);
    } catch {
        // Collection might not exist or be empty
        return 0;
    }
}

// ══════════════════════════════════════════════════════════════════════
// BATCH INSERT
// ══════════════════════════════════════════════════════════════════════

async function batchInsert(
    api: ApiClient,
    collection: string,
    records: RefRecord[],
): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(records.length / BATCH_SIZE);

        if (DRY_RUN) {
            success += batch.length;
            continue;
        }

        try {
            // NocoBase :create accepts an array for bulk insert
            await api.post(`${collection}:create`, batch as unknown as Record<string, unknown>);
            success += batch.length;
            if (totalBatches > 1) {
                process.stdout.write(`\r    batch ${batchNum}/${totalBatches}...`);
            }
        } catch {
            // Fallback: insert one by one
            for (const record of batch) {
                try {
                    await api.post(`${collection}:create`, record as unknown as Record<string, unknown>);
                    success++;
                } catch {
                    errors++;
                }
            }
        }
    }

    return { success, errors };
}

// ══════════════════════════════════════════════════════════════════════
// STATIC REFERENCE DATA
// ══════════════════════════════════════════════════════════════════════

function staticEcog(): RefRecord[] {
    return [
        { codigo: '0', nombre: 'ECOG 0', descripcion: 'Completamente activo, sin restricciones', orden: 0, activo: true },
        { codigo: '1', nombre: 'ECOG 1', descripcion: 'Restriccion en actividad fisica extenuante, ambulatorio y capaz de realizar trabajo ligero', orden: 1, activo: true },
        { codigo: '2', nombre: 'ECOG 2', descripcion: 'Ambulatorio y capaz de autocuidado, incapaz de trabajo. En pie >50% horas de vigilia', orden: 2, activo: true },
        { codigo: '3', nombre: 'ECOG 3', descripcion: 'Autocuidado limitado. En cama o silla >50% horas de vigilia', orden: 3, activo: true },
        { codigo: '4', nombre: 'ECOG 4', descripcion: 'Completamente incapacitado. No puede realizar autocuidado. Postrado', orden: 4, activo: true },
        { codigo: '5', nombre: 'ECOG 5', descripcion: 'Fallecido', orden: 5, activo: true },
    ];
}

function staticEstadoAdm(): RefRecord[] {
    return [
        { codigo: 'PROCESO_DIAGNOSTICO', nombre: 'Proceso diagnostico', descripcion: 'Paciente en proceso de estudio y diagnostico', orden: 1, activo: true },
        { codigo: 'ETAPIFICACION', nombre: 'Etapificacion', descripcion: 'Paciente en etapa de etapificacion oncologica', orden: 2, activo: true },
        { codigo: 'TRATAMIENTO', nombre: 'Tratamiento', descripcion: 'Paciente en tratamiento activo', orden: 3, activo: true },
        { codigo: 'SEGUIMIENTO', nombre: 'Seguimiento', descripcion: 'Paciente en seguimiento post-tratamiento', orden: 4, activo: true },
        { codigo: 'CERRADO', nombre: 'Cerrado', descripcion: 'Caso cerrado administrativamente', orden: 5, activo: true },
    ];
}

function staticEstadoCaso(): RefRecord[] {
    return [
        { codigo: 'ACTIVO', nombre: 'Activo', descripcion: 'Caso oncologico activo', orden: 1, activo: true },
        { codigo: 'SEGUIMIENTO', nombre: 'Seguimiento', descripcion: 'Paciente en seguimiento', orden: 2, activo: true },
        { codigo: 'CERRADO', nombre: 'Cerrado', descripcion: 'Caso cerrado', orden: 3, activo: true },
        { codigo: 'PERDIDO', nombre: 'Perdido', descripcion: 'Paciente perdido de seguimiento', orden: 4, activo: true },
        { codigo: 'FALLECIDO', nombre: 'Fallecido', descripcion: 'Paciente fallecido', orden: 5, activo: true },
        { codigo: 'DERIVADO', nombre: 'Derivado', descripcion: 'Paciente derivado a otro centro', orden: 6, activo: true },
    ];
}

function staticEstadoClinico(): RefRecord[] {
    return [
        { codigo: 'SOSPECHA', nombre: 'Sospecha', descripcion: 'Sospecha diagnostica de cancer', orden: 1, activo: true },
        { codigo: 'CONFIRMADO', nombre: 'Confirmado', descripcion: 'Diagnostico confirmado de cancer', orden: 2, activo: true },
        { codigo: 'NO_CANCER', nombre: 'No cancer', descripcion: 'Estudio descarta cancer', orden: 3, activo: true },
        { codigo: 'RECAIDA', nombre: 'Recaida', descripcion: 'Recurrencia o recaida del cancer', orden: 4, activo: true },
    ];
}

function staticIntencionTrat(): RefRecord[] {
    return [
        { codigo: 'CURATIVO', nombre: 'Curativo', descripcion: 'Tratamiento con intencion curativa', orden: 1, activo: true },
        { codigo: 'PALIATIVO', nombre: 'Paliativo', descripcion: 'Tratamiento con intencion paliativa', orden: 2, activo: true },
        { codigo: 'DIAGNOSTICO', nombre: 'Diagnostico', descripcion: 'Procedimiento con intencion diagnostica', orden: 3, activo: true },
        { codigo: 'PROFILACTICO', nombre: 'Profilactico', descripcion: 'Tratamiento profilactico', orden: 4, activo: true },
    ];
}

function staticTipoActividad(): RefRecord[] {
    return [
        { codigo: 'EXAMEN', nombre: 'Examen', descripcion: 'Examen o procedimiento diagnostico', orden: 1, activo: true },
        { codigo: 'INTERCONSULTA', nombre: 'Interconsulta', descripcion: 'Interconsulta a especialidad', orden: 2, activo: true },
        { codigo: 'CONTROL', nombre: 'Control', descripcion: 'Control medico programado', orden: 3, activo: true },
        { codigo: 'GESTION_INTERNA', nombre: 'Gestion interna', descripcion: 'Gestion administrativa interna', orden: 4, activo: true },
        { codigo: 'COMITE', nombre: 'Comite', descripcion: 'Presentacion en comite oncologico', orden: 5, activo: true },
        { codigo: 'CIRUGIA', nombre: 'Cirugia', descripcion: 'Intervencion quirurgica', orden: 6, activo: true },
        { codigo: 'QT', nombre: 'Quimioterapia', descripcion: 'Sesion de quimioterapia', orden: 7, activo: true },
        { codigo: 'RT', nombre: 'Radioterapia', descripcion: 'Sesion de radioterapia', orden: 8, activo: true },
    ];
}

function staticEstadoActividad(): RefRecord[] {
    return [
        { codigo: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Actividad pendiente de realizacion', orden: 1, activo: true },
        { codigo: 'EN_PROGRESO', nombre: 'En progreso', descripcion: 'Actividad en curso', orden: 2, activo: true },
        { codigo: 'COMPLETADA', nombre: 'Completada', descripcion: 'Actividad completada', orden: 3, activo: true },
        { codigo: 'VENCIDA', nombre: 'Vencida', descripcion: 'Actividad vencida sin completar', orden: 4, activo: true },
        { codigo: 'CANCELADA', nombre: 'Cancelada', descripcion: 'Actividad cancelada', orden: 5, activo: true },
    ];
}

function staticTipoDocumento(): RefRecord[] {
    return [
        { codigo: 'INFORME', nombre: 'Informe', descripcion: 'Informe medico o de procedimiento', orden: 1, activo: true },
        { codigo: 'NOTIFICACION', nombre: 'Notificacion', descripcion: 'Notificacion GES u obligatoria', orden: 2, activo: true },
        { codigo: 'IMAGEN', nombre: 'Imagen', descripcion: 'Imagen diagnostica', orden: 3, activo: true },
        { codigo: 'CONSENTIMIENTO', nombre: 'Consentimiento', descripcion: 'Consentimiento informado', orden: 4, activo: true },
        { codigo: 'OTRO', nombre: 'Otro', descripcion: 'Otro tipo de documento', orden: 5, activo: true },
    ];
}

function staticTipoEtapificacion(): RefRecord[] {
    return [
        { codigo: 'TNM_CLINICO', nombre: 'TNM Clinico', descripcion: 'Etapificacion TNM clinica (cTNM)', orden: 1, activo: true },
        { codigo: 'TNM_PATOLOGICO', nombre: 'TNM Patologico', descripcion: 'Etapificacion TNM patologica (pTNM)', orden: 2, activo: true },
        { codigo: 'FIGO', nombre: 'FIGO', descripcion: 'Etapificacion FIGO para canceres ginecologicos', orden: 3, activo: true },
        { codigo: 'ANN_ARBOR', nombre: 'Ann Arbor', descripcion: 'Etapificacion Ann Arbor para linfomas', orden: 4, activo: true },
    ];
}

function staticBaseDiagnostico(): RefRecord[] {
    return [
        { codigo: 'CLINICO', nombre: 'Clinico', descripcion: 'Diagnostico basado en hallazgos clinicos', orden: 1, activo: true },
        { codigo: 'HISTOLOGICO', nombre: 'Histologico', descripcion: 'Diagnostico confirmado por biopsia/histologia', orden: 2, activo: true },
        { codigo: 'CITOLOGICO', nombre: 'Citologico', descripcion: 'Diagnostico basado en citologia', orden: 3, activo: true },
        { codigo: 'IMAGENOLOGICO', nombre: 'Imagenologico', descripcion: 'Diagnostico basado en imagenes', orden: 4, activo: true },
        { codigo: 'MARCADORES', nombre: 'Marcadores tumorales', descripcion: 'Diagnostico basado en marcadores tumorales', orden: 5, activo: true },
        { codigo: 'LABORATORIO', nombre: 'Laboratorio', descripcion: 'Diagnostico basado en examenes de laboratorio', orden: 6, activo: true },
    ];
}

function staticGradoHistologico(): RefRecord[] {
    return [
        { codigo: 'G1', nombre: 'G1 - Bien diferenciado', descripcion: 'Tumor bien diferenciado', orden: 1, activo: true },
        { codigo: 'G2', nombre: 'G2 - Moderadamente diferenciado', descripcion: 'Tumor moderadamente diferenciado', orden: 2, activo: true },
        { codigo: 'G3', nombre: 'G3 - Poco diferenciado', descripcion: 'Tumor poco diferenciado', orden: 3, activo: true },
        { codigo: 'G4', nombre: 'G4 - Indiferenciado', descripcion: 'Tumor indiferenciado / anaplasico', orden: 4, activo: true },
        { codigo: 'GX', nombre: 'GX - No evaluable', descripcion: 'Grado no puede ser evaluado', orden: 5, activo: true },
    ];
}

function staticEstadioClinico(): RefRecord[] {
    const stages = [
        { codigo: '0',    nombre: 'Estadio 0',    descripcion: 'Carcinoma in situ', orden: 1 },
        { codigo: 'I',    nombre: 'Estadio I',    descripcion: 'Tumor localizado pequeno', orden: 2 },
        { codigo: 'IA',   nombre: 'Estadio IA',   descripcion: 'Subetapa IA', orden: 3 },
        { codigo: 'IB',   nombre: 'Estadio IB',   descripcion: 'Subetapa IB', orden: 4 },
        { codigo: 'II',   nombre: 'Estadio II',   descripcion: 'Tumor localizado mayor', orden: 5 },
        { codigo: 'IIA',  nombre: 'Estadio IIA',  descripcion: 'Subetapa IIA', orden: 6 },
        { codigo: 'IIB',  nombre: 'Estadio IIB',  descripcion: 'Subetapa IIB', orden: 7 },
        { codigo: 'III',  nombre: 'Estadio III',   descripcion: 'Extension regional', orden: 8 },
        { codigo: 'IIIA', nombre: 'Estadio IIIA', descripcion: 'Subetapa IIIA', orden: 9 },
        { codigo: 'IIIB', nombre: 'Estadio IIIB', descripcion: 'Subetapa IIIB', orden: 10 },
        { codigo: 'IIIC', nombre: 'Estadio IIIC', descripcion: 'Subetapa IIIC', orden: 11 },
        { codigo: 'IV',   nombre: 'Estadio IV',   descripcion: 'Enfermedad metastasica', orden: 12 },
        { codigo: 'IVA',  nombre: 'Estadio IVA',  descripcion: 'Subetapa IVA', orden: 13 },
        { codigo: 'IVB',  nombre: 'Estadio IVB',  descripcion: 'Subetapa IVB', orden: 14 },
    ];
    return stages.map(s => ({ ...s, activo: true }));
}

function staticFigo(): RefRecord[] {
    const stages = [
        { codigo: 'I',     nombre: 'FIGO I',     descripcion: 'Tumor confinado al organo de origen', orden: 1 },
        { codigo: 'IA',    nombre: 'FIGO IA',    descripcion: 'Subetapa IA', orden: 2 },
        { codigo: 'IA1',   nombre: 'FIGO IA1',   descripcion: 'Subetapa IA1', orden: 3 },
        { codigo: 'IA2',   nombre: 'FIGO IA2',   descripcion: 'Subetapa IA2', orden: 4 },
        { codigo: 'IB',    nombre: 'FIGO IB',    descripcion: 'Subetapa IB', orden: 5 },
        { codigo: 'IB1',   nombre: 'FIGO IB1',   descripcion: 'Subetapa IB1', orden: 6 },
        { codigo: 'IB2',   nombre: 'FIGO IB2',   descripcion: 'Subetapa IB2', orden: 7 },
        { codigo: 'IB3',   nombre: 'FIGO IB3',   descripcion: 'Subetapa IB3', orden: 8 },
        { codigo: 'IC',    nombre: 'FIGO IC',    descripcion: 'Subetapa IC', orden: 9 },
        { codigo: 'IC1',   nombre: 'FIGO IC1',   descripcion: 'Subetapa IC1 - Rotura quirurgica', orden: 10 },
        { codigo: 'IC2',   nombre: 'FIGO IC2',   descripcion: 'Subetapa IC2 - Rotura preoperatoria o superficie', orden: 11 },
        { codigo: 'IC3',   nombre: 'FIGO IC3',   descripcion: 'Subetapa IC3 - Celulas malignas en ascitis o lavado', orden: 12 },
        { codigo: 'II',    nombre: 'FIGO II',    descripcion: 'Extension mas alla del organo de origen', orden: 13 },
        { codigo: 'IIA',   nombre: 'FIGO IIA',   descripcion: 'Subetapa IIA', orden: 14 },
        { codigo: 'IIA1',  nombre: 'FIGO IIA1',  descripcion: 'Subetapa IIA1', orden: 15 },
        { codigo: 'IIA2',  nombre: 'FIGO IIA2',  descripcion: 'Subetapa IIA2', orden: 16 },
        { codigo: 'IIB',   nombre: 'FIGO IIB',   descripcion: 'Subetapa IIB', orden: 17 },
        { codigo: 'III',   nombre: 'FIGO III',   descripcion: 'Extension a pelvis o ganglios', orden: 18 },
        { codigo: 'IIIA',  nombre: 'FIGO IIIA',  descripcion: 'Subetapa IIIA', orden: 19 },
        { codigo: 'IIIA1', nombre: 'FIGO IIIA1', descripcion: 'Subetapa IIIA1 - Solo ganglios retroperitoneales positivos', orden: 20 },
        { codigo: 'IIIA2', nombre: 'FIGO IIIA2', descripcion: 'Subetapa IIIA2 - Peritoneo extrapelvico microscopico', orden: 21 },
        { codigo: 'IIIB',  nombre: 'FIGO IIIB',  descripcion: 'Subetapa IIIB', orden: 22 },
        { codigo: 'IIIC',  nombre: 'FIGO IIIC',  descripcion: 'Subetapa IIIC', orden: 23 },
        { codigo: 'IIIC1', nombre: 'FIGO IIIC1', descripcion: 'Subetapa IIIC1 - Ganglios pelvicos', orden: 24 },
        { codigo: 'IIIC2', nombre: 'FIGO IIIC2', descripcion: 'Subetapa IIIC2 - Ganglios para-aorticos', orden: 25 },
        { codigo: 'IV',    nombre: 'FIGO IV',    descripcion: 'Enfermedad a distancia', orden: 26 },
        { codigo: 'IVA',   nombre: 'FIGO IVA',   descripcion: 'Subetapa IVA - Invasion mucosa vesical o rectal', orden: 27 },
        { codigo: 'IVB',   nombre: 'FIGO IVB',   descripcion: 'Subetapa IVB - Metastasis a distancia', orden: 28 },
    ];
    return stages.map(s => ({ ...s, activo: true }));
}

// ══════════════════════════════════════════════════════════════════════
// SEED DEFINITIONS
// ══════════════════════════════════════════════════════════════════════

interface SeedDef {
    collection: string;
    label: string;
    source: 'backup' | 'static';
    backupFile?: string;
    transform?: (row: Record<string, unknown>) => RefRecord | null;
    staticData?: () => RefRecord[];
}

const SEED_DEFS: SeedDef[] = [
    // ─── BACKUP-SOURCED COLLECTIONS ─────────────────────────────────
    {
        collection: 'UGCO_REF_cie10',
        label: 'CIE-10 (diagnosticos)',
        source: 'backup',
        backupFile: 'ref_cie10.data.json',
        transform: (row) => {
            // Skip header rows (id 1-2 are column headers in this backup)
            if ((row.id as number) <= 2) return null;
            const codigo = String(row.codigo_oficial || row.codigo || '');
            const descripcion = String(row.descripcion || '');
            if (!codigo || codigo === 'Codigo') return null;
            return {
                codigo,
                nombre: descripcion,
                descripcion,
                activo: (row.activo as boolean) ?? true,
            };
        },
    },
    {
        collection: 'UGCO_REF_oncotopografiaicdo',
        label: 'Topografia ICD-O',
        source: 'backup',
        backupFile: 'ref_oncotopografia.data.json',
        transform: (row) => ({
            codigo: String(row.codigo_oficial || row.codigo || ''),
            nombre: String(row.descripcion || row.nombre || ''),
            descripcion: String(row.descripcion || ''),
            activo: true,
        }),
    },
    {
        collection: 'UGCO_REF_oncoespecialidad',
        label: 'Especialidades oncologicas',
        source: 'backup',
        backupFile: 'ref_oncoespecialidad.data.json',
        transform: (row) => ({
            codigo: String(row.codigo_oficial || row.codigo || ''),
            nombre: String(row.descripcion || row.nombre || ''),
            descripcion: String(row.descripcion || ''),
            orden: (row.orden as number) ?? (row.id as number) ?? 0,
            activo: true,
        }),
    },
    {
        collection: 'UGCO_REF_oncodiagnostico',
        label: 'Diagnosticos oncologicos',
        source: 'backup',
        backupFile: 'ref_oncodiagnostico.data.json',
        transform: (row) => ({
            codigo: String(row.codigo || row.codigo_oficial || ''),
            nombre: String(row.nombre || row.descripcion || ''),
            descripcion: String(row.nombre || row.descripcion || ''),
            activo: true,
        }),
    },

    // ─── STATIC REFERENCE COLLECTIONS ───────────────────────────────
    {
        collection: 'UGCO_REF_oncoecog',
        label: 'ECOG Performance Status',
        source: 'static',
        staticData: staticEcog,
    },
    {
        collection: 'UGCO_REF_oncoestadoadm',
        label: 'Estado administrativo',
        source: 'static',
        staticData: staticEstadoAdm,
    },
    {
        collection: 'UGCO_REF_oncoestadocaso',
        label: 'Estado del caso',
        source: 'static',
        staticData: staticEstadoCaso,
    },
    {
        collection: 'UGCO_REF_oncoestadoclinico',
        label: 'Estado clinico',
        source: 'static',
        staticData: staticEstadoClinico,
    },
    {
        collection: 'UGCO_REF_oncointenciontrat',
        label: 'Intencion de tratamiento',
        source: 'static',
        staticData: staticIntencionTrat,
    },
    {
        collection: 'UGCO_REF_oncotipoactividad',
        label: 'Tipo de actividad',
        source: 'static',
        staticData: staticTipoActividad,
    },
    {
        collection: 'UGCO_REF_oncoestadoactividad',
        label: 'Estado de actividad',
        source: 'static',
        staticData: staticEstadoActividad,
    },
    {
        collection: 'UGCO_REF_oncotipodocumento',
        label: 'Tipo de documento',
        source: 'static',
        staticData: staticTipoDocumento,
    },
    {
        collection: 'UGCO_REF_oncotipoetapificacion',
        label: 'Tipo de etapificacion',
        source: 'static',
        staticData: staticTipoEtapificacion,
    },
    {
        collection: 'UGCO_REF_oncobasediagnostico',
        label: 'Base del diagnostico',
        source: 'static',
        staticData: staticBaseDiagnostico,
    },
    {
        collection: 'UGCO_REF_oncogradohistologico',
        label: 'Grado histologico',
        source: 'static',
        staticData: staticGradoHistologico,
    },
    {
        collection: 'UGCO_REF_oncoestadio_clinico',
        label: 'Estadio clinico (TNM)',
        source: 'static',
        staticData: staticEstadioClinico,
    },
    {
        collection: 'UGCO_REF_oncofigo',
        label: 'FIGO (ginecologico)',
        source: 'static',
        staticData: staticFigo,
    },
];

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

async function main() {
    log('\n==========================================================', 'cyan');
    log('  SEED UGCO REFERENCES v2', 'cyan');
    log('  Uses shared ApiClient - Batch insert mode', 'cyan');
    log('==========================================================', 'cyan');

    const api = createClient();

    log(`\n  Backup dir : ${BACKUP_DIR}`, 'gray');
    log(`  Collections: ${SEED_DEFS.length}`, 'gray');

    if (DRY_RUN) {
        log('\n  ** DRY-RUN MODE: No data will be written **\n', 'yellow');
    }

    // Test connectivity
    log('\n  Verifying API connection...', 'gray');
    try {
        await api.get('applicationPlugins:list', { pageSize: 1 });
        log('  [OK] API connection established\n', 'green');
    } catch (err: unknown) {
        log(`  [ERROR] Cannot connect to API: ${err instanceof Error ? err.message : String(err)}`, 'red');
        process.exit(1);
    }

    // List available backup files
    if (fs.existsSync(BACKUP_DIR)) {
        const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
        log(`  Backup files found: ${files.length}`, 'gray');
        for (const f of files) {
            log(`    - ${f}`, 'gray');
        }
        log('', 'white');
    } else {
        log(`  [WARN] Backup directory not found: ${BACKUP_DIR}\n`, 'yellow');
    }

    const results: SeedResult[] = [];

    for (const def of SEED_DEFS) {
        const { collection, label, source, backupFile, transform, staticData } = def;

        // 1. Check if collection already has records
        const existing = await collectionCount(api, collection);
        if (existing > 0) {
            log(`  [SKIP] ${collection} (${label}) -- already has ${existing} records`, 'yellow');
            results.push({ collection, action: 'skipped', count: existing, errors: 0, reason: 'already populated' });
            continue;
        }

        // 2. Resolve records
        let records: RefRecord[] = [];

        if (source === 'backup' && backupFile && transform) {
            const raw = loadBackupJson(backupFile);
            if (raw.length === 0) {
                log(`  [SKIP] ${collection} (${label}) -- backup file empty or missing`, 'yellow');
                results.push({ collection, action: 'skipped', count: 0, errors: 0, reason: 'no backup data' });
                continue;
            }
            records = raw.map(transform).filter((r): r is RefRecord => r !== null && !!(r.codigo || r.nombre));
        } else if (source === 'static' && staticData) {
            records = staticData();
        }

        if (records.length === 0) {
            log(`  [SKIP] ${collection} (${label}) -- no records to insert`, 'yellow');
            results.push({ collection, action: 'skipped', count: 0, errors: 0, reason: 'empty' });
            continue;
        }

        // 3. Insert
        const prefix = DRY_RUN ? '[DRY] ' : '';
        process.stdout.write(`  ${prefix}${collection} (${label}) -- ${records.length} records...`);

        try {
            const { success, errors } = await batchInsert(api, collection, records);

            if (errors > 0) {
                log(` ${success} OK, ${errors} errors`, 'yellow');
            } else {
                log(` OK`, 'green');
            }

            results.push({ collection, action: 'seeded', count: success, errors });
        } catch (err: unknown) {
            log(` FAILED: ${err instanceof Error ? err.message : String(err)}`, 'red');
            results.push({ collection, action: 'error', count: 0, errors: 1, reason: String(err) });
        }
    }

    // ─── Summary ────────────────────────────────────────────────────
    log('\n==========================================================', 'white');
    log('  SUMMARY', 'white');
    log('==========================================================', 'white');

    const seeded = results.filter(r => r.action === 'seeded');
    const skipped = results.filter(r => r.action === 'skipped');
    const errored = results.filter(r => r.action === 'error');
    const totalRecords = seeded.reduce((sum, r) => sum + r.count, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    log(`  Seeded  : ${seeded.length} collections (${totalRecords} records)`, 'green');
    if (skipped.length > 0) {
        log(`  Skipped : ${skipped.length} collections`, 'yellow');
        for (const s of skipped) {
            log(`    - ${s.collection}: ${s.reason}`, 'gray');
        }
    }
    if (errored.length > 0) {
        log(`  Errors  : ${errored.length} collections`, 'red');
        for (const e of errored) {
            log(`    - ${e.collection}: ${e.reason}`, 'red');
        }
    }
    if (totalErrors > 0) {
        log(`  Record-level errors: ${totalErrors}`, 'red');
    }

    log('==========================================================\n', 'white');

    // Exit with error code if any failures
    if (errored.length > 0) {
        process.exit(1);
    }
}

main().catch((err) => {
    log(`\nFatal error: ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
