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

async function findBuhoMenu() {
    try {
        const res = await apiClient.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data.data;

        const candidates = schemas.filter(s =>
            (s.title && s.title.includes('BUHO')) || (s.name && s.name.includes('BUHO'))
        );

        console.log(`Found ${candidates.length} candidates for 'BUHO'.`);
        candidates.forEach(c => {
            console.log(JSON.stringify(c, null, 2));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findBuhoMenu();
