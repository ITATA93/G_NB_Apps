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

async function findBuhoChildren() {
    const buhoGroupId = 334368327925760;
    try {
        console.log(`Finding children of BUHO group (${buhoGroupId})...`);
        const res = await apiClient.get('/desktopRoutes:list?pageSize=2000&sort=sort');
        const routes = res.data.data;

        const children = routes.filter(r => r.parentId === buhoGroupId);
        console.log(`Found ${children.length} children.`);
        children.forEach(r => {
            console.log(JSON.stringify(r, null, 2));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findBuhoChildren();
