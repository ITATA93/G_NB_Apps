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
            console.log(`Collection ${name} already exists.`);
        } else {
            console.error(`Error creating collection ${name}:`, error.response?.data?.errors || error.message);
        }
    }
}

async function main() {
    // Creating ALMA_Usuarios mirror table
    // Assuming common fields for a User table. Adjust as necessary based on actual source schema.
    await createCollection('ALMA_Usuarios', 'Espejo Usuarios ALMA', [
        { interface: 'input', name: 'id_original', type: 'string', uiSchema: { title: 'ID Original' } },
        { interface: 'input', name: 'nombre', type: 'string', uiSchema: { title: 'Nombre' } },
        { interface: 'input', name: 'email', type: 'string', uiSchema: { title: 'Email' } },
        { interface: 'input', name: 'rut', type: 'string', uiSchema: { title: 'RUT' } },
        { interface: 'input', name: 'username', type: 'string', uiSchema: { title: 'Usuario' } }
    ]);

    console.log('Done.');
}

main();
