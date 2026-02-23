const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
    const client = createClient();
    log('Probing onco_casos...', 'cyan');

    try {
        // 1. Try to get it
        try {
            const schema = await client.getCollectionSchema('onco_casos');
            log('✓ Found onco_casos!', 'green');
            console.log(JSON.stringify(schema, null, 2));
            return;
        } catch (e) {
            log(`x Not found (or error): ${e.message}`, 'yellow');
        }

        // 2. Try to create it again with FULL logging
        log('Attempting creation...', 'cyan');
        const response = await client.post('/collections:create', {
            name: 'onco_casos',
            title: 'Casos Oncológicos',
            inherit: false,
            hidden: false
        });

        log(`Status: ${response.status}`, 'cyan');
        console.log('Response Body:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        log(`❌ Fatal Error: ${error.message}`, 'red');
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

main();
