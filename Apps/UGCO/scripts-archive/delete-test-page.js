require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const pageUid = '49n1rxc697f';

async function deletePage() {
    try {
        console.log(`Deleting page ${pageUid}...`);
        await axios.post(`${API_BASE_URL}/api/uiSchemas:remove/${pageUid}`, {}, { headers });
        console.log('✅ Page deleted successfully.');
    } catch (error) {
        console.error('❌ Error deleting page:', error.response ? error.response.data : error.message);
    }
}

deletePage();
