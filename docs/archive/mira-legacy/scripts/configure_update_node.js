require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const WORKFLOW_ID = '334749499457536';
const NODE_ID = '334750443175936'; // The existing "Actualizar registro" node
const LOOP_NODE_ID = '334749499457538';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function configureUpdateNode() {
    console.log(`Configuring node ${NODE_ID}...`);

    // Define the correct mapping using the Loop Node's output (Current Item)
    const updateConfig = {
        collection: 'ALMA_Usuarios',
        action: 'updateOrCreate', // Upsert
        params: {
            filter: {
                // Match by ID Original
                id_original: `{{ $jobsMapByNodeId['${LOOP_NODE_ID}']['PAPMI_RowId'] }}`
            },
            values: {
                // Map fields
                id_original: `{{ $jobsMapByNodeId['${LOOP_NODE_ID}']['PAPMI_RowId'] }}`,
                nombre: `{{ $jobsMapByNodeId['${LOOP_NODE_ID}']['Nombre'] }} {{ $jobsMapByNodeId['${LOOP_NODE_ID}']['Apellidos'] }}`,
                rut: `{{ $jobsMapByNodeId['${LOOP_NODE_ID}']['Rut'] }}`,
                email: `{{ $jobsMapByNodeId['${LOOP_NODE_ID}']['Email'] }}` // Assuming Email exists
            }
        }
    };

    const res = await apiClient.put(`/workflows/${WORKFLOW_ID}/nodes/${NODE_ID}`, {
        config: updateConfig
    });

    console.log(`Update Status: ${res.status}`);
    if (res.status === 200) {
        console.log('Node configured successfully.');
    } else {
        console.log('Error:', JSON.stringify(res.data));
    }
}

configureUpdateNode();
