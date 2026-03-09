/**
 * Fix association columns in all UGCO table blocks:
 * 1. Diagnose working vs broken columns
 * 2. Add fieldNames to association columns so they display label, not N/A
 * 3. Fix column titles (remove "ID" suffix)
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

// ── Step 1: Read the Dashboard to compare working vs broken columns ──
async function diagnose() {
  console.log("=== Step 1: Diagnose column schemas ===\n");

  // Get Dashboard table schema
  const schema = await api("GET", "uiSchemas:getJsonSchema/sncsgayec5c");

  // Find TableV2 and its columns
  function findColumns(node: any): Record<string, any> {
    if (!node || typeof node !== "object") return {};
    if (node["x-component"] === "TableV2" && node.properties) {
      return node.properties;
    }
    if (node.properties) {
      for (const k of Object.keys(node.properties)) {
        const result = findColumns(node.properties[k]);
        if (Object.keys(result).length > 0) return result;
      }
    }
    return {};
  }

  const columns = findColumns(schema.data);
  for (const [key, col] of Object.entries(columns) as any) {
    if (!col["x-collection-field"]) continue;
    console.log(`Column "${key}":`);
    console.log(`  x-collection-field: ${col["x-collection-field"]}`);
    console.log(`  x-component: ${col["x-component"]}`);
    console.log(`  x-component-props: ${JSON.stringify(col["x-component-props"])}`);
    console.log(`  title: ${col["title"]}`);
    console.log(`  x-uid: ${col["x-uid"]}`);

    // Check nested schema for title
    if (col.properties) {
      for (const [pk, pv] of Object.entries(col.properties) as any) {
        if (pv["x-component"] === "CollectionField") {
          console.log(`  Inner CollectionField: component-props=${JSON.stringify(pv["x-component-props"])}`);
        }
      }
    }
    console.log();
  }
}

// ── Step 2: Get field definitions to know the correct fieldNames ──
async function getFieldDefs() {
  console.log("=== Step 2: Get field definitions for associations ===\n");

  const collections = [
    "ugco_casooncologico",
    "ugco_comitecaso",
    "ugco_comiteoncologico",
    "ugco_eventoclinico",
    "ugco_tarea",
    "ugco_equiposeguimiento",
  ];

  const fieldMap: Record<string, Record<string, any>> = {};

  for (const coll of collections) {
    const res = await api("GET", `collections/${coll}/fields:list?pageSize=100`);
    const fields = res.data || [];
    fieldMap[coll] = {};
    for (const f of fields) {
      if (f.type === "belongsTo" || f.interface === "m2o") {
        fieldMap[coll][f.name] = {
          type: f.type,
          interface: f.interface,
          target: f.target,
          foreignKey: f.foreignKey,
          uiSchema: f.uiSchema,
          // The label field is in uiSchema.x-component-props.fieldNames.label
          fieldNames: f.uiSchema?.["x-component-props"]?.fieldNames,
        };
        console.log(`  ${coll}.${f.name} → target=${f.target}, fieldNames=${JSON.stringify(f.uiSchema?.["x-component-props"]?.fieldNames)}`);
      }
    }
    await delay(200);
  }

  return fieldMap;
}

// ── Step 3: Fix all association columns across all pages ──
async function fixAllColumns(fieldMap: Record<string, Record<string, any>>) {
  console.log("\n=== Step 3: Fix association columns across all pages ===\n");

  // Discover all UGCO pages
  const routesRes = await api("GET", "desktopRoutes:list?pageSize=200&sort=id");
  const allRoutes = routesRes.data || [];
  const ugcoGroup = allRoutes.find((r: any) => r.title === "UGCO" && r.type === "group");
  if (!ugcoGroup) { console.error("UGCO group not found!"); return; }

  const pages: { name: string; gridUid: string }[] = [];
  function collectPages(parentId: number) {
    const children = allRoutes.filter((r: any) => r.parentId === parentId);
    for (const child of children) {
      if (child.type === "page") {
        const tab = allRoutes.find((r: any) => r.parentId === child.id && r.type === "tabs");
        if (tab?.schemaUid) pages.push({ name: child.title || child.id, gridUid: tab.schemaUid });
      } else if (child.type === "group") {
        collectPages(child.id);
      }
    }
  }
  collectPages(ugcoGroup.id);

  let totalFixed = 0;

  for (const page of pages) {
    console.log(`\n── ${page.name} ──`);

    let schema: any;
    try {
      schema = await api("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    } catch (e: any) {
      console.log(`  ⚠️ Could not load: ${e.message.slice(0, 80)}`);
      continue;
    }

    // Find all TableBlockProvider nodes
    interface TableInfo {
      uid: string;
      collection: string;
      tableV2Props: Record<string, any>;
    }
    const tables: TableInfo[] = [];

    function findTableBlocks(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "TableBlockProvider" && node["x-uid"]) {
        const dp = node["x-decorator-props"] || {};
        // Find TableV2 inside
        function findTV2(n: any): Record<string, any> | null {
          if (!n || typeof n !== "object") return null;
          if (n["x-component"] === "TableV2" && n.properties) return n.properties;
          if (n.properties) {
            for (const k of Object.keys(n.properties)) {
              const r = findTV2(n.properties[k]);
              if (r) return r;
            }
          }
          return null;
        }
        const tv2Cols = findTV2(node);
        if (tv2Cols) {
          tables.push({ uid: node["x-uid"], collection: dp.collection || "", tableV2Props: tv2Cols });
        }
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) findTableBlocks(node.properties[k]);
      }
    }
    findTableBlocks(schema.data);

    if (tables.length === 0) {
      console.log("  No tables found");
      continue;
    }

    for (const table of tables) {
      const collFieldDefs = fieldMap[table.collection] || {};

      for (const [colKey, colSchema] of Object.entries(table.tableV2Props) as any) {
        const collField = colSchema["x-collection-field"] as string | undefined;
        if (!collField) continue;

        // Extract field name from "collection.fieldName"
        const parts = collField.split(".");
        const fieldName = parts[parts.length - 1];

        // Check if this is an association field
        const fieldDef = collFieldDefs[fieldName];
        if (!fieldDef) continue; // Not an association, skip

        // Check if fieldNames are already set
        const existingFieldNames = colSchema["x-component-props"]?.fieldNames;
        const defFieldNames = fieldDef.fieldNames;

        if (existingFieldNames && existingFieldNames.label) {
          // Already configured
          continue;
        }

        if (!defFieldNames) {
          console.log(`  ⚠️ ${fieldName}: No fieldNames in field definition`);
          continue;
        }

        console.log(`  Fixing ${colKey} (${collField}) → fieldNames=${JSON.stringify(defFieldNames)}`);

        // Patch the column schema
        const colUid = colSchema["x-uid"];
        if (!colUid) {
          console.log(`    ⚠️ No x-uid, skipping`);
          continue;
        }

        // Build patch: add fieldNames to component-props
        const newComponentProps = {
          ...(colSchema["x-component-props"] || {}),
          fieldNames: defFieldNames,
          ellipsis: true,
        };

        // Also fix the title if it ends with "ID"
        let newTitle = colSchema.title;
        if (typeof newTitle === "string" && newTitle.endsWith(" ID")) {
          newTitle = newTitle.replace(/ ID$/, "");
        }

        const patchBody: any = {
          "x-uid": colUid,
          "x-component-props": newComponentProps,
        };
        if (newTitle !== colSchema.title) {
          patchBody.title = newTitle;
        }

        try {
          await api("POST", "uiSchemas:patch", patchBody);
          console.log(`    ✅ Patched: fieldNames=${JSON.stringify(defFieldNames)}${newTitle !== colSchema.title ? `, title="${newTitle}"` : ""}`);
          totalFixed++;
        } catch (e: any) {
          console.error(`    ❌ ${e.message.slice(0, 100)}`);
        }
        await delay(200);
      }
    }
  }

  console.log(`\n✅ Total columns fixed: ${totalFixed}`);
}

async function main() {
  await diagnose();
  const fieldMap = await getFieldDefs();
  await fixAllColumns(fieldMap);
}

main().catch(console.error);
