/**
 * deploy-ugco-remaining.ts - Crear colecciones faltantes del modelo UGCO
 *
 * Colecciones: CasoEspecialidad, PersonaSignificativa, DocumentoCaso, EquipoMiembro
 */

import { createClient } from '../../../../shared/scripts/ApiClient';

const apiClient = createClient();

const COLLECTIONS = [
    {
        name: 'UGCO_casoespecialidad',
        title: 'UGCO: Caso–Especialidad (N:N)',
        fields: [
            { name: 'es_principal', type: 'boolean', interface: 'checkbox', defaultValue: false,
              uiSchema: { title: 'Es principal', type: 'boolean', 'x-component': 'Checkbox' } },
            { name: 'comentario', type: 'text', interface: 'textarea',
              uiSchema: { title: 'Comentario', type: 'string', 'x-component': 'Input.TextArea' } },
            { name: 'caso', type: 'belongsTo', target: 'UGCO_casooncologico', foreignKey: 'caso_id' },
            { name: 'especialidad', type: 'belongsTo', target: 'UGCO_REF_oncoespecialidad', foreignKey: 'especialidad_id' },
            { name: 'equipo', type: 'belongsTo', target: 'UGCO_equiposeguimiento', foreignKey: 'equipo_id' },
        ],
    },
    {
        name: 'UGCO_personasignificativa',
        title: 'UGCO: Persona Significativa / Cuidador',
        fields: [
            { name: 'nombre_completo', type: 'string', interface: 'input',
              uiSchema: { title: 'Nombre completo', type: 'string', 'x-component': 'Input' } },
            { name: 'parentesco', type: 'string', interface: 'input',
              uiSchema: { title: 'Parentesco', type: 'string', 'x-component': 'Input' } },
            { name: 'telefono_1', type: 'string', interface: 'input',
              uiSchema: { title: 'Teléfono 1', type: 'string', 'x-component': 'Input' } },
            { name: 'telefono_2', type: 'string', interface: 'input',
              uiSchema: { title: 'Teléfono 2', type: 'string', 'x-component': 'Input' } },
            { name: 'email', type: 'string', interface: 'input',
              uiSchema: { title: 'Email', type: 'string', 'x-component': 'Input' } },
            { name: 'vive_con_paciente', type: 'boolean', interface: 'checkbox', defaultValue: false,
              uiSchema: { title: 'Vive con paciente', type: 'boolean', 'x-component': 'Checkbox' } },
            { name: 'es_cuidador_principal', type: 'boolean', interface: 'checkbox', defaultValue: false,
              uiSchema: { title: 'Es cuidador principal', type: 'boolean', 'x-component': 'Checkbox' } },
            { name: 'fuente_dato', type: 'string', interface: 'select',
              uiSchema: { title: 'Fuente dato', type: 'string', 'x-component': 'Select',
                enum: [{ label: 'ALMA', value: 'ALMA' }, { label: 'SIGO', value: 'SIGO' }, { label: 'MANUAL', value: 'MANUAL' }] } },
            { name: 'observaciones', type: 'text', interface: 'textarea',
              uiSchema: { title: 'Observaciones', type: 'string', 'x-component': 'Input.TextArea' } },
            { name: 'creado_por', type: 'string', interface: 'input',
              uiSchema: { title: 'Creado por', type: 'string', 'x-component': 'Input' } },
            { name: 'fecha_creacion', type: 'date', interface: 'datePicker',
              uiSchema: { title: 'Fecha creación', type: 'string', 'x-component': 'DatePicker', 'x-component-props': { dateFormat: 'YYYY-MM-DD', showTime: true } } },
            { name: 'paciente', type: 'belongsTo', target: 'UGCO_ALMA_paciente', foreignKey: 'paciente_id' },
            { name: 'caso', type: 'belongsTo', target: 'UGCO_casooncologico', foreignKey: 'caso_id' },
        ],
    },
    {
        name: 'UGCO_documentocaso',
        title: 'UGCO: Documento del Caso',
        fields: [
            { name: 'nombre_archivo', type: 'string', interface: 'input',
              uiSchema: { title: 'Nombre archivo', type: 'string', 'x-component': 'Input' } },
            { name: 'ruta_almacenamiento', type: 'string', interface: 'input',
              uiSchema: { title: 'Ruta almacenamiento', type: 'string', 'x-component': 'Input' } },
            { name: 'seccion_origen', type: 'string', interface: 'input',
              uiSchema: { title: 'Sección origen', type: 'string', 'x-component': 'Input' } },
            { name: 'fecha_carga', type: 'date', interface: 'datePicker',
              uiSchema: { title: 'Fecha carga', type: 'string', 'x-component': 'DatePicker', 'x-component-props': { dateFormat: 'YYYY-MM-DD', showTime: true } } },
            { name: 'observaciones', type: 'text', interface: 'textarea',
              uiSchema: { title: 'Observaciones', type: 'string', 'x-component': 'Input.TextArea' } },
            { name: 'cargado_por', type: 'string', interface: 'input',
              uiSchema: { title: 'Cargado por', type: 'string', 'x-component': 'Input' } },
            { name: 'es_visible', type: 'boolean', interface: 'checkbox', defaultValue: true,
              uiSchema: { title: 'Es visible', type: 'boolean', 'x-component': 'Checkbox' } },
            { name: 'caso', type: 'belongsTo', target: 'UGCO_casooncologico', foreignKey: 'caso_id' },
            { name: 'evento', type: 'belongsTo', target: 'UGCO_eventoclinico', foreignKey: 'evento_id' },
            { name: 'tipo_documento', type: 'belongsTo', target: 'UGCO_REF_oncotipodocumento', foreignKey: 'tipo_documento_id' },
        ],
    },
    {
        name: 'UGCO_equipomiembro',
        title: 'UGCO: Miembro de Equipo',
        fields: [
            { name: 'rol_miembro', type: 'string', interface: 'select',
              uiSchema: { title: 'Rol en equipo', type: 'string', 'x-component': 'Select',
                enum: [
                    { label: 'Enfermera', value: 'ENFERMERA' },
                    { label: 'Médico', value: 'MEDICO' },
                    { label: 'Coordinador', value: 'COORDINADOR' },
                    { label: 'Administrativo', value: 'ADMINISTRATIVO' },
                ] } },
            { name: 'fecha_inicio', type: 'date', interface: 'datePicker',
              uiSchema: { title: 'Fecha inicio', type: 'string', 'x-component': 'DatePicker', 'x-component-props': { dateFormat: 'YYYY-MM-DD' } } },
            { name: 'fecha_fin', type: 'date', interface: 'datePicker',
              uiSchema: { title: 'Fecha fin', type: 'string', 'x-component': 'DatePicker', 'x-component-props': { dateFormat: 'YYYY-MM-DD' } } },
            { name: 'activo', type: 'boolean', interface: 'checkbox', defaultValue: true,
              uiSchema: { title: 'Activo', type: 'boolean', 'x-component': 'Checkbox' } },
            { name: 'creado_por', type: 'string', interface: 'input',
              uiSchema: { title: 'Creado por', type: 'string', 'x-component': 'Input' } },
            { name: 'fecha_creacion', type: 'date', interface: 'datePicker',
              uiSchema: { title: 'Fecha creación', type: 'string', 'x-component': 'DatePicker', 'x-component-props': { dateFormat: 'YYYY-MM-DD', showTime: true } } },
            { name: 'equipo', type: 'belongsTo', target: 'UGCO_equiposeguimiento', foreignKey: 'equipo_id' },
        ],
    },
];

async function main() {
    console.log('\n  Creando 4 colecciones UGCO restantes...\n');

    for (const col of COLLECTIONS) {
        try {
            await apiClient.post('/collections:create', col as any);
            console.log(`  [OK] ${col.name} — ${col.fields.length} campos`);
        } catch (error: any) {
            const msg = error.response?.data?.errors?.[0]?.message || error.message;
            if (msg.includes('already exists') || msg.includes('duplicate')) {
                console.log(`  [SKIP] ${col.name} — ya existe`);
            } else {
                console.log(`  [ERROR] ${col.name} — ${msg}`);
            }
        }
    }

    console.log('\n  Hecho.\n');
}

main().catch(console.error);
