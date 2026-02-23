require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const dataSourceKey = 'd_llw3u3ya2ej';

async function inspectSidraDetails() {
    try {
        console.log(`Fetching details for Data Source: ${dataSourceKey}...`);
        const res = await axios.get(`${API_BASE_URL}/api/dataSources:get`, {
            headers,
            params: {
                filterByTk: dataSourceKey,
                appends: ['collections']
            }
        });

        if (res.data.data) {
            console.log(JSON.stringify(res.data.data, null, 2));
        } else {
            console.log('No details found.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

inspectSidraDetails();
