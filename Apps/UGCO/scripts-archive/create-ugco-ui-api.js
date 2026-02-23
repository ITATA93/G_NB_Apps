require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const crypto = require('crypto');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

function generateUid() {
    return crypto.randomBytes(5).toString('hex');
}

const MENU_UID = 'nocobase-admin-menu';

async function createUgcoUI() {
    try {
        console.log('Starting UGCO UI Injection...');

        // 1. Create "UGCO (Auto)" Menu Item
        const menuUid = generateUid();

        // 2. Create "Casos" Page
        const casesPageUid = generateUid();
        const casesGridUid = generateUid();
        const casesRowUid = generateUid();
        const casesColUid = generateUid();
        const casesTableUid = generateUid();

        // 3. Create "Eventos" Page (as a sub-page or separate item? Let's put it in the same menu structure if possible, but NocoBase menu items are usually links. 
        // Let's make "UGCO (Auto)" a SubMenu, and put pages inside it.
        // Actually, creating a SubMenu via API is tricky. I'll just create two separate menu items for simplicity: "UGCO Casos" and "UGCO Eventos".

        // Schema for "UGCO Casos"
        const casesSchema = {
            "type": "void",
            "x-uid": menuUid,
            "x-component": "Menu.Item",
            "x-designer": "Menu.Item.Designer",
            "x-component-props": {
                "title": "UGCO Casos (Auto)"
            },
            "properties": {
                "page": {
                    "type": "void",
                    "x-uid": casesPageUid,
                    "x-component": "Page",
                    "x-designer": "Page.Designer",
                    "properties": {
                        "grid": {
                            "type": "void",
                            "x-uid": casesGridUid,
                            "x-component": "Grid",
                            "properties": {
                                "row1": {
                                    "type": "void",
                                    "x-uid": casesRowUid,
                                    "x-component": "Grid.Row",
                                    "properties": {
                                        "col1": {
                                            "type": "void",
                                            "x-uid": casesColUid,
                                            "x-component": "Grid.Col",
                                            "properties": {
                                                "tableBlock": {
                                                    "type": "void",
                                                    "x-uid": casesTableUid,
                                                    "x-decorator": "TableBlockProvider",
                                                    "x-decorator-props": {
                                                        "collection": "ugco_casooncologico",
                                                        "action": "list",
                                                        "params": { "pageSize": 20 },
                                                        "rowKey": "id",
                                                        "showIndex": true
                                                    },
                                                    "x-component": "CardItem",
                                                    "x-component-props": { "title": "Casos Oncológicos" },
                                                    "properties": {
                                                        "actions": {
                                                            "type": "void",
                                                            "x-component": "ActionBar",
                                                            "x-component-props": { "style": { "marginBottom": 16 } },
                                                            "properties": {
                                                                "create": {
                                                                    "type": "void",
                                                                    "x-component": "Action",
                                                                    "x-component-props": {
                                                                        "useAction": "{{ cm.useCreateAction }}",
                                                                        "title": "Nuevo Caso",
                                                                        "icon": "PlusOutlined",
                                                                        "type": "primary"
                                                                    },
                                                                    "properties": {
                                                                        "drawer": {
                                                                            "type": "void",
                                                                            "x-component": "Action.Drawer",
                                                                            "x-decorator": "FormBlockProvider",
                                                                            "x-decorator-props": { "collection": "ugco_casooncologico", "action": "create" },
                                                                            "properties": {
                                                                                "form": {
                                                                                    "type": "void",
                                                                                    "x-component": "FormV2",
                                                                                    "properties": {
                                                                                        "clinical_status": {
                                                                                            "type": "string",
                                                                                            "x-decorator": "FormItem",
                                                                                            "x-component": "Select",
                                                                                            "x-collection-field": "ugco_casooncologico.clinical_status",
                                                                                            "title": "Estado Clínico"
                                                                                        }
                                                                                        // Add more form fields here if needed
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "table": {
                                                            "type": "array",
                                                            "x-component": "TableV2",
                                                            "x-component-props": { "rowKey": "id", "rowSelection": { "type": "checkbox" } },
                                                            "properties": {
                                                                "col_status": {
                                                                    "type": "void",
                                                                    "x-decorator": "TableV2.Column.Decorator",
                                                                    "x-component": "TableV2.Column",
                                                                    "properties": {
                                                                        "clinical_status": {
                                                                            "type": "string",
                                                                            "x-collection-field": "ugco_casooncologico.clinical_status",
                                                                            "x-component": "CollectionField",
                                                                            "x-read-pretty": true
                                                                        }
                                                                    }
                                                                },
                                                                "col_proximo": {
                                                                    "type": "void",
                                                                    "x-decorator": "TableV2.Column.Decorator",
                                                                    "x-component": "TableV2.Column",
                                                                    "properties": {
                                                                        "proximo_control": {
                                                                            "type": "string",
                                                                            "x-collection-field": "ugco_casooncologico.proximo_control",
                                                                            "x-component": "CollectionField",
                                                                            "x-read-pretty": true
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
                            }
                        }
                    }
                }
            }
        };

        console.log(`Inserting UGCO Casos Menu Item...`);
        await axios.post(`${API_BASE_URL}/api/uiSchemas:insertAdjacent/${MENU_UID}?position=beforeEnd`, casesSchema, { headers });
        console.log('✅ UGCO Casos created.');

    } catch (error) {
        console.error('❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

createUgcoUI();
