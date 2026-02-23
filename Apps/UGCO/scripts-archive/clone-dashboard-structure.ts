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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    const routeId = 345392373628934; // Digestivo Alto
    const newUid = uid();

    console.log('Clonando estructura exacta del Dashboard...\n');

    // Copiar EXACTAMENTE la estructura del Dashboard que funciona
    // Solo cambiar UIDs y contenido
    const schema = {
        "type": "void",
        "x-component": "Page",
        "properties": {
            "grid": {  // <-- IMPORTANTE: usar "grid" como nombre, no UID
                "type": "void",
                "x-component": "Grid",
                "x-initializer": "page:addBlock",
                "properties": {
                    "row1": {  // <-- usar nombres descriptivos
                        "type": "void",
                        "x-component": "Grid.Row",
                        "properties": {
                            "col1": {
                                "type": "void",
                                "x-component": "Grid.Col",
                                "properties": {
                                    "card": {
                                        "type": "void",
                                        "x-component": "CardItem",
                                        "x-component-props": {
                                            "title": "🔶 Digestivo Alto"
                                        },
                                        "properties": {
                                            "markdown": {
                                                "type": "void",
                                                "x-component": "Markdown.Void",
                                                "x-component-props": {
                                                    "content": "# Digestivo Alto\\n\\nPágina de especialidad oncológica.\\n\\n*Use el botón + para agregar bloques*"
                                                },
                                                "x-uid": uid(),
                                                "x-async": false,
                                                "x-index": 1
                                            }
                                        },
                                        "x-uid": uid(),
                                        "x-async": false,
                                        "x-index": 1
                                    }
                                },
                                "x-uid": uid(),
                                "x-async": false,
                                "x-index": 1
                            }
                        },
                        "x-uid": uid(),
                        "x-async": false,
                        "x-index": 1
                    }
                },
                "x-uid": uid(),
                "x-async": false,
                "x-index": 1
            }
        },
        "name": uid(),
        "x-uid": newUid,
        "x-async": true
    };

    // 1. Limpiar ruta
    console.log('1. Limpiando ruta...');
    await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, { schemaUid: null });

    // 2. Eliminar schema anterior
    console.log('2. Eliminando schema anterior...');
    try {
        await client.post('/uiSchemas:remove/mup74mf8agk');
    } catch (e) {}

    // 3. Crear nuevo schema
    console.log('3. Creando schema con estructura del Dashboard...');
    const res = await client.post('/uiSchemas:insert', schema);
    console.log('   Status:', res.status);

    // 4. Vincular a ruta
    console.log('4. Vinculando a ruta...');
    await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, { schemaUid: newUid });

    // 5. Verificar
    console.log('5. Verificando...');
    const verify = await client.get(`/uiSchemas:getJsonSchema/${newUid}`);
    console.log('   Schema existe:', !!verify.data?.data);
    console.log('   Properties:', Object.keys(verify.data?.data?.properties || {}));

    console.log('\n✅ Nuevo schemaUid:', newUid);
    console.log('   Recarga la página.');
}

main().catch(e => console.error(e));
