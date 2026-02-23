require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const collections = ['ref_region', 'ref_comuna', 'ref_establecimiento'];

async function deleteCollections() {
    for (const col of collections) {
        try {
            console.log(`Deleting ${col}...`);
            await axios.delete(`${API_BASE_URL}/api/collections/${col}`, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });
            console.log(`✅ Deleted ${col}`);
        } catch (e) {
            console.error(`❌ Error deleting ${col}: ${e.message}`);
        }
    }
}
deleteCollections();
