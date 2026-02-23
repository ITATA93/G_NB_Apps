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

async function createPage() {
    const pageSchema = {
        "type": "void",
        "x-component": "Page",
        "title": "BUHO - Gestión de Pacientes",
        "properties": {
            "grid": {
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
                                        "title": "Bienvenido a BUHO (Página Independiente)"
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
        console.log('Creating standalone BUHO page...');
        const res = await apiClient.post('/uiSchemas:insert', pageSchema);
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

createPage();
