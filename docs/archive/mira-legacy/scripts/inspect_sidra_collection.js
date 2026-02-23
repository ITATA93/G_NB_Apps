require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`
    },
    validateStatus: () => true
});

async function inspect(collectionName) {
    console.log(`Inspecting ${collectionName}...`);
    const url = `/${DATA_SOURCE_KEY}:${collectionName}:list?pageSize=1`;
    const res = await apiClient.get(url);
    console.log(`Status: ${res.status}`);
    if (res.data && res.data.data) {
        console.log(`Data found: ${res.data.data.length} records`);
        if (res.data.data.length > 0) {
            console.log('Sample:', JSON.stringify(res.data.data[0], null, 2));
        }
    } else {
        console.log('Response:', JSON.stringify(res.data));
    }
    console.log('---');
}

async function main() {
    // Inspect ALMA_Usuarios (Internal or External?)
    console.log('Inspecting ALMA_Usuarios...');
    const url = `/ALMA_Usuarios:list?pageSize=1`;
    const res = await apiClient.get(url);
    console.log(`Status: ${res.status}`);
    if (res.data && res.data.data) {
        console.log(`Data found: ${res.data.data.length} records`);
        if (res.data.data.length > 0) {
            console.log('Sample:', JSON.stringify(res.data.data[0], null, 2));
        }
    } else {
        console.log('Response:', JSON.stringify(res.data));
    }
}

main();
