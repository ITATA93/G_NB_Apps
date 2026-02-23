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

const PAGES_TO_CHECK = [
    { id: 345419036819456, name: 'Pacientes' },
    { id: 345419038916608, name: 'Tratamientos' },
    { id: 345419043110912, name: 'Seguimiento' },
];

async function main() {
    console.log('=== VERIFICANDO ESTRUCTURA DE PÁGINAS ===\n');

    for (const page of PAGES_TO_CHECK) {
        console.log(`\n--- ${page.name} (${page.id}) ---`);

        // 1. Obtener la ruta
        const route = await client.get(`/desktopRoutes:get?filterByTk=${page.id}`);
        const routeData = route.data?.data;
        console.log('Ruta schemaUid:', routeData?.schemaUid);

        // 2. Verificar si tiene children
        const children = await client.get('/desktopRoutes:list', {
            params: { filter: { parentId: page.id } }
        });
        console.log('Children (tabs):', children.data?.data?.length || 0);
        for (const child of children.data?.data || []) {
            console.log('  - tipo:', child.type, '| schemaUid:', child.schemaUid, '| hidden:', child.hidden);
        }

        // 3. Obtener el schema
        if (routeData?.schemaUid) {
            const schema = await client.get(`/uiSchemas:getJsonSchema/${routeData.schemaUid}`);
            console.log('Schema Page x-async:', schema.data?.data?.['x-async']);

            // 4. Verificar el Grid
            const props = await client.get(`/uiSchemas:getProperties/${routeData.schemaUid}`);
            const gridKey = Object.keys(props.data?.data?.properties || {})[0];
            if (gridKey) {
                const grid = props.data?.data?.properties[gridKey];
                console.log('Grid x-uid:', grid?.['x-uid']);
                console.log('Grid x-async:', grid?.['x-async']);
                console.log('Grid x-initializer:', grid?.['x-initializer']);
            }
        }
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
