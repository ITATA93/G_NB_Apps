const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const WORKFLOW_ID = process.argv[2];

if (!WORKFLOW_ID) {
    console.error('Please provide a Workflow ID.');
    process.exit(1);
}

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

async function getWorkflowDetails() {
    console.log(`Fetching details for Workflow ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.get(`/workflows/${WORKFLOW_ID}?appends=nodes`);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const workflow = res.data.data;
            const filename = `workflow_${WORKFLOW_ID}.json`;
            fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(workflow, null, 2));
            console.log(`Workflow details saved to ${filename}`);
            console.log(`Nodes count: ${workflow.nodes ? workflow.nodes.length : 0}`);
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

getWorkflowDetails();
