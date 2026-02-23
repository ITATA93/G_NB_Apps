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

async function listCollections() {
    try {
        const res = await apiClient.get('/collections:list?pageSize=2000');
        const collections = res.data.data;

        console.log('--- Collections ---');
        collections.forEach(c => {
            if (!c.name.startsWith('t_') && !c.name.startsWith('pm_')) { // Filter system tables if possible, though NocoBase uses names
                console.log(c.name);
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listCollections();
