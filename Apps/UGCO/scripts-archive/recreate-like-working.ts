/**
 * recreate-like-working.ts - Recrear schemas como las páginas que funcionan
 *
 * Las páginas Ejemplo_01/02/03 funcionan. Vamos a copiar su estructura exacta.
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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

// Schema de prueba: una página simple como las que funcionan
async function createPageLikeWorking(routeId: number, title: string): Promise<string> {
    const pageUid = uid();
    const gridUid = uid();
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();
    const markdownUid = uid();

    // Estructura exacta de una página funcional (sin x-async en el root)
    const schema = {
        type: 'void',
        name: uid(),
        'x-uid': pageUid,
        'x-component': 'Page',
        // NO x-async aquí - las páginas funcionales no lo tienen
    };

    console.log(`\nCreando schema para ${title}...`);

    // 1. Eliminar schema anterior si existe
    try {
        const routeRes = await client.get('/desktopRoutes:get', {
            params: { filterByTk: routeId }
        });
        const oldSchemaUid = routeRes.data?.data?.schemaUid;
        if (oldSchemaUid) {
            console.log(`  Eliminando schema anterior: ${oldSchemaUid}`);
            await client.post(`/uiSchemas:remove/${oldSchemaUid}`);
        }
    } catch (e) {}

    // 2. Limpiar schemaUid de la ruta
    await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
        schemaUid: null
    });

    // 3. Crear el nuevo schema (solo el Page vacío, como las páginas nuevas)
    console.log(`  Insertando nuevo schema: ${pageUid}`);
    const insertRes = await client.post('/uiSchemas:insert', schema);
    console.log(`  Insert status: ${insertRes.status}`);

    // 4. Vincular a la ruta
    await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
        schemaUid: pageUid
    });

    // 5. Ahora agregar contenido usando insertAdjacent (como lo haría la UI)
    console.log(`  Agregando Grid con insertAdjacent...`);
    const gridSchema = {
        type: 'void',
        name: gridUid,
        'x-uid': gridUid,
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, {
        schema: gridSchema
    });

    // 6. Agregar Row
    console.log(`  Agregando Grid.Row...`);
    const rowSchema = {
        type: 'void',
        name: rowUid,
        'x-uid': rowUid,
        'x-component': 'Grid.Row',
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
        schema: rowSchema
    });

    // 7. Agregar Col
    console.log(`  Agregando Grid.Col...`);
    const colSchema = {
        type: 'void',
        name: colUid,
        'x-uid': colUid,
        'x-component': 'Grid.Col',
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${rowUid}?position=beforeEnd`, {
        schema: colSchema
    });

    // 8. Agregar Card con Markdown
    console.log(`  Agregando CardItem con Markdown...`);
    const cardSchema = {
        type: 'void',
        name: cardUid,
        'x-uid': cardUid,
        'x-component': 'CardItem',
        'x-decorator': 'BlockItem',
        'x-toolbar': 'BlockSchemaToolbar',
        'x-settings': 'blockSettings:markdown',
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${colUid}?position=beforeEnd`, {
        schema: cardSchema
    });

    const markdownSchema = {
        type: 'void',
        name: markdownUid,
        'x-uid': markdownUid,
        'x-component': 'Markdown.Void',
        'x-editable': false,
        'x-component-props': {
            content: `# ${title}\n\nPágina de especialidad oncológica.\n\n*Use el botón + para agregar bloques de datos.*`
        },
        'x-index': 1
    };

    await client.post(`/uiSchemas:insertAdjacent/${cardUid}?position=beforeEnd`, {
        schema: markdownSchema
    });

    // 9. Verificar tree paths
    const pathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: pageUid } }
    });
    console.log(`  Tree paths creados: ${pathsRes.data?.data?.length || 0}`);

    return pageUid;
}

async function main() {
    console.log('=== RECREANDO PÁGINAS COMO LAS FUNCIONALES ===\n');

    // Probar con Digestivo Alto primero
    const digestivoRouteId = 345392373628934;

    try {
        const newUid = await createPageLikeWorking(digestivoRouteId, '🔶 Digestivo Alto');
        console.log(`\n✅ Digestivo Alto recreado con UID: ${newUid}`);

        // Verificar el resultado
        console.log('\nVerificando schema creado...');
        const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${newUid}`);
        const schema = schemaRes.data?.data;
        console.log('  x-component:', schema?.['x-component']);
        console.log('  x-async:', schema?.['x-async']);

        const propsRes = await client.get(`/uiSchemas:getProperties/${newUid}`);
        console.log('  Tiene properties:', !!propsRes.data?.data?.properties);

    } catch (e: any) {
        console.error('Error:', e.response?.data || e.message);
    }

    console.log('\n=== Por favor recarga la página de Digestivo Alto ===');
}

main().catch(e => console.error('Error fatal:', e.message));
