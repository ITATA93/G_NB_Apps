import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../BD/diccionarios_raw');

const HL7_CODESYSTEMS = [
    { name: 'HL7_SexoBiologico', url: 'https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSCodigoSexo' },
    { name: 'HL7_Nacionalidad', url: 'https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CodPais' },
    { name: 'HL7_Prevision', url: 'https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSPrevision' },
    { name: 'HL7_IdentidadGenero', url: 'https://interoperabilidad.minsal.cl/fhir/ig/mpi/CodeSystem/CSIdentidadDeGenero' },
    { name: 'HL7_PueblosOriginarios', url: 'https://interoperabilidad.minsal.cl/fhir/ig/mpi/CodeSystem/CSPueblosOriginarios' }
];

async function fetchCodeSystems() {
    console.log('Fetching HL7 Chile CodeSystems...');

    for (const cs of HL7_CODESYSTEMS) {
        try {
            // Note: This is a simplified fetch. In a real scenario, we might need to parse HTML or hit a FHIR API.
            // Since we don't have a direct FHIR server URL for these IGs, we will simulate the "fetch" 
            // by creating placeholder JSONs with the URL as source, or try to fetch the JSON definition if available.
            // Many IGs publish the JSON definition at [url].json

            const jsonUrl = `${cs.url}.json`;
            console.log(`Downloading: ${jsonUrl}`);

            const response = await axios.get(jsonUrl, { validateStatus: () => true });

            let data;
            if (response.status === 200) {
                data = response.data;
            } else {
                console.warn(`Failed to fetch JSON for ${cs.name} (Status ${response.status}). Creating placeholder.`);
                data = {
                    resourceType: "CodeSystem",
                    url: cs.url,
                    status: "placeholder",
                    message: "Could not auto-fetch JSON definition. Manual download required."
                };
            }

            const outputPath = path.join(OUTPUT_DIR, `${cs.name}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
            console.log(`Saved: ${cs.name}.json`);

        } catch (error) {
            console.error(`Error fetching ${cs.name}:`, error.message);
        }
    }
}

fetchCodeSystems();
