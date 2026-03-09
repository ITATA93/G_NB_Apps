/**
 * Fix column titles: rename headers from "xxx ID" to proper names.
 * Also patches the inner CollectionField's x-component-props with fieldNames.
 *
 * The column header comes from the field definition's uiSchema.title.
 * Since we can't easily change property keys, we update the field uiSchema titles.
 */
import "dotenv/config";

const BASE = "https://mira.imedicina.cl/api";
const KEY = process.env.NOCOBASE_MIRA_IMED_API_KEY!;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Fields whose uiSchema.title should be updated (these are the belongsTo association fields)
const FIELD_TITLE_FIXES: Array<{
  collection: string;
  field: string;
  newTitle: string;
}> = [
  { collection: "ugco_casooncologico", field: "paciente", newTitle: "Paciente" },
  { collection: "ugco_casooncologico", field: "estado_clinico", newTitle: "Estado Clínico" },
  { collection: "ugco_casooncologico", field: "estado_adm", newTitle: "Estado Administrativo" },
  { collection: "ugco_casooncologico", field: "estado_seguimiento", newTitle: "Estado Seguimiento" },
  { collection: "ugco_casooncologico", field: "intencion_trat", newTitle: "Intención Tratamiento" },
  { collection: "ugco_comitecaso", field: "comite", newTitle: "Comité" },
  { collection: "ugco_comitecaso", field: "caso", newTitle: "Caso" },
  { collection: "ugco_comiteoncologico", field: "especialidad", newTitle: "Especialidad" },
  { collection: "ugco_eventoclinico", field: "caso", newTitle: "Caso" },
  { collection: "ugco_eventoclinico", field: "modalidad_prestacion", newTitle: "Modalidad Prestación" },
  { collection: "ugco_eventoclinico", field: "centro_destino", newTitle: "Centro Destino" },
  { collection: "ugco_eventoclinico", field: "estado_seguimiento", newTitle: "Estado Seguimiento" },
  { collection: "ugco_tarea", field: "tipo_tarea", newTitle: "Tipo Tarea" },
  { collection: "ugco_tarea", field: "estado_tarea", newTitle: "Estado Tarea" },
  { collection: "ugco_tarea", field: "caso", newTitle: "Caso" },
  { collection: "ugco_equiposeguimiento", field: "especialidad", newTitle: "Especialidad" },
];

async function main() {
  console.log("=== Fix Field uiSchema Titles ===\n");

  let fixed = 0;

  for (const fix of FIELD_TITLE_FIXES) {
    try {
      // Get current field definition
      const res = await api("GET", `collections/${fix.collection}/fields:list?filter[name]=${fix.field}`);
      const fieldDef = res.data?.[0];

      if (!fieldDef) {
        console.log(`  ⚠️ ${fix.collection}.${fix.field}: NOT FOUND`);
        continue;
      }

      const currentTitle = fieldDef.uiSchema?.title || "(no title)";
      console.log(`${fix.collection}.${fix.field}: current title="${currentTitle}"`);

      if (currentTitle !== fix.newTitle) {
        // Update the field's uiSchema title
        const newUiSchema = {
          ...(fieldDef.uiSchema || {}),
          title: fix.newTitle,
        };

        await api("POST", `collections/${fix.collection}/fields:update?filterByTk=${fix.field}`, {
          uiSchema: newUiSchema,
        });
        console.log(`  ✅ Updated title to "${fix.newTitle}"`);
        fixed++;
      } else {
        console.log(`  ✓ Already correct`);
      }
    } catch (e: any) {
      console.error(`  ❌ ${fix.collection}.${fix.field}: ${e.message.slice(0, 100)}`);
    }
    await delay(200);
  }

  console.log(`\n✅ Total field titles fixed: ${fixed}`);
}

main().catch(console.error);
