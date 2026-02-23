require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const collections = [
    {
        name: 'alma_paciente',
        title: 'ALMA Paciente (MPI)',
        fields: [
            { interface: 'input', name: 'run', type: 'string', unique: true, uiSchema: { title: 'RUN' } },
            { interface: 'input', name: 'nombres', type: 'string', uiSchema: { title: 'Nombres' } },
            { interface: 'input', name: 'apellidos', type: 'string', uiSchema: { title: 'Apellidos' } },
            { interface: 'datetime', name: 'fecha_nacimiento', type: 'date', uiSchema: { title: 'Fecha Nacimiento' } },
            { interface: 'input', name: 'direccion_calle', type: 'string', uiSchema: { title: 'Calle' } },
            { interface: 'input', name: 'direccion_numero', type: 'string', uiSchema: { title: 'Número' } },
            // Relationships
            { interface: 'm2o', name: 'sexo_biologico', type: 'belongsTo', target: 'ref_sexobiologico', uiSchema: { title: 'Sexo Biológico' } },
            { interface: 'm2o', name: 'pueblo_originario', type: 'belongsTo', target: 'ref_pueblooriginario', uiSchema: { title: 'Pueblo Originario' } },
            { interface: 'm2o', name: 'identidad_genero', type: 'belongsTo', target: 'ref_identidadgenero', uiSchema: { title: 'Identidad de Género' } },
            { interface: 'm2o', name: 'nacionalidad', type: 'belongsTo', target: 'ref_nacionalidad', uiSchema: { title: 'Nacionalidad' } },
            { interface: 'm2o', name: 'prevision', type: 'belongsTo', target: 'ref_prevision', uiSchema: { title: 'Previsión' } },
            { interface: 'm2o', name: 'comuna', type: 'belongsTo', target: 'ref_comuna', uiSchema: { title: 'Comuna' } }
        ]
    },
    {
        name: 'ugco_casooncologico',
        title: 'UGCO Caso Oncológico',
        fields: [
            { interface: 'datetime', name: 'fecha_diagnostico', type: 'date', uiSchema: { title: 'Fecha Diagnóstico' } },
            { interface: 'datetime', name: 'proximo_control', type: 'date', uiSchema: { title: 'Próximo Control' } },
            {
                interface: 'select',
                name: 'clinical_status',
                type: 'string',
                uiSchema: {
                    title: 'Estado Clínico',
                    enum: [
                        { label: 'Activo', value: 'active' },
                        { label: 'Remisión', value: 'remission' },
                        { label: 'Recaída', value: 'relapse' }
                    ]
                }
            },
            {
                interface: 'select',
                name: 'verification_status',
                type: 'string',
                uiSchema: {
                    title: 'Estado Verificación',
                    enum: [
                        { label: 'Confirmado', value: 'confirmed' },
                        { label: 'Provisional', value: 'provisional' }
                    ]
                }
            },
            // Relationships
            { interface: 'm2o', name: 'paciente', type: 'belongsTo', target: 'alma_paciente', uiSchema: { title: 'Paciente' } },
            { interface: 'm2o', name: 'diagnostico_cie10', type: 'belongsTo', target: 'ref_cie10', uiSchema: { title: 'Diagnóstico CIE-10' } },
            { interface: 'm2o', name: 'topografia', type: 'belongsTo', target: 'ref_oncotopografia', uiSchema: { title: 'Topografía' } },
            { interface: 'm2o', name: 'morfologia', type: 'belongsTo', target: 'ref_oncomorfologia', uiSchema: { title: 'Morfología' } },
            { interface: 'm2o', name: 'etapa_clinica', type: 'belongsTo', target: 'ref_etapa_clinica', uiSchema: { title: 'Etapa Clínica' } },
            { interface: 'm2o', name: 'comite_indicacion', type: 'belongsTo', target: 'ref_indicacion_comite', uiSchema: { title: 'Indicación Comité' } },
            { interface: 'm2o', name: 'estado_caso', type: 'belongsTo', target: 'ref_estado_caso', uiSchema: { title: 'Estado Caso' } }
        ]
    },
    {
        name: 'ugco_evento',
        title: 'UGCO Eventos y Solicitudes',
        fields: [
            { interface: 'datetime', name: 'fecha_solicitud', type: 'date', defaultValue: '{{now()}}', uiSchema: { title: 'Fecha Solicitud' } },
            { interface: 'datetime', name: 'fecha_realizacion', type: 'date', uiSchema: { title: 'Fecha Realización' } },
            { interface: 'textarea', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            {
                interface: 'select',
                name: 'tipo_evento',
                type: 'string',
                uiSchema: {
                    title: 'Tipo Evento',
                    enum: [
                        { label: 'Control Médico', value: 'control' },
                        { label: 'Laboratorio', value: 'laboratorio' },
                        { label: 'Imagenología', value: 'imagen' },
                        { label: 'Endoscopía', value: 'endoscopia' },
                        { label: 'Biopsia', value: 'biopsia' },
                        { label: 'Interconsulta', value: 'interconsulta' },
                        { label: 'Comité', value: 'comite' }
                    ]
                }
            },
            {
                interface: 'select',
                name: 'estado',
                type: 'string',
                defaultValue: 'solicitado',
                uiSchema: {
                    title: 'Estado',
                    enum: [
                        { label: 'Solicitado', value: 'solicitado' },
                        { label: 'Agendado', value: 'agendado' },
                        { label: 'Realizado/Informado', value: 'realizado' },
                        { label: 'Cancelado', value: 'cancelado' }
                    ]
                }
            },
            // Relationships
            { interface: 'm2o', name: 'caso', type: 'belongsTo', target: 'ugco_casooncologico', uiSchema: { title: 'Caso Oncológico' } }
        ]
    }
];

async function createCollections() {
    for (const collection of collections) {
        try {
            console.log(`Creating collection: ${collection.name}...`);
            await axios.post(`${API_BASE_URL}/api/collections`, collection, { headers });
            console.log(`✅ Collection ${collection.name} created successfully.`);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.code === 'COLLECTION_EXIST') {
                console.log(`⚠️ Collection ${collection.name} already exists.`);
            } else {
                console.error(`❌ Error creating ${collection.name}:`, error.response ? error.response.data : error.message);
            }
        }
    }
}

createCollections();
