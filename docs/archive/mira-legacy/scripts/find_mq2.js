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

async function findMq2() {
    try {
        const res = await apiClient.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data.data;

        const candidates = schemas.filter(s => s['x-uid'] && s['x-uid'].startsWith('mq2'));

        console.log(`Found ${candidates.length} candidates starting with 'mq2'.`);
        candidates.forEach(c => {
            console.log(JSON.stringify(c, null, 2));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findMq2();
