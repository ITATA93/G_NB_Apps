require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const dataSourceKey = 'd_llw3u3ya2ej';

async function listSidraTables() {
    try {
        console.log(`Fetching tables from SIDRA (${dataSourceKey})...`);
        const res = await axios.get(`${API_BASE_URL}/api/dataSources:get`, {
            headers,
            params: {
                filterByTk: dataSourceKey,
                appends: ['collections']
            }
        });

        if (res.data.data && res.data.data.collections) {
            const collections = res.data.data.collections;
            console.log(`Found ${collections.length} tables in SIDRA:`);
            collections.forEach(c => {
                console.log(`- Name: ${c.name} | Title: ${c.title || 'N/A'}`);
            });
        } else {
            console.log('No collections found in SIDRA response.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

listSidraTables();
