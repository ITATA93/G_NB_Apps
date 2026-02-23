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

async function insertMarkdownTest() {
    const gridUid = 'iqpdy5evpc8'; // The Grid on TEST page

    const markdownSchema = {
        "type": "void",
        "x-component": "Grid.Row",
        "properties": {
            "col_md": {
                "type": "void",
                "x-component": "Grid.Col",
                "properties": {
                    "hello_markdown": {
                        "type": "void",
                        "x-component": "Markdown.Void",
                        "x-editable": false,
                        "x-component-props": {
                            "content": "### TEST VISIBILITY\nIf you see this, the API is working."
                        }
                    }
                }
            }
        }
    };

    try {
        console.log(`Inserting Markdown Row into Grid '${gridUid}'...`);
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: markdownSchema,
            ancestor: gridUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

insertMarkdownTest();
