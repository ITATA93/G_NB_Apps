const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function createCollection(name, title, fields) {
    try {
        console.log(`Creating collection: ${name} (${title})...`);

        // 1. Create the collection
        await apiClient.post('/collections', {
            name: name,
            title: title,
            autoGenId: true,
            createdBy: true,
            updatedBy: true,
            sortable: true
        });
        console.log(`Collection ${name} created.`);

        // 2. Create fields
        for (const field of fields) {
            try {
                console.log(`  Creating field ${field.name} in ${name}...`);
                await apiClient.post(`/collections/${name}/fields`, field);
            } catch (fieldError) {
                console.error(`  Error creating field ${field.name}:`, fieldError.response?.data?.errors || fieldError.message);
            }
        }

    } catch (error) {
        if (error.response?.data?.errors?.[0]?.message === 'Collection already exists') {
            console.log(`Collection ${name} already exists. Checking fields...`);
            // Could add logic here to check/add missing fields if needed, but for now just skip
        } else {
            console.error(`Error creating collection ${name}:`, error.response?.data?.errors || error.message);
        }
    }
}

async function main() {
    // 1. ref_oncodiagnostico
    await createCollection('ref_oncodiagnostico', 'Diagnósticos Oncológicos', [
        { interface: 'input', name: 'codigo', type: 'string', uiSchema: { title: 'Código' } },
        { interface: 'input', name: 'nombre', type: 'string', uiSchema: { title: 'Nombre' } }
    ]);

    // 2. ugco_comiteoncologico
    await createCollection('ugco_comiteoncologico', 'Comité Oncológico', [
        { interface: 'datetime', name: 'fecha_comite', type: 'date', uiSchema: { title: 'Fecha Comité' } },
        { interface: 'input', name: 'tipo_comite', type: 'string', uiSchema: { title: 'Tipo Comité' } },
        { interface: 'textarea', name: 'resolucion', type: 'text', uiSchema: { title: 'Resolución' } }
    ]);

    console.log('Done.');
}

main();
