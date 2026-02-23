const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function listWorkflows() {
    console.log('Listing Workflows...');
    try {
        const res = await apiClient.get('/workflows:list?paginate=false');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const workflows = res.data.data;
            console.log(`Found ${workflows.length} workflows.`);
            workflows.forEach(w => {
                console.log(`- [${w.enabled ? 'ON' : 'OFF'}] ${w.title} (Type: ${w.type})`);
                console.log(`  ID: ${w.id}, Created: ${w.createdAt}, Updated: ${w.updatedAt}`);
            });
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

listWorkflows();
