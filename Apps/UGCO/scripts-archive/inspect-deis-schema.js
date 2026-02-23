require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const collections = ['ref_region', 'ref_comuna', 'ref_establecimiento'];

async function inspectSchema() {
    for (const col of collections) {
        try {
            console.log(`\n========================================`);
            console.log(`INSPECTING: ${col}`);
            console.log(`========================================`);

            // Fetch collection details
            const res = await axios.get(`${API_BASE_URL}/api/collections/${col}`, {
                headers: { Authorization: `Bearer ${API_KEY}` },
                params: { appends: ['fields'] }
            });

            const data = res.data.data;

            console.log(`Title: ${data.title}`);
            console.log(`Name: ${data.name}`);

            console.log('\n--- FIELDS ---');
            if (data.fields) {
                data.fields.forEach(f => {
                    let info = `- ${f.name} (${f.type})`;
                    if (f.interface) info += ` [Interface: ${f.interface}]`;
                    if (f.primaryKey) info += ` [PK]`;
                    if (f.unique) info += ` [UNIQUE]`;
                    if (f.target) info += ` [Target: ${f.target}]`; // For relationships
                    console.log(info);
                });
            }

            console.log('\n--- INDICES/CONSTRAINTS ---');
            // NocoBase might expose indices in a specific way, usually part of fields (unique) or separate.
            // We'll check if there's an 'indexes' property or infer from fields.
            if (data.indexes) {
                console.log(JSON.stringify(data.indexes, null, 2));
            } else {
                // Check for unique fields
                const uniqueFields = data.fields.filter(f => f.unique).map(f => f.name);
                if (uniqueFields.length > 0) {
                    console.log(`Unique Fields: ${uniqueFields.join(', ')}`);
                } else {
                    console.log('No explicit unique indices found in metadata.');
                }
            }

        } catch (e) {
            console.error(`❌ Error inspecting ${col}: ${e.message}`);
        }
    }
}

inspectSchema();
