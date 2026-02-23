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

async function implementFinalBuho() {
    const gridUid = '740bipou9vr'; // The Grid we just created in User Page

    // 1. Table Block
    const tableRowSchema = {
        "type": "void",
        "x-component": "Grid.Row",
        "properties": {
            "col_table": {
                "type": "void",
                "x-component": "Grid.Col",
                "properties": {
                    "buho_table_final": {
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
                                        "title": "Refresh Final",
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
    };

    // 2. Kanban Block
    const kanbanRowSchema = {
        "type": "void",
        "x-component": "Grid.Row",
        "properties": {
            "col_kanban": {
                "type": "void",
                "x-component": "Grid.Col",
                "properties": {
                    "buho_kanban_final": {
                        "type": "void",
                        "x-decorator": "KanbanBlockProvider",
                        "x-decorator-props": {
                            "collection": "buho_pacientes",
                            "dataSource": "main",
                            "action": "list",
                            "view": "kanban",
                            "groupField": "estado_plan"
                        },
                        "x-acl-action": "buho_pacientes:list",
                        "x-use-decorator-props": "useKanbanBlockDecoratorProps",
                        "x-component": "Kanban",
                        "x-component-props": {
                            "collection": "buho_pacientes",
                            "dataSource": "main",
                            "groupField": "estado_plan"
                        },
                        "properties": {
                            "card": {
                                "type": "void",
                                "x-component": "CardItem",
                                "properties": {
                                    "nombre": {
                                        "type": "void",
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
        console.log(`Inserting Table into Grid '${gridUid}'...`);
        await apiClient.post('/uiSchemas:insert', { schema: tableRowSchema, ancestor: gridUid });
        console.log('Table Inserted!');

        console.log(`Inserting Kanban into Grid '${gridUid}'...`);
        await apiClient.post('/uiSchemas:insert', { schema: kanbanRowSchema, ancestor: gridUid });
        console.log('Kanban Inserted!');

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

implementFinalBuho();
