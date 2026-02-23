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
        name: 'ref_especialidad_medica',
        title: 'REF Especialidades Médicas',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'DEIS', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'input', name: 'version', type: 'string', defaultValue: '2025', uiSchema: { title: 'Versión' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
        ]
    },
    {
        name: 'ref_etapa_clinica',
        title: 'REF Etapa Clínica (Local)',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'LOCAL', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
        ]
    },
    {
        name: 'ref_indicacion_comite',
        title: 'REF Indicación Comité (Local)',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'LOCAL', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
        ]
    },
    {
        name: 'ref_estado_caso',
        title: 'REF Estado Caso (Local)',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'LOCAL', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
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
