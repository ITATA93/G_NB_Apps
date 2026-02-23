const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = '334667320459265'; // The ID we found earlier

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl'
    },
    validateStatus: () => true
});

async function probeWorkflow() {
    console.log(`Probing Workflow ID ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.get(`/workflows/${WORKFLOW_ID}`);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log('Workflow found!');
            console.log('Data:', JSON.stringify(res.data.data, null, 2));
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

probeWorkflow();
