require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function createWorkflow() {
    console.log('Creating "Alma_Usuarios" workflow...');

    // 1. Create Workflow
    const workflowRes = await apiClient.post('/workflows', {
        title: 'Alma_Usuarios',
        enabled: true,
        type: 'schedule',
        config: {
            mode: 1, // Custom
            cron: '0 */3 * * * *' // Every 3 minutes
        }
    });

    if (workflowRes.status !== 200) {
        console.error('Failed to create workflow:', workflowRes.data);
        return;
    }
    const workflowId = workflowRes.data.data.id;
    console.log(`Workflow created: ${workflowId}`);

    // 2. Add Query Node
    console.log('Adding Query node...');
    const queryRes = await apiClient.post(`/workflows/${workflowId}/nodes`, {
        title: 'Query SIDRA',
        type: 'query',
        workflowId: workflowId,
        config: {
            collection: `d_llw3u3ya2ej:H_user`, // Using colon syntax for data source
            params: {
                pageSize: 20,
                appends: []
            }
        }
    });
    const queryNodeId = queryRes.data.data.id;

    // 3. Add Loop Node
    console.log('Adding Loop node...');
    const loopRes = await apiClient.post(`/workflows/${workflowId}/nodes`, {
        title: 'Loop Users',
        type: 'loop',
        workflowId: workflowId,
        upstreamId: queryNodeId,
        config: {
            target: `{{ $jobsMapByNodeId['${queryNodeId}'] }}` // Correct target
        }
    });
    const loopNodeId = loopRes.data.data.id;

    // 4. Add Update Node (Inside Loop)
    console.log('Adding Update node...');
    const updateRes = await apiClient.post(`/workflows/${workflowId}/nodes`, {
        title: 'Sync User',
        type: 'update', // Using 'update' type which supports upsert in NocoBase
        workflowId: workflowId,
        upstreamId: loopNodeId,
        branchIndex: 0, // Inside loop
        config: {
            collection: 'ALMA_Usuarios',
            action: 'updateOrCreate',
            params: {
                filter: {
                    id_original: `{{ $jobsMapByNodeId['${loopNodeId}']['PAPMI_RowId'] }}`
                },
                values: {
                    id_original: `{{ $jobsMapByNodeId['${loopNodeId}']['PAPMI_RowId'] }}`,
                    nombre: `{{ $jobsMapByNodeId['${loopNodeId}']['Nombre'] }} {{ $jobsMapByNodeId['${loopNodeId}']['Apellidos'] }}`,
                    rut: `{{ $jobsMapByNodeId['${loopNodeId}']['Rut'] }}`,
                    email: `{{ $jobsMapByNodeId['${loopNodeId}']['Email'] }}`
                }
            }
        }
    });

    if (updateRes.status === 200) {
        console.log('Workflow "Alma_Usuarios" created and configured successfully!');
    } else {
        console.error('Failed to add Update node:', updateRes.data);
    }
}

createWorkflow();
