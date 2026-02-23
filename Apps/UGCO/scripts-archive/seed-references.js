const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const DICTIONARIES_DIR = path.resolve(__dirname, '../../BD/diccionarios_raw');

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: API_BASE_URL and API_KEY must be defined in .env');
    process.exit(1);
}

// Map JSON files to NocoBase collections
const MAPPINGS = [
    /* CIE-10 already seeded
    {
        filePattern: 'DEIS_Esquema_Registros_2025_Corregido__Anexo_8.json', // CIE-10 (More complete list)
        collection: 'ref_cie10',
        transform: (entry) => ({
            codigo_oficial: entry['Anexo 8'],
            descripcion: entry['__EMPTY'],
            codigo_map_deis: entry['Anexo 8'],
            activo: true
        })
    },
    */
    /* Specialties already seeded
    {
        filePattern: 'UGCO_Diccionario_Local_COLUMNAS_Y_DICCIONARIO__GESTORAS_.json',
        collection: 'ref_oncoespecialidad',
        transform: (entry) => {
            const val = entry['ESPECIALIDAD '];
            if (!val || val === 'ESPECIALIDAD ') return null;
            return {
                codigo_oficial: val.trim().toUpperCase().replace(/\s+/g, '_'),
                descripcion: val.trim(),
                codigo_map_legacy: val.trim()
            };
        }
    },
    */
    /* Topography already seeded
    {
        filePattern: 'mCODE_Topography_ICD10.json',
        collection: 'ref_oncotopografia',
        transform: (entry) => ({
            codigo_oficial: entry.codigo_oficial,
            descripcion: entry.descripcion,
            codigo_map_legacy: entry.codigo_oficial,
            activo: true
        })
    },
    */
    {
        filePattern: 'HL7_SexoBiologico_Clean.json',
        collection: 'ref_sexobiologico',
        transform: (entry) => entry
    },
    {
        filePattern: 'HL7_PueblosOriginarios_Clean.json',
        collection: 'ref_pueblooriginario',
        transform: (entry) => entry
    },
    {
        filePattern: 'HL7_IdentidadGenero_Clean.json',
        collection: 'ref_identidadgenero',
        transform: (entry) => entry
    },
    {
        filePattern: 'HL7_Prevision_Clean.json',
        collection: 'ref_prevision',
        transform: (entry) => entry
    },
    {
        filePattern: 'HL7_Nacionalidad_Clean.json',
        collection: 'ref_nacionalidad',
        transform: (entry) => entry
    }
    // Add more mappings here for Topography, Morphology, etc.
];

async function seedReferences() {
    console.log(`Seeding references on ${API_BASE_URL}...`);

    const files = fs.readdirSync(DICTIONARIES_DIR);

    for (const mapping of MAPPINGS) {
        const file = files.find(f => f.includes(mapping.filePattern));
        if (!file) {
            console.warn(`⚠️ File matching ${mapping.filePattern} not found.`);
            continue;
        }

        console.log(`Processing ${file} -> ${mapping.collection}...`);
        const filePath = path.join(DICTIONARIES_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        console.log(`File content start: ${rawContent.substring(0, 50)}`);
        const dictionary = JSON.parse(rawContent);

        let successCount = 0;
        let errorCount = 0;

        // Handle different JSON structures
        let entries;
        if (Array.isArray(dictionary)) {
            entries = dictionary;
        } else if (dictionary.entries && Array.isArray(dictionary.entries)) {
            entries = dictionary.entries;
        } else {
            console.warn(`⚠️ Dictionary format not recognized for ${file}. Skipping.`);
            continue;
        }

        for (const entry of entries) {
            try {
                const payload = mapping.transform(entry);
                if (!payload || !payload.codigo_oficial) continue; // Skip empty rows

                await axios.post(
                    `${API_BASE_URL}/api/${mapping.collection}:create`,
                    payload,
                    { headers: { Authorization: `Bearer ${API_KEY}` } }
                );
                successCount++;
                if (successCount % 100 === 0) process.stdout.write('.');

            } catch (error) {
                errorCount++;
            }
        }
        console.log(`\n✅ Finished ${mapping.collection}: ${successCount} created, ${errorCount} errors.`);
    }
}

seedReferences();
