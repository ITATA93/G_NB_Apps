/**
 * seed-full-references.ts - Carga de datos semilla en tablas REF_* de UGCO
 *
 * Carga datos predefinidos (catálogos clínicos oncológicos) y datos
 * desde archivos JSON (topografías ICD-O, morfologías, CIE-10).
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/seed-full-references.ts          # todo
 *   tsx Apps/UGCO/scripts/nocobase/seed-full-references.ts --only ref_oncoecog
 *   tsx Apps/UGCO/scripts/nocobase/seed-full-references.ts --dry-run
 *   tsx Apps/UGCO/scripts/nocobase/seed-full-references.ts --skip-files   # solo predefinidos
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = createClient();
const DICT_DIR = path.resolve(__dirname, '../../BD/diccionarios_raw');

// ─── Datos predefinidos ──────────────────────────────────────────────────────

const SEED_DATA: Record<string, any[]> = {

    ref_oncoespecialidad: [
        { codigo_oficial: 'DIG', nombre: 'Digestivo', activo: true },
        { codigo_oficial: 'MAM', nombre: 'Mama', activo: true },
        { codigo_oficial: 'URO', nombre: 'Urología', activo: true },
        { codigo_oficial: 'GIN', nombre: 'Ginecología', activo: true },
        { codigo_oficial: 'PUL', nombre: 'Pulmonar', activo: true },
        { codigo_oficial: 'HEM', nombre: 'Hematología', activo: true },
        { codigo_oficial: 'NEU', nombre: 'Neurología', activo: true },
        { codigo_oficial: 'CCC', nombre: 'Cabeza y Cuello', activo: true },
        { codigo_oficial: 'DER', nombre: 'Dermatología', activo: true },
        { codigo_oficial: 'TIR', nombre: 'Tiroides', activo: true },
        { codigo_oficial: 'MSK', nombre: 'Musculoesquelético', activo: true },
        { codigo_oficial: 'PED', nombre: 'Oncología Pediátrica', activo: true },
        { codigo_oficial: 'OTR', nombre: 'Otros', activo: true },
    ],

    ref_oncoecog: [
        { valor: 0, codigo: 'ECOG-0', descripcion: 'Completamente activo, sin restricciones', activo: true },
        { valor: 1, codigo: 'ECOG-1', descripcion: 'Restricción actividad extenuante, ambulatorio y trabajo ligero', activo: true },
        { valor: 2, codigo: 'ECOG-2', descripcion: 'Ambulatorio, autocuidado, incapaz de trabajar. En pie >50% del tiempo', activo: true },
        { valor: 3, codigo: 'ECOG-3', descripcion: 'Autocuidado limitado, en cama/silla >50% del tiempo', activo: true },
        { valor: 4, codigo: 'ECOG-4', descripcion: 'Completamente incapacitado, no puede autocuidarse, postrado', activo: true },
        { valor: 5, codigo: 'ECOG-5', descripcion: 'Fallecido', activo: true },
    ],

    ref_oncoestadoactividad: [
        { codigo: 'PEN', nombre: 'Pendiente', es_final: false, activo: true },
        { codigo: 'PRG', nombre: 'Programada', es_final: false, activo: true },
        { codigo: 'CUR', nombre: 'En curso', es_final: false, activo: true },
        { codigo: 'COM', nombre: 'Completada', es_final: true, activo: true },
        { codigo: 'CAN', nombre: 'Cancelada', es_final: true, activo: true },
        { codigo: 'SUS', nombre: 'Suspendida', es_final: false, activo: true },
    ],

    ref_oncoestadoadm: [
        { codigo: 'ABT', nombre: 'Abierto', es_final: false, activo: true },
        { codigo: 'EVL', nombre: 'En evaluación', es_final: false, activo: true },
        { codigo: 'APR', nombre: 'Aprobado', es_final: false, activo: true },
        { codigo: 'TRT', nombre: 'En tratamiento', es_final: false, activo: true },
        { codigo: 'SEG', nombre: 'En seguimiento', es_final: false, activo: true },
        { codigo: 'CRD', nombre: 'Cerrado', es_final: true, activo: true },
        { codigo: 'ARC', nombre: 'Archivado', es_final: true, activo: true },
    ],

    ref_oncoestadocaso: [
        { codigo: 'NVO', nombre: 'Nuevo', es_final: false, activo: true },
        { codigo: 'ACT', nombre: 'Activo', es_final: false, activo: true },
        { codigo: 'TRT', nombre: 'En tratamiento', es_final: false, activo: true },
        { codigo: 'SEG', nombre: 'En seguimiento', es_final: false, activo: true },
        { codigo: 'REM', nombre: 'En remisión', es_final: false, activo: true },
        { codigo: 'REC', nombre: 'Recidiva', es_final: false, activo: true },
        { codigo: 'PAL', nombre: 'Paliativo', es_final: false, activo: true },
        { codigo: 'CRD', nombre: 'Cerrado', es_final: true, activo: true },
        { codigo: 'FAL', nombre: 'Fallecido', es_final: true, activo: true },
    ],

    ref_oncoestadoclinico: [
        { codigo: 'ACT', nombre: 'Activo', es_maligno: true, activo: true },
        { codigo: 'REM', nombre: 'Remisión completa', es_maligno: true, activo: true },
        { codigo: 'RMP', nombre: 'Remisión parcial', es_maligno: true, activo: true },
        { codigo: 'PRG', nombre: 'Progresión', es_maligno: true, activo: true },
        { codigo: 'REC', nombre: 'Recurrencia', es_maligno: true, activo: true },
        { codigo: 'RLP', nombre: 'Recaída', es_maligno: true, activo: true },
        { codigo: 'EST', nombre: 'Enfermedad estable', es_maligno: true, activo: true },
        { codigo: 'RES', nombre: 'Resuelto', es_maligno: false, activo: true },
    ],

    ref_oncointenciontrat: [
        { codigo: 'CUR', nombre: 'Curativo', es_curativo: true, es_paliativo: false, activo: true },
        { codigo: 'PAL', nombre: 'Paliativo', es_curativo: false, es_paliativo: true, activo: true },
        { codigo: 'NEO', nombre: 'Neoadyuvante', es_curativo: true, es_paliativo: false, activo: true },
        { codigo: 'ADY', nombre: 'Adyuvante', es_curativo: true, es_paliativo: false, activo: true },
        { codigo: 'PRO', nombre: 'Profiláctico', es_curativo: false, es_paliativo: false, activo: true },
        { codigo: 'DIA', nombre: 'Diagnóstico', es_curativo: false, es_paliativo: false, activo: true },
    ],

    ref_oncotipoactividad: [
        { codigo: 'CIR', nombre: 'Cirugía', es_clinica: true, activo: true },
        { codigo: 'QMT', nombre: 'Quimioterapia', es_clinica: true, activo: true },
        { codigo: 'RDT', nombre: 'Radioterapia', es_clinica: true, activo: true },
        { codigo: 'HRM', nombre: 'Hormonoterapia', es_clinica: true, activo: true },
        { codigo: 'INM', nombre: 'Inmunoterapia', es_clinica: true, activo: true },
        { codigo: 'TDR', nombre: 'Terapia dirigida', es_clinica: true, activo: true },
        { codigo: 'BIO', nombre: 'Biopsia', es_clinica: true, activo: true },
        { codigo: 'IMG', nombre: 'Imagenología', es_clinica: true, activo: true },
        { codigo: 'LAB', nombre: 'Laboratorio', es_clinica: true, activo: true },
        { codigo: 'CON', nombre: 'Consulta', es_clinica: true, activo: true },
        { codigo: 'ICO', nombre: 'Interconsulta', es_clinica: true, activo: true },
        { codigo: 'COM', nombre: 'Comité', es_clinica: false, activo: true },
        { codigo: 'ADM', nombre: 'Administrativo', es_clinica: false, activo: true },
        { codigo: 'SEG', nombre: 'Seguimiento', es_clinica: true, activo: true },
        { codigo: 'OTR', nombre: 'Otro', es_clinica: false, activo: true },
    ],

    ref_oncotipodocumento: [
        { codigo: 'BIO', nombre: 'Informe de biopsia', activo: true },
        { codigo: 'IMG', nombre: 'Informe imagenológico', activo: true },
        { codigo: 'LAB', nombre: 'Resultado laboratorio', activo: true },
        { codigo: 'QUI', nombre: 'Protocolo quirúrgico', activo: true },
        { codigo: 'QMT', nombre: 'Protocolo quimioterapia', activo: true },
        { codigo: 'RDT', nombre: 'Plan radioterapia', activo: true },
        { codigo: 'EPR', nombre: 'Epicrisis', activo: true },
        { codigo: 'ICO', nombre: 'Informe interconsulta', activo: true },
        { codigo: 'COM', nombre: 'Acta comité oncológico', activo: true },
        { codigo: 'CON', nombre: 'Consentimiento informado', activo: true },
        { codigo: 'DER', nombre: 'Derivación', activo: true },
        { codigo: 'OTR', nombre: 'Otro documento', activo: true },
    ],

    ref_oncotipoetapificacion: [
        { codigo: 'cTNM', nombre: 'TNM Clínico', descripcion: 'Etapificación clínica basada en examen físico, imágenes y biopsias' },
        { codigo: 'pTNM', nombre: 'TNM Patológico', descripcion: 'Etapificación patológica post-quirúrgica' },
        { codigo: 'yTNM', nombre: 'TNM Post-neoadyuvancia', descripcion: 'Etapificación post tratamiento neoadyuvante' },
        { codigo: 'rTNM', nombre: 'TNM Recurrencia', descripcion: 'Etapificación en recurrencia tumoral' },
        { codigo: 'aTNM', nombre: 'TNM Autopsia', descripcion: 'Etapificación post-mortem' },
        { codigo: 'FIGO', nombre: 'FIGO', descripcion: 'Etapificación ginecológica (FIGO)' },
        { codigo: 'BNET', nombre: 'Binet', descripcion: 'Etapificación LLC (Binet)' },
        { codigo: 'RAI', nombre: 'Rai', descripcion: 'Etapificación LLC (Rai)' },
        { codigo: 'ANNH', nombre: 'Ann Arbor', descripcion: 'Etapificación linfomas (Ann Arbor)' },
    ],

    ref_oncobasediagnostico: [
        { codigo: '0', nombre: 'Sin biopsia ni histología', es_histologico: false, activo: true },
        { codigo: '1', nombre: 'Clínico', es_histologico: false, activo: true },
        { codigo: '2', nombre: 'Investigaciones clínicas', es_histologico: false, activo: true },
        { codigo: '3', nombre: 'Exploración quirúrgica', es_histologico: false, activo: true },
        { codigo: '4', nombre: 'Laboratorio (marcadores)', es_histologico: false, activo: true },
        { codigo: '5', nombre: 'Citología/Hematología', es_histologico: false, activo: true },
        { codigo: '6', nombre: 'Histología de metástasis', es_histologico: true, activo: true },
        { codigo: '7', nombre: 'Histología del tumor primario', es_histologico: true, activo: true },
        { codigo: '8', nombre: 'Autopsia con histología', es_histologico: true, activo: true },
        { codigo: '9', nombre: 'Base desconocida', es_histologico: false, activo: true },
    ],

    ref_oncogradohistologico: [
        { codigo: 'GX', nombre: 'Grado no evaluable', activo: true },
        { codigo: 'G1', nombre: 'Bien diferenciado (bajo grado)', activo: true },
        { codigo: 'G2', nombre: 'Moderadamente diferenciado (grado intermedio)', activo: true },
        { codigo: 'G3', nombre: 'Pobremente diferenciado (alto grado)', activo: true },
        { codigo: 'G4', nombre: 'Indiferenciado (alto grado)', activo: true },
    ],

    ref_oncotnm_t: [
        { codigo: 'TX', descripcion: 'Tumor primario no evaluable', activo: true },
        { codigo: 'T0', descripcion: 'Sin evidencia de tumor primario', activo: true },
        { codigo: 'Tis', descripcion: 'Carcinoma in situ', activo: true },
        { codigo: 'T1', descripcion: 'Tumor limitado al órgano, tamaño pequeño', activo: true },
        { codigo: 'T1a', descripcion: 'Subcategoría T1a', activo: true },
        { codigo: 'T1b', descripcion: 'Subcategoría T1b', activo: true },
        { codigo: 'T1c', descripcion: 'Subcategoría T1c', activo: true },
        { codigo: 'T2', descripcion: 'Tumor de tamaño intermedio', activo: true },
        { codigo: 'T2a', descripcion: 'Subcategoría T2a', activo: true },
        { codigo: 'T2b', descripcion: 'Subcategoría T2b', activo: true },
        { codigo: 'T3', descripcion: 'Tumor grande o con extensión local', activo: true },
        { codigo: 'T3a', descripcion: 'Subcategoría T3a', activo: true },
        { codigo: 'T3b', descripcion: 'Subcategoría T3b', activo: true },
        { codigo: 'T4', descripcion: 'Tumor con invasión a estructuras adyacentes', activo: true },
        { codigo: 'T4a', descripcion: 'Subcategoría T4a', activo: true },
        { codigo: 'T4b', descripcion: 'Subcategoría T4b', activo: true },
    ],

    ref_oncotnm_m: [
        { codigo: 'MX', descripcion: 'Metástasis no evaluable', activo: true },
        { codigo: 'M0', descripcion: 'Sin metástasis a distancia', activo: true },
        { codigo: 'M1', descripcion: 'Metástasis a distancia', activo: true },
        { codigo: 'M1a', descripcion: 'Metástasis en un órgano no regional', activo: true },
        { codigo: 'M1b', descripcion: 'Metástasis en múltiples órganos', activo: true },
        { codigo: 'M1c', descripcion: 'Metástasis en peritoneo', activo: true },
    ],

    ref_oncoestadio_clinico: [
        { sistema: 'TNM', codigo: '0', nombre: 'Estadio 0', activo: true },
        { sistema: 'TNM', codigo: 'I', nombre: 'Estadio I', activo: true },
        { sistema: 'TNM', codigo: 'IA', nombre: 'Estadio IA', activo: true },
        { sistema: 'TNM', codigo: 'IB', nombre: 'Estadio IB', activo: true },
        { sistema: 'TNM', codigo: 'II', nombre: 'Estadio II', activo: true },
        { sistema: 'TNM', codigo: 'IIA', nombre: 'Estadio IIA', activo: true },
        { sistema: 'TNM', codigo: 'IIB', nombre: 'Estadio IIB', activo: true },
        { sistema: 'TNM', codigo: 'III', nombre: 'Estadio III', activo: true },
        { sistema: 'TNM', codigo: 'IIIA', nombre: 'Estadio IIIA', activo: true },
        { sistema: 'TNM', codigo: 'IIIB', nombre: 'Estadio IIIB', activo: true },
        { sistema: 'TNM', codigo: 'IIIC', nombre: 'Estadio IIIC', activo: true },
        { sistema: 'TNM', codigo: 'IV', nombre: 'Estadio IV', activo: true },
        { sistema: 'TNM', codigo: 'IVA', nombre: 'Estadio IVA', activo: true },
        { sistema: 'TNM', codigo: 'IVB', nombre: 'Estadio IVB', activo: true },
        { sistema: 'TNM', codigo: 'IVC', nombre: 'Estadio IVC', activo: true },
    ],

    ref_oncofigo: [
        { localizacion: 'Cérvix', codigo: 'I', nombre: 'FIGO I', activo: true },
        { localizacion: 'Cérvix', codigo: 'IA', nombre: 'FIGO IA', activo: true },
        { localizacion: 'Cérvix', codigo: 'IA1', nombre: 'FIGO IA1', activo: true },
        { localizacion: 'Cérvix', codigo: 'IA2', nombre: 'FIGO IA2', activo: true },
        { localizacion: 'Cérvix', codigo: 'IB', nombre: 'FIGO IB', activo: true },
        { localizacion: 'Cérvix', codigo: 'IB1', nombre: 'FIGO IB1', activo: true },
        { localizacion: 'Cérvix', codigo: 'IB2', nombre: 'FIGO IB2', activo: true },
        { localizacion: 'Cérvix', codigo: 'IB3', nombre: 'FIGO IB3', activo: true },
        { localizacion: 'Cérvix', codigo: 'II', nombre: 'FIGO II', activo: true },
        { localizacion: 'Cérvix', codigo: 'IIA', nombre: 'FIGO IIA', activo: true },
        { localizacion: 'Cérvix', codigo: 'IIB', nombre: 'FIGO IIB', activo: true },
        { localizacion: 'Cérvix', codigo: 'III', nombre: 'FIGO III', activo: true },
        { localizacion: 'Cérvix', codigo: 'IIIA', nombre: 'FIGO IIIA', activo: true },
        { localizacion: 'Cérvix', codigo: 'IIIB', nombre: 'FIGO IIIB', activo: true },
        { localizacion: 'Cérvix', codigo: 'IIIC', nombre: 'FIGO IIIC', activo: true },
        { localizacion: 'Cérvix', codigo: 'IV', nombre: 'FIGO IV', activo: true },
        { localizacion: 'Cérvix', codigo: 'IVA', nombre: 'FIGO IVA', activo: true },
        { localizacion: 'Cérvix', codigo: 'IVB', nombre: 'FIGO IVB', activo: true },
        { localizacion: 'Endometrio', codigo: 'I', nombre: 'FIGO I', activo: true },
        { localizacion: 'Endometrio', codigo: 'IA', nombre: 'FIGO IA', activo: true },
        { localizacion: 'Endometrio', codigo: 'IB', nombre: 'FIGO IB', activo: true },
        { localizacion: 'Endometrio', codigo: 'II', nombre: 'FIGO II', activo: true },
        { localizacion: 'Endometrio', codigo: 'III', nombre: 'FIGO III', activo: true },
        { localizacion: 'Endometrio', codigo: 'IIIA', nombre: 'FIGO IIIA', activo: true },
        { localizacion: 'Endometrio', codigo: 'IIIB', nombre: 'FIGO IIIB', activo: true },
        { localizacion: 'Endometrio', codigo: 'IIIC', nombre: 'FIGO IIIC', activo: true },
        { localizacion: 'Endometrio', codigo: 'IV', nombre: 'FIGO IV', activo: true },
        { localizacion: 'Endometrio', codigo: 'IVA', nombre: 'FIGO IVA', activo: true },
        { localizacion: 'Endometrio', codigo: 'IVB', nombre: 'FIGO IVB', activo: true },
        { localizacion: 'Ovario', codigo: 'I', nombre: 'FIGO I', activo: true },
        { localizacion: 'Ovario', codigo: 'IA', nombre: 'FIGO IA', activo: true },
        { localizacion: 'Ovario', codigo: 'IB', nombre: 'FIGO IB', activo: true },
        { localizacion: 'Ovario', codigo: 'IC', nombre: 'FIGO IC', activo: true },
        { localizacion: 'Ovario', codigo: 'II', nombre: 'FIGO II', activo: true },
        { localizacion: 'Ovario', codigo: 'IIA', nombre: 'FIGO IIA', activo: true },
        { localizacion: 'Ovario', codigo: 'IIB', nombre: 'FIGO IIB', activo: true },
        { localizacion: 'Ovario', codigo: 'III', nombre: 'FIGO III', activo: true },
        { localizacion: 'Ovario', codigo: 'IIIA', nombre: 'FIGO IIIA', activo: true },
        { localizacion: 'Ovario', codigo: 'IIIB', nombre: 'FIGO IIIB', activo: true },
        { localizacion: 'Ovario', codigo: 'IIIC', nombre: 'FIGO IIIC', activo: true },
        { localizacion: 'Ovario', codigo: 'IV', nombre: 'FIGO IV', activo: true },
        { localizacion: 'Ovario', codigo: 'IVA', nombre: 'FIGO IVA', activo: true },
        { localizacion: 'Ovario', codigo: 'IVB', nombre: 'FIGO IVB', activo: true },
    ],
};

// ─── Datos desde archivos JSON ───────────────────────────────────────────────

interface FileMapping {
    file: string;
    collection: string;
    parser: 'array' | 'wrapped';
    entriesKey?: string;
    skipRows?: number;
    transform: (entry: any) => any | null;
}

const FILE_MAPPINGS: FileMapping[] = [
    {
        file: 'mCODE_Topography_ICD10.json',
        collection: 'ref_oncotopografiaicdo',
        parser: 'array',
        transform: (entry: any) => ({
            codigo_oficial: entry.codigo_oficial,
            descripcion: entry.descripcion,
            sistema_cod: 'http://terminology.hl7.org/CodeSystem/icd-o-3',
            activo: entry.activo !== false,
        }),
    },
];

// ─── Ejecución ───────────────────────────────────────────────────────────────

async function seedCollection(name: string, records: any[], dryRun: boolean): Promise<{ ok: number; fail: number }> {
    let ok = 0;
    let fail = 0;

    for (const record of records) {
        if (!record) continue;
        if (dryRun) {
            ok++;
            continue;
        }
        try {
            await client.post(`/${name}:create`, record);
            ok++;
        } catch (error: any) {
            fail++;
        }
        // Progress indicator
        if ((ok + fail) % 50 === 0) {
            process.stdout.write('.');
        }
    }

    return { ok, fail };
}

async function loadFromFile(mapping: FileMapping): Promise<any[]> {
    const filePath = path.join(DICT_DIR, mapping.file);
    if (!fs.existsSync(filePath)) {
        log(`  ⚠️  Archivo no encontrado: ${mapping.file}`, 'yellow');
        return [];
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let entries: any[];

    if (mapping.parser === 'array') {
        entries = Array.isArray(raw) ? raw : [];
    } else {
        // wrapped format: { entries: [...] }
        entries = raw.entries || raw[mapping.entriesKey || 'entries'] || [];
        if (mapping.skipRows) {
            entries = entries.slice(mapping.skipRows);
        }
    }

    return entries.map(mapping.transform).filter(Boolean);
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const skipFiles = args.includes('--skip-files');
    const onlyIdx = args.indexOf('--only');
    const onlyCollection = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

    log(`\n╔══════════════════════════════════════════════════════════╗`, 'cyan');
    log(`║  UGCO Seed References                                    ║`, 'cyan');
    log(`╚══════════════════════════════════════════════════════════╝`, 'cyan');

    if (dryRun) log('\n⚠️  Modo DRY-RUN\n', 'yellow');

    let totalOk = 0;
    let totalFail = 0;

    // 1. Datos predefinidos
    log('\n── Datos predefinidos ──\n', 'cyan');
    for (const [name, records] of Object.entries(SEED_DATA)) {
        if (onlyCollection && name !== onlyCollection) continue;

        log(`  ${name} (${records.length} registros)...`, 'white');
        const { ok, fail } = await seedCollection(name, records, dryRun);
        const status = fail > 0 ? 'yellow' : 'green';
        log(`  → ${ok} OK, ${fail} errores`, status);
        totalOk += ok;
        totalFail += fail;
    }

    // 2. Datos desde archivos
    if (!skipFiles) {
        log('\n── Datos desde archivos JSON ──\n', 'cyan');
        for (const mapping of FILE_MAPPINGS) {
            if (onlyCollection && mapping.collection !== onlyCollection) continue;

            log(`  ${mapping.collection} ← ${mapping.file}...`, 'white');
            const records = await loadFromFile(mapping);
            if (records.length === 0) continue;

            log(`    Cargando ${records.length} registros`, 'gray');
            const { ok, fail } = await seedCollection(mapping.collection, records, dryRun);
            if (records.length > 50) process.stdout.write('\n');
            const status = fail > 0 ? 'yellow' : 'green';
            log(`  → ${ok} OK, ${fail} errores`, status);
            totalOk += ok;
            totalFail += fail;
        }
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Total: ${totalOk} insertados, ${totalFail} errores`, totalFail > 0 ? 'yellow' : 'green');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');
}

main().catch(err => {
    log(`\n❌ Error fatal: ${err.message}`, 'red');
    process.exit(1);
});
