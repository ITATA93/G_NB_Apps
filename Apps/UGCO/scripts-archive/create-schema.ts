import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from UGCO root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: API_BASE_URL and API_KEY must be defined in .env');
    process.exit(1);
}

const COLLECTIONS = [
    {
        name: "ref_cie10",
        title: "Catálogo CIE-10",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código CIE-10" } },
            { name: "descripcion", type: "string", interface: "textarea", uiSchema: { title: "Descripción" } },
            { name: "codigo_map_legacy", type: "string", interface: "input", uiSchema: { title: "Código Legacy" } },
            { name: "codigo_map_deis", type: "string", interface: "input", uiSchema: { title: "Código DEIS" } },
            { name: "activo", type: "boolean", defaultValue: true }
        ]
    },
    {
        name: "ref_oncotopografia",
        title: "Topografía (CIE-O-3)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código C" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "sistema_cod", type: "string", defaultValue: "http://hl7.org/fhir/sid/icd-o-3" }
        ]
    },
    {
        name: "ref_oncomorfologia",
        title: "Morfología (CIE-O-3)",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input", uiSchema: { title: "Código M" } },
            { name: "descripcion", type: "string", interface: "input", uiSchema: { title: "Descripción" } },
            { name: "sistema_cod", type: "string", defaultValue: "http://hl7.org/fhir/sid/icd-o-3" }
        ]
    },
    {
        name: "ref_oncoespecialidad",
        title: "Especialidades Oncológicas",
        fields: [
            { name: "codigo_oficial", type: "string", interface: "input" },
            { name: "descripcion", type: "string", interface: "input" },
            { name: "codigo_map_legacy", type: "string", interface: "input" }
        ]
    },
    {
        name: "alma_paciente",
        title: "Pacientes (MPI)",
        fields: [
            { name: "run", type: "string", unique: true, uiSchema: { title: "RUN" } },
            { name: "nombres", type: "string" },
            { name: "apellidos", type: "string" },
            { name: "fecha_nacimiento", type: "date" },
            { name: "sexo_biologico", type: "string", interface: "select", uiSchema: { enum: [{ label: "Hombre", value: "male" }, { label: "Mujer", value: "female" }] } },
            { name: "pueblo_originario", type: "string", interface: "input" },
            { name: "nivel_educacional", type: "string", interface: "input" },
            { name: "ocupacion", type: "string", interface: "input" },
            { name: "prais", type: "boolean" }
        ]
    },
    {
        name: "ugco_casooncologico",
        title: "Caso Oncológico",
        fields: [
            { name: "fecha_diagnostico", type: "date" },
            { name: "clinical_status", type: "string", interface: "select", uiSchema: { enum: [{ value: "active" }, { value: "remission" }, { value: "relapse" }] } },
            { name: "verification_status", type: "string", interface: "select", uiSchema: { enum: [{ value: "confirmed" }, { value: "provisional" }] } },
            // Relations
            { name: "paciente", type: "belongsTo", target: "alma_paciente", foreignKey: "paciente_id" },
            { name: "diagnostico_cie10", type: "belongsTo", target: "ref_cie10", foreignKey: "cie10_id" },
            { name: "topografia", type: "belongsTo", target: "ref_oncotopografia", foreignKey: "topografia_id" },
            { name: "morfologia", type: "belongsTo", target: "ref_oncomorfologia", foreignKey: "morfologia_id" }
        ]
    }
];

async function createSchema() {
    console.log(`Creating schema on ${API_BASE_URL}...`);

    for (const collection of COLLECTIONS) {
        try {
            console.log(`Creating collection: ${collection.name}...`);
            const response = await axios.post(
                `${API_BASE_URL}/api/collections:create`,
                collection,
                { headers: { Authorization: `Bearer ${API_KEY}` } }
            );
            console.log(`✅ Created ${collection.name} (ID: ${response.data.data?.id})`);
        } catch (error) {
            if (error.response) {
                console.error(`❌ Error creating ${collection.name}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else {
                console.error(`❌ Error creating ${collection.name}: ${error.message}`);
            }
        }
    }
}

createSchema();
