require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

async function fetchAll(collection) {
    console.log(`Fetching all ${collection}...`);
    const res = await axios.get(`${API_BASE_URL}/api/${collection}:list`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { pageSize: 2000 }
    });
    return res.data.data;
}

async function verify() {
    try {
        const regions = await fetchAll('ref_region');
        const comunas = await fetchAll('ref_comuna');
        const establecimientos = await fetchAll('ref_establecimiento');

        const regionCodes = new Set(regions.map(r => r.codigo_oficial));
        const comunaCodes = new Set(comunas.map(c => c.codigo_oficial));

        console.log('\n--- Verifying Comuna -> Region ---');
        let comunaErrors = 0;
        for (const c of comunas) {
            if (!regionCodes.has(c.codigo_region)) {
                console.error(`❌ Comuna ${c.codigo_oficial} (${c.descripcion}) has invalid region code: ${c.codigo_region}`);
                comunaErrors++;
            }
        }
        if (comunaErrors === 0) console.log('✅ All comunas have valid regions.');

        console.log('\n--- Verifying Establecimiento -> Comuna ---');
        let estErrors = 0;
        for (const e of establecimientos) {
            if (!comunaCodes.has(e.codigo_comuna)) {
                console.error(`❌ Establecimiento ${e.codigo_oficial} (${e.descripcion}) has invalid comuna code: ${e.codigo_comuna}`);
                estErrors++;
            }
        }
        if (estErrors === 0) console.log('✅ All establecimientos have valid comunas.');

    } catch (error) {
        console.error('Error during verification:', error.message);
    }
}

verify();
