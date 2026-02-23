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

async function getMenuDetails() {
    try {
        const res = await apiClient.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data.data;

        const menu = schemas.find(s => s['x-component'] === 'Menu');

        if (menu) {
            console.log('--- Menu Found ---');
            console.log(JSON.stringify(menu, null, 2));
        } else {
            console.log('Menu not found in list.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

getMenuDetails();
