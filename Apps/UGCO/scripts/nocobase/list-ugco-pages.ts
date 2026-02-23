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
    const UGCO_ID = 345392373628928;

    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: UGCO_ID },
            pageSize: 100
        }
    });

    console.log('Páginas bajo UGCO Oncología:\n');
    for (const route of routes.data?.data || []) {
        console.log(`  ID: ${route.id} | ${route.title} | tipo: ${route.type}`);
    }
    console.log('\nTotal:', routes.data?.data?.length || 0);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
