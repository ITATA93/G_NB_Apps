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

async function findMq2AndRecent() {
    try {
        const res = await apiClient.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data.data;

        // Sort by createdAt descending
        schemas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('--- Top 5 Recent Schemas ---');
        schemas.slice(0, 5).forEach(c => {
            console.log(`UID: ${c['x-uid']}, Component: ${c['x-component']}, Title: ${c.title || c.name}`);
        });

        const candidates = schemas.filter(s =>
            (s['x-uid'] && s['x-uid'].includes('mq2')) ||
            (s.name && s.name.includes('mq2'))
        );

        console.log('\n--- Candidates containing "mq2" ---');
        candidates.forEach(c => {
            console.log(JSON.stringify(c, null, 2));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findMq2AndRecent();
