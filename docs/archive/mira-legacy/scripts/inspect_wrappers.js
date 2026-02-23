require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function inspectWrappers() {
    const rowUid = 'tined2fj7ph';
    const colUid = 'jrycg34lbr3';

    try {
        console.log(`Inspecting Row '${rowUid}'...`);
        const rowRes = await apiClient.get(`/uiSchemas:getJsonSchema/${rowUid}`);
        console.log('Row Schema:', JSON.stringify(rowRes.data.data, null, 2));

        console.log(`Inspecting Col '${colUid}'...`);
        const colRes = await apiClient.get(`/uiSchemas:getJsonSchema/${colUid}`);
        console.log('Col Schema:', JSON.stringify(colRes.data.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectWrappers();
