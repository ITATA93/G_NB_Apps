/**
 * investigate-ejemplo.ts - Investigar Ejemplo_01 a fondo
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
    console.log('=== INVESTIGACIÓN EJEMPLO_01 ===\n');

    const EJEMPLO_PAGE_UID = '83spwnaehs3';

    // 1. Ver todas las properties de Ejemplo_01
    console.log('1. Properties de Ejemplo_01:');
    const props = await client.get(`/uiSchemas:getProperties/${EJEMPLO_PAGE_UID}`);

    // Extraer el Grid
    const gridKey = Object.keys(props.data?.data?.properties || {})[0];
    const gridSchema = props.data?.data?.properties?.[gridKey];

    console.log('Grid key:', gridKey);
    console.log('Grid x-uid:', gridSchema?.['x-uid']);
    console.log('Grid x-component:', gridSchema?.['x-component']);
    console.log('Grid x-initializer:', gridSchema?.['x-initializer']);
    console.log('Grid x-async:', gridSchema?.['x-async']);

    // 2. Buscar el Grid en la DB por nombre
    console.log('\n2. Buscando Grid por nombre en DB...');
    const gridByName = await client.get('/uiSchemas:list', {
        params: { filter: { name: gridKey } }
    });
    console.log('Grid en DB por nombre:', JSON.stringify(gridByName.data?.data?.[0]));

    // 3. Ver todos los schemas hijos del page
    console.log('\n3. Tree paths de Ejemplo_01:');
    const paths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: EJEMPLO_PAGE_UID } }
    });
    console.log('Total paths:', paths.data?.data?.length);
    for (const p of paths.data?.data || []) {
        console.log(JSON.stringify(p));

        // Ver cada descendant
        const desc = await client.get('/uiSchemas:list', {
            params: { filter: { 'x-uid': p.descendant } }
        });
        console.log('  -> RAW:', JSON.stringify(desc.data?.data?.[0]));
    }

    // 4. Comparar con Test_Final
    console.log('\n\n4. Tree paths de Test_Final:');
    const testPaths = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: 'fx0ztcldlmb' } }
    });
    console.log('Total paths:', testPaths.data?.data?.length);
    for (const p of testPaths.data?.data || []) {
        console.log(JSON.stringify(p));

        const desc = await client.get('/uiSchemas:list', {
            params: { filter: { 'x-uid': p.descendant } }
        });
        console.log('  -> RAW:', JSON.stringify(desc.data?.data?.[0]));
    }

    // 5. Ver si hay algo diferente en el schema completo
    console.log('\n\n5. Schema JSON completo de Ejemplo_01 (primeros niveles):');
    const fullSchema = await client.get(`/uiSchemas:getJsonSchema/${EJEMPLO_PAGE_UID}`);
    console.log(JSON.stringify(fullSchema.data?.data, null, 2));

    console.log('\n\n6. Schema JSON completo de Test_Final:');
    const testSchema = await client.get('/uiSchemas:getJsonSchema/fx0ztcldlmb');
    console.log(JSON.stringify(testSchema.data?.data, null, 2));
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
