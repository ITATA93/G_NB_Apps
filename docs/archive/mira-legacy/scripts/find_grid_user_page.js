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

async function findGridInUserPage() {
    const pageUid = '0pywr1ce17n';

    try {
        console.log(`Fetching schema for page '${pageUid}'...`);
        const res = await apiClient.get(`/uiSchemas:getJsonSchema/${pageUid}`);
        let pageSchema = res.data.data;

        if (pageSchema.schema) pageSchema = pageSchema.schema;

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
        console.log(`Found Grid UID: ${gridUid}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findGridInUserPage();
