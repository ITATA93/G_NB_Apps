const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

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

async function probeFilters() {
    console.log('Probing with filters...');

    const filters = [
        'paginate=false',
        'paginate=false&filter[enabled]=false',
        'paginate=false&filter[enabled]=true',
        'paginate=false&appends=versions' // Guessing 'versions' append
    ];

    for (const f of filters) {
        try {
            console.log(`GET /workflows:list?${f}`);
            const res = await apiClient.get(`/workflows:list?${f}`);
            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                const data = res.data.data;
                console.log(`Found ${data.length} workflows.`);
                if (data.length > 0) {
                    console.log('Sample:', JSON.stringify(data[0]).substring(0, 100));
                }
            }
        } catch (e) {
            console.log('Exception:', e.message);
        }
    }
}

probeFilters();
