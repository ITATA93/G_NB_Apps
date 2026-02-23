/**
 * add-fields-to-collections.ts - Agregar campos a colecciones UGCO existentes
 *
 * Las colecciones fueron creadas pero sin campos. Este script agrega los campos.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/add-fields-to-collections.ts --dry-run
 *   npx tsx Apps/UGCO/scripts/nocobase/add-fields-to-collections.ts
 */

import axios, { AxiosInstance } from 'axios';

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

const DRY_RUN = process.argv.includes('--dry-run');

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
    name, type: 'boolean', interface: 'checkbox',
    defaultValue,
    uiSchema: { title, type: 'boolean', 'x-component': 'Checkbox' },
});

const date = (name: string, title: string) => ({
    name, type: 'date', interface: 'datePicker',
    uiSchema: { title, type: 'string', 'x-component': 'DatePicker' },
});

const datetime = (name: string, title: string) => ({
    name, type: 'date', interface: 'datetime',
    uiSchema: { title, type: 'string', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } },
});

const belongsTo = (name: string, title: string, target: string, foreignKey?: string) => ({
    name,
    type: 'belongsTo',
    interface: 'm2o',
    target,
    foreignKey: foreignKey || `${name}_id`,
    uiSchema: { title, 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nombre', value: 'id' } } },
});

// ─── Definición de campos por colección ─────────────────────────────────────

interface CollectionFields {
    name: string;
    fields: any[];
}

const COLLECTION_FIELDS: CollectionFields[] = [
    // ═══ REF Tables ═══
    {
        name: 'UGCO_REF_oncoespecialidad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_cie10',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            str('categoria', 'Categoría'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncobasediagnostico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncodiagnostico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad_ref', 'Especialidad', 'UGCO_REF_oncoespecialidad'),
        ],
    },
    {
        name: 'UGCO_REF_oncoecog',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncoestadio_clinico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncoestadoactividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncoestadoadm',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncoestadocaso',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncoestadoclinico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncofigo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncogradohistologico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncointenciontrat',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncomorfologiaicdo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('comportamiento', 'Comportamiento'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotipoactividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotipodocumento',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotipoetapificacion',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotnm_m',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotnm_t',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotnm_n',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            str('localizacion', 'Localización'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_oncotopografiaicdo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            str('grupo', 'Grupo'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad_ref', 'Especialidad', 'UGCO_REF_oncoespecialidad'),
        ],
    },
    {
        name: 'UGCO_REF_lateralidad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_extension',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_prevision',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            str('tipo', 'Tipo'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_establecimiento_deis',
        fields: [
            str('codigo', 'Código DEIS'),
            str('nombre', 'Nombre'),
            str('tipo', 'Tipo Establecimiento'),
            str('dependencia', 'Dependencia'),
            str('region', 'Región'),
            str('comuna', 'Comuna'),
            bool('activo', 'Activo', true),
        ],
    },

    // ═══ ALMA Tables ═══
    {
        name: 'UGCO_ALMA_paciente',
        fields: [
            str('rut', 'RUT'),
            str('nombres', 'Nombres'),
            str('apellido_paterno', 'Apellido Paterno'),
            str('apellido_materno', 'Apellido Materno'),
            date('fecha_nacimiento', 'Fecha Nacimiento'),
            str('sexo', 'Sexo'),
            str('direccion', 'Dirección'),
            str('telefono', 'Teléfono'),
            str('email', 'Email'),
            str('prevision', 'Previsión'),
            str('ficha_clinica', 'Ficha Clínica'),
            bool('activo', 'Activo', true),
            belongsTo('sexo_ref', 'Sexo (REF)', 'UGCO_REF_sexo'),
            belongsTo('prevision_ref', 'Previsión (REF)', 'UGCO_REF_prevision'),
        ],
    },
    {
        name: 'UGCO_ALMA_episodio',
        fields: [
            str('numero_episodio', 'Número Episodio'),
            date('fecha_ingreso', 'Fecha Ingreso'),
            date('fecha_egreso', 'Fecha Egreso'),
            str('tipo_episodio', 'Tipo Episodio'),
            str('servicio', 'Servicio'),
            str('estado', 'Estado'),
            belongsTo('paciente_ref', 'Paciente', 'UGCO_ALMA_paciente'),
        ],
    },
    {
        name: 'UGCO_ALMA_diagnostico',
        fields: [
            str('codigo_cie10', 'Código CIE-10'),
            str('descripcion', 'Descripción'),
            date('fecha_diagnostico', 'Fecha Diagnóstico'),
            str('tipo', 'Tipo (Principal/Secundario)'),
            bool('confirmado', 'Confirmado'),
            belongsTo('episodio_ref', 'Episodio', 'UGCO_ALMA_episodio'),
            belongsTo('cie10_ref', 'CIE-10 (REF)', 'UGCO_REF_cie10'),
        ],
    },

    // ═══ UGCO Core ═══
    {
        name: 'UGCO_equiposeguimiento',
        fields: [
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_contactopaciente',
        fields: [
            str('tipo_contacto', 'Tipo de Contacto'),
            str('nombre_contacto', 'Nombre del Contacto'),
            str('parentesco', 'Parentesco'),
            str('telefono', 'Teléfono'),
            str('telefono_alternativo', 'Teléfono Alternativo'),
            str('email', 'Email'),
            str('direccion', 'Dirección'),
            str('comuna', 'Comuna'),
            str('region', 'Región'),
            txt('observaciones', 'Observaciones'),
            bool('es_contacto_principal', 'Es Contacto Principal'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_eventoclinico',
        fields: [
            date('fecha_evento', 'Fecha del Evento'),
            str('tipo_evento', 'Tipo de Evento'),
            txt('descripcion', 'Descripción'),
            str('resultado', 'Resultado'),
            txt('notas_clinicas', 'Notas Clínicas'),
            str('profesional_responsable', 'Profesional Responsable'),
            str('lugar', 'Lugar'),
            bool('requiere_seguimiento', 'Requiere Seguimiento'),
            date('fecha_proximo_control', 'Fecha Próximo Control'),
        ],
    },
    {
        name: 'UGCO_tarea',
        fields: [
            str('titulo', 'Título'),
            txt('descripcion', 'Descripción'),
            date('fecha_vencimiento', 'Fecha Vencimiento'),
            str('prioridad', 'Prioridad'),
            str('estado', 'Estado'),
            str('asignado_a', 'Asignado A'),
            txt('notas', 'Notas'),
            bool('completada', 'Completada'),
            datetime('fecha_completada', 'Fecha Completada'),
        ],
    },
    {
        name: 'UGCO_comitecaso',
        fields: [
            date('fecha_presentacion', 'Fecha Presentación'),
            txt('motivo_presentacion', 'Motivo de Presentación'),
            txt('resumen_clinico', 'Resumen Clínico'),
            txt('recomendaciones', 'Recomendaciones'),
            txt('plan_tratamiento', 'Plan de Tratamiento'),
            str('estado_revision', 'Estado de Revisión'),
            txt('observaciones', 'Observaciones'),
        ],
    },

    // ═══ REF adicionales ═══
    {
        name: 'UGCO_REF_sexo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'UGCO_REF_comuna',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('region', 'Región'),
            bool('activo', 'Activo', true),
        ],
    },

    // ═══ Colecciones principales (versión lowercase existente) ═══
    {
        name: 'ugco_casooncologico',
        fields: [
            // Datos del caso
            str('numero_caso', 'Número de Caso'),
            date('fecha_apertura', 'Fecha de Apertura'),
            date('fecha_diagnostico', 'Fecha de Diagnóstico'),
            date('fecha_cierre', 'Fecha de Cierre'),
            str('estado', 'Estado del Caso'),
            // Diagnóstico oncológico
            str('diagnostico_principal', 'Diagnóstico Principal'),
            str('codigo_cie10', 'Código CIE-10'),
            str('codigo_topografia', 'Código Topografía ICD-O'),
            str('codigo_morfologia', 'Código Morfología ICD-O'),
            str('lateralidad', 'Lateralidad'),
            str('extension', 'Extensión'),
            // Estadiaje
            str('estadio_clinico', 'Estadio Clínico'),
            str('tnm_t', 'TNM - T'),
            str('tnm_n', 'TNM - N'),
            str('tnm_m', 'TNM - M'),
            str('grado_histologico', 'Grado Histológico'),
            str('figo', 'FIGO'),
            // ECOG y estado
            str('ecog', 'ECOG'),
            str('intencion_tratamiento', 'Intención de Tratamiento'),
            str('base_diagnostico', 'Base del Diagnóstico'),
            // SIGO
            str('sigo_numero_caso', 'SIGO - Número de Caso'),
            date('sigo_fecha_notificacion', 'SIGO - Fecha Notificación'),
            str('sigo_estado', 'SIGO - Estado'),
            // Notas
            txt('notas_clinicas', 'Notas Clínicas'),
            txt('antecedentes', 'Antecedentes'),
            bool('activo', 'Activo', true),
            // Relaciones
            belongsTo('paciente_ref', 'Paciente', 'UGCO_ALMA_paciente'),
            belongsTo('especialidad_ref', 'Especialidad', 'UGCO_REF_oncoespecialidad'),
            belongsTo('equipo_ref', 'Equipo de Seguimiento', 'UGCO_equiposeguimiento'),
            belongsTo('cie10_ref', 'CIE-10 (REF)', 'UGCO_REF_cie10'),
            belongsTo('topografia_ref', 'Topografía (REF)', 'UGCO_REF_oncotopografiaicdo'),
            belongsTo('morfologia_ref', 'Morfología (REF)', 'UGCO_REF_oncomorfologiaicdo'),
            belongsTo('lateralidad_ref', 'Lateralidad (REF)', 'UGCO_REF_lateralidad'),
            belongsTo('extension_ref', 'Extensión (REF)', 'UGCO_REF_extension'),
            belongsTo('estadio_ref', 'Estadio Clínico (REF)', 'UGCO_REF_oncoestadio_clinico'),
            belongsTo('grado_ref', 'Grado Histológico (REF)', 'UGCO_REF_oncogradohistologico'),
            belongsTo('tnm_t_ref', 'TNM-T (REF)', 'UGCO_REF_oncotnm_t'),
            belongsTo('tnm_n_ref', 'TNM-N (REF)', 'UGCO_REF_oncotnm_n'),
            belongsTo('tnm_m_ref', 'TNM-M (REF)', 'UGCO_REF_oncotnm_m'),
            belongsTo('ecog_ref', 'ECOG (REF)', 'UGCO_REF_oncoecog'),
            belongsTo('intencion_ref', 'Intención Tratamiento (REF)', 'UGCO_REF_oncointenciontrat'),
            belongsTo('base_diag_ref', 'Base Diagnóstico (REF)', 'UGCO_REF_oncobasediagnostico'),
        ],
    },
    {
        name: 'ugco_comiteoncologico',
        fields: [
            str('nombre', 'Nombre del Comité'),
            str('tipo', 'Tipo de Comité'),
            str('especialidad', 'Especialidad'),
            date('fecha_sesion', 'Fecha de Sesión'),
            str('lugar', 'Lugar'),
            str('moderador', 'Moderador'),
            txt('agenda', 'Agenda'),
            txt('acta', 'Acta'),
            str('estado', 'Estado'),
            int('total_casos', 'Total de Casos'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad_ref', 'Especialidad (REF)', 'UGCO_REF_oncoespecialidad'),
        ],
    },
];

// ─── Colores para consola ───────────────────────────────────────────────────

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  ADD FIELDS TO UGCO COLLECTIONS                                   ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');

    if (DRY_RUN) {
        log('\n  [!] Modo DRY-RUN: no se agregarán campos\n', 'yellow');
    }

    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    // Verificar conexión
    log('\n  Verificando conexión...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida\n', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] No se puede conectar: ${error.message}`, 'red');
        process.exit(1);
    }

    let totalFields = 0;
    let totalErrors = 0;

    for (const col of COLLECTION_FIELDS) {
        const { name, fields } = col;
        process.stdout.write(`  ${name} — ${fields.length} campos...`);

        if (DRY_RUN) {
            console.log(colors.green(' [DRY-OK]'));
            totalFields += fields.length;
            continue;
        }

        let colErrors = 0;
        for (const field of fields) {
            try {
                await client.post(`/${name}/fields:create`, field);
            } catch (error: any) {
                const msg = error.response?.data?.errors?.[0]?.message || error.message;
                if (!msg.includes('already exists') && !msg.includes('duplicate')) {
                    colErrors++;
                }
            }
        }

        if (colErrors > 0) {
            console.log(colors.yellow(` ${fields.length - colErrors} OK, ${colErrors} errores`));
            totalErrors += colErrors;
        } else {
            console.log(colors.green(' OK'));
        }
        totalFields += fields.length - colErrors;
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Campos agregados: ${totalFields}`, 'green');
    if (totalErrors > 0) {
        log(`  Errores: ${totalErrors}`, 'red');
    }
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');
}

main().catch(console.error);
