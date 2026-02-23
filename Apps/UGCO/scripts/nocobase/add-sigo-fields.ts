/**
 * add-sigo-fields.ts - Agregar campos y tablas faltantes para compatibilidad SIGO
 *
 * Este script agrega los campos y tablas de referencia necesarios para
 * tener cobertura completa con el formato de carga masiva de biopsias SIGO.
 *
 * Campos/Tablas agregados:
 *   - ref_oncotnm_n: Tabla TNM - Nódulos (N)
 *   - ref_lateralidad: Lateralidad del tumor
 *   - ref_extension: Extensión tumoral
 *   - ref_prevision: Previsión de salud
 *   - ref_establecimiento_deis: Establecimientos con código DEIS
 *   - Campos adicionales en ugco_casooncologico
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/add-sigo-fields.ts
 *   tsx Apps/UGCO/scripts/nocobase/add-sigo-fields.ts --dry-run
 *   tsx Apps/UGCO/scripts/nocobase/add-sigo-fields.ts --seed  # crear con datos
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

const belongsTo = (name: string, target: string, foreignKey: string) => ({
    name, type: 'belongsTo', target, foreignKey,
});

// ═══════════════════════════════════════════════════════════════════════════
// NUEVAS TABLAS DE REFERENCIA SIGO
// ═══════════════════════════════════════════════════════════════════════════

const NEW_REF_TABLES = [
    {
        name: 'ref_oncotnm_n',
        title: 'REF: TNM - Nódulos (N)',
        fields: [
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            str('localizacion', 'Localización'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
        seedData: [
            { codigo: 'N0', descripcion: 'Sin metástasis en ganglios linfáticos regionales', orden: 1 },
            { codigo: 'N1', descripcion: 'Metástasis en ganglios linfáticos regionales', orden: 2 },
            { codigo: 'N2', descripcion: 'Metástasis en múltiples ganglios linfáticos regionales', orden: 3 },
            { codigo: 'N3', descripcion: 'Metástasis en ganglios linfáticos distantes', orden: 4 },
            { codigo: 'Nx', descripcion: 'No se pueden evaluar los ganglios linfáticos regionales', orden: 5 },
            { codigo: 'Nis', descripcion: 'Carcinoma in situ - ganglios', orden: 6 },
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
        seedData: [
            { codigo: 'D', nombre: 'Derecho', codigo_sigo: 'Derecho', orden: 1 },
            { codigo: 'I', nombre: 'Izquierdo', codigo_sigo: 'Izquierdo', orden: 2 },
            { codigo: 'B', nombre: 'Bilateral', codigo_sigo: 'Bilateral', orden: 3 },
            { codigo: 'NC', nombre: 'No corresponde', codigo_sigo: 'No corresponde', orden: 4 },
            { codigo: 'D', nombre: 'Desconocido', codigo_sigo: 'Desconocido', orden: 5 },
            { codigo: 'NA', nombre: 'No aplica', codigo_sigo: 'No aplica', orden: 6 },
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
        seedData: [
            { codigo: 'IS', nombre: 'In situ', codigo_sigo: 'In situ', descripcion: 'Tumor confinado al tejido de origen', orden: 1 },
            { codigo: 'LOC', nombre: 'Localizado', codigo_sigo: 'Localizado', descripcion: 'Tumor confinado al órgano de origen', orden: 2 },
            { codigo: 'REG', nombre: 'Regional', codigo_sigo: 'Regional', descripcion: 'Extensión a estructuras adyacentes o ganglios regionales', orden: 3 },
            { codigo: 'MET', nombre: 'Metástasis', codigo_sigo: 'Metástasis', descripcion: 'Diseminación a órganos distantes', orden: 4 },
            { codigo: 'DESC', nombre: 'Desconocido', codigo_sigo: 'Desconocido', descripcion: 'No se puede determinar la extensión', orden: 5 },
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
        seedData: [
            { codigo: 'FONASA', nombre: 'FONASA', codigo_sigo: 'FONASA', tipo: 'Público', orden: 1 },
            { codigo: 'ISAPRE', nombre: 'ISAPRE', codigo_sigo: 'ISAPRE', tipo: 'Privado', orden: 2 },
            { codigo: 'CAPREDENA', nombre: 'CAPREDENA', codigo_sigo: 'CAPREDENA', tipo: 'FFAA', orden: 3 },
            { codigo: 'DIPRECA', nombre: 'DIPRECA', codigo_sigo: 'DIPRECA', tipo: 'FFAA', orden: 4 },
            { codigo: 'SISA', nombre: 'SISA', codigo_sigo: 'SISA', tipo: 'Otro', orden: 5 },
            { codigo: 'NINGUNA', nombre: 'Ninguna', codigo_sigo: 'NINGUNA', tipo: 'Sin previsión', orden: 6 },
            { codigo: 'DESCONOCIDO', nombre: 'Desconocido', codigo_sigo: 'DESCONOCIDO', tipo: 'Desconocido', orden: 7 },
        ],
    },
    {
        name: 'ref_establecimiento_deis',
        title: 'REF: Establecimientos DEIS',
        fields: [
            str('codigo_deis', 'Código DEIS'),
            str('nombre', 'Nombre Establecimiento'),
            str('tipo_establecimiento', 'Tipo'),
            str('region', 'Región'),
            str('comuna', 'Comuna'),
            str('servicio_salud', 'Servicio de Salud'),
            bool('activo', 'Activo', true),
        ],
        seedData: [
            { codigo_deis: '108100', nombre: 'Hospital San Juan de Dios de Los Andes', tipo_establecimiento: 'Hospital', region: 'Valparaíso', comuna: 'Los Andes', servicio_salud: 'Aconcagua' },
            { codigo_deis: '108102', nombre: 'Hospital de Ovalle', tipo_establecimiento: 'Hospital', region: 'Coquimbo', comuna: 'Ovalle', servicio_salud: 'Coquimbo' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// CAMPOS ADICIONALES PARA COLECCIONES EXISTENTES
// ═══════════════════════════════════════════════════════════════════════════

const ADDITIONAL_FIELDS = {
    ugco_casooncologico: [
        str('id_carga_masiva', 'ID Carga Masiva SIGO'),
        str('establecimiento_deis', 'Código Establecimiento DEIS'),
        str('lateralidad', 'Lateralidad'),
        str('extension_tumoral', 'Extensión Tumoral'),
        str('rut_patologo', 'RUT Patólogo'),
        date('fecha_examen_confirmatorio', 'Fecha Examen Confirmatorio'),
        str('topografia_descripcion', 'Descripción Topografía'),
        str('morfologia_descripcion', 'Descripción Morfología'),
        belongsTo('ref_lateralidad', 'ref_lateralidad', 'lateralidad_id'),
        belongsTo('ref_extension', 'ref_extension', 'extension_id'),
        belongsTo('establecimiento', 'ref_establecimiento_deis', 'establecimiento_id'),
        belongsTo('tnm_n_ref', 'ref_oncotnm_n', 'tnm_n_id'),
    ],
    alma_paciente: [
        str('establecimiento_deis', 'Código Establecimiento DEIS'),
        belongsTo('prevision_ref', 'ref_prevision', 'prevision_id'),
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Funciones de ejecución
// ═══════════════════════════════════════════════════════════════════════════

async function createCollection(col: any, dryRun: boolean): Promise<boolean> {
    const fieldCount = col.fields.length;

    if (dryRun) {
        log(`  [DRY] Crear colección: ${col.name} (${col.title}) — ${fieldCount} campos`, 'gray');
        return true;
    }

    try {
        await client.post('/collections:create', {
            name: col.name,
            title: col.title,
            fields: col.fields,
        });
        log(`  ✅ Creada: ${col.name} — ${fieldCount} campos`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            log(`  ⏭️  ${col.name} — ya existe`, 'yellow');
            return true;
        }
        log(`  ❌ ${col.name} — ${msg}`, 'red');
        return false;
    }
}

async function seedCollection(col: any, dryRun: boolean): Promise<boolean> {
    if (!col.seedData || col.seedData.length === 0) return true;

    if (dryRun) {
        log(`  [DRY] Seed: ${col.name} — ${col.seedData.length} registros`, 'gray');
        return true;
    }

    try {
        for (const record of col.seedData) {
            await client.post(`/${col.name}:create`, { ...record, activo: true });
        }
        log(`  ✅ Seed: ${col.name} — ${col.seedData.length} registros`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        log(`  ⚠️  Seed ${col.name} — ${msg}`, 'yellow');
        return false;
    }
}

async function addFieldToCollection(collectionName: string, field: any, dryRun: boolean): Promise<boolean> {
    if (dryRun) {
        log(`  [DRY] Agregar campo: ${collectionName}.${field.name}`, 'gray');
        return true;
    }

    try {
        await client.post(`/collections/${collectionName}/fields:create`, field);
        log(`  ✅ Campo agregado: ${collectionName}.${field.name}`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            log(`  ⏭️  ${collectionName}.${field.name} — ya existe`, 'yellow');
            return true;
        }
        log(`  ❌ ${collectionName}.${field.name} — ${msg}`, 'red');
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const withSeed = args.includes('--seed');

    log(`\n╔══════════════════════════════════════════════════════════╗`, 'cyan');
    log(`║  SIGO Fields Adder - Compatibilidad Carga Masiva        ║`, 'cyan');
    log(`╚══════════════════════════════════════════════════════════╝`, 'cyan');

    if (dryRun) {
        log('\n⚠️  Modo DRY-RUN: no se realizarán cambios\n', 'yellow');
    }

    // ═══ Fase 1: Crear nuevas tablas de referencia ═══
    log(`\n══ Fase 1: Nuevas tablas de referencia (${NEW_REF_TABLES.length}) ══\n`, 'cyan');

    let tablesOk = 0;
    let tablesFail = 0;

    for (const col of NEW_REF_TABLES) {
        const success = await createCollection(col, dryRun);
        if (success) {
            tablesOk++;
            if (withSeed) {
                await seedCollection(col, dryRun);
            }
        } else {
            tablesFail++;
        }
    }

    // ═══ Fase 2: Agregar campos a colecciones existentes ═══
    log(`\n══ Fase 2: Campos adicionales en colecciones existentes ══\n`, 'cyan');

    let fieldsOk = 0;
    let fieldsFail = 0;

    for (const [collectionName, fields] of Object.entries(ADDITIONAL_FIELDS)) {
        log(`\n  📁 ${collectionName}:`, 'white');
        for (const field of fields) {
            const success = await addFieldToCollection(collectionName, field, dryRun);
            if (success) fieldsOk++;
            else fieldsFail++;
        }
    }

    // ═══ Resumen ═══
    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Tablas:  ${tablesOk} OK, ${tablesFail} errores`, tablesFail > 0 ? 'yellow' : 'green');
    log(`  Campos:  ${fieldsOk} OK, ${fieldsFail} errores`, fieldsFail > 0 ? 'yellow' : 'green');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    if (!dryRun && withSeed) {
        log(`\n📋 Datos de referencia cargados desde diccionario SIGO`, 'green');
    }

    log(`\n✅ Cobertura SIGO completada. Campos agregados:`, 'green');
    log(`   - ref_oncotnm_n (TNM Nódulos)`, 'white');
    log(`   - ref_lateralidad (Lateralidad)`, 'white');
    log(`   - ref_extension (Extensión tumoral)`, 'white');
    log(`   - ref_prevision (Previsión salud)`, 'white');
    log(`   - ref_establecimiento_deis (Establecimientos)`, 'white');
    log(`   - Campos SIGO en ugco_casooncologico`, 'white');
    log(`   - Campos SIGO en alma_paciente\n`, 'white');
}

main().catch(err => {
    log(`\n❌ Error fatal: ${err.message}`, 'red');
    process.exit(1);
});
