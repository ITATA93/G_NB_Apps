/**
 * investigate-async.ts - Investigar el campo x-async y su efecto
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

async function main() {
    console.log('=== INVESTIGANDO x-async ===\n');

    // 1. Ver tree paths de Ejemplo_01 vs Test
    console.log('1. Tree paths con detalle de async...\n');

    // Ejemplo_01
    const ejemploPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: '83spwnaehs3' }, pageSize: 5 }
    });

    console.log('Ejemplo_01 tree paths:');
    for (const p of ejemploPaths.data?.data || []) {
        console.log(`  depth=${p.depth}, async=${p.async}, descendant=${p.descendant}`);
    }

    // Test_CorrectWay
    const testPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: '0k5ip75lloo' } }
    });

    console.log('\nTest_CorrectWay tree paths:');
    for (const p of testPaths.data?.data || []) {
        console.log(`  depth=${p.depth}, async=${p.async}, descendant=${p.descendant}`);
    }

    // 2. Ver el campo async en el tree path del Grid
    console.log('\n\n2. Comparando campo async en tree path del Grid...\n');

    // Buscar tree path específico del Grid de Ejemplo_01
    const ejemploGridPath = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: 'e7c82icm7k5', depth: 1 } }
    });
    console.log('Ejemplo_01 Grid tree path:', JSON.stringify(ejemploGridPath.data?.data?.[0]));

    // Buscar tree path específico del Grid de Test
    const testGridPath = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: 's91vhu0l89', depth: 1 } }
    });
    console.log('Test Grid tree path:', JSON.stringify(testGridPath.data?.data?.[0]));

    // 3. Intentar actualizar el tree path para agregar async
    console.log('\n\n3. ¿Podemos actualizar el tree path para agregar async?...\n');

    // Primero ver todos los campos disponibles
    const allPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: 's91vhu0l89' }, pageSize: 5 }
    });
    console.log('Tree paths del Grid de Test:');
    for (const p of allPaths.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // 4. Ver el tree path del Page (depth 0)
    console.log('\n\n4. Tree path del Page (depth 0)...');

    const ejemploPagePath = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: '83spwnaehs3', depth: 0 } }
    });
    console.log('Ejemplo_01 Page path:', JSON.stringify(ejemploPagePath.data?.data?.[0]));

    const testPagePath = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { descendant: '0k5ip75lloo', depth: 0 } }
    });
    console.log('Test Page path:', JSON.stringify(testPagePath.data?.data?.[0]));

    // 5. ¿Qué pasa si creamos el Grid con x-async: true en insertAdjacent?
    console.log('\n\n5. Creando nueva página con Grid x-async: true...\n');

    const uid = () => Math.random().toString(36).substring(2, 13);
    const pageUid = uid();
    const gridUid = uid();

    // Crear page
    await client.post('/uiSchemas:insert', {
        type: 'void',
        name: uid(),
        'x-uid': pageUid,
        'x-component': 'Page'
    });
    console.log('Page creado:', pageUid);

    // Agregar Grid con x-async: true
    await client.post(`/uiSchemas:insertAdjacent/${pageUid}?position=beforeEnd`, {
        schema: {
            type: 'void',
            name: uid(),
            'x-uid': gridUid,
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
            'x-async': true  // Agregando async
        }
    });
    console.log('Grid agregado con x-async: true');

    // Crear ruta
    await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_Async',
        parentId: 345392373628932,
        schemaUid: pageUid,
        menuSchemaUid: uid(),
        enableTabs: false
    });

    // Verificar
    const newSchema = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('\nJSON Schema de Test_Async:', JSON.stringify(newSchema.data?.data));

    const newProps = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    const gridProps = Object.values(newProps.data?.data?.properties || {})[0] as any;
    console.log('Grid x-async en properties:', gridProps?.['x-async']);

    console.log('\n✅ Test_Async creada: /admin/' + pageUid);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
