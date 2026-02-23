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

async function findRecent() {
    try {
        const res = await apiClient.get('/uiSchemas:list?pageSize=2000&sort=-createdAt');
        const schemas = res.data.data;

        console.log('--- Top 10 Recent Schemas ---');
        schemas.slice(0, 10).forEach(c => {
            console.log(`UID: ${c['x-uid']}, Component: ${c['x-component']}, CreatedAt: ${c.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findRecent();
