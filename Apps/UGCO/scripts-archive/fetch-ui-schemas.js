require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function fetchSchemas() {
    try {
        console.log('Fetching UI Schemas...');
        const res = await axios.get(`${API_BASE_URL}/api/uiSchemas:list`, {
            headers,
            params: {
                pageSize: 100
            }
        });

        fs.writeFileSync('temp_ui_schemas.json', JSON.stringify(res.data, null, 2));
        console.log('Saved to temp_ui_schemas.json');

        // Log some summary
        if (res.data && res.data.data) {
            const components = res.data.data.map(s => s['x-component']);
            console.log('Components found:', [...new Set(components)]);
        } else {
            console.log('No data found');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

fetchSchemas();
