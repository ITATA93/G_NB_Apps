require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const fs = require('fs');

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

async function checkNodes() {
    console.log(`Checking nodes for workflow ${WORKFLOW_ID}...`);
    const res = await apiClient.get(`/workflows/${WORKFLOW_ID}/nodes`);

    if (res.status === 200) {
        const nodes = res.data.data;
        console.log(`Found ${nodes.length} nodes. Writing to workflow_analysis.json...`);

        const analysis = nodes.map(node => {
            const relevantConfig = {};
            if (node.config) {
                if (node.type === 'query') {
                    relevantConfig.collection = node.config.collection;
                    relevantConfig.params = node.config.params;
                } else if (node.type === 'loop') {
                    relevantConfig.target = node.config.target;
                } else if (node.type === 'update') {
                    relevantConfig.collection = node.config.collection;
                    relevantConfig.action = node.config.action;
                    relevantConfig.params = node.config.params;
                } else {
                    relevantConfig.full = node.config;
                }
            }
            return {
                id: node.id,
                title: node.title,
                type: node.type,
                upstreamId: node.upstreamId,
                downstreamId: node.downstreamId,
                config: relevantConfig
            };
        });

        fs.writeFileSync('workflow_analysis.json', JSON.stringify(analysis, null, 2));
        console.log('Analysis saved.');
    } else {
        console.log('Error:', res.status);
    }
}

checkNodes();
