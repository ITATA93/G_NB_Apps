require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
    console.error('❌ Missing API_BASE_URL or API_KEY in .env');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const collections = [
    {
        name: 'ref_region',
        title: 'REF Regiones',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'DEIS', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'input', name: 'version', type: 'string', defaultValue: '2025', uiSchema: { title: 'Versión' } },
            { interface: 'input', name: 'codigo_alternativo', type: 'string', uiSchema: { title: 'Código Alternativo' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
        ]
    },
    {
        name: 'ref_comuna',
        title: 'REF Comunas',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'DEIS', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'input', name: 'version', type: 'string', defaultValue: '2025', uiSchema: { title: 'Versión' } },
            { interface: 'input', name: 'codigo_alternativo', type: 'string', uiSchema: { title: 'Código Alternativo' } },
            { interface: 'input', name: 'codigo_region', type: 'string', uiSchema: { title: 'Código Región (String)' } },
            { interface: 'm2o', name: 'region', type: 'belongsTo', target: 'ref_region', foreignKey: 'region_id', uiSchema: { title: 'Región' } },
            { interface: 'checkbox', name: 'activo', type: 'boolean', defaultValue: true, uiSchema: { title: 'Activo' } }
        ]
    },
    {
        name: 'ref_establecimiento',
        title: 'REF Establecimientos',
        fields: [
            { interface: 'input', name: 'codigo_oficial', type: 'string', unique: true, uiSchema: { title: 'Código Oficial' } },
            { interface: 'input', name: 'descripcion', type: 'string', uiSchema: { title: 'Descripción' } },
            { interface: 'input', name: 'sistema_codificacion', type: 'string', defaultValue: 'DEIS', uiSchema: { title: 'Sistema Codificación' } },
            { interface: 'input', name: 'version', type: 'string', defaultValue: '2025', uiSchema: { title: 'Versión' } },
            { interface: 'input', name: 'codigo_alternativo', type: 'string', uiSchema: { title: 'Código Alternativo' } },
            { interface: 'input', name: 'codigo_comuna', type: 'string', uiSchema: { title: 'Código Comuna (String)' } },
            { interface: 'input', name: 'codigo_region', type: 'string', uiSchema: { title: 'Código Región (String)' } },
            { interface: 'm2o', name: 'comuna', type: 'belongsTo', target: 'ref_comuna', foreignKey: 'comuna_id', uiSchema: { title: 'Comuna' } },
            { interface: 'm2o', name: 'region', type: 'belongsTo', target: 'ref_region', foreignKey: 'region_id', uiSchema: { title: 'Región' } },
            { interface: 'input', name: 'servicio_salud', type: 'string', uiSchema: { title: 'Servicio de Salud' } },
            { interface: 'input', name: 'tipo_establecimiento', type: 'string', uiSchema: { title: 'Tipo Establecimiento' } },
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
