import "dotenv/config";

const B = "https://mira.imedicina.cl/api";
const K = process.env.NOCOBASE_MIRA_IMED_API_KEY!;
const h = { Authorization: `Bearer ${K}`, "Content-Type": "application/json" };

async function main() {
  // 1. Bar chart data — check for nulls
  console.log("=== Bar chart data (check for nulls) ===");
  const r1 = await fetch(`${B}/charts:query`, {
    method: "POST", headers: h,
    body: JSON.stringify({
      collection: "ugco_casoespecialidad",
      measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
      dimensions: [{ field: ["especialidad", "nombre"], alias: "especialidad" }],
      filter: { es_principal: true },
      orders: [], limit: 20,
    }),
  });
  const d1 = await r1.json();
  console.log(JSON.stringify(d1.data, null, 2));

  // 2. Check statistic schemas in Reportes
  console.log("\n=== Reportes schema — statistic nodes ===");
  const r2 = await fetch(`${B}/uiSchemas:getJsonSchema/xy2menx3j6`, { headers: h });
  const d2 = await r2.json();
  function findRenderers(node: any, path: string) {
    if (!node || typeof node !== "object") return;
    if (node["x-decorator"] === "ChartRendererProvider") {
      const dp = node["x-decorator-props"] || {};
      const cfg = dp.config || {};
      console.log(`  Renderer: chartType=${cfg.chartType} title="${cfg.title}"`);
      console.log(`    measures: ${JSON.stringify(dp.query?.measures)}`);
      console.log(`    dimensions: ${JSON.stringify(dp.query?.dimensions)}`);
      console.log(`    uid: ${node["x-uid"]}`);
    }
    if (node.properties) {
      for (const k of Object.keys(node.properties)) findRenderers(node.properties[k], path + "." + k);
    }
  }
  findRenderers(d2.data, "root");

  // 3. Table data test
  console.log("\n=== Table data test ===");
  const r3 = await fetch(`${B}/ugco_casooncologico:list?pageSize=2&sort=-createdAt`, { headers: h });
  const d3 = await r3.json();
  console.log("Status:", r3.status, "Count:", d3.meta?.count || d3.meta?.totalCount);
  if (d3.data?.[0]) {
    const first = d3.data[0];
    console.log("First keys:", Object.keys(first).join(", "));
    console.log("UGCO_COD01:", first.UGCO_COD01);
    console.log("paciente_id:", first.paciente_id);
    console.log("id:", first.id);
  }

  // 4. Check FK patch in Dashboard
  console.log("\n=== Dashboard schema — collection fields ===");
  const r4 = await fetch(`${B}/uiSchemas:getJsonSchema/cij5h86v2uh`, { headers: h });
  const d4 = await r4.json();
  const fields: string[] = [];
  function findCollFields(node: any) {
    if (!node || typeof node !== "object") return;
    if (node["x-collection-field"]) fields.push(node["x-collection-field"]);
    if (node.properties) {
      for (const k of Object.keys(node.properties)) findCollFields(node.properties[k]);
    }
  }
  findCollFields(d4.data);
  console.log("Fields:", fields);
  console.log("FK _id fields:", fields.filter(f => f.endsWith("_id")));

  // 5. Check Casos Oncológicos page schema
  console.log("\n=== Casos Oncológicos schema — collection fields ===");
  const r5 = await fetch(`${B}/uiSchemas:getJsonSchema/dehh7nf8t3j`, { headers: h });
  const d5 = await r5.json();
  const fields2: string[] = [];
  function findCollFields2(node: any) {
    if (!node || typeof node !== "object") return;
    if (node["x-collection-field"]) fields2.push(node["x-collection-field"]);
    if (node.properties) {
      for (const k of Object.keys(node.properties)) findCollFields2(node.properties[k]);
    }
  }
  findCollFields2(d5.data);
  console.log("Fields:", fields2);
  console.log("FK _id fields:", fields2.filter(f => f.endsWith("_id")));

  // 6. Try ugco_casooncologico:list with appends to test association loading
  console.log("\n=== Table load test with appends ===");
  const r6 = await fetch(`${B}/ugco_casooncologico:list?pageSize=1&appends[]=paciente&appends[]=estado_clinico`, { headers: h });
  const d6 = await r6.json();
  console.log("Status:", r6.status, "Count:", d6.meta?.count);
  if (d6.data?.[0]) {
    console.log("paciente:", d6.data[0].paciente?.nombres);
    console.log("estado_clinico:", d6.data[0].estado_clinico?.nombre);
  }
}

main().catch(console.error);
