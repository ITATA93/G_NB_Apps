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

async function insertNamedGrid() {
    const pageUid = '0pywr1ce17n'; // BUHO V2 Pagina

    const gridSchema = {
        "name": "grid", // FORCE NAME
        "type": "void",
        "x-component": "Grid",
        "x-initializer": "page:addBlock",
        "properties": {
            "row_1": {
                "type": "void",
                "x-component": "Grid.Row",
                "properties": {
                    "col_1": {
                        "type": "void",
                        "x-component": "Grid.Col",
                        "properties": {
                            "markdown_1": {
                                "type": "void",
                                "x-component": "Markdown.Void",
                                "x-editable": false,
                                "x-component-props": {
                                    "content": "# FINAL ATTEMPT\nGrid named 'grid'."
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        console.log(`Inserting Named Grid into Page '${pageUid}'...`);
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: gridSchema,
            ancestor: pageUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

insertNamedGrid();
