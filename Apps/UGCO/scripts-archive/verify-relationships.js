require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

async function verifyRelationships() {
    try {
        console.log('--- Verifying Comuna -> Region ---');
        const comunaRes = await axios.get(`${API_BASE_URL}/api/ref_comuna:list`, {
            headers: { Authorization: `Bearer ${API_KEY}` },
            params: { pageSize: 1, appends: ['region'] }
        });

        if (comunaRes.data.data.length > 0) {
            const c = comunaRes.data.data[0];
            console.log(`Comuna: ${c.descripcion} (${c.codigo_oficial})`);
            console.log(`Region Linked:`, c.region ? `${c.region.descripcion} (${c.region.codigo_oficial})` : 'NULL');
        }

        console.log('\n--- Verifying Establecimiento -> Comuna & Region ---');
        const estRes = await axios.get(`${API_BASE_URL}/api/ref_establecimiento:list`, {
            headers: { Authorization: `Bearer ${API_KEY}` },
            params: { pageSize: 1, appends: ['comuna', 'region'] }
        });

        if (estRes.data.data.length > 0) {
            const e = estRes.data.data[0];
            console.log(`Establecimiento: ${e.descripcion} (${e.codigo_oficial})`);
            console.log(`Comuna Linked:`, e.comuna ? `${e.comuna.descripcion} (${e.comuna.codigo_oficial})` : 'NULL');
            console.log(`Region Linked:`, e.region ? `${e.region.descripcion} (${e.region.codigo_oficial})` : 'NULL');
        }

    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

verifyRelationships();
