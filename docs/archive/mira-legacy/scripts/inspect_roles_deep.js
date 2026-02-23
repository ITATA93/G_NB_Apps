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

// Function to recursively fetch properties
async function fetchSchemaRecursive(uid, depth = 0) {
    if (depth > 5) return { "x-uid": uid, "note": "Max depth reached" }; // Prevent infinite loops

    try {
        const res = await apiClient.get(`/uiSchemas:getJsonSchema/${uid}`);
        const schema = res.data.data;

        if (schema.properties) {
            for (const key in schema.properties) {
                const childUid = schema.properties[key]['x-uid'];
                if (childUid) {
                    // Recursively fetch child details
                    schema.properties[key] = await fetchSchemaRecursive(childUid, depth + 1);
                }
            }
        }
        return schema;
    } catch (error) {
        return { "x-uid": uid, "error": error.message };
    }
}

async function inspectRolesDeep() {
    const rolesBlockUid = 'ioiobe6w1rh';
    console.log(`Deep inspecting Roles Block '${rolesBlockUid}'...`);

    const fullSchema = await fetchSchemaRecursive(rolesBlockUid);
    console.log(JSON.stringify(fullSchema, null, 2));
}

inspectRolesDeep();
