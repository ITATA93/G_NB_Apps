/**
 * fix-test02-like-a.ts - Ajustar Test_02 para que sea exactamente igual a "a"
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

const TEST_ROUTE_ID = 345408121143296;
const TEST_SCHEMA_UID = 'yz83359mv6j';
const TEST_MENU_UID = 'x1vabottgj';
const TEST_GRID_UID = 'ayz2cnr40bu';

async function main() {
    console.log('=== AJUSTANDO TEST_02 PARA SER IGUAL A "a" ===\n');

    // 1. Eliminar el menuSchema actual y crear uno vacío
    console.log('1. Arreglando menuSchema...');
    try {
        // Eliminar menuSchema actual
        await client.post(`/uiSchemas:remove/${TEST_MENU_UID}`);
        console.log('   MenuSchema eliminado');
    } catch (e) {}

    // Crear menuSchema vacío (como "a")
    const newMenuUid = Math.random().toString(36).substring(2, 13);
    // En "a", el menuSchema es literalmente {} - un objeto vacío
    // Esto significa que probablemente no fue creado con uiSchemas:insert
    // sino que es solo una referencia vacía

    // Actualizar la ruta con menuSchemaUid null o crear uno realmente vacío
    console.log('   Probando con menuSchemaUid vacío...');

    // Primero, veamos cómo se ve el menuSchema de "a" en la base de datos
    const aMenuRes = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': '9bpb5x9pp7j' } }
    });
    console.log('   Menu "a" en DB:', JSON.stringify(aMenuRes.data?.data));

    // 2. Arreglar el Grid para tener x-async: true
    console.log('\n2. Arreglando Grid x-async...');
    try {
        await client.post('/uiSchemas:patch', {
            'x-uid': TEST_GRID_UID,
            'x-async': true
        });
        console.log('   Grid actualizado con x-async: true');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Verificar
    console.log('\n3. Verificando cambios...');
    const propsRes = await client.get(`/uiSchemas:getProperties/${TEST_SCHEMA_UID}`);
    console.log('   Properties de Test_02:');
    console.log(JSON.stringify(propsRes.data?.data, null, 2));

    // 4. Intentar un enfoque diferente: ver qué hace NocoBase al crear una página desde UI
    console.log('\n\n4. Investigando el menuSchema de "a" más a fondo...');

    // El menuSchema de "a" es 9bpb5x9pp7j pero cuando lo obtenemos devuelve {}
    // Esto puede significar que existe pero está vacío, o que tiene una estructura especial

    // Ver si hay serverHooks asociados
    try {
        const hooksRes = await client.get('/uiSchemaServerHooks:list');
        console.log('   ServerHooks:', hooksRes.data?.data?.length);
        for (const hook of hooksRes.data?.data || []) {
            console.log(`     - ${hook.uid}: ${hook.type}`);
        }
    } catch (e) {}

    // 5. Ver si hay algo en la tabla de templates
    console.log('\n5. Verificando templates...');
    try {
        const templatesRes = await client.get('/uiSchemaTemplates:list', { params: { pageSize: 10 } });
        console.log('   Templates:', templatesRes.data?.data?.length);
    } catch (e) {}

    // 6. Comparar los registros raw en uiSchemas
    console.log('\n6. Comparando registros raw...');
    const aSchemaRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': '0h2vgqaifns' } }
    });
    const testSchemaRaw = await client.get('/uiSchemas:list', {
        params: { filter: { 'x-uid': TEST_SCHEMA_UID } }
    });

    console.log('   "a" raw:', JSON.stringify(aSchemaRaw.data?.data?.[0]));
    console.log('   Test_02 raw:', JSON.stringify(testSchemaRaw.data?.data?.[0]));
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
