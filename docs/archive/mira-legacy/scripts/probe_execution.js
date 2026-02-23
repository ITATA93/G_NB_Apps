const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = '334571046502400'; // One of the scheduled workflows

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

async function probeExecution() {
    console.log(`Probing execution creation for Workflow ${WORKFLOW_ID}...`);
    try {
        // Try POST /executions with workflowId in body
        const res = await apiClient.post('/executions:create', {
            workflowId: WORKFLOW_ID
        });
        console.log(`POST /executions:create Status: ${res.status}`);
        console.log('Response:', JSON.stringify(res.data).substring(0, 500));

        if (res.status !== 200) {
            // Try POST /executions
            const res2 = await apiClient.post('/executions', {
                workflowId: WORKFLOW_ID
            });
            console.log(`POST /executions Status: ${res2.status}`);
            console.log('Response:', JSON.stringify(res2.data).substring(0, 500));
        }

    } catch (e) {
        console.log('Exception:', e.message);
    }
}

probeExecution();
