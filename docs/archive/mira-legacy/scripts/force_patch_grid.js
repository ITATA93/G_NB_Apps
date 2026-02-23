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

async function forcePatchGrid() {
    const pageUid = 'smn07pjdtli';
    let gridUid = null;

    try {
        console.log(`Fetching schema for page '${pageUid}'...`);
        const res = await apiClient.get(`/uiSchemas:getJsonSchema/${pageUid}`);
        let schema = res.data.data;
        if (schema.schema) schema = schema.schema;

        if (schema.properties && schema.properties.grid) {
            gridUid = schema.properties.grid['x-uid'];
        }

        if (!gridUid) {
            console.error('Could not find Grid UID in properties.grid');
            return;
        }
        console.log(`Found Grid UID: ${gridUid}`);

        const gridContent = {
            "x-uid": gridUid,
            "x-initializer": "page:addBlock",
            "properties": {
                "forced_row": {
                    "type": "void",
                    "x-component": "Grid.Row",
                    "properties": {
                        "forced_col": {
                            "type": "void",
                            "x-component": "Grid.Col",
                            "properties": {
                                "forced_markdown": {
                                    "type": "void",
                                    "x-component": "Markdown.Void",
                                    "x-editable": false,
                                    "x-component-props": {
                                        "content": "# FORCED CONTENT\nIf you see this, PATCH works better than INSERT."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        console.log(`Force Patching Grid '${gridUid}'...`);
        const patchRes = await apiClient.post('/uiSchemas:patch', gridContent);
        console.log('Success!', JSON.stringify(patchRes.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

forcePatchGrid();
