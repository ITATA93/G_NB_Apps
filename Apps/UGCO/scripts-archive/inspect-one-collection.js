require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function inspectOneCollection() {
    try {
        console.log('Fetching one collection...');
        const res = await axios.get(`${API_BASE_URL}/api/collections:list`, {
            headers,
            params: {
                pageSize: 1,
                appends: ['fields']
            }
        });

        if (res.data.data.length > 0) {
            console.log(JSON.stringify(res.data.data[0], null, 2));
        } else {
            console.log('No collections found.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

inspectOneCollection();
