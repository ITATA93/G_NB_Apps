/**
 * find-edit-component.ts - Buscar qué componente permite editar páginas
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
    console.log('=== BUSCANDO COMPONENTE DE EDICIÓN ===\n');

    // 1. Comparar página "a" (funciona y editable) con Test_02
    const A_UID = '0h2vgqaifns';
    const TEST02_UID = 'yz83359mv6j';
    const EJEMPLO_UID = '83spwnaehs3';  // Ejemplo_01 con tabla

    // 2. Obtener schemas completos con getProperties
    console.log('1. Comparando schemas con getProperties...\n');

    for (const uid of [A_UID, TEST02_UID, EJEMPLO_UID]) {
        console.log(`=== ${uid} ===`);
        try {
            const propsRes = await client.get(`/uiSchemas:getProperties/${uid}`);
            console.log(JSON.stringify(propsRes.data?.data, null, 2));
        } catch (e: any) {
            console.log('Error:', e.message);
        }
        console.log('');
    }

    // 3. Buscar si hay alguna tabla de "pageBlocks" o similar
    console.log('\n2. Buscando tablas relacionadas con bloques...');
    const testEndpoints = [
        'pageBlocks',
        'blocks',
        'uiBlocks',
        'pageContents',
        'pageSchemas',
        'schemaTemplates',
        'uiSchemaTemplates'
    ];

    for (const endpoint of testEndpoints) {
        try {
            const res = await client.get(`/${endpoint}:list`, { params: { pageSize: 5 } });
            console.log(`   ${endpoint}: ${res.data?.data?.length || 0} registros`);
            if (res.data?.data?.length > 0) {
                console.log('   Ejemplo:', JSON.stringify(res.data.data[0]).substring(0, 200));
            }
        } catch (e: any) {
            // No existe
        }
    }

    // 4. Ver si la página "a" tiene algo especial en sus properties
    console.log('\n\n3. Analizando página "a" en detalle...');
    try {
        // getJsonSchema vs getProperties
        const jsonRes = await client.get(`/uiSchemas:getJsonSchema/${A_UID}`);
        const propsRes = await client.get(`/uiSchemas:getProperties/${A_UID}`);

        console.log('getJsonSchema keys:', Object.keys(jsonRes.data?.data || {}));
        console.log('getProperties keys:', Object.keys(propsRes.data?.data || {}));

        // Ver si tiene x-initializer
        const schema = jsonRes.data?.data;
        console.log('\nx-initializer:', schema?.['x-initializer']);
        console.log('x-designer:', schema?.['x-designer']);
        console.log('x-toolbar:', schema?.['x-toolbar']);

        // Ver properties
        if (propsRes.data?.data?.properties) {
            console.log('\nProperties de "a":');
            for (const [key, value] of Object.entries(propsRes.data.data.properties)) {
                const prop = value as any;
                console.log(`  ${key}:`);
                console.log(`    x-component: ${prop?.['x-component']}`);
                console.log(`    x-initializer: ${prop?.['x-initializer']}`);
            }
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 5. Ver Ejemplo_01 que tiene tabla
    console.log('\n\n4. Analizando Ejemplo_01 (tiene tabla)...');
    try {
        const propsRes = await client.get(`/uiSchemas:getProperties/${EJEMPLO_UID}`);
        const props = propsRes.data?.data;

        console.log('Estructura de Ejemplo_01:');
        console.log('  type:', props?.type);
        console.log('  x-component:', props?.['x-component']);

        if (props?.properties) {
            for (const [key, value] of Object.entries(props.properties)) {
                const prop = value as any;
                console.log(`\n  Property "${key}":`);
                console.log(`    x-component: ${prop?.['x-component']}`);
                console.log(`    x-initializer: ${prop?.['x-initializer']}`);
            }
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 6. Intentar agregar un Grid con x-initializer a Test_02
    console.log('\n\n5. Agregando Grid con x-initializer a Test_02...');
    try {
        const gridUid = Math.random().toString(36).substring(2, 13);
        const gridSchema = {
            type: 'void',
            name: gridUid,
            'x-uid': gridUid,
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock'
        };

        await client.post(`/uiSchemas:insertAdjacent/${TEST02_UID}?position=beforeEnd`, {
            schema: gridSchema
        });
        console.log('   ✓ Grid agregado a Test_02');

        // Verificar
        const verifyRes = await client.get(`/uiSchemas:getProperties/${TEST02_UID}`);
        console.log('   Properties ahora:', Object.keys(verifyRes.data?.data?.properties || {}));
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }
}

main().catch(e => console.error('Error:', e.message));
