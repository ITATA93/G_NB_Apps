import "dotenv/config";

const BASE = "https://mira.imedicina.cl/api";
const KEY = process.env.NOCOBASE_MIRA_IMED_API_KEY!;
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function main() {
  // Check comitecaso table schema for duplicate caso column
  const res = await fetch(`${BASE}/uiSchemas:getJsonSchema/royl0rksy91`, { headers: h });
  const data = await res.json();

  function findTableV2(node: any, path: string) {
    if (!node || typeof node !== "object") return;
    if (node["x-component"] === "TableV2") {
      console.log("TableV2 at", path);
      if (node.properties) {
        for (const [k, v] of Object.entries(node.properties) as any) {
          if (v["x-collection-field"]) {
            console.log(`  Column: ${k} → ${v["x-collection-field"]} uid=${v["x-uid"]}`);
          }
        }
      }
    }
    if (node.properties) {
      for (const [k, v] of Object.entries(node.properties) as any) findTableV2(v, path + "." + k);
    }
  }

  console.log("=== Comité Caso table (royl0rksy91) ===");
  findTableV2(data.data, "root");

  // Dashboard cases table
  const res2 = await fetch(`${BASE}/uiSchemas:getJsonSchema/sncsgayec5c`, { headers: h });
  const data2 = await res2.json();
  const dp = data2.data?.["x-decorator-props"] || {};
  console.log("\n=== Dashboard cases table (sncsgayec5c) ===");
  console.log("  collection:", dp.collection);
  console.log("  action:", dp.action);
  console.log("  params:", JSON.stringify(dp.params));
  findTableV2(data2.data, "root");

  // Critical: Check if TableBlockProvider has appends for associations
  console.log("\n=== Check appends ===");
  console.log("Dashboard table params.appends:", dp.params?.appends);

  // Test: does the table data load via API with appends?
  console.log("\n=== Test list with appends ===");
  const res3 = await fetch(
    `${BASE}/ugco_casooncologico:list?pageSize=2&sort=-createdAt&appends[]=paciente&appends[]=estado_clinico&appends[]=estado_adm`,
    { headers: h }
  );
  const data3 = await res3.json();
  console.log("Status:", res3.status);
  console.log("Count:", data3.meta?.count);
  if (data3.data?.[0]) {
    const row = data3.data[0];
    console.log("First row:");
    console.log("  id:", row.id);
    console.log("  paciente:", row.paciente?.nombres || "(null)");
    console.log("  estado_clinico:", row.estado_clinico?.nombre || "(null)");
    console.log("  estado_adm:", row.estado_adm?.nombre || "(null)");
  }

  // Check if appends are missing from the schema
  // NocoBase TableBlockProvider NEEDS params.appends to resolve associations
  if (!dp.params?.appends) {
    console.log("\n⚠️  Dashboard table is MISSING params.appends!");
    console.log("   This is why associations show as empty/IDs in the browser.");
    console.log("   Need to add appends: ['paciente', 'estado_clinico', 'estado_adm', 'estado_seguimiento']");
  }

  // Check comitecaso table appends
  const dpc = data.data?.["x-decorator-props"] || {};
  console.log("\nComité table params.appends:", dpc.params?.appends);
  if (!dpc.params?.appends) {
    console.log("⚠️  Comité table is MISSING params.appends too!");
  }
}

main().catch(console.error);
