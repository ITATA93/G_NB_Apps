const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl',
        'X-With-ACL-Meta': 'true'
    },
    validateStatus: () => true
});

async function listDataSourceCollections() {
    console.log(`Listing collections for ${DATA_SOURCE_KEY}...`);

    // 1. Prefixed
    const url1 = `/dataSources/${DATA_SOURCE_KEY}/collections:list?paginate=false`;
    console.log(`Testing ${url1}`);
    try {
        const res1 = await apiClient.get(url1);
        console.log(`Status: ${res1.status}`);
        if (res1.status === 200) {
            const collections = res1.data.data;
            const hUser = collections.find(c => c.name === 'H_user');
            if (hUser) {
                console.log('Found H_user metadata:', JSON.stringify(hUser, null, 2));
            } else {
                console.log('H_user not found in list!');
            }
        } else {
            console.log('Error:', JSON.stringify(res1.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }

    // 2. Unprefixed
    const url2 = `/${DATA_SOURCE_KEY}/collections:list?paginate=false`;
    console.log(`Testing ${url2}`);
    try {
        const res2 = await apiClient.get(url2);
        console.log(`Status: ${res2.status}`);
        if (res2.status === 200) {
            console.log('Found collections:', res2.data.data.map(c => c.name));
        } else {
            console.log('Error:', JSON.stringify(res2.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

listDataSourceCollections();
