/**
 * Diagnose and fix titleField for reference collections.
 * NocoBase uses titleField to know which field to display as the label
 * when rendering association columns. Without it, it shows "N/A".
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

const COLLECTIONS_TO_CHECK = [
  { name: "ref_oncoestadoclinico", expectedTitle: "nombre" },
  { name: "ref_oncoestadoadm", expectedTitle: "nombre" },
  { name: "ref_oncoestadocaso", expectedTitle: "nombre" },
  { name: "ref_oncotipoactividad", expectedTitle: "nombre" },
  { name: "ref_oncoestadoactividad", expectedTitle: "nombre" },
  { name: "ref_oncoespecialidad", expectedTitle: "nombre" },
  { name: "ref_oncointenciontrat", expectedTitle: "nombre" },
  { name: "ref_modalidadprestacion", expectedTitle: "nombre" },
  { name: "ref_centrosaluddeis", expectedTitle: "nombre" },
  { name: "ref_estadoseguimientoevento", expectedTitle: "nombre" },
  { name: "alma_paciente", expectedTitle: "nombres" },
  { name: "ugco_casooncologico", expectedTitle: "UGCO_COD01" },
  { name: "ugco_comiteoncologico", expectedTitle: "nombre" },
  { name: "ugco_eventoclinico", expectedTitle: "tipo_evento" },
];

async function main() {
  console.log("=== Diagnose & Fix titleField ===\n");

  let fixed = 0;

  for (const coll of COLLECTIONS_TO_CHECK) {
    try {
      const res = await api("GET", `collections:list?filter[name]=${coll.name}`);
      const collDef = res.data?.[0];

      if (!collDef) {
        console.log(`  ⚠️ ${coll.name}: NOT FOUND`);
        continue;
      }

      const currentTitle = collDef.titleField || "(not set)";
      console.log(`${coll.name}: titleField=${currentTitle}`);

      if (!collDef.titleField || collDef.titleField === "id") {
        // Need to set titleField
        console.log(`  → Setting titleField to "${coll.expectedTitle}"`);

        try {
          await api("POST", `collections:update?filterByTk=${coll.name}`, {
            titleField: coll.expectedTitle,
          });
          console.log(`  ✅ Set titleField="${coll.expectedTitle}"`);
          fixed++;
        } catch (e: any) {
          console.error(`  ❌ ${e.message.slice(0, 100)}`);
        }
        await delay(300);
      } else {
        console.log(`  ✓ Already set`);
      }
    } catch (e: any) {
      console.error(`  ❌ ${coll.name}: ${e.message.slice(0, 100)}`);
    }
  }

  console.log(`\n✅ Total collections fixed: ${fixed}`);

  // Verify by reading one association
  console.log("\n=== Verify: Test association render ===");
  const testRes = await api("GET", "ugco_casooncologico:list?pageSize=1&sort=-id&appends[]=estado_clinico&appends[]=paciente");
  const row = testRes.data?.[0];
  if (row) {
    console.log(`  paciente: ${JSON.stringify(row.paciente?.nombres)} (titleField for alma_paciente)`);
    console.log(`  estado_clinico: ${JSON.stringify(row.estado_clinico?.nombre)} (titleField for ref_oncoestadoclinico)`);
  }
}

main().catch(console.error);
