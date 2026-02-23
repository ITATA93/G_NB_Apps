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

async function listChildren(parentId: number, indent: string = '') {
    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId },
            pageSize: 100
        }
    });

    for (const route of routes.data?.data || []) {
        console.log(`${indent}${route.id} | ${route.title} | ${route.type}`);
        if (route.type === 'group') {
            await listChildren(route.id, indent + '  ');
        }
    }
}

async function main() {
    const UGCO_ID = 345392373628928;

    console.log('=== ESTRUCTURA COMPLETA DE UGCO ONCOLOGÍA ===\n');
    await listChildren(UGCO_ID);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
