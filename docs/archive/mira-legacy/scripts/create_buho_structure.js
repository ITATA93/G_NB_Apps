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

async function createBuhoStructure() {
    console.log('Starting BUHO Structure Creation...');

    // 1. Define the Schema for the BUHO App (Menu Item + Sub-pages)
    const buhoSchema = {
        "type": "void",
        "x-component": "Menu.Item",
        "x-component-props": {
            "title": "BUHO - Gestión de Camas",
            "icon": "AppstoreOutlined"
        },
        "properties": {
            "dashboard_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Dashboard"
                },
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
                                            "stats_card": {
                                                "type": "void",
                                                "x-component": "CardItem",
                                                "x-component-props": {
                                                    "title": "Ocupación Total"
                                                },
                                                "properties": {
                                                    "text": {
                                                        "type": "void",
                                                        "x-component": "Markdown.Void",
                                                        "x-component-props": {
                                                            "content": "## 85%"
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
            },
            "kanban_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Mapa de Camas"
                },
                "properties": {
                    "kanban_block": {
                        "type": "void",
                        "x-decorator": "BlockItem",
                        "x-decorator-props": {
                            "collection": "buho_pacientes",
                            "action": "list",
                            "view": "kanban"
                        },
                        "x-component": "Kanban",
                        "x-component-props": {
                            "collection": "buho_pacientes",
                            "groupField": "estado_cama"
                        }
                    }
                }
            },
            "list_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Listado de Pacientes"
                },
                "properties": {
                    "table_block": {
                        "type": "void",
                        "x-decorator": "BlockItem",
                        "x-decorator-props": {
                            "collection": "buho_pacientes",
                            "action": "list",
                            "view": "table"
                        },
                        "x-component": "TableV2",
                        "x-component-props": {
                            "collection": "buho_pacientes"
                        },
                        "properties": {
                            "actions": {
                                "type": "void",
                                "x-component": "TableV2.ActionBar",
                                "properties": {
                                    "filter": {
                                        "type": "void",
                                        "x-component": "TableV2.Filter"
                                    }
                                }
                            },
                            "columns": {
                                "type": "void",
                                "x-component": "TableV2.Column",
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
    };

    try {
        console.log('Attempting to create BUHO structure...');
        const createRes = await apiClient.post('/uiSchemas', { schema: buhoSchema });

        console.log('BUHO Structure Created Successfully!');
        console.log('UID:', createRes.data.data.uid);
        console.log('IMPORTANT: Copy this UID and insert it into your Main Menu manually using the UI or another script.');

    } catch (error) {
        console.error('Error creating BUHO structure:', error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

createBuhoStructure();
