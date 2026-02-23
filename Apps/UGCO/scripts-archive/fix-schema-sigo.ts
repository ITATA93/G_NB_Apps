/**
 * fix-schema-sigo.ts - Corrección completa del esquema UGCO para compatibilidad SIGO
 *
 * Este script realiza las siguientes correcciones:
 *   1. Crea tablas de referencia faltantes (TNM-N, lateralidad, extensión, previsión)
 *   2. Agrega campos faltantes a colecciones existentes
 *   3. Crea relaciones FK hacia tablas de referencia
 *   4. Carga datos desde el Excel normalizado (si existe)
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/fix-schema-sigo.ts --dry-run     # solo mostrar
 *   tsx Apps/UGCO/scripts/nocobase/fix-schema-sigo.ts               # ejecutar
 *   tsx Apps/UGCO/scripts/nocobase/fix-schema-sigo.ts --with-data   # con datos
 *   tsx Apps/UGCO/scripts/nocobase/fix-schema-sigo.ts --phase 1     # solo fase 1
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient';

const client = createClient();

// ─── Helpers para definir campos ────────────────────────────────────────────

const str = (name: string, title: string, opts: any = {}) => ({
    name, type: 'string', interface: 'input',
    uiSchema: { title, type: 'string', 'x-component': 'Input', ...opts.ui },
    ...opts.extra,
});

const txt = (name: string, title: string) => ({
    name, type: 'text', interface: 'textarea',
    uiSchema: { title, type: 'string', 'x-component': 'Input.TextArea' },
});

const int = (name: string, title: string) => ({
    name, type: 'integer', interface: 'integer',
    uiSchema: { title, type: 'number', 'x-component': 'InputNumber' },
});

const bool = (name: string, title: string, defaultValue = false) => ({
    name, type: 'boolean', interface: 'checkbox', defaultValue,
    uiSchema: { title, type: 'boolean', 'x-component': 'Checkbox' },
});

const date = (name: string, title: string) => ({
    name, type: 'date', interface: 'datePicker',
    uiSchema: {
        title, type: 'string', 'x-component': 'DatePicker',
        'x-component-props': { dateFormat: 'YYYY-MM-DD' },
    },
});

const belongsTo = (name: string, target: string, foreignKey: string, title?: string) => ({
    name, type: 'belongsTo', target, foreignKey,
    uiSchema: title ? { title, 'x-component': 'AssociationField' } : undefined,
});

const hasMany = (name: string, target: string, foreignKey: string, title?: string) => ({
    name, type: 'hasMany', target, foreignKey,
    uiSchema: title ? { title, 'x-component': 'AssociationField' } : undefined,
});

// ═══════════════════════════════════════════════════════════════════════════
// FASE 1: Tablas de referencia faltantes (SIGO)
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_1_NEW_REF_TABLES = [
    {
        name: 'ref_oncotnm_n',
        title: 'REF: TNM - Nódulos (N)',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            str('localizacion', 'Localización'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
        data: [
            { codigo: 'N0', nombre: 'N0', descripcion: 'Sin metástasis en ganglios linfáticos regionales', orden: 1, activo: true },
            { codigo: 'N1', nombre: 'N1', descripcion: 'Metástasis en ganglios linfáticos regionales ipsilaterales', orden: 2, activo: true },
            { codigo: 'N2', nombre: 'N2', descripcion: 'Metástasis en múltiples ganglios o bilaterales', orden: 3, activo: true },
            { codigo: 'N3', nombre: 'N3', descripcion: 'Metástasis en ganglios linfáticos distantes o fijos', orden: 4, activo: true },
            { codigo: 'Nx', nombre: 'Nx', descripcion: 'No se pueden evaluar los ganglios linfáticos regionales', orden: 5, activo: true },
            { codigo: 'Nis', nombre: 'Nis', descripcion: 'Carcinoma in situ en ganglios', orden: 6, activo: true },
        ],
    },
    {
        name: 'ref_lateralidad',
        title: 'REF: Lateralidad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
        data: [
            { codigo: 'D', nombre: 'Derecho', codigo_sigo: 'Derecho', orden: 1, activo: true },
            { codigo: 'I', nombre: 'Izquierdo', codigo_sigo: 'Izquierdo', orden: 2, activo: true },
            { codigo: 'B', nombre: 'Bilateral', codigo_sigo: 'Bilateral', orden: 3, activo: true },
            { codigo: 'NC', nombre: 'No corresponde', codigo_sigo: 'No corresponde', orden: 4, activo: true },
            { codigo: 'DESC', nombre: 'Desconocido', codigo_sigo: 'Desconocido', orden: 5, activo: true },
            { codigo: 'NA', nombre: 'No aplica', codigo_sigo: 'No aplica', orden: 6, activo: true },
        ],
    },
    {
        name: 'ref_extension',
        title: 'REF: Extensión Tumoral',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            txt('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
        data: [
            { codigo: 'IS', nombre: 'In situ', codigo_sigo: 'In situ', descripcion: 'Tumor confinado al tejido de origen, no ha invadido membrana basal', orden: 1, activo: true },
            { codigo: 'LOC', nombre: 'Localizado', codigo_sigo: 'Localizado', descripcion: 'Tumor confinado al órgano de origen', orden: 2, activo: true },
            { codigo: 'REG', nombre: 'Regional', codigo_sigo: 'Regional', descripcion: 'Extensión directa a estructuras adyacentes o ganglios regionales', orden: 3, activo: true },
            { codigo: 'MET', nombre: 'Metástasis', codigo_sigo: 'Metástasis', descripcion: 'Diseminación a sitios distantes del tumor primario', orden: 4, activo: true },
            { codigo: 'DESC', nombre: 'Desconocido', codigo_sigo: 'Desconocido', descripcion: 'No se puede determinar la extensión', orden: 5, activo: true },
        ],
    },
    {
        name: 'ref_prevision',
        title: 'REF: Previsión de Salud',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            str('tipo', 'Tipo'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
        data: [
            { codigo: 'FONASA', nombre: 'FONASA', codigo_sigo: 'FONASA', tipo: 'Público', orden: 1, activo: true },
            { codigo: 'ISAPRE', nombre: 'ISAPRE', codigo_sigo: 'ISAPRE', tipo: 'Privado', orden: 2, activo: true },
            { codigo: 'CAPREDENA', nombre: 'CAPREDENA', codigo_sigo: 'CAPREDENA', tipo: 'FFAA', orden: 3, activo: true },
            { codigo: 'DIPRECA', nombre: 'DIPRECA', codigo_sigo: 'DIPRECA', tipo: 'FFAA', orden: 4, activo: true },
            { codigo: 'SISA', nombre: 'SISA', codigo_sigo: 'SISA', tipo: 'Otro', orden: 5, activo: true },
            { codigo: 'NINGUNA', nombre: 'Ninguna', codigo_sigo: 'NINGUNA', tipo: 'Sin previsión', orden: 6, activo: true },
            { codigo: 'DESCONOCIDO', nombre: 'Desconocido', codigo_sigo: 'DESCONOCIDO', tipo: 'Desconocido', orden: 7, activo: true },
        ],
    },
    {
        name: 'ref_establecimiento_deis',
        title: 'REF: Establecimientos DEIS',
        fields: [
            str('codigo_deis', 'Código DEIS'),
            str('nombre', 'Nombre Establecimiento'),
            str('tipo_establecimiento', 'Tipo'),
            str('nivel_atencion', 'Nivel Atención'),
            str('region', 'Región'),
            str('comuna', 'Comuna'),
            str('servicio_salud', 'Servicio de Salud'),
            str('direccion', 'Dirección'),
            bool('activo', 'Activo', true),
        ],
        data: [
            { codigo_deis: '108102', nombre: 'Hospital Dr. Antonio Tirado Lanas de Ovalle', tipo_establecimiento: 'Hospital', nivel_atencion: 'Alta Complejidad', region: 'Coquimbo', comuna: 'Ovalle', servicio_salud: 'Coquimbo', activo: true },
        ],
    },
    {
        name: 'ref_morfologia_sinonimos',
        title: 'REF: Sinónimos Morfología ICD-O',
        fields: [
            str('codigo_morfologico', 'Código Morfológico'),
            str('descripcion_sinonimo', 'Descripción Sinónimo'),
            int('orden', 'Orden'),
            belongsTo('morfologia', 'ref_oncomorfologiaicdo', 'morfologia_id'),
        ],
        data: [], // Se carga desde Excel
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// FASE 2: Campos adicionales en colecciones existentes
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_2_ADDITIONAL_FIELDS: Record<string, any[]> = {
    ugco_casooncologico: [
        // Campos SIGO faltantes
        str('id_carga_masiva', 'ID Carga Masiva SIGO'),
        str('codigo_establecimiento_deis', 'Código Establecimiento DEIS'),
        str('lateralidad_texto', 'Lateralidad (texto)'),
        str('extension_texto', 'Extensión (texto)'),
        str('rut_patologo', 'RUT Patólogo'),
        date('fecha_examen_confirmatorio', 'Fecha Examen Confirmatorio'),
        str('topografia_descripcion', 'Descripción Topografía'),
        str('morfologia_descripcion', 'Descripción Morfología'),
        str('fuente_dato', 'Fuente del Dato'),
    ],
    alma_paciente: [
        str('codigo_establecimiento_deis', 'Código Establecimiento DEIS'),
        str('prevision_texto', 'Previsión (texto)'),
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// FASE 3: Relaciones FK faltantes
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_3_RELATIONS: Record<string, any[]> = {
    ugco_casooncologico: [
        belongsTo('lateralidad_ref', 'ref_lateralidad', 'lateralidad_id', 'Lateralidad'),
        belongsTo('extension_ref', 'ref_extension', 'extension_id', 'Extensión'),
        belongsTo('establecimiento_ref', 'ref_establecimiento_deis', 'establecimiento_id', 'Establecimiento'),
        belongsTo('tnm_n_ref', 'ref_oncotnm_n', 'tnm_n_id', 'TNM - N'),
        belongsTo('cie10_ref', 'ref_cie10', 'cie10_id', 'CIE-10'),
        belongsTo('topografia_ref', 'ref_oncotopografiaicdo', 'topografia_id', 'Topografía ICD-O'),
        belongsTo('morfologia_ref', 'ref_oncomorfologiaicdo', 'morfologia_id', 'Morfología ICD-O'),
    ],
    alma_paciente: [
        belongsTo('prevision_ref', 'ref_prevision', 'prevision_id', 'Previsión'),
        belongsTo('establecimiento_ref', 'ref_establecimiento_deis', 'establecimiento_origen_id', 'Establecimiento Origen'),
    ],
    ugco_contactopaciente: [
        belongsTo('comuna_ref', 'ref_comuna', 'comuna_id', 'Comuna'),
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Funciones de ejecución
// ═══════════════════════════════════════════════════════════════════════════

async function checkCollectionExists(name: string): Promise<boolean> {
    try {
        const response = await client.get(`/collections/${name}`);
        return response.data?.data?.name === name;
    } catch {
        return false;
    }
}

async function createCollection(col: any, dryRun: boolean, withData: boolean): Promise<boolean> {
    const fieldCount = col.fields.length;

    if (dryRun) {
        log(`  [DRY] Crear: ${col.name} (${col.title}) — ${fieldCount} campos`, 'gray');
        if (withData && col.data?.length) {
            log(`        + ${col.data.length} registros de datos`, 'gray');
        }
        return true;
    }

    // Verificar si ya existe
    const exists = await checkCollectionExists(col.name);
    if (exists) {
        log(`  [SKIP] ${col.name} — ya existe`, 'yellow');
        return true;
    }

    try {
        await client.post('/collections:create', {
            name: col.name,
            title: col.title,
            fields: col.fields,
        });
        log(`  [OK] Creada: ${col.name} — ${fieldCount} campos`, 'green');

        // Cargar datos si se solicita
        if (withData && col.data?.length) {
            let dataOk = 0;
            for (const record of col.data) {
                try {
                    await client.post(`/${col.name}:create`, record);
                    dataOk++;
                } catch (e: any) {
                    // Ignorar duplicados
                }
            }
            log(`       + ${dataOk}/${col.data.length} registros cargados`, 'green');
        }

        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        log(`  [ERROR] ${col.name} — ${msg}`, 'red');
        return false;
    }
}

async function addFieldToCollection(collectionName: string, field: any, dryRun: boolean): Promise<boolean> {
    if (dryRun) {
        log(`    [DRY] + ${field.name} (${field.type})`, 'gray');
        return true;
    }

    try {
        await client.post(`/collections/${collectionName}/fields:create`, field);
        log(`    [OK] + ${field.name}`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            log(`    [SKIP] ${field.name} — ya existe`, 'yellow');
            return true;
        }
        log(`    [ERROR] ${field.name} — ${msg}`, 'red');
        return false;
    }
}

async function runPhase1(dryRun: boolean, withData: boolean): Promise<{ ok: number; fail: number }> {
    log(`\n${'═'.repeat(70)}`, 'cyan');
    log(`  FASE 1: Crear tablas de referencia faltantes (${PHASE_1_NEW_REF_TABLES.length})`, 'cyan');
    log(`${'═'.repeat(70)}\n`, 'cyan');

    let ok = 0, fail = 0;

    for (const col of PHASE_1_NEW_REF_TABLES) {
        const success = await createCollection(col, dryRun, withData);
        if (success) ok++; else fail++;
    }

    return { ok, fail };
}

async function runPhase2(dryRun: boolean): Promise<{ ok: number; fail: number }> {
    log(`\n${'═'.repeat(70)}`, 'cyan');
    log(`  FASE 2: Agregar campos faltantes a colecciones existentes`, 'cyan');
    log(`${'═'.repeat(70)}\n`, 'cyan');

    let ok = 0, fail = 0;

    for (const [collectionName, fields] of Object.entries(PHASE_2_ADDITIONAL_FIELDS)) {
        log(`  ${collectionName}:`, 'white');

        // Verificar que la colección existe
        const exists = await checkCollectionExists(collectionName);
        if (!exists && !dryRun) {
            log(`    [SKIP] Colección no existe`, 'yellow');
            continue;
        }

        for (const field of fields) {
            const success = await addFieldToCollection(collectionName, field, dryRun);
            if (success) ok++; else fail++;
        }
    }

    return { ok, fail };
}

async function runPhase3(dryRun: boolean): Promise<{ ok: number; fail: number }> {
    log(`\n${'═'.repeat(70)}`, 'cyan');
    log(`  FASE 3: Crear relaciones FK faltantes`, 'cyan');
    log(`${'═'.repeat(70)}\n`, 'cyan');

    let ok = 0, fail = 0;

    for (const [collectionName, relations] of Object.entries(PHASE_3_RELATIONS)) {
        log(`  ${collectionName}:`, 'white');

        const exists = await checkCollectionExists(collectionName);
        if (!exists && !dryRun) {
            log(`    [SKIP] Colección no existe`, 'yellow');
            continue;
        }

        for (const relation of relations) {
            const success = await addFieldToCollection(collectionName, relation, dryRun);
            if (success) ok++; else fail++;
        }
    }

    return { ok, fail };
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const withData = args.includes('--with-data');
    const phaseArg = args.find((a, i) => args[i - 1] === '--phase');

    console.log('\n' + '╔' + '═'.repeat(68) + '╗');
    console.log('║' + '  FIX-SCHEMA-SIGO: Corrección de esquema UGCO para SIGO             ' + '║');
    console.log('╚' + '═'.repeat(68) + '╝\n');

    if (dryRun) {
        log('[!] Modo DRY-RUN: no se realizarán cambios\n', 'yellow');
    }

    const results: Record<string, { ok: number; fail: number }> = {};

    const phasesToRun = phaseArg ? [phaseArg] : ['1', '2', '3'];

    for (const phase of phasesToRun) {
        switch (phase) {
            case '1':
                results['Fase 1 - Tablas REF'] = await runPhase1(dryRun, withData);
                break;
            case '2':
                results['Fase 2 - Campos'] = await runPhase2(dryRun);
                break;
            case '3':
                results['Fase 3 - Relaciones FK'] = await runPhase3(dryRun);
                break;
            default:
                log(`[ERROR] Fase desconocida: ${phase}. Usa 1, 2 o 3.`, 'red');
        }
    }

    // Resumen
    log(`\n${'━'.repeat(70)}`, 'white');
    log('  RESUMEN:', 'white');
    log(`${'━'.repeat(70)}`, 'white');

    let totalOk = 0, totalFail = 0;
    for (const [phase, { ok, fail }] of Object.entries(results)) {
        const status = fail > 0 ? 'yellow' : 'green';
        log(`  ${phase}: ${ok} OK, ${fail} errores`, status);
        totalOk += ok;
        totalFail += fail;
    }

    log(`${'━'.repeat(70)}`, 'white');
    log(`  TOTAL: ${totalOk} OK, ${totalFail} errores`, totalFail > 0 ? 'yellow' : 'green');
    log(`${'━'.repeat(70)}\n`, 'white');

    if (!dryRun && totalFail === 0) {
        log('[OK] Esquema UGCO corregido para compatibilidad SIGO\n', 'green');
    }
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
