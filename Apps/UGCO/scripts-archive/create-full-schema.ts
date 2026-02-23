/**
 * create-full-schema.ts - Creación completa del esquema UGCO en NocoBase
 *
 * Crea las 43 colecciones del sistema UGCO (27 REF + 5 ALMA + 11 UGCO)
 * con todos los campos, relaciones belongsTo y datos de interfaz.
 *
 * ACTUALIZADO: Incluye tablas SIGO para compatibilidad con carga masiva biopsias:
 *   - ref_oncotnm_n (TNM - Nódulos)
 *   - ref_lateralidad
 *   - ref_extension
 *   - ref_prevision
 *   - ref_establecimiento_deis
 *   - ref_sexo (unificada SIGO/HL7/ALMA)
 *   - ref_morfologia_sinonimos
 *
 * Orden de creación:
 *   Fase 1: REF_* (catálogos de referencia, sin dependencias)
 *   Fase 2: ALMA_* (tablas espejo del HIS)
 *   Fase 3: UGCO_* core (caso oncológico, equipos, comités)
 *   Fase 4: UGCO_* secundarias (dependen de core)
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts          # crear todo
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts --phase 1 # solo REF
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts --phase 2 # solo ALMA
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts --phase 3 # solo UGCO core
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts --phase 4 # solo UGCO sec.
 *   tsx Apps/UGCO/scripts/nocobase/create-full-schema.ts --dry-run  # solo mostrar
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

// ─── Campos comunes de auditoría ────────────────────────────────────────────

const auditFields = () => [
    str('creado_por', 'Creado por'),
    datetime('fecha_creacion', 'Fecha creación'),
    str('modificado_por', 'Modificado por'),
    datetime('fecha_modificacion', 'Fecha modificación'),
];

// Códigos interoperabilidad UGCO
const ugcoCodes = () => [
    str('UGCO_COD01', 'Código UGCO 01'),
    str('UGCO_COD02', 'Código UGCO 02'),
    str('UGCO_COD03', 'Código UGCO 03'),
    str('UGCO_COD04', 'Código UGCO 04'),
];

// ═══════════════════════════════════════════════════════════════════════════
// FASE 1: Tablas de Referencia (REF_*)
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_1_REF: any[] = [
    {
        name: 'ref_oncoespecialidad',
        title: 'REF: Especialidades Oncológicas',
        fields: [
            str('codigo_alma', 'Código ALMA'),
            str('codigo_oficial', 'Código Oficial'),
            str('codigo_map_snomed', 'Código SNOMED'),
            str('codigo_map_deis', 'Código DEIS'),
            str('codigo_map_legacy', 'Código Legacy'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_cie10',
        title: 'REF: Clasificación CIE-10',
        fields: [
            str('codigo_alma', 'Código ALMA'),
            str('codigo_oficial', 'Código CIE-10'),
            str('codigo_map_snomed', 'Código SNOMED'),
            str('codigo_map_deis', 'Código DEIS'),
            str('codigo_map_legacy', 'Código Legacy'),
            str('descripcion', 'Descripción'),
            str('capitulo', 'Capítulo'),
            str('grupo', 'Grupo'),
            str('categoria', 'Categoría'),
            str('sistema_cod', 'Sistema codificación', { extra: { defaultValue: 'http://hl7.org/fhir/sid/icd-10' } }),
            str('version', 'Versión', { extra: { defaultValue: '2019' } }),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncobasediagnostico',
        title: 'REF: Base del Diagnóstico',
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
        title: 'REF: Diagnósticos Oncológicos',
        fields: [
            str('codigo_cie10', 'Código CIE-10'),
            str('nombre_dx', 'Nombre diagnóstico'),
            str('grupo_tumor', 'Grupo tumoral'),
            bool('es_maligno', 'Es maligno', true),
            bool('es_in_situ', 'Es in situ', false),
            bool('es_hematologico', 'Es hematológico', false),
            bool('activo', 'Activo', true),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
    {
        name: 'ref_oncoecog',
        title: 'REF: Escala ECOG',
        fields: [
            int('valor', 'Valor'),
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadio_clinico',
        title: 'REF: Estadios Clínicos',
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
        title: 'REF: Estado de Actividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadoadm',
        title: 'REF: Estado Administrativo',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadocaso',
        title: 'REF: Estado de Caso',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_final', 'Es estado final', false),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncoestadoclinico',
        title: 'REF: Estado Clínico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_maligno', 'Es maligno', true),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncofigo',
        title: 'REF: Estadios FIGO',
        fields: [
            str('localizacion', 'Localización'),
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncogradohistologico',
        title: 'REF: Grado Histológico',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncointenciontrat',
        title: 'REF: Intención de Tratamiento',
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
        title: 'REF: Morfología ICD-O',
        fields: [
            str('codigo_alma', 'Código ALMA'),
            str('codigo_oficial', 'Código ICD-O'),
            str('codigo_map_snomed', 'Código SNOMED'),
            str('codigo_map_deis', 'Código DEIS'),
            str('codigo_map_legacy', 'Código Legacy'),
            str('comportamiento', 'Comportamiento'),
            str('descripcion', 'Descripción'),
            bool('es_maligno', 'Es maligno', true),
            str('sistema_cod', 'Sistema codificación', { extra: { defaultValue: 'http://terminology.hl7.org/CodeSystem/icd-o-3' } }),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipoactividad',
        title: 'REF: Tipo de Actividad',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            bool('es_clinica', 'Es clínica', true),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipodocumento',
        title: 'REF: Tipo de Documento',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotipoetapificacion',
        title: 'REF: Tipo de Etapificación',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            txt('descripcion', 'Descripción'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotnm_m',
        title: 'REF: TNM - Metástasis (M)',
        fields: [
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            str('localizacion', 'Localización'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotnm_t',
        title: 'REF: TNM - Tumor (T)',
        fields: [
            str('codigo', 'Código'),
            str('descripcion', 'Descripción'),
            str('localizacion', 'Localización'),
            bool('activo', 'Activo', true),
        ],
    },
    {
        name: 'ref_oncotopografiaicdo',
        title: 'REF: Topografía ICD-O',
        fields: [
            str('codigo_alma', 'Código ALMA'),
            str('codigo_oficial', 'Código ICD-O'),
            str('codigo_map_snomed', 'Código SNOMED'),
            str('codigo_map_deis', 'Código DEIS'),
            str('codigo_map_legacy', 'Código Legacy'),
            str('descripcion', 'Descripción'),
            str('sitio_anatomico', 'Sitio anatómico'),
            str('grupo_tumor', 'Grupo tumoral'),
            str('sistema_cod', 'Sistema codificación', { extra: { defaultValue: 'http://terminology.hl7.org/CodeSystem/icd-o-3' } }),
            str('version', 'Versión'),
            bool('activo', 'Activo', true),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
        ],
    },
    // ─── Tablas SIGO (compatibilidad carga masiva biopsias) ─────────────────
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
    },
    {
        name: 'ref_sexo',
        title: 'REF: Sexo (Unificado)',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('codigo_sigo', 'Código SIGO'),
            str('codigo_hl7', 'Código HL7'),
            str('codigo_alma', 'Código ALMA'),
            int('orden', 'Orden'),
            bool('activo', 'Activo', true),
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
    },
    {
        name: 'ref_comuna',
        title: 'REF: Comunas',
        fields: [
            str('codigo', 'Código'),
            str('nombre', 'Nombre'),
            str('region', 'Región'),
            str('provincia', 'Provincia'),
            bool('activo', 'Activo', true),
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// FASE 2: Tablas ALMA (espejo del HIS)
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_2_ALMA: any[] = [
    {
        name: 'alma_paciente',
        title: 'ALMA: Paciente',
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
            str('sistema_prevision', 'Sistema previsión'),
            date('fecha_defuncion', 'Fecha defunción'),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            // Campos SIGO
            str('codigo_establecimiento_deis', 'Código Establecimiento DEIS'),
            // Relaciones SIGO
            belongsTo('prevision_ref', 'ref_prevision', 'prevision_id'),
            belongsTo('sexo_ref', 'ref_sexo', 'sexo_id'),
            belongsTo('establecimiento_origen', 'ref_establecimiento_deis', 'establecimiento_origen_id'),
        ],
    },
    {
        name: 'alma_episodio',
        title: 'ALMA: Episodio',
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
            txt('resumen_alta', 'Resumen alta'),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
        ],
    },
    {
        name: 'alma_diagnostico',
        title: 'ALMA: Diagnóstico',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('tipo_diagnostico', 'Tipo diagnóstico'),
            str('codigo_cie10', 'Código CIE-10'),
            str('descripcion', 'Descripción'),
            datetime('fecha_registro', 'Fecha registro'),
            str('profesional_registra', 'Profesional registra'),
            bool('es_oncologico', 'Es oncológico', false),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio', 'alma_episodio', 'episodio_id'),
        ],
    },
    {
        name: 'alma_interconsulta',
        title: 'ALMA: Interconsulta',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('especialidad_solicitada', 'Especialidad solicitada'),
            str('servicio_solicitante', 'Servicio solicitante'),
            str('profesional_solicitante', 'Profesional solicitante'),
            txt('motivo_solicitud', 'Motivo solicitud'),
            select('prioridad', 'Prioridad', ['RUTINA', 'URGENTE']),
            datetime('fecha_solicitud', 'Fecha solicitud'),
            datetime('fecha_aceptacion', 'Fecha aceptación'),
            datetime('fecha_respuesta', 'Fecha respuesta'),
            select('estado_ic', 'Estado IC', ['PENDIENTE', 'ACEPTADA', 'EN_CURSO', 'RESPONDIDA', 'RECHAZADA', 'CANCELADA']),
            str('profesional_responde', 'Profesional responde'),
            txt('respuesta_resumen', 'Resumen respuesta'),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio', 'alma_episodio', 'episodio_id'),
        ],
    },
    {
        name: 'alma_ordenexamen',
        title: 'ALMA: Orden de Examen',
        fields: [
            int('id_alma', 'ID ALMA'),
            str('tipo_orden', 'Tipo orden'),
            str('codigo_examen', 'Código examen'),
            str('nombre_examen', 'Nombre examen'),
            datetime('fecha_solicitud', 'Fecha solicitud'),
            datetime('fecha_programada', 'Fecha programada'),
            datetime('fecha_realizacion', 'Fecha realización'),
            datetime('fecha_informe', 'Fecha informe'),
            select('estado_orden', 'Estado orden', ['SOLICITADO', 'PROGRAMADO', 'REALIZADO', 'INFORMADO', 'CANCELADO']),
            str('servicio_solicitante', 'Servicio solicitante'),
            str('profesional_solicitante', 'Profesional solicitante'),
            txt('resultado_resumen', 'Resumen resultado'),
            str('url_informe', 'URL informe'),
            datetime('fecha_ultima_actualizacion', 'Última actualización'),
            bool('activo', 'Activo', true),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio', 'alma_episodio', 'episodio_id'),
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// FASE 3: Tablas UGCO Core
// ═══════════════════════════════════════════════════════════════════════════

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
            // Campos SIGO adicionales
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
            select('severity', 'Severity', ['severe', 'moderate', 'mild']),
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
            // Relaciones base
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('episodio_alma', 'alma_episodio', 'episodio_alma_id'),
            belongsTo('diag_alma', 'alma_diagnostico', 'diag_alma_id'),
            belongsTo('estado_clinico', 'ref_oncoestadoclinico', 'estado_clinico_id'),
            belongsTo('estado_adm', 'ref_oncoestadoadm', 'estado_adm_id'),
            belongsTo('intencion_trat', 'ref_oncointenciontrat', 'intencion_trat_id'),
            belongsTo('estado_seguimiento', 'ref_oncoestadocaso', 'estado_seguimiento_id'),
            // Relaciones SIGO/Catálogos
            belongsTo('cie10_ref', 'ref_cie10', 'cie10_id'),
            belongsTo('topografia_ref', 'ref_oncotopografiaicdo', 'topografia_id'),
            belongsTo('morfologia_ref', 'ref_oncomorfologiaicdo', 'morfologia_id'),
            belongsTo('tnm_t_ref', 'ref_oncotnm_t', 'tnm_t_id'),
            belongsTo('tnm_n_ref', 'ref_oncotnm_n', 'tnm_n_id'),
            belongsTo('tnm_m_ref', 'ref_oncotnm_m', 'tnm_m_id'),
            belongsTo('lateralidad_ref', 'ref_lateralidad', 'lateralidad_id'),
            belongsTo('extension_ref', 'ref_extension', 'extension_id'),
            belongsTo('establecimiento_ref', 'ref_establecimiento_deis', 'establecimiento_id'),
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

// ═══════════════════════════════════════════════════════════════════════════
// FASE 4: Tablas UGCO Secundarias
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_4_UGCO_SEC: any[] = [
    {
        name: 'ugco_casoespecialidad',
        title: 'UGCO: Caso - Especialidad',
        fields: [
            bool('es_principal', 'Es principal', false),
            txt('comentario', 'Comentario'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('especialidad', 'ref_oncoespecialidad', 'especialidad_id'),
            belongsTo('equipo', 'ugco_equiposeguimiento', 'equipo_id'),
        ],
    },
    {
        name: 'ugco_contactopaciente',
        title: 'UGCO: Contacto Paciente',
        fields: [
            str('region_residencia', 'Región'),
            str('provincia_residencia', 'Provincia'),
            str('comuna_residencia', 'Comuna'),
            str('tipo_calle', 'Tipo calle'),
            str('nombre_calle', 'Nombre calle'),
            str('numero_direccion', 'Número'),
            str('complemento_dir', 'Complemento dirección'),
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
        name: 'ugco_personasignificativa',
        title: 'UGCO: Persona Significativa',
        fields: [
            str('nombre_completo', 'Nombre completo'),
            str('parentesco', 'Parentesco'),
            str('telefono_1', 'Teléfono 1'),
            str('telefono_2', 'Teléfono 2'),
            str('email', 'Email'),
            bool('vive_con_paciente', 'Vive con paciente'),
            bool('es_cuidador_principal', 'Es cuidador principal'),
            select('fuente_dato', 'Fuente dato', ['ALMA', 'SIGO', 'MANUAL']),
            txt('observaciones', 'Observaciones'),
            ...auditFields(),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
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
            str('sistema_origen', 'Sistema origen'),
            txt('descripcion_origen', 'Descripción origen'),
            ...auditFields(),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('episodio_alma', 'alma_episodio', 'episodio_alma_id'),
        ],
    },
    {
        name: 'ugco_documentocaso',
        title: 'UGCO: Documento del Caso',
        fields: [
            str('nombre_archivo', 'Nombre archivo'),
            str('ruta_almacenamiento', 'Ruta almacenamiento'),
            str('seccion_origen', 'Sección origen'),
            datetime('fecha_carga', 'Fecha carga'),
            txt('observaciones', 'Observaciones'),
            str('cargado_por', 'Cargado por'),
            bool('es_visible', 'Es visible', true),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('evento', 'ugco_eventoclinico', 'evento_id'),
            belongsTo('tipo_documento', 'ref_oncotipodocumento', 'tipo_documento_id'),
        ],
    },
    {
        name: 'ugco_tarea',
        title: 'UGCO: Tarea',
        fields: [
            ...ugcoCodes(),
            bool('es_interna', 'Es interna', false),
            str('titulo', 'Título'),
            txt('descripcion', 'Descripción'),
            datetime('fecha_creacion', 'Fecha creación'),
            datetime('fecha_vencimiento', 'Fecha vencimiento'),
            datetime('fecha_inicio', 'Fecha inicio'),
            datetime('fecha_cierre', 'Fecha cierre'),
            str('responsable_usuario', 'Responsable'),
            txt('comentarios', 'Comentarios'),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('evento', 'ugco_eventoclinico', 'evento_id'),
            belongsTo('equipo', 'ugco_equiposeguimiento', 'equipo_id'),
            belongsTo('tipo_tarea', 'ref_oncotipoactividad', 'tipo_tarea_id'),
            belongsTo('estado_tarea', 'ref_oncoestadoactividad', 'estado_tarea_id'),
        ],
    },
    {
        name: 'ugco_equipomiembro',
        title: 'UGCO: Miembro de Equipo',
        fields: [
            int('usuario_id', 'ID Usuario'),
            str('rol_miembro', 'Rol miembro'),
            date('fecha_inicio', 'Fecha inicio'),
            date('fecha_fin', 'Fecha fin'),
            bool('activo', 'Activo', true),
            ...auditFields(),
            belongsTo('equipo', 'ugco_equiposeguimiento', 'equipo_id'),
        ],
    },
    {
        name: 'ugco_comitecaso',
        title: 'UGCO: Caso en Comité',
        fields: [
            bool('es_caso_principal', 'Es caso principal', false),
            txt('decision_resumen', 'Resumen decisión'),
            txt('plan_tratamiento', 'Plan tratamiento'),
            txt('otros_acuerdos', 'Otros acuerdos'),
            str('responsable_seguimiento', 'Responsable seguimiento'),
            bool('requiere_tareas', 'Requiere tareas', false),
            ...auditFields(),
            belongsTo('comite', 'ugco_comiteoncologico', 'comite_id'),
            belongsTo('caso', 'ugco_casooncologico', 'caso_id'),
            belongsTo('paciente', 'alma_paciente', 'paciente_id'),
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// Ejecución
// ═══════════════════════════════════════════════════════════════════════════

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

async function createCollection(col: any, dryRun: boolean): Promise<boolean> {
    const fieldCount = col.fields.length;
    const relCount = col.fields.filter((f: any) => f.type === 'belongsTo').length;

    if (dryRun) {
        log(`  [DRY] ${col.name} (${col.title}) — ${fieldCount} campos, ${relCount} relaciones`, 'gray');
        return true;
    }

    try {
        await client.post('/collections:create', {
            name: col.name,
            title: col.title,
            fields: col.fields,
        });
        log(`  ✅ ${col.name} — ${fieldCount} campos, ${relCount} relaciones`, 'green');
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            log(`  ⏭️  ${col.name} — ya existe, omitiendo`, 'yellow');
            return true;
        }
        log(`  ❌ ${col.name} — ${msg}`, 'red');
        return false;
    }
}

async function createPhase(phaseKey: string, dryRun: boolean): Promise<{ ok: number; fail: number }> {
    const phase = PHASES[phaseKey];
    log(`\n══ Fase ${phaseKey}: ${phase.label} (${phase.collections.length} colecciones) ══\n`, 'cyan');

    let ok = 0;
    let fail = 0;
    for (const col of phase.collections) {
        const success = await createCollection(col, dryRun);
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

    log(`\n╔══════════════════════════════════════════════════════════╗`, 'cyan');
    log(`║  UGCO Schema Creator — ${totalCollections} colecciones definidas          ║`, 'cyan');
    log(`╚══════════════════════════════════════════════════════════╝`, 'cyan');

    if (dryRun) {
        log('\n⚠️  Modo DRY-RUN: no se crearán colecciones\n', 'yellow');
    }

    const phasesToRun = phaseArg ? [phaseArg] : Object.keys(PHASES);
    let totalOk = 0;
    let totalFail = 0;

    for (const pk of phasesToRun) {
        if (!PHASES[pk]) {
            log(`❌ Fase desconocida: ${pk}. Usa 1, 2, 3 o 4.`, 'red');
            process.exit(1);
        }
        const { ok, fail } = await createPhase(pk, dryRun);
        totalOk += ok;
        totalFail += fail;
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Resultado: ${totalOk} OK, ${totalFail} errores`, totalFail > 0 ? 'yellow' : 'green');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');
}

main().catch(err => {
    log(`\n❌ Error fatal: ${err.message}`, 'red');
    process.exit(1);
});
