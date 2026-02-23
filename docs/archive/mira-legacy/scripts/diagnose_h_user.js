const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';
const COLLECTION_NAME = 'H_user';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl'
    },
    validateStatus: () => true // Don't throw on error status
});

async function testEndpoint(description, url) {
    console.log(`Testing ${description}: ${url}`);
    try {
        const res = await apiClient.get(url);
        console.log(`  Status: ${res.status} ${res.statusText}`);
        if (res.status === 200) {
            console.log(`  SUCCESS! Data length: ${res.data?.data?.length}`);
            return true;
        } else {
            console.log(`  Error Data:`, JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log(`  Exception: ${e.message}`);
    }
    return false;
}

async function runDiagnostics() {
    console.log('Starting Diagnostics for H_user...');

    // 1. Standard Data Source List
    await testEndpoint('Standard List', `/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:list?paginate=false`);

    // 2. Lowercase Collection
    await testEndpoint('Lowercase List', `/${DATA_SOURCE_KEY}/${COLLECTION_NAME.toLowerCase()}:list?paginate=false`);

    // 3. Uppercase Collection
    await testEndpoint('Uppercase List', `/${DATA_SOURCE_KEY}/${COLLECTION_NAME.toUpperCase()}:list?paginate=false`);

    // 4. Schema Get
    await testEndpoint('Get Json Schema', `/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:getJsonSchema`);

    // 5. Root Collection (Aliased?)
    await testEndpoint('Root List', `/${COLLECTION_NAME}:list?paginate=false`);

    // 6. Data Source Info
    await testEndpoint('Data Source Info', `/dataSources/${DATA_SOURCE_KEY}:get`);

    // 7. Plugin Prefix Guesses
    await testEndpoint('Plugin MSSQL', `/mssql/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:list`);
    await testEndpoint('Plugin External', `/external/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:list`);
    await testEndpoint('Plugin Data Source', `/plugin-data-source-external-mssql/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:list`);

    // 8. Try listing collections via data source (prefixed)
    await testEndpoint('Data Source Collections (Prefixed)', `/dataSources/${DATA_SOURCE_KEY}/collections:list`);
    await testEndpoint('Data Source H_user (Prefixed)', `/dataSources/${DATA_SOURCE_KEY}/${COLLECTION_NAME}:list`);

    console.log('Diagnostics completed.');
}

runDiagnostics();
