require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function patchBuhoV2Grid() {
    const pageUid = 'smn07pjdtli'; // BUHO V2 Page UID

    try {
        console.log(`Fetching schema for page '${pageUid}'...`);
        const res = await apiClient.get(`/uiSchemas:getJsonSchema/${pageUid}`);
        let pageSchema = res.data.data;

        // Handle schema wrapper if present
        if (pageSchema.schema) {
            console.log('Unwrapping schema property...');
            pageSchema = pageSchema.schema;
        }

        // Recursive function to find Grid
        function findGrid(schema) {
            if (schema['x-component'] === 'Grid') {
                return schema['x-uid'];
            }
            if (schema.properties) {
                for (const key in schema.properties) {
                    const found = findGrid(schema.properties[key]);
                    if (found) return found;
                }
            }
            return null;
        }

        const gridUid = findGrid(pageSchema);

        if (!gridUid) {
            console.error('Grid UID not found in page schema.');
            console.log('Schema Keys:', Object.keys(pageSchema));
            if (pageSchema.properties) console.log('Properties Keys:', Object.keys(pageSchema.properties));
            return;
        }

        console.log(`Found Grid UID: ${gridUid}`);

        console.log('Patching Grid with x-initializer...');
        const patchPayload = {
            "x-uid": gridUid,
            "x-initializer": "page:addBlock"
        };

        const patchRes = await apiClient.post('/uiSchemas:patch', patchPayload);
        console.log('Success!', JSON.stringify(patchRes.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

patchBuhoV2Grid();
