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

async function findGrid() {
    const pageUid = '0kxqe038u2u';
    try {
        const res = await apiClient.get(`/uiSchemas:getProperties/${pageUid}`);
        const props = res.data;

        // Look for a child with x-component: Grid
        let gridUid = null;
        for (const key in props) {
            if (props[key]['x-component'] === 'Grid') {
                gridUid = props[key]['x-uid'];
                console.log(`Found Grid UID: ${gridUid}`);
                break;
            }
        }

        if (!gridUid) {
            console.log('No Grid found. Creating one...');
            // Create a Grid if none exists
            // ...
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findGrid();
