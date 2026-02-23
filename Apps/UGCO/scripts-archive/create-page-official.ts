/**
 * create-page-official.ts - Crear página siguiendo el flujo oficial de NocoBase
 *
 * Según la documentación:
 * 1. Crear ruta con desktopRoutes:create (type: "page") → NocoBase crea automáticamente el grid
 * 2. La respuesta incluye gridUid o schemaUid
 * 3. Usar ese UID para agregar bloques con uiSchemas:create
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
    console.log('=== CREAR PÁGINA SIGUIENDO FLUJO OFICIAL ===\n');

    const UGCO_PARENT_ID = 345392373628928;

    // 1. Crear página directamente con desktopRoutes:create
    // Según la guía, NocoBase debería crear automáticamente el schema/grid
    console.log('1. Creando página con desktopRoutes:create...');

    const pageResponse = await client.post('/desktopRoutes:create', {
        type: 'page',
        title: 'Test_Official',
        parentId: UGCO_PARENT_ID,
        name: 'test_official',
        enableTabs: false
    });

    console.log('\nRespuesta completa de desktopRoutes:create:');
    console.log(JSON.stringify(pageResponse.data, null, 2));

    const pageData = pageResponse.data?.data;

    // Buscar el gridUid en la respuesta
    const gridUid = pageData?.gridUid || pageData?.schemaUid || pageData?.uid;

    console.log('\n--- Campos importantes ---');
    console.log('id:', pageData?.id);
    console.log('title:', pageData?.title);
    console.log('schemaUid:', pageData?.schemaUid);
    console.log('gridUid:', pageData?.gridUid);
    console.log('menuSchemaUid:', pageData?.menuSchemaUid);

    if (!gridUid) {
        console.log('\n⚠️ No se encontró gridUid en la respuesta.');
        console.log('Verificando si se creó un schema automáticamente...');

        // Buscar si hay un schema asociado
        if (pageData?.schemaUid) {
            const schemaRes = await client.get(`/uiSchemas:getJsonSchema/${pageData.schemaUid}`);
            console.log('\nSchema encontrado:', JSON.stringify(schemaRes.data?.data, null, 2));

            const propsRes = await client.get(`/uiSchemas:getProperties/${pageData.schemaUid}`);
            console.log('\nProperties:', JSON.stringify(propsRes.data?.data, null, 2));
        }
    }

    // 2. Si hay gridUid, intentar agregar un bloque de tabla
    if (gridUid) {
        console.log('\n\n2. Agregando bloque de tabla al grid...');

        try {
            const tableResponse = await client.post('/uiSchemas:create', {
                componentName: 'Table',
                collection: 'ugco_pacientes',
                parentUid: gridUid
            });

            console.log('Respuesta de crear tabla:');
            console.log(JSON.stringify(tableResponse.data, null, 2));
        } catch (e: any) {
            console.log('Error al crear tabla:', e.response?.data || e.message);
        }
    }

    // 3. Verificar la estructura creada
    console.log('\n\n3. Verificando estructura final...');

    if (pageData?.schemaUid) {
        const finalSchema = await client.get(`/uiSchemas:getJsonSchema/${pageData.schemaUid}`);
        console.log('Schema final:', JSON.stringify(finalSchema.data?.data, null, 2));

        const treePaths = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { ancestor: pageData.schemaUid } }
        });
        console.log('\nTree paths:', treePaths.data?.data?.length);
        for (const p of treePaths.data?.data || []) {
            console.log(JSON.stringify(p));
        }
    }

    console.log('\n\n✅ Página creada');
    console.log('   URL: /admin/' + (pageData?.schemaUid || pageData?.id));
    console.log('\n   Prueba acceder a la página y verificar si permite edición.');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
