require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const WORKFLOW_ID = '334762235461633'; // User workflow ID

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function triggerWorkflow() {
    console.log(`Triggering workflow ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.post(`/workflows/${WORKFLOW_ID}:trigger`);
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(res.data, null, 2));

        // Wait a bit for execution
        console.log('Waiting 5 seconds for execution...');
        await new Promise(r => setTimeout(r, 5000));

        // Check ALMA_Usuarios count
        const countRes = await apiClient.get('/ALMA_Usuarios:count');
        console.log('ALMA_Usuarios count:', countRes.data);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

triggerWorkflow();
