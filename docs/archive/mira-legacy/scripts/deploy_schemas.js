require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// Type mapping
const TYPE_MAP = {
    'VARCHAR': 'string',
    'TEXT': 'text',
    'INTEGER': 'integer',
    'SERIAL': 'integer',
    'DATE': 'date',
    'TIMESTAMP': 'date',
    'BOOLEAN': 'boolean'
};

const INTERFACE_MAP = {
    'string': 'input',
    'text': 'textarea',
    'integer': 'number',
    'date': 'datetime',
    'boolean': 'checkbox'
};

async function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/i;
    const match = content.match(createTableRegex);

    if (!match) return null;

    const tableName = match[1];
    const body = match[2];

    const fields = [];
    const lines = body.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('--')) continue;

        // Regex to capture name, type, constraints, and comments
        // Example: UGCO_COD01 VARCHAR(50) NOT NULL UNIQUE, -- comment
        const fieldRegex = /^(\w+)\s+([A-Z]+)(?:\(([^)]+)\))?(.*?)(?:--\s*(.*))?$/i;
        const fieldMatch = line.match(fieldRegex);

        if (fieldMatch) {
            const fieldName = fieldMatch[1];
            const rawType = fieldMatch[2].toUpperCase();
            const constraints = fieldMatch[4] || '';
            const comment = fieldMatch[5] || '';

            if (fieldName.toLowerCase() === 'id' || rawType === 'SERIAL') continue;

            let type = TYPE_MAP[rawType] || 'string';
            let interfaceType = INTERFACE_MAP[type];
            let unique = constraints.toUpperCase().includes('UNIQUE');

            // Check for FK
            const fkRegex = /FK\s*(?:->|to)\s*(\w+)(?:\((\w+)\))?/i;
            const fkMatch = comment.match(fkRegex);
            let targetCollection = null;
            let targetKey = 'id';

            if (fkMatch) {
                targetCollection = fkMatch[1].toLowerCase(); // NocoBase collections are lowercase
                targetKey = fkMatch[2] || 'id';
                type = 'belongsTo';
            }

            fields.push({
                name: fieldName.toLowerCase(),
                type,
                interface: interfaceType,
                target: targetCollection,
                targetKey: targetKey,
                unique: unique,
                originalType: rawType
            });
        }
    }

    return { tableName, fields };
}

async function createCollection(name, title) {
    name = name.toLowerCase();
    console.log(`Checking collection: ${name}`);
    try {
        await apiClient.get(`/collections:getJsonSchema?name=${name}`);
        console.log(`  Collection ${name} exists.`);
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.log(`  Creating collection ${name}...`);
            await apiClient.post('/collections', {
                name: name,
                title: title,
            });
        } else {
            console.error(`  Error checking collection ${name}:`, e.message);
        }
    }
}

async function createField(collectionName, field) {
    collectionName = collectionName.toLowerCase();
    console.log(`  Processing field ${field.name} in ${collectionName}`);

    const fieldData = {
        name: field.name,
        type: field.type,
        interface: field.interface,
        uiSchema: { title: field.name }
    };

    if (field.unique) {
        fieldData.unique = true;
    }

    if (field.type === 'belongsTo') {
        fieldData.target = field.target;
        fieldData.foreignKey = field.name + '_id';

        if (field.name.endsWith('_id')) {
            fieldData.name = field.name.slice(0, -3); // 'paciente'
            fieldData.foreignKey = field.name; // 'paciente_id'
        }
    }

    try {
        await apiClient.post(`/collections/${collectionName}/fields`, fieldData);
        console.log(`    Created/Updated field ${fieldData.name}`);
    } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            // console.log(`    Field ${fieldData.name} likely exists.`);
        } else {
            console.error(`    Failed to create field ${fieldData.name}:`, error.response ? error.response.data : error.message);
        }
    }
}

async function main() {
    const dirs = [
        path.join(__dirname, '../UGCO/BD'),
        path.join(__dirname, '../../Apps/BUHO/BD')
    ];

    const schemas = [];

    // 1. Parse all schemas
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        for (const file of files) {
            const schema = await parseMarkdownFile(path.join(dir, file));
            if (schema) schemas.push(schema);
        }
    }

    // 2. Pass 1: Create Collections and Basic Fields
    console.log('--- PASS 1: Collections & Basic Fields ---');
    for (const schema of schemas) {
        await createCollection(schema.tableName, schema.tableName);
        for (const field of schema.fields) {
            if (field.type !== 'belongsTo') {
                await createField(schema.tableName, field);
            }
        }
    }

    // 3. Pass 2: Relationships
    console.log('\n--- PASS 2: Relationships ---');
    for (const schema of schemas) {
        for (const field of schema.fields) {
            if (field.type === 'belongsTo') {
                await createField(schema.tableName, field);
            }
        }
    }
}

main();
