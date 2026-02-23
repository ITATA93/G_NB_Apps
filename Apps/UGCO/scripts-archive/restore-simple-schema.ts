/**
 * restore-simple-schema.ts - Restaurar schema simple a una especialidad
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

function generateUid(): string {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    const schemaUid = 'gvwu5oy6x81'; // Digestivo Alto
    const title = 'Digestivo Alto';

    console.log(`Restaurando schema simple para ${title}...`);

    // Schema simple como el del Dashboard que funciona
    const simpleSchema = {
        type: 'void',
        'x-component': 'Page',
        'x-async': true,
        name: generateUid(),
        'x-uid': schemaUid,
        properties: {
            grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                'x-uid': generateUid(),
                'x-async': false,
                'x-index': 1,
                properties: {
                    row1: {
                        type: 'void',
                        'x-component': 'Grid.Row',
                        'x-uid': generateUid(),
                        'x-async': false,
                        'x-index': 1,
                        properties: {
                            col1: {
                                type: 'void',
                                'x-component': 'Grid.Col',
                                'x-uid': generateUid(),
                                'x-async': false,
                                'x-index': 1,
                                properties: {
                                    card: {
                                        type: 'void',
                                        'x-component': 'CardItem',
                                        'x-component-props': {
                                            title: `🔶 ${title}`
                                        },
                                        'x-uid': generateUid(),
                                        'x-async': false,
                                        'x-index': 1,
                                        properties: {
                                            markdown: {
                                                type: 'void',
                                                'x-component': 'Markdown.Void',
                                                'x-component-props': {
                                                    content: `# ${title}\n\nPágina de especialidad restaurada.\n\n*Use el botón + para agregar bloques*`
                                                },
                                                'x-uid': generateUid(),
                                                'x-async': false,
                                                'x-index': 1
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
        // Intentar eliminar el schema existente
        console.log('  Eliminando schema existente...');
        try {
            await client.post(`/uiSchemas:remove/${schemaUid}`);
            console.log('  ✓ Schema eliminado');
        } catch (e) {
            console.log('  (no existía o error al eliminar)');
        }

        // Insertar el nuevo schema
        console.log('  Insertando nuevo schema...');
        const response = await client.post('/uiSchemas:insert', simpleSchema);
        console.log('  Response status:', response.status);
        console.log('  Response data keys:', Object.keys(response.data || {}));

        // Verificar
        console.log('\n  Verificando schema...');
        const verify = await client.get(`/uiSchemas:getJsonSchema/${schemaUid}`);
        const data = verify.data?.data || verify.data;
        console.log('  Schema existe:', !!data);
        console.log('  x-uid:', data?.['x-uid']);
        console.log('  x-component:', data?.['x-component']);

        console.log('\n✅ Completado. Recarga la página en el navegador.');

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

main();
