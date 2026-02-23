const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
    const client = createClient();
    log('Configuring fields for onco_casos...', 'cyan');

    // Define fields to add
    const fields = [
        {
            name: 'paciente_id',
            type: 'string',
            uiSchema: {
                title: 'ID Paciente',
                'x-component': 'Input',
            }
        },
        {
            name: 'estado_caso',
            type: 'select',
            uiSchema: {
                title: 'Estado',
                'x-component': 'Select',
                enum: [
                    { value: 'activo', label: 'Activo' },
                    { value: 'cerrado', label: 'Cerrado' },
                    { value: 'fallecido', label: 'Fallecido' }
                ]
            }
        }
    ];

    try {
        log('Sending create field request...', 'yellow');

        for (const field of fields) {
            log(`Creating field ${field.name}...`, 'cyan');
            try {
                // Correct NocoBase endpoint pattern for creating a field in a collection
                // POST /collections/<collectionName>/fields:create
                const response = await client.post(`/collections/onco_casos/fields:create`, field);

                if (response.status === 200) {
                    log(`✓ Field ${field.name} created.`, 'green');
                } else {
                    log(`x Failed ${field.name}: ${response.status}`, 'red');
                    if (response.data) console.log(JSON.stringify(response.data, null, 2));
                }
            } catch (e) {
                log(`x Error creating ${field.name}: ${e.message}`, 'red');
                if (e.response) console.log(JSON.stringify(e.response.data, null, 2));
            }
        }

    } catch (error) {
        log(`❌ Fatal Error: ${error.message}`, 'red');
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
