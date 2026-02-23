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
    // Verificar Prueba_API
    const pageUid = 's92ttcxbx6';

    console.log('=== Verificando Prueba_API ===');

    // JSON Schema
    const schema = await client.get(`/uiSchemas:getJsonSchema/${pageUid}`);
    console.log('JSON Schema:', JSON.stringify(schema.data?.data));

    // Properties
    const props = await client.get(`/uiSchemas:getProperties/${pageUid}`);
    const gridProps = Object.values(props.data?.data?.properties || {})[0] as any;
    console.log('Grid x-async:', gridProps?.['x-async']);

    // Comparar con Test_Async que SÍ funciona
    console.log('\n=== Test_Async (funciona) ===');
    const asyncSchema = await client.get('/uiSchemas:getJsonSchema/1akrkhzo9i7');
    console.log('JSON Schema:', JSON.stringify(asyncSchema.data?.data));

    const asyncProps = await client.get('/uiSchemas:getProperties/1akrkhzo9i7');
    const asyncGridProps = Object.values(asyncProps.data?.data?.properties || {})[0] as any;
    console.log('Grid x-async:', asyncGridProps?.['x-async']);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
