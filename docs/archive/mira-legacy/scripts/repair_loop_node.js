require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;

const WORKFLOW_ID = '334762235461633';
const LOOP_NODE_ID = '334762235461635';
const CORRECT_QUERY_NODE_ID = '334762235461634';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function repairLoopNode() {
    console.log(`Repairing Loop Node ${LOOP_NODE_ID} in Workflow ${WORKFLOW_ID}...`);

    const newConfig = {
        target: `{{ $jobsMapByNodeId['${CORRECT_QUERY_NODE_ID}'] }}`
    };

    console.log(`Setting new target: ${newConfig.target}`);

    try {
        const res = await apiClient.put(`/workflows/${WORKFLOW_ID}/nodes/${LOOP_NODE_ID}`, {
            config: newConfig
        });

        if (res.status === 200) {
            console.log('Success! Node updated.');
            console.log('New Config:', JSON.stringify(res.data.data.config, null, 2));
        } else {
            console.log('Error updating node:', res.status);
            console.log(JSON.stringify(res.data, null, 2));
        }
    } catch (error) {
        console.error('Fatal Error:', error.message);
    }
}

repairLoopNode();
