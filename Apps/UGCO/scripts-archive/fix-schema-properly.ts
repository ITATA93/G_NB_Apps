/**
 * fix-schema-properly.ts - Recrear schema usando el metodo interno de NocoBase
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
    const routeId = 345392373628934;

    console.log('=== Reparando schema Digestivo Alto ===\n');

    // Paso 1: Verificar el schema del Dashboard que SI funciona
    console.log('1. Verificando schema Dashboard (funcional)...');
    const dashboardRes = await client.get('/uiSchemas:getJsonSchema/xikvv7wkefy');
    const dashboardSchema = dashboardRes.data?.data;
    console.log('   Dashboard tiene schema:', !!dashboardSchema);

    // Paso 2: Verificar si hay un schema en la tabla ui_schemas
    console.log('\n2. Listando schemas existentes...');
    try {
        const listRes = await client.get('/uiSchemas:list', { params: { pageSize: 200 } });
        const schemas = listRes.data?.data || [];
        console.log('   Total schemas en sistema:', schemas.length);

        // Buscar nuestro schema
        const ourSchema = schemas.find((s: any) => s['x-uid'] === schemaUid);
        console.log('   Schema gvwu5oy6x81 encontrado:', !!ourSchema);
        if (ourSchema) {
            console.log('   Schema ID:', ourSchema.id);
        }
    } catch (e: any) {
        console.log('   Error listando:', e.message);
    }

    // Paso 3: Intentar eliminar via destroy
    console.log('\n3. Eliminando schema corrupto...');
    try {
        // Eliminar por x-uid
        await client.post(`/uiSchemas:remove/${schemaUid}`);
        console.log('   ✓ Schema eliminado via remove');
    } catch (e: any) {
        console.log('   Error remove:', e.message);
    }

    // Paso 4: Limpiar schemaUid de la ruta
    console.log('\n4. Limpiando schemaUid de la ruta...');
    try {
        await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
            schemaUid: null
        });
        console.log('   ✓ schemaUid limpiado de ruta');
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // Paso 5: Crear nuevo schema con UID nuevo
    console.log('\n5. Creando nuevo schema...');
    const newUid = generateUid();
    const newSchema = {
        type: 'void',
        name: generateUid(),
        'x-uid': newUid,
        'x-component': 'Page',
        'x-async': true,
        properties: {
            grid: {
                type: 'void',
                name: generateUid(),
                'x-uid': generateUid(),
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                'x-async': false,
                'x-index': 1,
                properties: {
                    row1: {
                        type: 'void',
                        name: generateUid(),
                        'x-uid': generateUid(),
                        'x-component': 'Grid.Row',
                        'x-async': false,
                        'x-index': 1,
                        properties: {
                            col1: {
                                type: 'void',
                                name: generateUid(),
                                'x-uid': generateUid(),
                                'x-component': 'Grid.Col',
                                'x-async': false,
                                'x-index': 1,
                                properties: {
                                    card: {
                                        type: 'void',
                                        name: generateUid(),
                                        'x-uid': generateUid(),
                                        'x-component': 'CardItem',
                                        'x-async': false,
                                        'x-index': 1,
                                        properties: {
                                            markdown: {
                                                type: 'void',
                                                name: generateUid(),
                                                'x-uid': generateUid(),
                                                'x-component': 'Markdown.Void',
                                                'x-editable': false,
                                                'x-component-props': {
                                                    content: '# 🔶 Digestivo Alto\n\nPágina de especialidad oncológica.\n\n**Use el botón + para agregar bloques de datos.**'
                                                },
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
        const createRes = await client.post('/uiSchemas:insert', newSchema);
        console.log('   ✓ Schema creado con UID:', newUid);
        console.log('   Response:', createRes.status);
    } catch (e: any) {
        console.log('   Error creando:', e.response?.data || e.message);
    }

    // Paso 6: Vincular nuevo schema a la ruta
    console.log('\n6. Vinculando nuevo schema a ruta...');
    try {
        await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
            schemaUid: newUid
        });
        console.log('   ✓ Ruta actualizada con schemaUid:', newUid);
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // Paso 7: Verificar
    console.log('\n7. Verificando...');
    const verifyRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: routeId }
    });
    const route = verifyRoute.data?.data;
    console.log('   Ruta schemaUid:', route?.schemaUid);

    const verifySchema = await client.get(`/uiSchemas:getJsonSchema/${newUid}`);
    const schema = verifySchema.data?.data;
    console.log('   Schema existe:', !!schema);
    console.log('   Schema x-component:', schema?.['x-component']);

    console.log('\n✅ Completado. Nuevo schemaUid:', newUid);
    console.log('   Por favor recarga la página y verifica.');
}

main().catch(e => console.error('Error:', e.message));
