const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = '334671781101568';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function getWorkflow() {
    console.log(`Fetching Workflow ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.get(`/workflows/${WORKFLOW_ID}?appends=nodes`);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log(JSON.stringify(res.data.data, null, 2));
        } else {
            console.log('Error:', JSON.stringify(res.data));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

getWorkflow();
