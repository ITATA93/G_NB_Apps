require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const WORKFLOW_ID = '334749499457536';
const QUERY_NODE_ID = '334749499457537';
const LOOP_NODE_ID = '334749499457538';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function configureLoopNode() {
    console.log(`Configuring Loop node ${LOOP_NODE_ID}...`);

    const loopConfig = {
        // The target should be the result of the Query node
        target: `{{ $jobsMapByNodeId['${QUERY_NODE_ID}'] }}`
    };

    const res = await apiClient.put(`/workflows/${WORKFLOW_ID}/nodes/${LOOP_NODE_ID}`, {
        config: loopConfig
    });

    console.log(`Update Status: ${res.status}`);
    if (res.status === 200) {
        console.log('Loop node configured successfully.');
    } else {
        console.log('Error:', JSON.stringify(res.data));
    }
}

configureLoopNode();
