/**
 * find-initialization.ts - Buscar cómo NocoBase inicializa páginas
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
    console.log('=== BUSCANDO INICIALIZACIÓN DE PÁGINAS ===\n');

    // 1. Probar diferentes endpoints de inicialización
    console.log('1. Probando endpoints de inicialización...\n');

    const endpoints = [
        // Posibles endpoints de páginas
        '/desktopRoutes:initPage',
        '/desktopRoutes:initialize',
        '/uiSchemas:initPage',
        '/uiSchemas:initialize',
        '/pages:create',
        '/pages:init',
        // Endpoints de menú
        '/menus:create',
        '/menuItems:create',
        // Endpoints de rutas
        '/routes:create',
        '/adminRoutes:create',
    ];

    for (const endpoint of endpoints) {
        try {
            // Probar OPTIONS para ver si existe
            const res = await client.options(endpoint);
            console.log(`${endpoint}: EXISTS (${res.status})`);
        } catch (e: any) {
            if (e.response?.status !== 404) {
                console.log(`${endpoint}: ${e.response?.status}`);
            }
        }
    }

    // 2. Ver todos los métodos disponibles en desktopRoutes
    console.log('\n\n2. Métodos disponibles en desktopRoutes...');
    try {
        // Probar diferentes acciones
        const actions = ['list', 'get', 'create', 'update', 'destroy',
                        'add', 'set', 'remove', 'toggle', 'move',
                        'initPage', 'createPage', 'addPage'];

        for (const action of actions) {
            try {
                const res = await client.get(`/desktopRoutes:${action}`, {
                    params: { pageSize: 1 },
                    validateStatus: () => true
                });
                if (res.status !== 404) {
                    console.log(`  desktopRoutes:${action} - ${res.status}`);
                }
            } catch (e) {}
        }
    } catch (e) {}

    // 3. Ver todos los métodos disponibles en uiSchemas
    console.log('\n3. Métodos disponibles en uiSchemas...');
    const uiActions = ['list', 'get', 'create', 'insert', 'insertAdjacent',
                      'insertBeforeBegin', 'insertAfterBegin', 'insertBeforeEnd',
                      'insertAfterEnd', 'patch', 'remove', 'getJsonSchema',
                      'getProperties', 'saveAsTemplate', 'clearAncestor',
                      'initializeActionContext', 'duplicate'];

    for (const action of uiActions) {
        try {
            const res = await client.get(`/uiSchemas:${action}/test`, {
                validateStatus: () => true
            });
            if (res.status !== 404 && res.status !== 500) {
                console.log(`  uiSchemas:${action} - ${res.status}`);
            }
        } catch (e) {}
    }

    // 4. Ver qué diferencias hay en los registros de uiSchemas
    console.log('\n\n4. Comparando campos de registros uiSchemas...');

    const A_SCHEMA = '0h2vgqaifns';
    const TEST_SCHEMA = 'c1grgklhpx';

    const aRes = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': A_SCHEMA } }
    });
    const testRes = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_SCHEMA } }
    });

    const aSchema = aRes.data?.data?.[0] || {};
    const testSchema = testRes.data?.data?.[0] || {};

    console.log('\nCampos en "a":', Object.keys(aSchema));
    console.log('Campos en Test_03:', Object.keys(testSchema));

    console.log('\n"a" completo:', JSON.stringify(aSchema, null, 2));
    console.log('\nTest_03 completo:', JSON.stringify(testSchema, null, 2));

    // 5. Ver tree paths detallados
    console.log('\n\n5. Tree paths detallados...');

    const aPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: A_SCHEMA } }
    });
    const testPathsRes = await client.get('/uiSchemaTreePath:list', {
        params: { filter: { ancestor: TEST_SCHEMA } }
    });

    console.log('\n"a" paths:');
    for (const p of aPathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    console.log('\nTest_03 paths:');
    for (const p of testPathsRes.data?.data || []) {
        console.log(JSON.stringify(p));
    }

    // 6. Verificar si las páginas tienen ACL/permisos específicos
    console.log('\n\n6. Verificando ACL...');
    try {
        const aclRes = await client.get('/rolesResourcesActions:list', { params: { pageSize: 100 } });
        const relatedActions = (aclRes.data?.data || []).filter((a: any) =>
            a.resource?.includes('uiSchema') ||
            a.resource?.includes('page') ||
            a.resource?.includes('route')
        );
        console.log('Acciones ACL relacionadas:', relatedActions.length);
        for (const a of relatedActions.slice(0, 5)) {
            console.log(`  ${a.resource}: ${a.action}`);
        }
    } catch (e) {}
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
