const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
    const client = createClient();
    log('Starting MIRA Collection Sync...', 'cyan');

    // List of required collections based on app-spec/app.yaml
    const requiredCollections = [
        // UGCO Core
        { name: 'onco_casos', title: 'Casos Oncológicos' },
        { name: 'onco_episodios', title: 'Episodios Oncológicos' },
        { name: 'onco_comite_sesiones', title: 'Sesiones de Comité' },
        { name: 'onco_comite_casos', title: 'Casos en Comité' },

        // ALMA Integration
        { name: 'alma_pacientes', title: 'ALMA Pacientes' },
        { name: 'alma_episodios', title: 'ALMA Episodios' },
        { name: 'alma_diagnosticos', title: 'ALMA Diagnosticos' }
    ];

    try {
        const existing = await client.getCollections();
        const existingNames = new Set(existing.map(c => c.name));

        for (const col of requiredCollections) {
            if (existingNames.has(col.name)) {
                log(`✓ Collection ${col.name} already exists.`, 'green');
            } else {
                log(`+ Creating collection ${col.name}...`, 'yellow');
                await client.createCollection({
                    name: col.name,
                    title: col.title,
                    inherit: false,
                    hidden: false
                });
                log(`✓ Created ${col.name}!`, 'green');
            }
        }

        // Create fields for onco_casos as a test/MVP
        // Fields: paciente_id (string)
        try {
            log(`Configuration fields for onco_casos...`, 'cyan');
            // Check if field exists is harder, we usually just try to create and catch error, or list fields
            // For now, let's just ensure the collection exists. 
            // NocoBase API for fields is usually POST /collections:update?filterByTk=<collection> with { fields: [...] }
            // or POST /<collection>/fields 

            // Let's stick to collection creation for this pass.
        } catch (err) {
            log(`Error configuring fields: ${err.message}`, 'red');
        }

    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        if (error.response) {
            console.error(error.response.data);
        }
        process.exit(1);
    }
}

main();
