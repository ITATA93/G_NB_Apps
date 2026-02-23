require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function listRoutes() {
    try {
        console.log('Listing desktopRoutes...');
        const res = await apiClient.get('/desktopRoutes:list?pageSize=2000&sort=sort');
        const routes = res.data.data;

        console.log(`Found ${routes.length} routes.`);

        const roots = routes.filter(r => r.parentId === null || r.parentId === 0);
        console.log('--- Root Routes ---');
        roots.forEach(r => console.log(JSON.stringify(r, null, 2)));

        const buho = routes.filter(r => r.title && r.title.includes('BUHO'));
        console.log('--- BUHO Routes ---');
        buho.forEach(r => console.log(JSON.stringify(r, null, 2)));

        // Also find the 'Admin' menu group if it exists
        const admin = routes.filter(r => r.title === 'Admin' || r.type === 'group');
        console.log('--- Group Routes ---');
        admin.forEach(r => console.log(`ID: ${r.id}, Title: ${r.title}, Type: ${r.type}`));

    } catch (error) {
        console.error('Error listing routes:', error.message);
    }
}

listRoutes();
