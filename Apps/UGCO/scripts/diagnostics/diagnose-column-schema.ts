/**
 * Deep diagnose: read a specific table block and dump all column schemas
 */
import "dotenv/config";

const BASE = "https://mira.imedicina.cl/api";
const KEY = process.env.NOCOBASE_MIRA_IMED_API_KEY!;

async function api(method: string, path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return JSON.parse(text);
}

async function main() {
  // Dashboard cases table
  console.log("=== Dashboard cases table (sncsgayec5c) — FULL COLUMN DUMP ===\n");
  const schema = await api("GET", "uiSchemas:getJsonSchema/sncsgayec5c");

  function dumpCols(node: any, path: string, depth: number) {
    if (!node || typeof node !== "object") return;

    const indent = "  ".repeat(depth);
    const comp = node["x-component"] || "";
    const dec = node["x-decorator"] || "";
    const uid = node["x-uid"] || "";
    const collField = node["x-collection-field"] || "";

    if (comp || dec || collField) {
      console.log(`${indent}${path}: comp=${comp} dec=${dec} collField=${collField} uid=${uid}`);
      if (node["x-component-props"]) {
        console.log(`${indent}  component-props: ${JSON.stringify(node["x-component-props"])}`);
      }
      if (node.title) {
        console.log(`${indent}  title: ${node.title}`);
      }
    }

    if (node.properties) {
      for (const [k, v] of Object.entries(node.properties) as any) {
        dumpCols(v, k, depth + 1);
      }
    }
  }

  dumpCols(schema.data, "root", 0);

  // Also dump Casos Oncológicos table
  console.log("\n\n=== Casos Oncológicos table (xfg6z9qfilz) — FULL COLUMN DUMP ===\n");
  const schema2 = await api("GET", "uiSchemas:getJsonSchema/xfg6z9qfilz");
  dumpCols(schema2.data, "root", 0);

  // And Tareas
  console.log("\n\n=== Tareas table (bxk236arf91) — FULL COLUMN DUMP ===\n");
  const schema3 = await api("GET", "uiSchemas:getJsonSchema/bxk236arf91");
  dumpCols(schema3.data, "root", 0);
}

main().catch(console.error);
