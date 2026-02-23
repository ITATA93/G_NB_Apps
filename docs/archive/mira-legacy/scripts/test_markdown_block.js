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

async function injectMarkdown() {
    const pageUid = '0kxqe038u2u';

    const markdownSchema = {
        schema: {
            "type": "void",
            "x-component": "Markdown.Void",
            "x-editable": false,
            "x-component-props": {
                "content": "# Hello from API\nThis is a test markdown block."
            }
        }
    };

    try {
        console.log(`Injecting Markdown into page '${pageUid}'...`);
        const res = await apiClient.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, markdownSchema);
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

injectMarkdown();
