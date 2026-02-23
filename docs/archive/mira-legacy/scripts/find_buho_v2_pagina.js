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

async function findBuhoV2Pagina() {
    try {
        const res = await apiClient.get('/desktopRoutes:list?pageSize=2000');
        const routes = res.data.data;

        const target = routes.find(r => r.title && r.title.includes('BUHO V2 Pagina'));

        if (target) {
            console.log('Found Route:', JSON.stringify(target, null, 2));

            // Now fetch the schema
            if (target.schemaUid) {
                console.log(`Fetching schema for ${target.schemaUid}...`);
                const schemaRes = await apiClient.get(`/uiSchemas:getJsonSchema/${target.schemaUid}`);
                console.log('Page Schema:', JSON.stringify(schemaRes.data.data, null, 2));
            }
        } else {
            console.log('Route "BUHO V2 Pagina" not found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findBuhoV2Pagina();
