import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from UGCO root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const DICTIONARIES_DIR = path.resolve(__dirname, '../../BD/diccionarios_raw');

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: API_BASE_URL and API_KEY must be defined in .env');
    process.exit(1);
}

// Map JSON files to NocoBase collections
const MAPPINGS = [
    {
        filePattern: 'DEIS_Esquema_Registros_2025_Corregido__Anexo_4.json', // CIE-10
        collection: 'ref_cie10',
        transform: (entry: any) => ({
            codigo_oficial: entry['CÓDIGO'],
            descripcion: entry['GLOSA'] || entry['DESCRIPCIÓN'],
            codigo_map_deis: entry['CÓDIGO'],
            activo: true
        })
    },
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
        const dictionary = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        let successCount = 0;
        let errorCount = 0;

        for (const entry of dictionary.entries) {
            try {
                const payload = mapping.transform(entry);
                if (!payload.codigo_oficial) continue; // Skip empty rows

                // Check if exists (to avoid duplicates or update)
                // Ideally we use a filter, but for simplicity in this MVP we might just create
                // or use a custom "upsert" logic if NocoBase supports it easily via API.
                // For now, simple create.

                await axios.post(
                    `${API_BASE_URL}/api/${mapping.collection}:create`,
                    payload,
                    { headers: { Authorization: `Bearer ${API_KEY}` } }
                );
                successCount++;
                if (successCount % 100 === 0) process.stdout.write('.');

            } catch (error) {
                errorCount++;
                // console.error(`Failed to insert: ${JSON.stringify(entry)}`);
            }
        }
        console.log(`\n✅ Finished ${mapping.collection}: ${successCount} created, ${errorCount} errors.`);
    }
}

seedReferences();
