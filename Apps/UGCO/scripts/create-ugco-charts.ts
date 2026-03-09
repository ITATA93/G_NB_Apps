/**
 * create-ugco-charts.ts  (v4 — complete schema with ChartRendererProvider)
 * Creates 2 working chart blocks in the UGCO Dashboard
 *
 * Chart 1 (left col z02a3z3zwj8):
 *   Casos por Especialidad — Column chart, count by especialidad
 *
 * Chart 2 (right col dupzzgff6sw):
 *   Distribución por Estado — Pie chart, count by estado
 *
 * CORRECT Schema architecture (NocoBase v1.9.14 data-visualization plugin):
 *
 *   OUTER CONTAINER (the card shell):
 *     x-decorator: "ChartBlockProvider"     ← global refresh/filter context only
 *     x-component: "ChartCardItem"
 *     x-decorator-props: { collection, dataSource }  ← NO query/config here!
 *
 *   OUTER > properties > [gridUid]:
 *     x-component: "Grid"
 *     x-decorator: "ChartV2Block"           ← registers ChartRenderer+ChartRendererProvider locally
 *     x-initializer: "charts:addBlock"
 *
 *   OUTER > [gridUid] > properties > Grid.Row > Grid.Col > [rendererUid]:
 *     x-decorator: "ChartRendererProvider"  ← calls charts:query, provides data
 *     x-decorator-props: { collection, dataSource, query, config }  ← HERE is where query goes!
 *     x-component: "CardItem"               ← NOT ChartCardItem, just CardItem
 *
 *   ... > [rendererUid] > properties > [chartUid]:
 *     x-component: "ChartRenderer"          ← reads context, renders the visualization
 *
 * Chart type keys (ant-design-charts group, lowercase names):
 *   "ant-design-charts.column"  → Vertical bar/column chart
 *   "ant-design-charts.bar"     → Horizontal bar chart
 *   "ant-design-charts.pie"     → Pie chart
 *   "ant-design-charts.line"    → Line chart
 *   "ant-design-charts.area"    → Area chart
 *   "antd.statistic"            → Statistic number widget
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

function uid(): string {
  return randomBytes(5).toString("hex").slice(0, 10);
}

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface ChartMeasure {
  field: string[];
  aggregate: string;
  alias: string;
}

interface ChartDimension {
  field: string[];
  alias?: string;
}

interface ChartOptions {
  title: string;
  collection: string;
  measures: ChartMeasure[];
  dimensions: ChartDimension[];
  filter?: object;
  chartType: string;
  general?: Record<string, string>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema builder (v4 — complete nested structure)
// Source: NocoBase data-visualization plugin source:
//   createRendererSchema() in utils.ts → gridRowColWrap() → ChartRendererProvider
// ──────────────────────────────────────────────────────────────────────────────

function buildChartSchema(opts: ChartOptions): object {
  // Outer container UIDs
  const blockUid          = uid();
  const outerActionsUid   = uid();
  const gridUid           = uid();

  // Inner renderer UIDs (inside the Grid)
  const rowUid            = uid();
  const colUid            = uid();
  const rendererUid       = uid();
  const innerActionsUid   = uid();
  const chartRendererUid  = uid();

  // The query that ChartRendererProvider will use to call charts:query
  const query = {
    measures: opts.measures,
    dimensions: opts.dimensions,
    filter: opts.filter ?? {},
    orders: [],
    limit: 2000,
  };

  return {
    type: "void",
    "x-uid": blockUid,
    name: blockUid,
    version: "2.0",
    _isJSONSchemaObject: true,

    // ── OUTER CONTAINER ──────────────────────────────────────────────────────
    // ChartBlockProvider: provides global auto-refresh & block-level actions
    // It does NOT call charts:query — the inner ChartRendererProvider does.
    "x-component": "ChartCardItem",
    "x-use-component-props": "useChartBlockCardProps",
    "x-settings": "chart:block",
    "x-decorator": "ChartBlockProvider",
    "x-decorator-props": {
      collection: opts.collection,
      dataSource: "main",
      // Note: query and config belong on ChartRendererProvider, not here.
      // ChartBlockProvider only needs collection/dataSource for ACL context.
    },
    "x-async": false,
    "x-index": 1,

    properties: {
      // Outer ActionBar (refresh, filters, etc.)
      [outerActionsUid]: {
        type: "void",
        "x-uid": outerActionsUid,
        name: outerActionsUid,
        version: "2.0",
        _isJSONSchemaObject: true,
        "x-component": "ActionBar",
        "x-component-props": {
          style: { marginBottom: "var(--nb-designer-offset)" },
        },
        "x-initializer": "chartBlock:configureActions",
        "x-async": false,
        "x-index": 1,
      },

      // Grid with ChartV2Block decorator.
      // ChartV2Block wraps the Grid in SchemaComponentOptions that registers
      // ChartRenderer and ChartRendererProvider locally, making them available
      // as x-component/x-decorator values for all descendant schema nodes.
      [gridUid]: {
        type: "void",
        "x-uid": gridUid,
        name: gridUid,
        version: "2.0",
        _isJSONSchemaObject: true,
        "x-component": "Grid",
        "x-decorator": "ChartV2Block",
        "x-initializer": "charts:addBlock",
        "x-async": false,
        "x-index": 2,

        properties: {
          // Grid.Row → Grid.Col → ChartRendererProvider (mirrors gridRowColWrap in source)
          [rowUid]: {
            type: "void",
            "x-uid": rowUid,
            name: rowUid,
            version: "2.0",
            _isJSONSchemaObject: true,
            "x-component": "Grid.Row",
            "x-async": false,
            "x-index": 1,

            properties: {
              [colUid]: {
                type: "void",
                "x-uid": colUid,
                name: colUid,
                version: "2.0",
                _isJSONSchemaObject: true,
                "x-component": "Grid.Col",
                "x-async": false,
                "x-index": 1,

                properties: {
                  // ── INNER RENDERER ────────────────────────────────────────
                  // ChartRendererProvider: calls charts:query, provides data
                  // CardItem: the card shell around the chart
                  // ChartRenderer: reads context, renders the visualization
                  [rendererUid]: {
                    type: "void",
                    "x-uid": rendererUid,
                    name: rendererUid,
                    version: "2.0",
                    _isJSONSchemaObject: true,

                    "x-decorator": "ChartRendererProvider",
                    "x-decorator-props": {
                      collection: opts.collection,
                      dataSource: "main",
                      query,
                      config: {
                        chartType: opts.chartType,
                        general: opts.general ?? {},
                        advanced: {},
                        title: opts.title,
                        bordered: false,
                      },
                    },
                    "x-acl-action": `${opts.collection}:list`,
                    "x-toolbar": "ChartRendererToolbar",
                    "x-settings": "chart:renderer",
                    "x-component": "CardItem",
                    "x-component-props": {
                      size: "small",
                      bordered: false,
                    },
                    "x-initializer": "charts:addBlock",
                    "x-async": false,
                    "x-index": 1,

                    properties: {
                      // Inner ActionBar (chart-level actions)
                      [innerActionsUid]: {
                        type: "void",
                        "x-uid": innerActionsUid,
                        name: innerActionsUid,
                        version: "2.0",
                        _isJSONSchemaObject: true,
                        "x-component": "ActionBar",
                        "x-initializer": "chart:configureActions",
                        "x-async": false,
                        "x-index": 1,
                      },

                      // The actual chart renderer component
                      [chartRendererUid]: {
                        type: "void",
                        "x-uid": chartRendererUid,
                        name: chartRendererUid,
                        version: "2.0",
                        _isJSONSchemaObject: true,
                        "x-component": "ChartRenderer",
                        "x-component-props": {},
                        "x-async": false,
                        "x-index": 2,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Charts definition
// ──────────────────────────────────────────────────────────────────────────────

const CHARTS: Array<{ colUid: string; opts: ChartOptions }> = [
  {
    colUid: "z02a3z3zwj8",   // left column of row 4
    opts: {
      title: "Casos por Especialidad",
      collection: "onco_casos",
      measures: [{ field: ["id"], aggregate: "count", alias: "count" }],
      dimensions: [{ field: ["especialidad"], alias: "especialidad" }],
      chartType: "ant-design-charts.column",
      general: { xField: "especialidad", yField: "count" },
    },
  },
  {
    colUid: "dupzzgff6sw",   // right column of row 4
    opts: {
      title: "Distribución por Estado",
      collection: "onco_casos",
      measures: [{ field: ["id"], aggregate: "count", alias: "count" }],
      dimensions: [{ field: ["estado"], alias: "estado" }],
      chartType: "ant-design-charts.pie",
      general: { colorField: "estado", angleField: "count" },
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("=== CREATE UGCO DASHBOARD CHARTS (v4 — ChartRendererProvider) ===\n");
  console.log(`Instance: ${BASE}\n`);

  for (const { colUid, opts } of CHARTS) {
    console.log(`▶ ${opts.title} → col ${colUid}`);

    // Step 1: Get current schema of the column to find and delete old chart blocks
    let existingBlockUids: string[] = [];
    try {
      const colSchema = await api("GET", `uiSchemas:getJsonSchema/${colUid}`);
      const props = colSchema.data?.properties || {};
      existingBlockUids = Object.keys(props).filter(k => {
        const node = props[k];
        return node?.["x-decorator"] === "ChartBlockProvider" ||
               node?.["x-component"] === "ChartCardItem" ||
               node?.["x-decorator"] === "ChartV2BlockProvider" ||
               node?.["x-decorator"] === "ChartRendererProvider";
      });
      if (existingBlockUids.length > 0) {
        console.log(`  Found ${existingBlockUids.length} existing chart block(s) to replace`);
      }
    } catch (e: any) {
      console.warn(`  ⚠ Could not read col schema: ${e.message}`);
    }

    // Step 2: Delete old chart blocks
    for (const oldUid of existingBlockUids) {
      try {
        const colSchema = await api("GET", `uiSchemas:getJsonSchema/${colUid}`);
        const blockXUid = colSchema.data?.properties?.[oldUid]?.["x-uid"] || oldUid;
        await api("POST", `uiSchemas:remove/${blockXUid}`);
        console.log(`  🗑 Deleted old block: ${blockXUid}`);
      } catch (e: any) {
        console.warn(`  ⚠ Could not delete block ${oldUid}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    // Step 3: Insert new complete chart block
    const schema = buildChartSchema(opts);
    const blockUid = (schema as any)["x-uid"];

    try {
      await api(
        "POST",
        `uiSchemas:insertAdjacent/${colUid}?position=afterBegin`,
        { schema }
      );
      const gridKey = Object.keys((schema as any).properties).find(
        (k) => (schema as any).properties[k]["x-component"] === "Grid"
      );
      const gridUid = (schema as any).properties[gridKey!]?.["x-uid"];
      console.log(`  ✅ Created complete chart block: ${blockUid}`);
      console.log(`     Grid (ChartV2Block): ${gridUid}`);
      console.log(`     ChartType: ${opts.chartType}`);
    } catch (e: any) {
      console.error(`  ❌ Failed: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n=== DONE — reload the UGCO Dashboard to verify ===");
  console.log("Expected: Charts now call charts:query and render visualizations");
}

main().catch(console.error);
