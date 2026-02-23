require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const menuUid = 'nocobase-admin-menu';

const payload = {
    "schema": {
        "type": "void",
        "title": "Pacientes (API)",
        "x-component": "Menu.Item",
        "x-designer": "Menu.Item.Designer",
        "x-component-props": {},
        "properties": {
            "page": {
                "type": "void",
                "x-component": "Page",
                "title": "Gestión de Pacientes",
                "x-designer": "Page.Designer",
                "x-component-props": {},
                "properties": {
                    "grid": {
                        "type": "void",
                        "x-component": "Grid",
                        "x-initializer": "page:addBlock",
                        "properties": {
                            "row": {
                                "type": "void",
                                "x-component": "Grid.Row",
                                "properties": {
                                    "col": {
                                        "type": "void",
                                        "x-component": "Grid.Col",
                                        "properties": {
                                            "card": {
                                                "type": "void",
                                                "x-component": "CardItem",
                                                "title": "Bienvenido a UGCO"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

async function createPage() {
    try {
        // Try inserting INSIDE the menu (at the end of its children)
        console.log(`Inserting page into menu ${menuUid} (beforeEnd)...`);
        const res = await axios.post(`${API_BASE_URL}/api/uiSchemas:insertAdjacent/${menuUid}?position=beforeEnd`, payload, { headers });
        console.log('✅ Page created successfully!');
        console.log('UID:', res.data.data['x-uid']);
    } catch (error) {
        console.error('❌ Error creating page:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

createPage();
