require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const WORKFLOW_ID = '334762235461633';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function checkExecutions() {
    console.log(`Checking executions for workflow ${WORKFLOW_ID}...`);
    try {
        const res = await apiClient.get(`/workflows/${WORKFLOW_ID}/executions`, {
            params: {
                sort: '-createdAt',
                pageSize: 5
            }
        });

        if (res.status === 200) {
            const executions = res.data.data;
            console.log(`Found ${executions.length} recent executions.`);
            for (const exec of executions) {
                console.log(`\n[${exec.id}] Status: ${exec.status} | Time: ${exec.createdAt}`);
                try {
                    // Fetch details for this execution
                    const detailRes = await apiClient.get(`/executions/${exec.id}`);
                    if (detailRes.status === 200) {
                        const data = detailRes.data.data;
                        if (data && data.jobs && Array.isArray(data.jobs)) {
                            data.jobs.forEach(job => {
                                console.log(`  Node: ${job.nodeId} | Status: ${job.status}`);
                                if (job.result) {
                                    console.log(`  Result: ${JSON.stringify(job.result).substring(0, 200)}...`);
                                }
                            });
                        } else {
                            console.log('  No jobs found in execution details or invalid format.');
                            console.log('  Full details:', JSON.stringify(data, null, 2).substring(0, 500));
                        }
                    }
                } catch (detailErr) {
                    console.log(`  Error fetching details: ${detailErr.message}`);
                }
            }
        } else {
            console.log('Error fetching executions:', res.status);
        }
    } catch (err) {
        console.error('Fatal Error:', err.message);
        if (err.response) {
            console.error('Response Data:', JSON.stringify(err.response.data));
        }
    }
}

checkExecutions();
