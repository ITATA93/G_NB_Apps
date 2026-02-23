require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const collectionName = 'buho_pacientes';

async function verifyBuhoSchema() {
    try {
        console.log(`Verifying collection ${collectionName}...`);

        const res = await axios.get(`${API_BASE_URL}/api/collections:get`, {
            headers,
            params: {
                filterByTk: collectionName,
                appends: ['fields']
            }
        });

        if (res.data.data) {
            console.log('✅ Collection exists.');
            const fields = res.data.data.fields;
            console.log(`Found ${fields.length} fields.`);
            fields.forEach(f => {
                console.log(`- [${f.name}] ${f.type}`);
            });
        } else {
            console.log('❌ Collection NOT found.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

verifyBuhoSchema();
