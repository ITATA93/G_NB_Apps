require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function verifySchema() {
    const collections = ['alma_paciente', 'ugco_casooncologico', 'ugco_evento'];

    for (const name of collections) {
        try {
            console.log(`Checking ${name}...`);
            const res = await axios.get(`${API_BASE_URL}/api/collections:get/${name}`, { headers });
            console.log(`✅ ${name} exists.`);

            if (res.data && res.data.data && res.data.data.fields) {
                const fields = res.data.data.fields.map(f => f.name);
                console.log(`   Fields: ${fields.join(', ')}`);
            } else {
                console.log('   ⚠️ Structure unexpected:', JSON.stringify(res.data, null, 2));
            }
        } catch (error) {
            console.error(`❌ Error checking ${name}:`, error.response ? error.response.status : error.message);
        }
    }
}

verifySchema();
