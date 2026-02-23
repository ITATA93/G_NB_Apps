require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const menuUid = 'nocobase-admin-menu';

// Helper to create a Table Block Schema
function createTableBlock(title, collection, fields) {
    return {
        "type": "void",
        "x-decorator": "TableBlockProvider",
        "x-decorator-props": {
            "collection": collection,
            "action": "list",
            "params": {
                "pageSize": 20,
                "appends": fields // Pre-load fields
            },
            "rowKey": "id",
            "showIndex": true,
            "dragSort": false
        },
        "x-component": "CardItem",
        "x-component-props": {
            "title": title
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
                    "create": {
                        "type": "void",
                        "x-component": "Action",
                        "title": "Crear Nuevo",
                        "x-action": "create",
                        "x-designer": "Action.Designer",
                        "x-component-props": {
                            "type": "primary",
                            "icon": "PlusOutlined"
                        },
                        "properties": {
                            "drawer": {
                                "type": "void",
                                "x-component": "Action.Drawer",
                                "x-decorator": "FormBlockProvider",
                                "x-decorator-props": {
                                    "collection": collection,
                                    "action": "create"
                                },
                                "title": "Crear Registro",
                                "properties": {
                                    "form": {
                                        "type": "void",
                                        "x-component": "FormV2",
                                        "x-use-component-props": "useFormBlockProps",
                                        "properties": fields.reduce((acc, field) => {
                                            acc[field] = {
                                                "type": "string", // Simplified, assumes string/relation
                                                "x-decorator": "FormItem",
                                                "x-component": "CollectionField",
                                                "x-collection-field": `${collection}.${field}`
                                            };
                                            return acc;
                                        }, {})
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
                "x-use-component-props": "useTableBlockProps",
                "x-component-props": {
                    "rowKey": "id",
                    "rowSelection": {
                        "type": "checkbox"
                    }
                },
                "properties": fields.reduce((acc, field) => {
                    acc[field] = {
                        "type": "void",
                        "x-decorator": "TableV2.Column.Decorator",
                        "x-component": "TableV2.Column",
                        "properties": {
                            [field]: {
                                "type": "string",
                                "x-component": "CollectionField",
                                "x-read-pretty": true,
                                "x-collection-field": `${collection}.${field}`
                            }
                        }
                    };
                    return acc;
                }, {
                    "actions": {
                        "type": "void",
                        "title": "Acciones",
                        "x-component": "TableV2.Column",
                        "properties": {
                            "actions": {
                                "type": "void",
                                "x-component": "Space",
                                "properties": {
                                    "view": {
                                        "type": "void",
                                        "x-component": "Action.Link",
                                        "title": "Ver",
                                        "x-action": "view",
                                        "properties": {
                                            "drawer": {
                                                "type": "void",
                                                "x-component": "Action.Drawer",
                                                "x-decorator": "FormBlockProvider",
                                                "x-decorator-props": {
                                                    "collection": collection,
                                                    "action": "get",
                                                    "dataSource": "main"
                                                },
                                                "title": "Detalle",
                                                "properties": {
                                                    "form": {
                                                        "type": "void",
                                                        "x-component": "FormV2",
                                                        "x-read-pretty": true,
                                                        "x-use-component-props": "useFormBlockProps",
                                                        "properties": fields.reduce((acc, field) => {
                                                            acc[field] = {
                                                                "type": "string",
                                                                "x-decorator": "FormItem",
                                                                "x-component": "CollectionField",
                                                                "x-collection-field": `${collection}.${field}`
                                                            };
                                                            return acc;
                                                        }, {})
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
        }
    };
}

const payload = {
    "schema": {
        "type": "void",
        "title": "UGCO Dashboard (Auto)",
        "x-component": "Menu.Item",
        "x-designer": "Menu.Item.Designer",
        "x-component-props": {},
        "properties": {
            "page": {
                "type": "void",
                "x-component": "Page",
                "title": "Dashboard Oncológico",
                "x-designer": "Page.Designer",
                "x-component-props": {},
                "properties": {
                    "grid": {
                        "type": "void",
                        "x-component": "Grid",
                        "x-initializer": "page:addBlock",
                        "properties": {
                            "row1": {
                                "type": "void",
                                "x-component": "Grid.Row",
                                "properties": {
                                    "col1": {
                                        "type": "void",
                                        "x-component": "Grid.Col",
                                        "properties": {
                                            "patientsTable": createTableBlock(
                                                "Pacientes (MPI)",
                                                "alma_paciente",
                                                ["run", "nombres", "apellidos", "sexo_biologico", "prevision"]
                                            )
                                        }
                                    }
                                }
                            },
                            "row2": {
                                "type": "void",
                                "x-component": "Grid.Row",
                                "properties": {
                                    "col1": {
                                        "type": "void",
                                        "x-component": "Grid.Col",
                                        "properties": {
                                            "casesTable": createTableBlock(
                                                "Casos Oncológicos",
                                                "ugco_casooncologico",
                                                ["paciente", "diagnostico_cie10", "clinical_status", "proximo_control"]
                                            )
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

async function createDashboard() {
    try {
        console.log(`Inserting Dashboard into menu ${menuUid}...`);
        const res = await axios.post(`${API_BASE_URL}/api/uiSchemas:insertAdjacent/${menuUid}?position=beforeEnd`, payload, { headers });
        console.log('✅ Dashboard created successfully!');
        console.log('UID:', res.data.data['x-uid']);
    } catch (error) {
        console.error('❌ Error creating dashboard:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

createDashboard();
