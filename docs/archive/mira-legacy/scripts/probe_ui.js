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

const candidates = ['root', 'main', 'menu', 'admin', 'layout', 'page', 'home'];

async function probe() {
    for (const uid of candidates) {
        try {
            const res = await apiClient.get(`/uiSchemas:getJsonSchema/${uid}`);
            console.log(`UID '${uid}': Found!`);
            console.log(JSON.stringify(res.data, null, 2).substring(0, 500));
        } catch (error) {
            console.log(`UID '${uid}': Not found or error (${error.response ? error.response.status : error.message})`);
        }
    }
}

probe();
