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

async function getPageSchema() {
    const pageUid = 'e62iry3oegl';
    try {
        // Get properties to see children
        const res = await apiClient.get(`/uiSchemas:getProperties/${pageUid}`);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getPageSchema();
