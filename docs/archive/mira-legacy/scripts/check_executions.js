const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = process.argv[2] || '334571046502400';

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

async function checkExecutions() {
    console.log(`Checking executions for Workflow ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.get(`/executions:list?filter[workflowId]=${WORKFLOW_ID}&sort=-createdAt&paginate=false`);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const executions = res.data.data;
            console.log(`Found ${executions.length} executions.`);
            if (executions.length > 0) {
                const latest = executions[0];
                console.log('Latest Execution:', JSON.stringify({
                    id: latest.id,
                    status: latest.status,
                    createdAt: latest.createdAt,
                    jobs: latest.jobs
                }, null, 2));
            } else {
                console.log('No executions found yet. Waiting for schedule...');
            }
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

checkExecutions();
