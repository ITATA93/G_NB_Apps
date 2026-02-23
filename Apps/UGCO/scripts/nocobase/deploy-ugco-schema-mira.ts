/**
 * deploy-ugco-schema-mira.ts - Desplegar esquema UGCO en MIRA con prefijo UGCO_
 *
 * Toma las definiciones del esquema local y las carga en MIRA con todas
 * las colecciones renombradas con el prefijo UGCO_ para agruparlas.
 *
 * Mapeo de nombres:
 *   ref_*  → UGCO_REF_*
 *   alma_* → UGCO_ALMA_*
 *   ugco_* → UGCO_*
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/deploy-ugco-schema-mira.ts --dry-run   # simular
 *   tsx Apps/UGCO/scripts/nocobase/deploy-ugco-schema-mira.ts             # ejecutar
 *   tsx Apps/UGCO/scripts/nocobase/deploy-ugco-schema-mira.ts --phase 1   # solo REF
 */

import axios, { AxiosInstance } from 'axios';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

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

const datetime = (name: string, title: string) => ({
    name, type: 'date', interface: 'datePicker',
    uiSchema: {
        title, type: 'string', 'x-component': 'DatePicker',
        'x-component-props': { dateFormat: 'YYYY-MM-DD', showTime: true },
    },
});

const select = (name: string, title: string, options: string[]) => ({
    name, type: 'string', interface: 'select',
    uiSchema: {
        title, type: 'string', 'x-component': 'Select',
        enum: options.map(v => ({ label: v, value: v })),
    },
});

const belongsTo = (name: string, target: string, foreignKey: string) => ({
    name, type: 'belongsTo', target, foreignKey,
});

// ─── Campos comunes ─────────────────────────────────────────────────────────

const auditFields = () => [
    str('creado_por', 'Creado por'),
    datetime('fecha_creacion', 'Fecha creación'),
    str('modificado_por', 'Modificado por'),
    datetime('fecha_modificacion', 'Fecha modificación'),
];

const ugcoCodes = () => [
    str('UGCO_COD01', 'Código UGCO 01'),
    str('UGCO_COD02', 'Código UGCO 02'),
    str('UGCO_COD03', 'Código UGCO 03'),
    str('UGCO_COD04', 'Código UGCO 04'),
];

// ─── Función para renombrar colecciones ─────────────────────────────────────

function renameCollection(originalName: string): string {
    if (originalName.startsWith('ref_')) {
        return 'UGCO_REF_' + originalName.substring(4);
    }
    if (originalName.startsWith('alma_')) {
        return 'UGCO_ALMA_' + originalName.substring(5);
    }
    if (originalName.startsWith('ugco_')) {
        return 'UGCO_' + originalName.substring(5);
    }
    return 'UGCO_' + originalName;
}

function renameTarget(originalTarget: string): string {
    return renameCollection(originalTarget);
}

function transformFields(fields: any[]): any[] {
    return fields.map(field => {
        if (field.type === 'belongsTo' && field.target) {
            return {
                ...field,
                target: renameTarget(field.target),
            };
        }
        return field;
    });
}

