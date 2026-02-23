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

async function checkData() {
    console.log('Checking data in ALMA_Usuarios...');
    try {
        const res = await apiClient.get('/ALMA_Usuarios:list?page=1&pageSize=1');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const data = res.data.data;
            const meta = res.data.meta;
            console.log(`Found ${data.length} records.`);
            if (meta) {
                console.log('Meta:', JSON.stringify(meta, null, 2));
            }
            if (data.length > 0) {
                console.log('Sample Record:', JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

checkData();
