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

async function forcePatchUserPage() {
    const pageUid = '0pywr1ce17n'; // BUHO V2 Pagina

    const pagePatch = {
        "x-uid": pageUid,
        "properties": {
            "grid": {
                "type": "void",
                "x-component": "Grid",
                "x-initializer": "page:addBlock",
                "properties": {
                    "row_table": {
                        "type": "void",
                        "x-component": "Grid.Row",
                        "properties": {
                            "col_table": {
                                "type": "void",
                                "x-component": "Grid.Col",
                                "properties": {
                                    "buho_table_block": {
                                        "type": "void",
                                        "x-decorator": "TableBlockProvider",
                                        "x-decorator-props": {
                                            "collection": "buho_pacientes",
                                            "dataSource": "main",
                                            "action": "list",
                                            "view": "table"
                                        },
                                        "x-acl-action": "buho_pacientes:list",
                                        "x-use-decorator-props": "useTableBlockDecoratorProps",
                                        "x-component": "TableV2",
                                        "x-component-props": {
                                            "collection": "buho_pacientes",
                                            "dataSource": "main"
                                        },
                                        "properties": {
                                            "actions": {
                                                "type": "void",
                                                "x-component": "ActionBar",
                                                "x-component-props": {
                                                    "style": {
                                                        "marginBottom": "16px"
                                                    }
                                                },
                                                "properties": {
                                                    "refresh": {
                                                        "type": "void",
                                                        "title": "Refresh User Page",
                                                        "x-component": "Action",
                                                        "x-component-props": {
                                                            "action": "refresh",
                                                            "icon": "ReloadOutlined"
                                                        }
                                                    }
                                                }
                                            },
                                            "columns": {
                                                "type": "void",
                                                "x-component": "TableV2.Column",
                                                "x-initializer": "table:configureColumns",
                                                "properties": {
                                                    "nombre": {
                                                        "type": "void",
                                                        "x-decorator": "TableV2.Column.Decorator",
                                                        "x-component": "CollectionField",
                                                        "x-component-props": {
                                                            "field": "nombre"
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

    try {
        console.log(`Force Patching Page '${pageUid}'...`);
        const res = await apiClient.post('/uiSchemas:patch', pagePatch);
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

forcePatchUserPage();
