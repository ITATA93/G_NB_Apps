require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const crypto = require('crypto');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
// Hardcoded key from user request
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

// Helper to generate short UIDs similar to NocoBase
function generateUid() {
    return crypto.randomBytes(5).toString('hex');
}

const MENU_UID = 'nocobase-admin-menu';

async function createBuhoUI() {
    try {
        console.log('Starting BUHO UI Injection...');

        // 1. Define the Schema
        // We will try to insert a Menu Item containing a Page with a Table
        const menuUid = generateUid();
        const pageUid = generateUid();
        const gridUid = generateUid();
        const rowUid = generateUid();
        const colUid = generateUid();
        const tableBlockUid = generateUid();

        const schema = {
            "type": "void",
            "x-uid": menuUid,
            "x-component": "Menu.Item",
            "x-designer": "Menu.Item.Designer",
            "x-component-props": {
                "title": "BUHO (Auto)"
            },
            "properties": {
                "page": {
                    "type": "void",
                    "x-uid": pageUid,
                    "x-component": "Page",
                    "x-designer": "Page.Designer",
                    "properties": {
                        "grid": {
                            "type": "void",
                            "x-uid": gridUid,
                            "x-component": "Grid",
                            "x-component-props": {
                                "dndContext": false
                            },
                            "properties": {
                                "row1": {
                                    "type": "void",
                                    "x-uid": rowUid,
                                    "x-component": "Grid.Row",
                                    "properties": {
                                        "col1": {
                                            "type": "void",
                                            "x-uid": colUid,
                                            "x-component": "Grid.Col",
                                            "properties": {
                                                "tableBlock": {
                                                    "type": "void",
                                                    "x-uid": tableBlockUid,
                                                    "x-decorator": "TableBlockProvider",
                                                    "x-decorator-props": {
                                                        "collection": "buho_pacientes",
                                                        "action": "list",
                                                        "params": {
                                                            "pageSize": 20
                                                        },
                                                        "rowKey": "id",
                                                        "showIndex": true,
                                                        "dragSort": false
                                                    },
                                                    "x-component": "CardItem",
                                                    "x-component-props": {
                                                        "title": "Pacientes Hospitalizados"
                                                    },
                                                    "properties": {
                                                        "actions": {
                                                            "type": "void",
                                                            "x-component": "ActionBar",
                                                            "x-component-props": {
                                                                "style": {
                                                                    "marginBottom": 16
                                                                }
                                                            },
                                                            "properties": {
                                                                "refresh": {
                                                                    "type": "void",
                                                                    "x-component": "Action",
                                                                    "x-component-props": {
                                                                        "useAction": "{{ cm.useRefreshAction }}",
                                                                        "title": "Refrescar",
                                                                        "icon": "ReloadOutlined"
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "table": {
                                                            "type": "array",
                                                            "x-component": "TableV2",
                                                            "x-component-props": {
                                                                "rowKey": "id",
                                                                "rowSelection": {
                                                                    "type": "checkbox"
                                                                }
                                                            },
                                                            "properties": {
                                                                "col_nombre": {
                                                                    "type": "void",
                                                                    "x-decorator": "TableV2.Column.Decorator",
                                                                    "x-component": "TableV2.Column",
                                                                    "properties": {
                                                                        "nombre": {
                                                                            "type": "string",
                                                                            "x-collection-field": "buho_pacientes.nombre",
                                                                            "x-component": "CollectionField",
                                                                            "x-read-pretty": true
                                                                        }
                                                                    }
                                                                },
                                                                "col_cama": {
                                                                    "type": "void",
                                                                    "x-decorator": "TableV2.Column.Decorator",
                                                                    "x-component": "TableV2.Column",
                                                                    "properties": {
                                                                        "cama": {
                                                                            "type": "string",
                                                                            "x-collection-field": "buho_pacientes.cama",
                                                                            "x-component": "CollectionField",
                                                                            "x-read-pretty": true
                                                                        }
                                                                    }
                                                                },
                                                                "col_estado": {
                                                                    "type": "void",
                                                                    "x-decorator": "TableV2.Column.Decorator",
                                                                    "x-component": "TableV2.Column",
                                                                    "properties": {
                                                                        "estado_plan": {
                                                                            "type": "string",
                                                                            "x-collection-field": "buho_pacientes.estado_plan",
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

        // 2. Send Request
        console.log(`Inserting Menu Item into ${MENU_UID}...`);
        const res = await axios.post(`${API_BASE_URL}/api/uiSchemas:insertAdjacent/${MENU_UID}?position=beforeEnd`, schema, { headers });

        console.log('✅ Success! Response:', JSON.stringify(res.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

createBuhoUI();