function transformCollection(col: any): any {
    return {
        name: renameCollection(col.name),
        title: col.title,
        fields: transformFields(col.fields),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFINICIÓN DEL ESQUEMA (igual que create-full-schema.ts)
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_1_REF: any[] = [
    {
        name: 'ref_oncoespecialidad',
        title: 'UGCO REF: Especialidades Oncológicas',
        fields: [
            str('codigo_alma', 'Código ALMA'),
            str('codigo_oficial', 'Código Oficial'),
            str('codigo_map_snomed', 'Código SNOMED'),
            str('codigo_map_deis', 'Código DEIS'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_cie10',
        title: 'UGCO REF: Clasificación CIE-10',
        fields: [
            str('codigo_oficial', 'Código CIE-10'),
            str('descripcion', 'Descripción'),
            str('capitulo', 'Capítulo'),
            str('grupo', 'Grupo'),
            str('categoria', 'Categoría'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncobasediagnostico',
        title: 'UGCO REF: Base del Diagnóstico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('es_histologico', 'Es histológico', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncodiagnostico',
        title: 'UGCO REF: Diagnósticos Oncológicos',
        fields: [
            str('codigo_cie10', 'Código CIE-10'),
            str('nombre_dx', 'Nombre diagnóstico'),
            str('grupo_tumor', 'Grupo tumoral'),
            bool('es_maligno', 'Es maligno', true),
            bool('activo', 'Activo', true),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
    {
        name: 'ref_oncoecog',
        title: 'UGCO REF: Escala ECOG',
        fields: [
            int('valor', 'Valor'),
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadio_clinico',
        title: 'UGCO REF: Estadios Clínicos',
        fields: [
            str('sistema', 'Sistema'),
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('localizacion', 'Localización'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadoactividad',
        title: 'UGCO REF: Estado de Actividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadoadm',
        title: 'UGCO REF: Estado Administrativo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadocaso',
        title: 'UGCO REF: Estado de Caso',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadoclinico',
        title: 'UGCO REF: Estado Clínico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_maligno', 'Es maligno', true),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncofigo',
        title: 'UGCO REF: Estadios FIGO',
        fields: [
            str('localizacion', 'Localización'),
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncogradohistologico',
        title: 'UGCO REF: Grado Histológico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncointenciontrat',
        title: 'UGCO REF: Intención de Tratamiento',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_curativo', 'Es curativo', false),
            bool('es_paliativo', 'Es paliativo', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncomorfologiaicdo',
        title: 'UGCO REF: Morfología ICD-O',
        fields: [
            str('codigo_oficial', 'Código ICD-O'),
            str('comportamiento', 'Comportamiento'),
            str('descripcion', 'Descripción'),
            bool('es_maligno', 'Es maligno', true),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipoactividad',
        title: 'UGCO REF: Tipo de Actividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_clinica', 'Es clínica', true),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipodocumento',
        title: 'UGCO REF: Tipo de Documento',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipoetapificacion',
        title: 'UGCO REF: Tipo de Etapificación',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotnm_m',
        title: 'UGCO REF: TNM - Metástasis (M)',
        fields: [
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotnm_t',
        title: 'UGCO REF: TNM - Tumor (T)',
        fields: [
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotnm_n',
        title: 'UGCO REF: TNM - Nódulos (N)',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotopografiaicdo',
        title: 'UGCO REF: Topografía ICD-O',
        fields: [
            str('codigo_oficial', 'Código ICD-O'),
            str('descripcion', 'Descripción'),
            str('sitio_anatomico', 'Sitio anatómico'),
            str('grupo_tumor', 'Grupo tumoral'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
    {
        name: 'ref_lateralidad',
        title: 'UGCO REF: Lateralidad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_extension',
        title: 'UGCO REF: Extensión Tumoral',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            txt('descripcion', 'Descripción'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_prevision',
        title: 'UGCO REF: Previsión de Salud',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            str('tipo', 'Tipo'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_establecimiento_deis',
        title: 'UGCO REF: Establecimientos DEIS',
        fields: [
            str('codigo_deis', 'Código DEIS'),
            str('nombre', 'Nombre Establecimiento'),
            str('tipo_establecimiento', 'Tipo'),
            str('nivel_atencion', 'Nivel Atención'),
            str('region', 'Región'),
            str('comuna', 'Comuna'),
            str('servicio_salud', 'Servicio de Salud'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_sexo',
        title: 'UGCO REF: Sexo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            str('codigo_hl7', 'Código HL7'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_comuna',
        title: 'UGCO REF: Comunas',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('region', 'Región'),
            str('provincia', 'Provincia'),
            bool('activo', 'Activo', true),
        ],
    },
];

const PHASE_2_ALMA: any[] = [
    {
        name: 'alma_paciente',
        title: 'UGCO ALMA: Paciente',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('run', 'RUN'),
            str('tipo_documento', 'Tipo documento'),
            str('nro_documento', 'Nro. documento'),
            str('dv', 'DV'),
            str('nombres', 'Nombres'),
            str('apellido_paterno', 'Apellido paterno'),
            str('apellido_materno', 'Apellido materno'),
            date('fecha_nacimiento', 'Fecha nacimiento'),
            str('sexo', 'Sexo'),
            str('genero', 'Género'),
            str('nacionalidad', 'Nacionalidad'),
            str('prevision', 'Previsión'),
            date('fecha_defuncion', 'Fecha defunción'),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            str('codigo_establecimiento_deis', 'Código Establecimiento DEIS'),
            belongsTo('prevision_ref', 'ref_prevision', 'prevision_id'),
            belongsTo('sexo_ref', 'ref_sexo', 'sexo_id'),
        ],
    },
    {
        name: 'alma_episodio',
        title: 'UGCO ALMA: Episodio',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('tipo_episodio', 'Tipo episodio'),
            datetime('fecha_ingreso', 'Fecha ingreso'),
            datetime('fecha_egreso', 'Fecha egreso'),
            str('establecimiento', 'Establecimiento'),
            str('servicio', 'Servicio'),
            str('unidad', 'Unidad'),
            str('profesional_tratante', 'Profesional tratante'),
            txt('motivo_consulta', 'Motivo consulta'),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
        ],
    },
    {
        name: 'alma_diagnostico',
        title: 'UGCO ALMA: Diagnóstico',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('tipo_diagnostico', 'Tipo diagnóstico'),
            str('codigo_cie10', 'Código CIE-10'),
            str('descripcion', 'Descripción'),
            datetime('fecha_registro', 'Fecha registro'),
            bool('es_oncologico', 'Es oncológico', false),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio', 'alma_episodio', 'episodio_id'),
        ],
    },
];

const PHASE_3_UGCO_CORE: any[] = [
    {
        name: 'ugco_equiposeguimiento',
        title: 'UGCO: Equipo de Seguimiento',
        fields: [
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
    {
        name: 'ugco_casooncologico',
        title: 'UGCO: Caso Oncológico',
        fields: [
            ...ugcoCodes(),
            // Diagnóstico
            str('codigo_cie10', 'Código CIE-10'),
            str('cie10_glosa', 'Glosa CIE-10'),
            str('topografia_icdo', 'Topografía ICD-O'),
            str('topografia_descripcion', 'Descripción Topografía'),
            str('morfologia_icdo', 'Morfología ICD-O'),
            str('morfologia_descripcion', 'Descripción Morfología'),
            str('comportamiento', 'Comportamiento'),
            date('fecha_diagnostico', 'Fecha diagnóstico'),
            str('base_diagnostico', 'Base del diagnóstico'),
            // Etapificación
            str('tipo_etapificacion', 'Tipo etapificación'),
            str('tnm_t', 'TNM - T'),
            str('tnm_n', 'TNM - N'),
            str('tnm_m', 'TNM - M'),
            str('estadio_clinico', 'Estadio clínico'),
            str('figo', 'FIGO'),
            str('grado_diferenciacion', 'Grado diferenciación'),
            str('ecog_inicial', 'ECOG inicial'),
            // Campos SIGO
            str('id_carga_masiva', 'ID Carga Masiva SIGO'),
            str('codigo_establecimiento_deis', 'Código Establecimiento DEIS'),
            str('lateralidad', 'Lateralidad'),
            str('extension_tumoral', 'Extensión Tumoral'),
            str('rut_patologo', 'RUT Patólogo'),
            date('fecha_examen_confirmatorio', 'Fecha Examen Confirmatorio'),
            select('fuente_dato', 'Fuente del Dato', ['ALMA', 'SIGO', 'MANUAL', 'EXTERNO']),
            // Garantías
            str('garantia', 'Garantía (GES/CAEC)'),
            // FHIR fields
            select('clinical_status', 'Clinical Status', ['active', 'recurrence', 'relapse', 'remission', 'resolved']),
            select('verification_status', 'Verification Status', ['unconfirmed', 'provisional', 'differential', 'confirmed', 'refuted']),
            // Fechas seguimiento
            date('fecha_caso', 'Fecha caso'),
            date('fecha_inicio_seguimiento', 'Fecha inicio seguimiento'),
            date('fecha_ultimo_contacto', 'Último contacto'),
            // Defunción
            bool('fallecido', 'Fallecido'),
            date('fecha_defuncion', 'Fecha defunción'),
            str('causa_defuncion', 'Causa defunción'),
            // Otros
            txt('comentario_general', 'Comentario general'),
            // Auditoría
            ...auditFields(),
            // Relaciones
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio_alma', 'alma_episodio', 'episodio_alma_id'),
            belongsTo('diag_alma', 'alma_diagnostico', 'diag_alma_id'),
            belongsTo('estado_clinico', 'ref_oncoestadoclinico', 'estado_clinico_id'),
            belongsTo('estado_adm', 'ref_oncoestadoadm', 'estado_adm_id'),
            belongsTo('intencion_trat', 'ref_oncointenciontrat', 'intencion_trat_id'),
            belongsTo('cie10_ref', 'ref_cie10', 'cie10_id'),
            belongsTo('topografia_ref', 'ref_oncotopografiaicdo', 'topografia_id'),
            belongsTo('morfologia_ref', 'ref_oncomorfologiaicdo', 'morfologia_id'),
            belongsTo('tnm_t_ref', 'ref_oncotnm_t', 'tnm_t_id'),
            belongsTo('tnm_n_ref', 'ref_oncotnm_n', 'tnm_n_id'),
            belongsTo('tnm_m_ref', 'ref_oncotnm_m', 'tnm_m_id'),
            belongsTo('lateralidad_ref', 'ref_lateralidad', 'lateralidad_id'),
            belongsTo('extension_ref', 'ref_extension', 'extension_id'),
            belongsTo('grado_histologico_ref', 'ref_oncogradohistologico', 'grado_histologico_id'),
        ],
    },
    {
        name: 'ugco_comiteoncologico',
        title: 'UGCO: Comité Oncológico',
        fields: [
            ...ugcoCodes(),
            datetime('fecha_comite', 'Fecha comité'),
            str('nombre', 'Nombre'),
            str('tipo_comite', 'Tipo comité'),
            str('lugar', 'Lugar'),
            txt('observaciones', 'Observaciones'),
            ...auditFields(),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
];

const PHASE_4_UGCO_SEC: any[] = [
    {
        name: 'ugco_contactopaciente',
        title: 'UGCO: Contacto Paciente',
        fields: [
            str('region_residencia', 'Región'),
            str('provincia_residencia', 'Provincia'),
            str('comuna_residencia', 'Comuna'),
            str('direccion', 'Dirección'),
            str('telefono_1', 'Teléfono 1'),
            str('telefono_2', 'Teléfono 2'),
            str('email', 'Email'),
            select('fuente_dato', 'Fuente dato', ['ALMA', 'SIGO', 'MANUAL']),
            txt('observaciones', 'Observaciones'),
            ...auditFields(),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('comuna_ref', 'ref_comuna', 'comuna_id'),
        ],
    },
    {
        name: 'ugco_eventoclinico',
        title: 'UGCO: Evento Clínico',
        fields: [
            ...ugcoCodes(),
            select('tipo_evento', 'Tipo evento', ['EXAMEN', 'CIRUGIA', 'QT', 'RT', 'OTRO']),
            str('subtipo_evento', 'Subtipo evento'),
            date('fecha_solicitud', 'Fecha solicitud'),
            date('fecha_realizacion', 'Fecha realización'),
            txt('resultado_resumen', 'Resumen resultado'),
            str('centro_realizacion', 'Centro realización'),
            select('origen_dato', 'Origen dato', ['ALMA', 'EXTERNO', 'MANUAL']),
            ...auditFields(),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
        ],
    },
    {
        name: 'ugco_tarea',
        title: 'UGCO: Tarea',
        fields: [
            ...ugcoCodes(),
            str('titulo', 'Título'),
            txt('descripcion', 'Descripción'),
            datetime('fecha_vencimiento', 'Fecha vencimiento'),
            datetime('fecha_cierre', 'Fecha cierre'),
            str('responsable_usuario', 'Responsable'),
            txt('comentarios', 'Comentarios'),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('tipo_tarea', 'ref_oncotipoactividad', 'tipo_tarea_id'),
            belongsTo('estado_tarea', 'ref_oncoestadoactividad', 'estado_tarea_id'),
        ],
    },
    {
        name: 'ugco_comitecaso',
        title: 'UGCO: Caso en Comité',
        fields: [
            bool('es_caso_principal', 'Es caso principal', false),
            txt('decision_resumen', 'Resumen decisión'),
            txt('plan_tratamiento', 'Plan tratamiento'),
            str('responsable_seguimiento', 'Responsable seguimiento'),
            ...auditFields(),
            belongsTo('comite', 'ugco_comiteoncologico', 'comite_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// Cliente y ejecución
// ═══════════════════════════════════════════════════════════════════════════

function createMiraClient(): AxiosInstance {
    return axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });
}

function log(msg: string, color: string = 'white') {
    const colors: Record<string, string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
        white: '\x1b[37m',
    };
    console.log(`${colors[color] || ''}${msg}\x1b[0m`);
}

interface PhaseConfig {
    label: string;
    collections: any[];
}

const PHASES: Record<string, PhaseConfig> = {
    '1': { label: 'REF (Catálogos de referencia)', collections: PHASE_1_REF },
    '2': { label: 'ALMA (Tablas espejo HIS)', collections: PHASE_2_ALMA },
    '3': { label: 'UGCO Core (Caso, Equipo, Comité)', collections: PHASE_3_UGCO_CORE },
    '4': { label: 'UGCO Secundarias', collections: PHASE_4_UGCO_SEC },
};

async function createCollection(client: AxiosInstance, col: any, dryRun: boolean): Promise<boolean> {
    const transformed = transformCollection(col);
    const fieldCount = transformed.fields.length;
    const relCount = transformed.fields.filter((f: any) => f.type === 'belongsTo').length;

    if (dryRun) {
        log(`  [DRY] ${transformed.name} (${transformed.title}) — ${fieldCount} campos, ${relCount} rel`, 'gray');
        return true;
    }

    try {
        await client.post('/collections:create', {
            name: transformed.name,
            title: transformed.title,
            fields: transformed.fields,
        });
        log(`  [OK] ${transformed.name} — ${fieldCount} campos, ${relCount} rel`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            log(`  [SKIP] ${transformed.name} — ya existe`, 'yellow');
            return true;
        }
        log(`  [ERROR] ${transformed.name} — ${msg}`, 'red');
        return false;
    }
}

async function createPhase(client: AxiosInstance, phaseKey: string, dryRun: boolean): Promise<{ ok: number; fail: number }> {
    const phase = PHASES[phaseKey];
    log(`\n══ Fase ${phaseKey}: ${phase.label} (${phase.collections.length} colecciones) ══\n`, 'cyan');

    let ok = 0;
    let fail = 0;
    for (const col of phase.collections) {
        const success = await createCollection(client, col, dryRun);
        if (success) ok++;
        else fail++;
    }

    return { ok, fail };
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const phaseArg = args.find((a, i) => args[i - 1] === '--phase');

    const totalCollections = Object.values(PHASES).reduce((n, p) => n + p.collections.length, 0);

    console.log('\n');
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  DEPLOY UGCO SCHEMA TO MIRA                                       ║', 'cyan');
    log('║  Hospital Dr. Antonio Tirado Lanas de Ovalle                      ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');
    log(`  Colecciones: ${totalCollections} (con prefijo UGCO_)`, 'gray');

    if (dryRun) {
        log('\n  [!] Modo DRY-RUN: no se crearán colecciones\n', 'yellow');
    }

    const client = createMiraClient();

    // Verificar conexión
    log('\n  Verificando conexión...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida\n', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] No se puede conectar a MIRA: ${error.message}`, 'red');
        process.exit(1);
    }

    const phasesToRun = phaseArg ? [phaseArg] : Object.keys(PHASES);
    let totalOk = 0;
    let totalFail = 0;

    for (const pk of phasesToRun) {
        if (!PHASES[pk]) {
            log(`[ERROR] Fase desconocida: ${pk}. Usa 1, 2, 3 o 4.`, 'red');
            process.exit(1);
        }
        const { ok, fail } = await createPhase(client, pk, dryRun);
        totalOk += ok;
        totalFail += fail;
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Resultado: ${totalOk} OK, ${totalFail} errores`, totalFail > 0 ? 'yellow' : 'green');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    if (!dryRun && totalFail === 0) {
        log('  Mapeo de nombres:', 'gray');
        log('    ref_*  → UGCO_REF_*', 'gray');
        log('    alma_* → UGCO_ALMA_*', 'gray');
        log('    ugco_* → UGCO_*\n', 'gray');
    }
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
