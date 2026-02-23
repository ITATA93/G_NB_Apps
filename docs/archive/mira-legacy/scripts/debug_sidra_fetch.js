require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`
    },
    validateStatus: () => true
});

async function testFetch(strategy, url) {
    console.log(`Testing ${strategy}: ${url}`);
    try {
        const res = await apiClient.get(url);
        console.log(`Status: ${res.status}`);
        if (res.data && res.data.data) {
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log(`Data count: ${data.length}`);
            if (data.length > 0) console.log('Sample:', JSON.stringify(data[0]).substring(0, 100) + '...');
        } else {
            console.log('Response body:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
    console.log('---');
}

async function main() {
    // Strategy 1: Standard List
    await testFetch('Standard List', `/dataSources/${DATA_SOURCE_KEY}/collections/H_user:list?pageSize=1`);

    // Strategy 2: Colon Syntax
    await testFetch('Colon Syntax', `/${DATA_SOURCE_KEY}:H_user:list?pageSize=1`);

    // Strategy 3: Filter by PK (if known) - trying generic
    await testFetch('Filter PK', `/dataSources/${DATA_SOURCE_KEY}/collections/H_user:list?pageSize=1&filter[PAPMI_RowId.$notNull]=true`);

    // Strategy 6: Filter by Rut (suggested by metadata)
    // Note: We need a valid Rut or just a non-null check if supported
    await testFetch('Filter Rut', `/dataSources/${DATA_SOURCE_KEY}/collections/H_user:list?pageSize=1&filter[Rut.$notNull]=true`);


    // Strategy 4: Repository/Collection API
    await testFetch('Repo API', `/api/${DATA_SOURCE_KEY}:H_user:list?pageSize=1`);

    // Strategy 5: Check another table (Region) to compare
    await testFetch('Region Check', `/dataSources/${DATA_SOURCE_KEY}/collections/Region:list?pageSize=1`);
}

main();
