require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function findParent() {
    try {
        const targetUid = '0kxqe038u2u';
        console.log(`Searching for parent of ${targetUid} in ALL schemas (excluding self)...`);

        const res = await apiClient.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data.data;

        let count = 0;
        for (const s of schemas) {
            count++;
            if (count % 100 === 0) console.log(`Checked ${count} schemas...`);

            if (s['x-uid'] === targetUid) continue;

            try {
                const detail = await apiClient.get(`/uiSchemas:getJsonSchema/${s['x-uid']}`);
                const jsonStr = JSON.stringify(detail.data);
                if (jsonStr.includes(targetUid)) {
                    console.log('FOUND PARENT!', JSON.stringify(detail.data, null, 2));
                    return;
                }
            } catch (e) {
                // ignore
            }
        }
        console.log('Parent not found.');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findParent();
