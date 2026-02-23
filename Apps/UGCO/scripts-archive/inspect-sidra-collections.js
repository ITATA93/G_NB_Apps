require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const dataSourceKey = 'd_llw3u3ya2ej';

async function inspectSidraCollections() {
    try {
        console.log(`Fetching collections from Data Source: ${dataSourceKey} (SIDRA)...`);
        // Try passing dataSource as param
        const res = await axios.get(`${API_BASE_URL}/api/collections:list`, {
            headers,
            params: {
                pageSize: 200,
                dataSource: dataSourceKey
            }
        });

        if (res.data.data) {
            console.log(`Found ${res.data.data.length} collections in SIDRA.`);
            res.data.data.forEach(c => {
                console.log(`- [${c.name}] ${c.title} (Type: ${c.collectionType || 'N/A'})`);
            });
        } else {
            console.log('No collections found in SIDRA.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

inspectSidraCollections();
