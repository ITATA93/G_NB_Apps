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

async function insertMarkdownIntoCol() {
    const colUid = 'jrycg34lbr3'; // The Column containing Roles

    const markdownSchema = {
        "type": "void",
        "x-component": "Markdown.Void",
        "x-editable": false,
        "x-component-props": {
            "content": "### TEST VISIBILITY (Inside Col via Ancestor)\nIf you see this, insertion into ancestor works."
        }
    };

    try {
        console.log(`Inserting Markdown into Column '${colUid}'...`);
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: markdownSchema,
            ancestor: colUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

insertMarkdownIntoCol();
