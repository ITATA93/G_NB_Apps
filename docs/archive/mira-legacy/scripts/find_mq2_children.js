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

async function findMq2ChildrenAndPage() {
    const mq2GroupId = 334368363577344;
    const targetSchemaUid = '0kxqe038u2u';

    try {
        console.log('Listing all routes to find MQ2 children and target page...');
        const res = await apiClient.get('/desktopRoutes:list?pageSize=2000');
        const routes = res.data.data;

        const mq2Children = routes.filter(r => r.parentId === mq2GroupId);
        console.log(`--- Children of MQ2 (${mq2GroupId}) ---`);
        mq2Children.forEach(r => {
            console.log(JSON.stringify(r, null, 2));
        });

        const targetRoute = routes.find(r => r.schemaUid === targetSchemaUid);
        if (targetRoute) {
            console.log('--- Found Route for Target Page ---');
            console.log(JSON.stringify(targetRoute, null, 2));
        } else {
            console.log(`No route found for schemaUid: ${targetSchemaUid}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findMq2ChildrenAndPage();
