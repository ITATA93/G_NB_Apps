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

async function createBuhoV3() {
    try {
        console.log('Creating BUHO V3 Page Schema...');
        const pageSchema = {
            "type": "void",
            "x-component": "Page",
            "properties": {
                "grid": {
                    "type": "void",
                    "x-component": "Grid",
                    "x-initializer": "page:addBlock", // KEY PROPERTY
                    "properties": {
                        "row_table": {
                            "type": "void",
                            "x-component": "Grid.Row",
                            "properties": {
                                "col_table": {
                                    "type": "void",
                                    "x-component": "Grid.Col",
                                    "properties": {
                                        "table_block": {
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
                                                            "title": "Refresh V3",
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

        const schemaRes = await apiClient.post('/uiSchemas:insert', { schema: pageSchema });
        const schemaUid = schemaRes.data.data['x-uid'];
        console.log(`Page Schema Created! UID: ${schemaUid}`);

        console.log('Creating Desktop Route for BUHO V3...');
        const buhoGroupId = 334368327925760; // Parent ID for BUHO group

        const routePayload = {
            "type": "page",
            "title": "BUHO V3 Pagina",
            "schemaUid": schemaUid,
            "parentId": buhoGroupId
        };

        const routeRes = await apiClient.post('/desktopRoutes:create', routePayload);
        console.log('Route Created!', JSON.stringify(routeRes.data.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

createBuhoV3();
