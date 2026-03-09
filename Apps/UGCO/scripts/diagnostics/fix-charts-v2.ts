/**
 * Fix chart rendering issues:
 * 1. Statistics show "0" — investigate and fix antd.statistic config
 * 2. Bar chart orientation — ensure horizontal bars for long labels
 * 3. Verify data flow
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

async function main() {
  console.log("=== Fix Charts v2 ===\n");

  // ─── Step 1: Get all ChartRendererProvider nodes from Dashboard + Reportes ───
  const grids = {
    Dashboard: "cij5h86v2uh",
    Reportes: "xy2menx3j6",
  };

  for (const [pageName, gridUid] of Object.entries(grids)) {
    console.log(`\n── ${pageName} (${gridUid}) ──`);
    const schema = await api("GET", `uiSchemas:getJsonSchema/${gridUid}`);

    interface ChartNode {
      uid: string;
      decoratorProps: any;
      chartType: string;
      title: string;
    }
    const nodes: ChartNode[] = [];

    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "ChartRendererProvider" && node["x-uid"]) {
        const dp = node["x-decorator-props"] || {};
        const cfg = dp.config || {};
        nodes.push({
          uid: node["x-uid"],
          decoratorProps: dp,
          chartType: cfg.chartType || "",
          title: cfg.title || "",
        });
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) walk(node.properties[k]);
      }
    }
    walk(schema.data);

    for (const node of nodes) {
      console.log(`\n  Chart: "${node.title}" (${node.chartType}) uid=${node.uid}`);

      if (node.chartType === "antd.statistic") {
        // Fix statistics: The antd.statistic type needs 'general.field' to know which
        // measure field to display. Without it, it defaults to showing 0.
        const dp = node.decoratorProps;
        const query = dp.query || {};
        const config = dp.config || {};
        const measures = query.measures || [];
        const alias = measures[0]?.alias || "count";

        // The statistic needs general.field to reference the measure alias
        const newConfig = {
          ...config,
          general: {
            ...(config.general || {}),
            field: alias,
          },
        };

        const patchBody = {
          "x-uid": node.uid,
          "x-decorator-props": {
            ...dp,
            config: newConfig,
          },
        };

        try {
          await api("POST", "uiSchemas:patch", patchBody);
          console.log(`  ✅ Patched statistic: general.field = "${alias}"`);
        } catch (e: any) {
          console.error(`  ❌ ${e.message}`);
        }
        await delay(300);
      }

      if (node.chartType === "ant-design-charts.bar") {
        // The bar chart should show horizontal bars
        // For ant-design-charts v2 (used by NocoBase 1.9.14):
        //   bar chart: xField = value (count), yField = category (specialty)
        // Let's verify the config is correct and also add sorting
        const dp = node.decoratorProps;
        const config = dp.config || {};
        const general = config.general || {};

        console.log(`  Current: xField=${general.xField}, yField=${general.yField}`);

        // The config looks correct. Let's also try setting layout/orientation hints
        // and add 'seriesField' if missing
        const newGeneral = {
          ...general,
          xField: "count",
          yField: "especialidad",
        };

        const newConfig = {
          ...config,
          general: newGeneral,
        };

        const patchBody = {
          "x-uid": node.uid,
          "x-decorator-props": {
            ...dp,
            config: newConfig,
          },
        };

        try {
          await api("POST", "uiSchemas:patch", patchBody);
          console.log(`  ✅ Confirmed bar config: xField=count, yField=especialidad`);
        } catch (e: any) {
          console.error(`  ❌ ${e.message}`);
        }
        await delay(300);
      }
    }
  }

  console.log("\n✅ Done");
}

main().catch(console.error);
