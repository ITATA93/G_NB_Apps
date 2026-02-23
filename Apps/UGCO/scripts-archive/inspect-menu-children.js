require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function getMenuChildren() {
    try {
        console.log('Fetching Menu Children...');
        // Try to get properties specifically
        const res = await axios.get(`${API_BASE_URL}/api/uiSchemas:getProperties/nocobase-admin-menu`, { headers });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

getMenuChildren();
