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

async function inspectPage(name: string, id: number) {
    console.log(`\n=== ${name} (${id}) ===\n`);

    // Ruta completa
    const route = await client.get(`/desktopRoutes:get?filterByTk=${id}`);
    console.log('RUTA:', JSON.stringify(route.data?.data, null, 2));

    // Children
    const children = await client.get('/desktopRoutes:list', {
        params: { filter: { parentId: id } }
    });
    console.log('\nCHILDREN:', JSON.stringify(children.data?.data, null, 2));

    // Schema
    const schemaUid = route.data?.data?.schemaUid;
    if (schemaUid) {
        const schema = await client.get(`/uiSchemas:getJsonSchema/${schemaUid}`);
        console.log('\nSCHEMA:', JSON.stringify(schema.data?.data, null, 2));

        const props = await client.get(`/uiSchemas:getProperties/${schemaUid}`);
        console.log('\nPROPERTIES:', JSON.stringify(props.data?.data, null, 2));
    }
}

async function main() {
    // Una página que funciona (Mama - creada por UI)
    await inspectPage('🩷 Mama (FUNCIONA)', 345392373628938);

    // Una página que no funciona (Pacientes - creada por API)
    await inspectPage('Pacientes (NO FUNCIONA)', 345419036819456);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
