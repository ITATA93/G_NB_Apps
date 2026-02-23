require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const dashboardUid = 'euwccss2tmj';

async function inspectDashboard() {
    try {
        console.log(`Fetching schema for UID ${dashboardUid}...`);
        const res = await axios.get(`${API_BASE_URL}/api/uiSchemas:getJsonSchema/${dashboardUid}`, { headers });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

inspectDashboard();
