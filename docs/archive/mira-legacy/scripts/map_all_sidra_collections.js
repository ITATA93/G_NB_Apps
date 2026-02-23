require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej'; // Default or from env

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: Missing NOCOBASE_API_URL or NOCOBASE_API_TOKEN in .env file');
    process.exit(1);
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

// Type mapping helper
function mapType(rawType, type) {
    const t = (rawType || type || '').toLowerCase();
    if (t.includes('int')) return 'integer';
    if (t.includes('char') || t.includes('text') || t.includes('string')) return 'string';
    if (t.includes('date') || t.includes('time')) return 'date';
    if (t.includes('bit') || t.includes('bool')) return 'boolean';
    if (t.includes('float') || t.includes('decimal') || t.includes('money')) return 'float';
    return 'string'; // Default fallback
}

async function mapCollections() {
    console.log('Starting Bulk Mapping...');
    try {
        // 1. Fetch Source Collections
        const sourceRes = await apiClient.get(`/dataSources/${DATA_SOURCE_KEY}/collections?paginate=false`);
        if (sourceRes.status !== 200) {
            console.error('Failed to fetch source collections');
            return;
        }

        const allCollections = sourceRes.data.data;
        // 2. Filter Collections
        const collectionsToMap = allCollections.filter(c =>
            !c.name.startsWith('sys') &&
            !c.name.includes('$') &&
            c.name !== 'H_user'
        );

        console.log(`Found ${collectionsToMap.length} valid collections to map.`);

        for (const col of collectionsToMap) {
            const originalName = col.name;
            const targetName = `ALMA_${originalName.replace(/ /g, '_')}`;

            console.log(`\nProcessing ${originalName} -> ${targetName}...`);

            // 3. Check/Create Target Collection
            let collectionExists = false;
            try {
                const checkRes = await apiClient.get(`/collections/${targetName}`);
                if (checkRes.status === 200 && checkRes.data?.data?.name === targetName) {
                    console.log(`  Collection ${targetName} already exists. Skipping creation.`);
                    collectionExists = true;
                }
            } catch (e) {
                // 404 means it doesn't exist
            }

            if (!collectionExists) {
                console.log(`  Creating collection ${targetName}...`);
                const createPayload = {
                    name: targetName,
                    title: `ALMA ${originalName}`,
                    inherit: false
                };
                try {
                    const createRes = await apiClient.post('/collections', createPayload);
                    if (createRes.status === 200 || createRes.status === 201) {
                        console.log(`  Created collection ${targetName}.`);
                    } else {
                        console.error(`  Failed to create collection ${targetName}: ${createRes.status} - ${JSON.stringify(createRes.data)}`);
                        continue;
                    }
                } catch (createError) {
                    console.error(`  Exception creating collection ${targetName}: ${createError.message}`);
                    if (createError.response) console.error('    Response:', JSON.stringify(createError.response.data));
                    continue;
                }
            }

            // 4. Map Fields
            if (col.fields && col.fields.length > 0) {
                console.log(`  Mapping ${col.fields.length} fields for ${targetName}...`);
                for (const field of col.fields) {
                    const fieldName = field.name;
                    const targetType = mapType(field.rawType, field.type);

                    const fieldPayload = {
                        interface: 'input',
                        name: fieldName,
                        type: targetType,
                        uiSchema: {
                            title: fieldName,
                            'x-component': targetType === 'date' ? 'DatePicker' : 'Input'
                        }
                    };

                    try {
                        const fieldRes = await apiClient.post(`/collections/${targetName}/fields`, fieldPayload);
                    } catch (fieldError) {
                        // Ignore "already exists" errors, log others
                        if (fieldError.response?.status !== 400) {
                            console.log(`    Failed field ${fieldName}: ${fieldError.message}`);
                        }
                    }
                }
            }
        }

        console.log('\nBulk Mapping Completed.');

    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
}

mapCollections();
