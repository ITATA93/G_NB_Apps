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

async function implementKanban() {
    const gridUid = 'iqpdy5evpc8'; // The Grid on TEST page

    const kanbanRowSchema = {
        "type": "void",
        "x-component": "Grid.Row",
        "properties": {
            "col_kanban": {
                "type": "void",
                "x-component": "Grid.Col",
                "properties": {
                    "kanban_block": {
                        "type": "void",
                        "x-decorator": "KanbanBlockProvider",
                        "x-decorator-props": {
                            "collection": "buho_pacientes",
                            "dataSource": "main",
                            "action": "list",
                            "view": "kanban"
                        },
                        "x-acl-action": "buho_pacientes:list",
                        "x-use-decorator-props": "useKanbanBlockDecoratorProps",
                        "x-component": "Kanban",
                        "x-component-props": {
                            "collection": "buho_pacientes",
                            "dataSource": "main",
                            "groupField": "estado_plan",
                            "cardTitleField": "nombre"
                        },
                        "properties": {
                            "card": {
                                "type": "void",
                                "x-component": "Kanban.Card",
                                "properties": {
                                    "fields": {
                                        "type": "void",
                                        "x-component": "Kanban.Card.Designer",
                                        "x-component-props": {
                                            "fields": ["nombre", "cama", "servicio", "riesgo_detectado", "diagnostico_principal"]
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
        console.log(`Inserting Kanban Row into Grid '${gridUid}'...`);
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: kanbanRowSchema,
            ancestor: gridUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

implementKanban();
