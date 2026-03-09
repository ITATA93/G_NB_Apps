/**
 * Fix Charts v3 — Complete chart improvements:
 * 1. Bar chart: fix labels, remove null entries, add filter for nulls
 * 2. Statistics: add titles to KPI cards
 * 3. Diagnose table "No data" issues
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

const GRIDS: Record<string, string> = {
  Dashboard: "cij5h86v2uh",
  Reportes: "xy2menx3j6",
};

async function main() {
  console.log("=== Fix Charts v3 ===\n");

  // ─── Step 1: Test current chart data ───
  console.log("── Step 1: Test charts:query responses ──\n");

  // Bar chart query
  const barData = await api("POST", "charts:query", {
    collection: "ugco_casoespecialidad",
    measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
    dimensions: [{ field: ["especialidad", "nombre"], alias: "especialidad" }],
    filter: { es_principal: true },
    orders: [],
    limit: 20,
  });
  console.log("Bar chart data:");
  console.log(JSON.stringify(barData.data, null, 2));

  // Check for null entries
  const nullEntries = (barData.data || []).filter((d: any) => !d.especialidad || d.especialidad === "null");
  console.log(`\nNull/empty entries: ${nullEntries.length}`);
  if (nullEntries.length > 0) {
    console.log("Null entries:", JSON.stringify(nullEntries));
  }

  // Pie chart query
  const pieData = await api("POST", "charts:query", {
    collection: "ugco_casooncologico",
    measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
    dimensions: [{ field: ["estado_clinico", "nombre"], alias: "estado" }],
    orders: [],
    limit: 20,
  });
  console.log("\nPie chart data:");
  console.log(JSON.stringify(pieData.data, null, 2));

  // ─── Step 2: Scan all chart schemas ───
  console.log("\n── Step 2: Scan chart schemas ──\n");

  interface ChartNode {
    uid: string;
    page: string;
    decoratorProps: any;
    chartType: string;
    title: string;
    query: any;
    config: any;
  }
  const allCharts: ChartNode[] = [];

  for (const [pageName, gridUid] of Object.entries(GRIDS)) {
    const schema = await api("GET", `uiSchemas:getJsonSchema/${gridUid}`);

    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "ChartRendererProvider" && node["x-uid"]) {
        const dp = node["x-decorator-props"] || {};
        const cfg = dp.config || {};
        const query = dp.query || {};
        allCharts.push({
          uid: node["x-uid"],
          page: pageName,
          decoratorProps: dp,
          chartType: cfg.chartType || "",
          title: cfg.title || "(no title)",
          query,
          config: cfg,
        });
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) walk(node.properties[k]);
      }
    }
    walk(schema.data);
  }

  console.log(`Found ${allCharts.length} chart nodes:\n`);
  for (const c of allCharts) {
    console.log(`  [${c.page}] "${c.title}" type=${c.chartType} uid=${c.uid}`);
    console.log(`    measures: ${JSON.stringify(c.query.measures)}`);
    console.log(`    dimensions: ${JSON.stringify(c.query.dimensions)}`);
    console.log(`    general: ${JSON.stringify(c.config.general)}`);
    console.log();
  }

  // ─── Step 3: Fix bar charts ───
  console.log("── Step 3: Fix bar charts ──\n");

  for (const chart of allCharts) {
    if (chart.chartType !== "ant-design-charts.bar") continue;

    console.log(`Fixing bar chart "${chart.title}" (${chart.uid})...`);

    const dp = chart.decoratorProps;
    const config = chart.config;
    const query = chart.query;

    // Add filter to exclude null especialidad entries
    const newQuery = {
      ...query,
      filter: {
        $and: [
          { es_principal: { $eq: true } },
          { especialidad: { nombre: { $ne: null } } },
        ],
      },
      // Add ordering by count descending for better visualization
      orders: [{ field: "count", order: "DESC" }],
    };

    // Fix general config — ensure correct field mapping
    // For ant-design-charts.bar: xField = numeric value, yField = category
    const newConfig = {
      ...config,
      title: "Casos por Especialidad",
      general: {
        xField: "count",
        yField: "especialidad",
      },
    };

    const patchBody = {
      "x-uid": chart.uid,
      "x-decorator-props": {
        ...dp,
        query: newQuery,
        config: newConfig,
      },
    };

    try {
      await api("POST", "uiSchemas:patch", patchBody);
      console.log(`  ✅ Patched: filter added, title set, fields confirmed`);
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
    }
    await delay(300);
  }

  // ─── Step 4: Fix pie charts — add title ───
  console.log("\n── Step 4: Fix pie charts ──\n");

  for (const chart of allCharts) {
    if (chart.chartType !== "ant-design-charts.pie") continue;

    console.log(`Fixing pie chart "${chart.title}" (${chart.uid})...`);

    const dp = chart.decoratorProps;
    const config = chart.config;

    const newConfig = {
      ...config,
      title: "Distribución por Estado Clínico",
      general: {
        colorField: "estado",
        angleField: "count",
      },
    };

    try {
      await api("POST", "uiSchemas:patch", {
        "x-uid": chart.uid,
        "x-decorator-props": {
          ...dp,
          config: newConfig,
        },
      });
      console.log(`  ✅ Patched: title set, fields confirmed`);
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
    }
    await delay(300);
  }

  // ─── Step 5: Fix statistics — add titles ───
  console.log("\n── Step 5: Fix statistics KPI titles ──\n");

  for (const chart of allCharts) {
    if (chart.chartType !== "antd.statistic") continue;

    console.log(`Fixing statistic "${chart.title}" (${chart.uid})...`);
    console.log(`  Current config: ${JSON.stringify(chart.config)}`);
    console.log(`  Collection: ${chart.decoratorProps.collection}`);

    const dp = chart.decoratorProps;
    const config = chart.config;

    // Determine title based on collection
    let title = "Total";
    if (dp.collection === "ugco_casooncologico") {
      title = "Total Casos Oncológicos";
    } else if (dp.collection === "ugco_tarea") {
      title = "Total Tareas Pendientes";
    }

    const newConfig = {
      ...config,
      title,
      general: {
        ...(config.general || {}),
        field: "count",
        title, // antd.statistic uses general.title for the label
      },
    };

    try {
      await api("POST", "uiSchemas:patch", {
        "x-uid": chart.uid,
        "x-decorator-props": {
          ...dp,
          config: newConfig,
        },
      });
      console.log(`  ✅ Patched: title="${title}"`);
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
    }
    await delay(300);
  }

  // ─── Step 6: Diagnose table blocks ───
  console.log("\n── Step 6: Diagnose Dashboard table blocks ──\n");

  const dashSchema = await api("GET", `uiSchemas:getJsonSchema/${GRIDS.Dashboard}`);

  interface TableNode {
    uid: string;
    decorator: string;
    decoratorProps: any;
    component: string;
  }
  const tables: TableNode[] = [];

  function findTables(node: any) {
    if (!node || typeof node !== "object") return;
    if (node["x-decorator"] === "TableBlockProvider" && node["x-uid"]) {
      tables.push({
        uid: node["x-uid"],
        decorator: node["x-decorator"],
        decoratorProps: node["x-decorator-props"] || {},
        component: node["x-component"] || "",
      });
    }
    if (node.properties) {
      for (const k of Object.keys(node.properties)) findTables(node.properties[k]);
    }
  }
  findTables(dashSchema.data);

  console.log(`Found ${tables.length} table blocks in Dashboard:\n`);
  for (const t of tables) {
    console.log(`  Table uid=${t.uid}`);
    console.log(`    collection: ${t.decoratorProps.collection}`);
    console.log(`    dataSource: ${t.decoratorProps.dataSource}`);
    console.log(`    params: ${JSON.stringify(t.decoratorProps.params)}`);
    console.log(`    action: ${t.decoratorProps.action}`);

    // Check if columns reference _id fields still
    const fullNode = await api("GET", `uiSchemas:getJsonSchema/${t.uid}`);
    const colFields: string[] = [];
    function findCols(n: any) {
      if (!n || typeof n !== "object") return;
      if (n["x-collection-field"]) colFields.push(n["x-collection-field"]);
      if (n.properties) {
        for (const k of Object.keys(n.properties)) findCols(n.properties[k]);
      }
    }
    findCols(fullNode.data);
    console.log(`    columns: ${colFields.join(", ")}`);
    const idCols = colFields.filter(f => f.endsWith("_id"));
    if (idCols.length > 0) {
      console.log(`    ⚠️ Still has _id columns: ${idCols.join(", ")}`);
    }
    console.log();
  }

  // ─── Step 7: Test bar chart with corrected filter ───
  console.log("── Step 7: Test bar chart with corrected filter ──\n");

  const barDataFixed = await api("POST", "charts:query", {
    collection: "ugco_casoespecialidad",
    measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
    dimensions: [{ field: ["especialidad", "nombre"], alias: "especialidad" }],
    filter: {
      $and: [
        { es_principal: { $eq: true } },
        { especialidad: { nombre: { $ne: null } } },
      ],
    },
    orders: [{ field: "count", order: "DESC" }],
    limit: 20,
  });
  console.log("Bar chart data (filtered, sorted DESC):");
  console.log(JSON.stringify(barDataFixed.data, null, 2));

  console.log("\n✅ Fix Charts v3 Complete");
}

main().catch(console.error);
