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

async function updatePage() {
    const pageUid = '0kxqe038u2u';

    const contentSchema = {
        schema: {
            "type": "void",
            "x-component": "Grid",
            "properties": {
                "row1": {
                    "type": "void",
                    "x-component": "Grid.Row",
                    "properties": {
                        "col1": {
                            "type": "void",
                            "x-component": "Grid.Col",
                            "properties": {
                                "hello_card": {
                                    "type": "void",
                                    "x-component": "CardItem",
                                    "title": "Tablero de Control BUHO (API Generated)"
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        console.log(`Updating page '${pageUid}'...`);
        // Insert grid into the page
        const res = await apiClient.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, contentSchema);
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

updatePage();
