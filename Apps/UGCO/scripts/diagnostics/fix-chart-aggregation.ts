/**
 * Fix chart aggregation: rename 'aggregate' → 'aggregation' in all ChartRendererProvider nodes
 * NocoBase data-visualization plugin uses 'aggregation' (not 'aggregate')
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

const GRIDS: Record<string, string> = {
  Dashboard: "cij5h86v2uh",
  Reportes: "xy2menx3j6",
};

async function main() {
  let fixed = 0;

  for (const [name, gridUid] of Object.entries(GRIDS)) {
    console.log(`\n=== Scanning ${name} (grid=${gridUid}) ===`);
    const schema = await api("GET", `uiSchemas:getJsonSchema/${gridUid}`);

    interface Patch {
      uid: string;
      decoratorProps: any;
      query: any;
    }
    const patches: Patch[] = [];

    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "ChartRendererProvider" && node["x-uid"]) {
        const dp = node["x-decorator-props"] || {};
        const query = dp.query || {};
        const measures = query.measures || [];
        const needsFix = measures.some((m: any) => m.aggregate && !m.aggregation);
        if (needsFix) {
          patches.push({ uid: node["x-uid"], decoratorProps: dp, query });
        }
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) walk(node.properties[k]);
      }
    }

    walk(schema.data);
    console.log(`  Found ${patches.length} ChartRendererProvider nodes to fix`);

    for (const p of patches) {
      const fixedMeasures = p.query.measures.map((m: any) => {
        const { aggregate, ...rest } = m;
        return { ...rest, aggregation: aggregate };
      });

      const newQuery = { ...p.query, measures: fixedMeasures };
      const newDP = { ...p.decoratorProps, query: newQuery };

      try {
        await api("POST", "uiSchemas:patch", {
          "x-uid": p.uid,
          "x-decorator-props": newDP,
        });
        console.log(`  ✅ Patched ${p.uid} → aggregation: ${fixedMeasures[0].aggregation}`);
        fixed++;
      } catch (e: any) {
        console.error(`  ❌ ${e.message}`);
      }
    }
  }

  console.log(`\n✅ Total fixed: ${fixed}`);
}

main().catch(console.error);
