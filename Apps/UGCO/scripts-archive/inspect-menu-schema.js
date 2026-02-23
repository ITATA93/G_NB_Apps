require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function getMenuSchema() {
    try {
        console.log('Fetching Menu Schema...');
        const res = await axios.get(`${API_BASE_URL}/api/uiSchemas:getJsonSchema/nocobase-admin-menu`, { headers });

        fs.writeFileSync('menu_schema.json', JSON.stringify(res.data, null, 2));
        console.log('Saved to menu_schema.json');

        // Log properties keys to see children
        if (res.data.data && res.data.data.properties) {
            console.log('Menu items:', Object.keys(res.data.data.properties));
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

getMenuSchema();
