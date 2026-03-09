/**
 * Fix table blocks: add params.appends so associations resolve in browser.
 * NocoBase TableBlockProvider requires params.appends to eager-load related data.
 * Without it, association columns show empty or the table may not render data.
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

// Map of collection → association fields that need appends
const APPENDS_MAP: Record<string, string[]> = {
  ugco_casooncologico: [
    "paciente",
    "estado_clinico",
    "estado_adm",
    "estado_seguimiento",
    "especialidades",
    "especialidades.especialidad",
  ],
  ugco_comitecaso: [
    "comite",
    "caso",
    "caso.paciente",
  ],
  ugco_comiteoncologico: [
    "especialidad",
  ],
  ugco_eventoclinico: [
    "caso",
    "caso.paciente",
  ],
  ugco_tarea: [
    "caso",
    "tipo_tarea",
    "estado_tarea",
  ],
  ugco_equiposeguimiento: [
    "especialidad",
  ],
  ugco_casoespecialidad: [
    "caso",
    "caso.paciente",
    "especialidad",
  ],
};

async function main() {
  console.log("=== Fix Table Appends ===\n");

  // Step 1: Discover all pages
  const routesRes = await api("GET", "desktopRoutes:list?pageSize=200&sort=id");
  const allRoutes = routesRes.data || [];

  // Find UGCO group
  const ugcoGroup = allRoutes.find((r: any) => r.title === "UGCO" && r.type === "group");
  if (!ugcoGroup) {
    console.error("UGCO group not found!");
    return;
  }

  // Collect all page schema UIDs
  const pageGridUids: { name: string; gridUid: string }[] = [];

  function collectPages(parentId: number, depth: number) {
    const children = allRoutes.filter((r: any) => r.parentId === parentId);
    for (const child of children) {
      if (child.type === "page") {
        // Find tab child
        const tab = allRoutes.find((r: any) => r.parentId === child.id && r.type === "tabs");
        if (tab?.schemaUid) {
          pageGridUids.push({ name: child.title || child.id, gridUid: tab.schemaUid });
        }
      } else if (child.type === "group") {
        collectPages(child.id, depth + 1);
      }
    }
  }
  collectPages(ugcoGroup.id, 0);

  console.log(`Found ${pageGridUids.length} pages with grid UIDs\n`);

  let totalFixed = 0;

  for (const page of pageGridUids) {
    console.log(`\n── ${page.name} (${page.gridUid}) ──`);

    let schema: any;
    try {
      schema = await api("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    } catch (e: any) {
      console.log(`  ⚠️ Could not load schema: ${e.message}`);
      continue;
    }

    // Find all TableBlockProvider nodes
    interface TableBlock {
      uid: string;
      collection: string;
      decoratorProps: any;
    }
    const tableBlocks: TableBlock[] = [];

    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "TableBlockProvider" && node["x-uid"]) {
        const dp = node["x-decorator-props"] || {};
        tableBlocks.push({
          uid: node["x-uid"],
          collection: dp.collection || "",
          decoratorProps: dp,
        });
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) walk(node.properties[k]);
      }
    }
    walk(schema.data);

    if (tableBlocks.length === 0) {
      console.log("  No table blocks found");
      continue;
    }

    for (const tb of tableBlocks) {
      const appends = APPENDS_MAP[tb.collection];
      if (!appends) {
        console.log(`  Table ${tb.uid} (${tb.collection}) — no appends mapping, skipping`);
        continue;
      }

      const currentAppends = tb.decoratorProps.params?.appends;
      if (currentAppends && currentAppends.length > 0) {
        console.log(`  Table ${tb.uid} (${tb.collection}) — already has appends: ${currentAppends.join(", ")}`);
        continue;
      }

      // Patch to add appends
      const newParams = {
        ...(tb.decoratorProps.params || {}),
        appends,
      };

      const patchBody = {
        "x-uid": tb.uid,
        "x-decorator-props": {
          ...tb.decoratorProps,
          params: newParams,
        },
      };

      try {
        await api("POST", "uiSchemas:patch", patchBody);
        console.log(`  ✅ ${tb.uid} (${tb.collection}) — added appends: ${appends.join(", ")}`);
        totalFixed++;
      } catch (e: any) {
        console.error(`  ❌ ${tb.uid}: ${e.message}`);
      }
      await delay(200);
    }
  }

  console.log(`\n✅ Total tables fixed: ${totalFixed}`);
}

main().catch(console.error);
