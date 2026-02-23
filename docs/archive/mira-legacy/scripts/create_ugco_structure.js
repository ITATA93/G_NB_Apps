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

async function createUgcoStructure() {
    console.log('Starting UGCO Structure Creation...');

    // 1. Define the Schema for the UGCO App
    const ugcoSchema = {
        "type": "void",
        "x-component": "Menu.Item",
        "x-component-props": {
            "title": "UGCO - Gestión Clínica",
            "icon": "MedicineBoxOutlined"
        },
        "properties": {
            "desktop_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Mi Escritorio"
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
                                            "welcome_card": {
                                                "type": "void",
                                                "x-component": "CardItem",
                                                "x-component-props": {
                                                    "title": "Bienvenido, Doctor"
                                                },
                                                "properties": {
                                                    "text": {
                                                        "type": "void",
                                                        "x-component": "Markdown.Void",
                                                        "x-component-props": {
                                                            "content": "Tiene 5 pacientes pendientes de revisión hoy."
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
            "directory_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Directorio de Pacientes"
                },
                "properties": {
                    "table_block": {
                        "type": "void",
                        "x-decorator": "BlockItem",
                        "x-decorator-props": {
                            "collection": "buho_pacientes", // Sharing collection for now
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
            },
            "clinical_file_page": {
                "type": "void",
                "x-component": "Page",
                "x-component-props": {
                    "title": "Ficha Clínica (Ejemplo)"
                },
                "properties": {
                    "tabs": {
                        "type": "void",
                        "x-component": "Tabs",
                        "properties": {
                            "tab1": {
                                "type": "void",
                                "x-component": "Tabs.TabPane",
                                "x-component-props": {
                                    "tab": "Resumen"
                                },
                                "properties": {
                                    "details": {
                                        "type": "void",
                                        "x-component": "Details",
                                        "x-component-props": {
                                            "collection": "buho_pacientes"
                                        }
                                    }
                                }
                            },
                            "tab2": {
                                "type": "void",
                                "x-component": "Tabs.TabPane",
                                "x-component-props": {
                                    "tab": "Historia"
                                },
                                "properties": {
                                    "text": {
                                        "type": "void",
                                        "x-component": "Markdown.Void",
                                        "x-component-props": {
                                            "content": "Historial clínico del paciente..."
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
        console.log('Attempting to create UGCO structure...');
        const createRes = await apiClient.post('/uiSchemas', { schema: ugcoSchema });

        console.log('UGCO Structure Created Successfully!');
        console.log('UID:', createRes.data.data.uid);
        console.log('IMPORTANT: Copy this UID and insert it into your Main Menu manually using the UI or another script.');

    } catch (error) {
        console.error('Error creating UGCO structure:', error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

createUgcoStructure();
