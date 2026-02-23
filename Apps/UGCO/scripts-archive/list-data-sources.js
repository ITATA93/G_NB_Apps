require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function listDataSources() {
    try {
        console.log('Fetching data sources...');
        // Try common endpoints for data sources
        const res = await axios.get(`${API_BASE_URL}/api/dataSources:list`, { headers });

        if (res.data.data) {
            console.log('Data Sources found:', res.data.data.length);
            res.data.data.forEach(ds => {
                console.log(`- [${ds.key}] ${ds.displayName} (Type: ${ds.type})`);
            });
        } else {
            console.log('No data sources returned (or different API structure).');
        }

    } catch (error) {
        console.log('Error fetching dataSources:list. Trying alternate endpoint...');
        try {
            // Sometimes it's just 'data-sources'
            const res = await axios.get(`${API_BASE_URL}/api/data-sources:list`, { headers });
            console.log(JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error('Error:', e.response ? e.response.data : e.message);
        }
    }
}

listDataSources();
