require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const collections = ['ref_region', 'ref_comuna', 'ref_establecimiento'];

async function verifyFields() {
    for (const col of collections) {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/${col}:list`, {
                headers: { Authorization: `Bearer ${API_KEY}` },
                params: { pageSize: 1 }
            });

            if (res.data.data && res.data.data.length > 0) {
                const record = res.data.data[0];
                console.log(`\n--- ${col} Fields ---`);
                console.log(Object.keys(record).join(', '));
                console.log('Sample values:', {
                    codigo_oficial: record.codigo_oficial,
                    sistema_codificacion: record.sistema_codificacion,
                    version: record.version
                });
            } else {
                console.log(`\n--- ${col}: No records found ---`);
            }
        } catch (e) {
            console.error(`Error checking ${col}: ${e.message}`);
        }
    }
}

verifyFields();
