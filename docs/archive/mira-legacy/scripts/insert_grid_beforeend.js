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

async function insertGridBeforeEnd() {
    const pageUid = '0pywr1ce17n'; // BUHO V2 Pagina

    const gridSchema = {
        "schema": {
            "type": "void",
            "x-component": "Grid",
            "x-initializer": "page:addBlock",
            "properties": {
                "row_test": {
                    "type": "void",
                    "x-component": "Grid.Row",
                    "properties": {
                        "col_test": {
                            "type": "void",
                            "x-component": "Grid.Col",
                            "properties": {
                                "markdown_test": {
                                    "type": "void",
                                    "x-component": "Markdown.Void",
                                    "x-editable": false,
                                    "x-component-props": {
                                        "content": "### SUCCESS via insertAdjacent(beforeEnd)\nGrid created."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        console.log(`Inserting Grid into Page '${pageUid}' (beforeEnd)...`);
        const res = await apiClient.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, gridSchema);
        console.log('Success!', JSON.stringify(res.data, null, 2));

        // Verify immediately
        console.log('Verifying persistence...');
        const check = await apiClient.get(`/uiSchemas:getJsonSchema/${pageUid}`);
        console.log('Page Schema after insert:', JSON.stringify(check.data.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

insertGridBeforeEnd();
