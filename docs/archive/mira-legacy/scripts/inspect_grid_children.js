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

async function inspectChildren() {
    const gridUid = 'iqpdy5evpc8';
    try {
        const res = await apiClient.get(`/uiSchemas:getProperties/${gridUid}`);
        const props = res.data;

        console.log('--- Grid Children ---');
        for (const key in props) {
            const child = props[key];

            // Check for Roles table
            if (JSON.stringify(child).includes('roles')) {
                console.log('FOUND ROLES TABLE:');
                console.log(JSON.stringify(child, null, 2));
            }

            // Check for Kanban
            if (JSON.stringify(child).includes('buho_pacientes')) {
                console.log('FOUND KANBAN BLOCK:');
                console.log(JSON.stringify(child, null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectChildren();
