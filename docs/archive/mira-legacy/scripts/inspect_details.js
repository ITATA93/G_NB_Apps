const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const EXECUTION_ID = '334675507740672';
const TARGET_COLLECTION = 'ALMA_Usuarios';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function inspectDetails() {
    console.log(`--- Inspecting Execution ${EXECUTION_ID} ---`);
    try {
        const execRes = await apiClient.get(`/executions/${EXECUTION_ID}`);
        if (execRes.status === 200) {
            // We want to see the result of the query node
            // The execution object usually has 'jobs'
            const jobsRes = await apiClient.get(`/executions/${EXECUTION_ID}/jobs`);
            if (jobsRes.status === 200) {
                const jobs = jobsRes.data.data;
                console.log(`Found ${jobs.length} jobs.`);

                // Find the query node job
                const queryJob = jobs.find(j => j.nodeId === 334671781101569); // Node ID from previous steps
                if (queryJob) {
                    console.log('Query Job Result:', JSON.stringify(queryJob.result, null, 2));
                } else {
                    console.log('Query job not found. Listing all jobs:', JSON.stringify(jobs, null, 2));
                }
            }
        } else {
            console.log('Failed to fetch execution:', execRes.status);
        }
    } catch (e) {
        console.error('Error fetching execution:', e.message);
    }

    console.log('\n--- Inspecting Target Schema (ALMA_Usuarios) ---');
    try {
        const targetRes = await apiClient.get(`/collections/${TARGET_COLLECTION}?appends=fields`);
        if (targetRes.status === 200) {
            const fields = targetRes.data.data.fields;
            console.log('Target Fields:', fields.map(f => `${f.name} (${f.type})`).join(', '));
        } else {
            console.log('Failed to fetch target schema:', targetRes.status);
        }
    } catch (e) {
        console.error('Error fetching target:', e.message);
    }
}

inspectDetails();
