require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const dashboardUid = 'euwccss2tmj';

async function deleteDashboard() {
    try {
        console.log(`Deleting dashboard ${dashboardUid}...`);
        await axios.post(`${API_BASE_URL}/api/uiSchemas:remove/${dashboardUid}`, {}, { headers });
        console.log('✅ Dashboard deleted successfully.');
    } catch (error) {
        console.error('❌ Error deleting dashboard:', error.response ? error.response.data : error.message);
    }
}

deleteDashboard();
