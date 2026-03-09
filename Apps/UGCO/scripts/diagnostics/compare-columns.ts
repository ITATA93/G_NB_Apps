/**
 * Compare working (paciente) vs broken (estado_clinico) column schemas
 */
import "dotenv/config";

const BASE = "https://mira.imedicina.cl/api";
const KEY = process.env.NOCOBASE_MIRA_IMED_API_KEY!;

async function api(path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  });
  return res.json();
}

async function main() {
  // Working: paciente column (uid=ypvafeatvq3, parent uid=2f629c8c51)
  console.log("=== WORKING: paciente column ===");
  const working = await api("uiSchemas:getJsonSchema/2f629c8c51");
  console.log(JSON.stringify(working.data, null, 2));

  console.log("\n\n=== BROKEN: estado_clinico column ===");
  // Broken: estado_clinico_id column (uid=zgbcmbul5vq, parent uid=a8cfmav93mg)
  const broken = await api("uiSchemas:getJsonSchema/a8cfmav93mg");
  console.log(JSON.stringify(broken.data, null, 2));

  console.log("\n\n=== BROKEN: estado_adm column ===");
  // Another broken column for comparison
  const broken2 = await api("uiSchemas:getJsonSchema/ahqhjzfuc6x");
  console.log(JSON.stringify(broken2.data, null, 2));
}

main().catch(console.error);
