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

async function main() {
    const response = await client.get('/desktopRoutes:list', { params: { pageSize: 100 } });
    const routes = response.data?.data || [];

    console.log('Total rutas:', routes.length);

    // Buscar rutas de especialidades (parentId del grupo Especialidades)
    const specialtyParentId = 345392373628932;
    const specialties = routes.filter((r: any) => r.parentId === specialtyParentId);

    console.log('\nEspecialidades encontradas:', specialties.length);
    console.log('─'.repeat(70));
    for (const r of specialties) {
        console.log(`  ${r.title}`);
        console.log(`    ID: ${r.id} | schemaUid: ${r.schemaUid || 'NULL'}`);
    }

    // Verificar un schema
    console.log('\n\nVerificando schema gvwu5oy6x81...');
    try {
        const schemaRes = await client.get('/uiSchemas:getJsonSchema/gvwu5oy6x81');
        console.log('  Response data keys:', Object.keys(schemaRes.data || {}));
        console.log('  Full response:', JSON.stringify(schemaRes.data, null, 2).substring(0, 500));
    } catch (e: any) {
        console.log('  Error:', e.message);
    }
}

main().catch(e => console.error('Error:', e.message));
