/**
 * create-test02.ts - Crear página Test_02 completamente nueva
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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    console.log('=== CREANDO PÁGINA TEST_02 ===\n');

    const newPageUid = uid();
    const newMenuUid = uid();

    // 1. Crear page schema (vacío)
    console.log('1. Creando page schema...');
    const pageSchema = {
        type: 'void',
        name: uid(),
        'x-uid': newPageUid,
        'x-component': 'Page'
    };
    await client.post('/uiSchemas:insert', pageSchema);
    console.log('   ✓ Page schema:', newPageUid);

    // 2. Crear menu schema (vacío)
    console.log('2. Creando menu schema...');
    const menuSchema = {
        type: 'void',
        name: newMenuUid,
        'x-uid': newMenuUid
    };
    await client.post('/uiSchemas:insert', menuSchema);
    console.log('   ✓ Menu schema:', newMenuUid);

    // 3. Crear ruta directamente bajo UGCO (no bajo Especialidades)
    console.log('3. Creando ruta bajo UGCO...');
    const UGCO_PARENT_ID = 345392373628928;

    const createRouteRes = await client.post('/desktopRoutes:create', {
        parentId: UGCO_PARENT_ID,
        title: 'Test_02',
        type: 'page',
        schemaUid: newPageUid,
        menuSchemaUid: newMenuUid,
        enableTabs: false
    });

    const newRoute = createRouteRes.data?.data;
    console.log('   ✓ Ruta creada:', newRoute?.id);

    // 4. Verificar
    console.log('\n4. Verificando...');
    console.log('   ID:', newRoute?.id);
    console.log('   title:', newRoute?.title);
    console.log('   schemaUid:', newRoute?.schemaUid);
    console.log('   menuSchemaUid:', newRoute?.menuSchemaUid);
    console.log('   parentId:', newRoute?.parentId);

    console.log('\n✅ Test_02 creada');
    console.log('   URL: /admin/' + newPageUid);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
