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

async function initUserPageGrid() {
    const pageUid = '0pywr1ce17n'; // BUHO V2 Pagina

    const gridSchema = {
        "type": "void",
        "x-component": "Grid",
        "x-initializer": "page:addBlock",
        "properties": {
            "row_init": {
                "type": "void",
                "x-component": "Grid.Row",
                "properties": {
                    "col_init": {
                        "type": "void",
                        "x-component": "Grid.Col",
                        "properties": {
                            "markdown_init": {
                                "type": "void",
                                "x-component": "Markdown.Void",
                                "x-editable": false,
                                "x-component-props": {
                                    "content": "### BUHO V2 Pagina Initialized\nGrid created via API."
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        console.log(`Initializing Grid in Page '${pageUid}'...`);
        // Insert Grid into Page (Page is the ancestor)
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: gridSchema,
            ancestor: pageUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

initUserPageGrid();
