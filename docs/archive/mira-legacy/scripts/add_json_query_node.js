require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const WORKFLOW_ID = '334749499457536'; // Existing workflow ID

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function addJsonQueryNode() {
    console.log(`Adding JSON Query node to workflow ${WORKFLOW_ID}...`);

    // 1. Get existing nodes to find the Query node ID
    const nodesRes = await apiClient.get(`/workflows/${WORKFLOW_ID}/nodes`);
    const nodes = nodesRes.data.data;
    const queryNode = nodes.find(n => n.type === 'query');

    if (!queryNode) {
        console.error('Query node not found. Cannot attach JSON Query node.');
        return;
    }

    // 2. Create JSON Query Node
    // This node transforms the output of the Query node
    const jsonNodePayload = {
        title: 'Transform SIDRA Data',
        type: 'json-query',
        workflowId: WORKFLOW_ID,
        upstreamId: queryNode.id,
        config: {
            // Example: Extract 'data' array if response is wrapped
            // alasql syntax used by NocoBase
            expression: 'SELECT * FROM ?'
        }
    };

    const createRes = await apiClient.post(`/workflows/${WORKFLOW_ID}/nodes`, jsonNodePayload);
    console.log(`Create JSON Query Node Status: ${createRes.status}`);

    if (createRes.status === 200 || createRes.status === 201) {
        console.log('JSON Query node added successfully.');
        console.log('ID:', createRes.data.data.id);
    } else {
        console.log('Failed:', JSON.stringify(createRes.data));
    }
}

addJsonQueryNode();
