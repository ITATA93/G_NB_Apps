require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej';

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: Missing NOCOBASE_API_URL or NOCOBASE_API_TOKEN in .env file');
    process.exit(1);
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function createWorkflow() {
    console.log('Attempting to create "Sync SIDRA Users" workflow...');

    // Step 1: Create Workflow Shell
    const workflowPayload = {
        title: 'Sync SIDRA Users',
        type: 'schedule', // Trying 'schedule' type
        enabled: true,
        config: {
            mode: 1, // Custom mode
            cron: '*/3 * * * *' // Every 3 minutes
        }
    };

    try {
        const res = await apiClient.post('/workflows', workflowPayload);
        console.log(`Create Workflow Status: ${res.status}`);

        if (res.status === 200 || res.status === 201) {
            const workflow = res.data.data;
            console.log(`Workflow created! ID: ${workflow.id}`);

            // Step 2: Add Query Node (Fetching from SIDRA)
            // Note: Configuring external data source in a node via API is experimental
            // We will try to add a generic query node first
            const queryNodePayload = {
                title: 'Query SIDRA H_user',
                type: 'query',
                workflowId: workflow.id,
                config: {
                    collection: 'H_user',
                    dataSource: 'd_llw3u3ya2ej', // SIDRA data source key
                    multiple: true,
                    params: {
                        paginate: false
                    }
                }
            };

            const nodeRes = await apiClient.post(`/workflows/${workflow.id}/nodes`, queryNodePayload);
            console.log(`Create Query Node Status: ${nodeRes.status}`);

            if (nodeRes.status === 200 || nodeRes.status === 201) {
                console.log('Query node added successfully.');
                const queryNode = nodeRes.data.data;

                // Step 3: Add Loop Node (Iterating over results)
                const loopNodePayload = {
                    title: 'Loop Users',
                    type: 'loop', // Assuming 'loop' or 'map' type
                    workflowId: workflow.id,
                    upstreamId: queryNode.id,
                    config: {
                        items: `{{ $jobsMapByNodeId.${queryNode.id} }}` // Reference to query result
                    }
                };
                // Note: The exact syntax for 'items' reference in NocoBase JSON is complex. 
                // We are creating the structure; the user might need to refine the variable reference in UI.

                const loopRes = await apiClient.post(`/workflows/${workflow.id}/nodes`, loopNodePayload);
                console.log(`Create Loop Node Status: ${loopRes.status}`);

                if (loopRes.status === 200 || loopRes.status === 201) {
                    console.log('Loop node added.');
                    // Inside the loop, we would need an Update node. 
                    // Creating nested nodes via API is tricky without knowing the exact branchIndex/upstreamId logic for loops.
                    // We will stop here and let the user configure the inner loop logic in UI if the shell exists.
                }
            } else {
                console.log('Failed to create Query node:', JSON.stringify(nodeRes.data));
            }

        } else {
            console.log('Failed to create workflow:', JSON.stringify(res.data));
        }

    } catch (e) {
        console.error('Exception:', e.message);
    }
}

createWorkflow();
