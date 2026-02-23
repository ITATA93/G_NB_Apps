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

async function implementFromGuide() {
    const pageUid = '0pywr1ce17n'; // BUHO V2 Pagina

    // Structure from Orientaciones.md Section 8.4
    const schemaPayload = {
        "schema": {
            "type": "void",
            "x-component": "Grid.Row",
            "properties": {
                "col_guide": {
                    "type": "void",
                    "x-component": "Grid.Col",
                    "properties": {
                        "table_block_guide": {
                            "type": "void",
                            "x-decorator": "BlockItem", // KEY DIFFERENCE: Using BlockItem as per guide
                            "x-decorator-props": {
                                "collection": "buho_pacientes",
                                "dataSource": "main",
                                "action": "list",
                                "view": "table"
                            },
                            "x-component": "TableV2",
                            "x-component-props": {
                                "collection": "buho_pacientes",
                                "dataSource": "main"
                            },
                            "properties": {
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
        }
    };

    try {
        console.log(`Inserting Guide-Compliant Block into Page '${pageUid}'...`);
        // Using insertAdjacent with beforeEnd on the Page UID, as per guide logic for adding to page
        // (Guide says insertAdjacent/<UID_REFERENCIA>?position=beforeEnd)
        // If targeting the page directly, beforeEnd appends to the page's children (which should be the Grid, or inside the Grid if Page handles it).
        // But wait, Page usually contains a Grid.
        // If I insertAdjacent to Page, I might be adding a sibling to the Grid?
        // The guide says "añadir una fila con una tabla al final de una página".
        // If the page UID is the reference, beforeEnd puts it inside.

        const res = await apiClient.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, schemaPayload);
        console.log('Success!', JSON.stringify(res.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

implementFromGuide();
