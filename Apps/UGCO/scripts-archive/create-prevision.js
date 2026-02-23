const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: API_BASE_URL and API_KEY must be defined in .env');
    process.exit(1);
}

const collections = [
    {
        name: "ref_prevision",
        title: "Previsión (HL7)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    },
    {
        name: "ref_sexobiologico",
        title: "Sexo Biológico (HL7)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    },
    {
        name: "ref_pueblooriginario",
        title: "Pueblo Originario (HL7)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    },
    {
        name: "ref_identidadgenero",
        title: "Identidad de Género (HL7)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    },
    {
        name: "ref_nacionalidad",
        title: "Nacionalidad (HL7)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    }
];

async function createCollections() {
    console.log(`Creating collections on ${API_BASE_URL}...`);
    for (const collection of collections) {
        try {
            await axios.post(`${API_BASE_URL}/api/collections:create`, collection, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });
            console.log(`✅ Collection ${collection.name} created successfully.`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(`⚠️ Collection ${collection.name} might already exist.`);
            } else {
                console.error(`❌ Error creating collection ${collection.name}: ${error.message}`);
            }
        }
    }
}

createCollections();

