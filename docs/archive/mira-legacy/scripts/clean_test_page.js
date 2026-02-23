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

async function cleanPage() {
    // UIDs to remove (from previous logs)
    const uidsToRemove = [
        'ko52k5eaort', // Failed Kanban
        'wm8v8l3vfdx', // Failed Table
        'hvhe6ard25p'  // Failed Cloned Table
    ];

    for (const uid of uidsToRemove) {
        try {
            console.log(`Removing block '${uid}'...`);
            await apiClient.post(`/uiSchemas:remove/${uid}`);
            console.log('Success.');
        } catch (error) {
            console.error(`Error removing ${uid}:`, error.message);
        }
    }
}

cleanPage();
