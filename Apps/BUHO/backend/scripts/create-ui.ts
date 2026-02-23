import { createClient, log } from '../../../../shared/scripts/ApiClient';

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Generación de UI NocoBase - Proyección BUHO              ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    const client = createClient();
    const menuUid = 'nocobase-admin-menu'; // Target menu to insert into

    // UI Schema for the Page
    const pageSchema = {
        "type": "void",
        "title": "Proyección BUHO",
        "x-component": "Menu.Item",
        "x-designer": "Menu.Item.Designer",
        "x-component-props": {},
        "properties": {
            "page": {
                "type": "void",
                "x-component": "Page",
                "title": "Proyección de Pacientes (BUHO)",
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
                                            "demo_card": {
                                                "type": "void",
                                                "x-component": "CardItem",
                                                "title": "Instrucciones",
                                                "properties": {
                                                    "content": {
                                                        "type": "void",
                                                        "x-component": "Markdown.Void",
                                                        "x-editable": false,
                                                        "x-component-props": {
                                                            "content": "### Vista de Proyección\nEsta página ha sido generada por API. Configure aquí el bloque Kanban conectado a la colección **BUHO_Pacientes**."
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
        log(`🚀 Creando página 'Proyección BUHO' en el menú...`, 'cyan');

        // Insert the page schema into the menu
        const response = await client.post(`/uiSchemas:insertAdjacent/${menuUid}?position=beforeEnd`, {
            schema: pageSchema
        });

        if (response.data) {
            log('✅ Página creada exitosamente!', 'green');
            log(`   UID: ${response.data['x-uid']}`, 'white');
            log('\n👉 Ahora vaya a NocoBase y configure el bloque de datos dentro de esta página.', 'yellow');
        } else {
            log('⚠️  Respuesta inesperada al crear página', 'yellow');
        }

    } catch (error: any) {
        log(`\n✗ Error fatal: ${error.message}`, 'red');
        if (error.response) {
            log(`  Status: ${error.response.status}`, 'red');
            log(`  Data: ${JSON.stringify(error.response.data)}`, 'red');
        }
    }
}

main();
