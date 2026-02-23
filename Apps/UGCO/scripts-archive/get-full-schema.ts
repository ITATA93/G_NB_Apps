/**
 * get-full-schema.ts - Obtener schema completo con todas las properties
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

const WORKING_PAGE_UID = '83spwnaehs3';
const DIGESTIVO_UID = 'y9z8atdl8r';
const DASHBOARD_UID = 'xikvv7wkefy';

async function getFullSchema(uid: string): Promise<any> {
    // Obtener el schema base
    const res = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
    const schema = res.data?.data;

    // Si tiene properties, obtenerlas recursivamente
    if (schema) {
        try {
            const propsRes = await client.get(`/uiSchemas:getProperties/${uid}`);
            if (propsRes.data?.data?.properties) {
                schema.properties = propsRes.data.data.properties;
            }
        } catch (e) {}
    }

    return schema;
}

async function main() {
    console.log('=== COMPARANDO SCHEMAS COMPLETOS ===\n');

    // 1. Página funcional con tabla
    console.log('1. Página funcional (Ejemplo_01)...');
    try {
        const propsRes = await client.get(`/uiSchemas:getProperties/${WORKING_PAGE_UID}`);
        const props = propsRes.data?.data;
        console.log('getProperties response:');
        console.log(JSON.stringify(props, null, 2).substring(0, 2000));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 2. Dashboard
    console.log('\n\n2. Dashboard...');
    try {
        const propsRes = await client.get(`/uiSchemas:getProperties/${DASHBOARD_UID}`);
        const props = propsRes.data?.data;
        console.log('getProperties response:');
        console.log(JSON.stringify(props, null, 2).substring(0, 1000));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 3. Digestivo Alto
    console.log('\n\n3. Digestivo Alto...');
    try {
        const propsRes = await client.get(`/uiSchemas:getProperties/${DIGESTIVO_UID}`);
        const props = propsRes.data?.data;
        console.log('getProperties response:');
        console.log(JSON.stringify(props, null, 2).substring(0, 1000));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 4. Verificar qué diferencia hay en cómo se crearon
    console.log('\n\n4. Verificando diferencias en la base...');

    // Buscar en uiSchemas directamente
    const schemas = [WORKING_PAGE_UID, DASHBOARD_UID, DIGESTIVO_UID];
    for (const uid of schemas) {
        try {
            const res = await client.get('/uiSchemas:get', {
                params: { filter: { 'x-uid': uid } }
            });
            const schema = res.data?.data;
            console.log(`\n${uid}:`);
            console.log('  x-async:', schema?.['x-async']);
            console.log('  name:', schema?.name);
            console.log('  type:', schema?.type);
        } catch (e: any) {
            console.log(`${uid}: Error - ${e.message}`);
        }
    }
}

main().catch(e => console.error('Error:', e.message));
