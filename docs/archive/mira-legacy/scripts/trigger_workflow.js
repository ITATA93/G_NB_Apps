const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = '334571046502400';

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

async function triggerWorkflow() {
    console.log('Fetching Workflow ID...');
    let workflowId;
    try {
        const listRes = await apiClient.get('/workflows:list?paginate=false');
        if (listRes.status === 200) {
            // Filter by title
            const matchingWorkflows = listRes.data.data.filter(w => w.title === "Sync SIDRA Users");

            if (matchingWorkflows.length > 0) {
                // Sort by createdAt descending (newest first)
                matchingWorkflows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const latestWorkflow = matchingWorkflows[0];
                workflowId = latestWorkflow.id;
                console.log(`Found ${matchingWorkflows.length} workflows with title "Sync H_user to ALMA_Usuarios".`);
                console.log(`Selected Latest Workflow ID: ${workflowId} (Created: ${latestWorkflow.createdAt})`);
            } else {
                console.log('Workflow not found.');
                return;
            }
        }
    } catch (e) {
        console.log('Exception fetching workflow:', e.message);
        return;
    }

    console.log(`Triggering Workflow ${workflowId}...`);
    try {
        // Use /executions:create to manually trigger a scheduled workflow
        const res = await apiClient.post('/executions:create', {
            workflowId: workflowId
        });
        console.log(`Status: ${res.status}`);
        if (res.status === 200 || res.status === 201) {
            console.log('Workflow triggered successfully.');
            console.log('Execution ID:', res.data.data?.id);
            console.log('Response:', JSON.stringify(res.data, null, 2));
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception triggering workflow:', e.message);
        if (e.response) {
            console.log('Error Response:', JSON.stringify(e.response.data).substring(0, 200));
        }
    }
}

triggerWorkflow();
