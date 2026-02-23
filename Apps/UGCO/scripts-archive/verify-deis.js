require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const collections = ['ref_region', 'ref_comuna', 'ref_establecimiento'];

async function check() {
    for (const col of collections) {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/${col}:list`, {
                headers: { Authorization: `Bearer ${API_KEY}` },
                params: { pageSize: 1, appends: ['total'] }
            });
            console.log(`${col}: ${res.data.meta.count}`);
        } catch (e) {
            console.error(`${col}: Error ${e.message}`);
        }
    }
}
check();
