const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';
const SOURCE_COLLECTION = 'H_user';
const TARGET_COLLECTION = 'ALMA_Usuarios';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function inspectSchemas() {
    console.log('--- Inspecting Source (SIDRA: H_user) ---');
    try {
        // Fetch one record to see actual data fields
        const sourceRes = await apiClient.get(`/dataSources/${DATA_SOURCE_KEY}/collections/${SOURCE_COLLECTION}:list?paginate=false&pageSize=1`);
        console.log('Source Response Data:', JSON.stringify(sourceRes.data, null, 2));

        if (sourceRes.status === 200 && sourceRes.data?.data?.length > 0) {
            const sample = sourceRes.data.data[0];
            console.log('Source Sample Record Keys:', Object.keys(sample));
        }
    } catch (e) {
        console.error('Error fetching source:', e.message);
    }

    console.log('\n--- Inspecting Target (ALMA_Usuarios) ---');
    try {
        const targetRes = await apiClient.get(`/collections/${TARGET_COLLECTION}`);
        console.log('Target Response Data:', JSON.stringify(targetRes.data, null, 2));

        if (targetRes.status === 200 && targetRes.data?.data?.fields) {
            const fields = targetRes.data.data.fields;
            console.log('Target Fields:', fields.map(f => `${f.name} (${f.type})`).join(', '));
        }
    } catch (e) {
        console.error('Error fetching target:', e.message);
    }
}

inspectSchemas();
