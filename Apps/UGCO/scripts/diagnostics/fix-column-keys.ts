/**
 * Fix column property keys: replace inner CollectionField nodes that have
 * _id suffix keys (e.g., estado_clinico_id) with new nodes using the
 * correct association key (e.g., estado_clinico).
 *
 * The property key determines which field NocoBase looks up for rendering.
 * A key of "estado_clinico_id" → integer field → renders as N/A for association
 * A key of "estado_clinico" → belongsTo field → renders association label
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

// Map: old property key → { newKey, collectionField, fieldNames }
const KEY_FIXES: Record<string, {
  newKey: string;
  collectionField: string;
  fieldNames: { label: string; value: string };
}> = {
  // ugco_casooncologico columns
  "paciente_id": {
    newKey: "paciente",
    collectionField: "ugco_casooncologico.paciente",
    fieldNames: { label: "nombres", value: "id" },
  },
  "estado_clinico_id": {
    newKey: "estado_clinico",
    collectionField: "ugco_casooncologico.estado_clinico",
    fieldNames: { label: "nombre", value: "id" },
  },
  "estado_adm_id": {
    newKey: "estado_adm",
    collectionField: "ugco_casooncologico.estado_adm",
    fieldNames: { label: "nombre", value: "id" },
  },
  "estado_seguimiento_id": {
    newKey: "estado_seguimiento",
    collectionField: "ugco_casooncologico.estado_seguimiento",
    fieldNames: { label: "nombre", value: "id" },
  },
  // ugco_comitecaso columns
  "comite_id": {
    newKey: "comite",
    collectionField: "ugco_comitecaso.comite",
    fieldNames: { label: "nombre", value: "id" },
  },
  "caso_id": {
    newKey: "caso",
    collectionField: "ugco_comitecaso.caso",
    fieldNames: { label: "UGCO_COD01", value: "id" },
  },
  // ugco_comiteoncologico columns
  "especialidad_id": {
    newKey: "especialidad",
    collectionField: "ugco_comiteoncologico.especialidad",
    fieldNames: { label: "nombre", value: "id" },
  },
  // ugco_tarea columns
  "tipo_tarea_id": {
    newKey: "tipo_tarea",
    collectionField: "ugco_tarea.tipo_tarea",
    fieldNames: { label: "nombre", value: "id" },
  },
  "estado_tarea_id": {
    newKey: "estado_tarea",
    collectionField: "ugco_tarea.estado_tarea",
    fieldNames: { label: "nombre", value: "id" },
  },
  // ugco_equiposeguimiento columns
  // Note: especialidad_id already covered above
};

async function main() {
  console.log("=== Fix Column Property Keys ===\n");

  // Discover all UGCO pages
  const routesRes = await api("GET", "desktopRoutes:list?pageSize=200&sort=id");
  const allRoutes = routesRes.data || [];
  const ugcoGroup = allRoutes.find((r: any) => r.title === "UGCO" && r.type === "group");
  if (!ugcoGroup) { console.error("UGCO not found!"); return; }

  const pages: { name: string; gridUid: string }[] = [];
  function collectPages(parentId: number) {
    const children = allRoutes.filter((r: any) => r.parentId === parentId);
    for (const child of children) {
      if (child.type === "page") {
        const tab = allRoutes.find((r: any) => r.parentId === child.id && r.type === "tabs");
        if (tab?.schemaUid) pages.push({ name: child.title || child.id, gridUid: tab.schemaUid });
      } else if (child.type === "group") collectPages(child.id);
    }
  }
  collectPages(ugcoGroup.id);

  let totalFixed = 0;

  for (const page of pages) {
    let schema: any;
    try {
      schema = await api("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    } catch { continue; }

    // Find TableV2.Column nodes that contain inner CollectionField with _id keys
    interface ColumnToFix {
      parentUid: string; // TableV2.Column wrapper uid
      innerUid: string;  // CollectionField uid
      propertyKey: string; // current key (e.g., "estado_clinico_id")
      fix: typeof KEY_FIXES[string];
      collectionField: string; // actual x-collection-field value
    }
    const columnsToFix: ColumnToFix[] = [];

    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-component"] === "TableV2.Column" && node["x-uid"] && node.properties) {
        for (const [key, child] of Object.entries(node.properties) as any) {
          if (child["x-component"] === "CollectionField" && child["x-uid"]) {
            // Check if key needs fixing
            const fix = KEY_FIXES[key];
            if (fix) {
              columnsToFix.push({
                parentUid: node["x-uid"],
                innerUid: child["x-uid"],
                propertyKey: key,
                fix,
                collectionField: child["x-collection-field"] || "",
              });
            }
          }
        }
      }
      if (node.properties) {
        for (const k of Object.keys(node.properties)) walk(node.properties[k]);
      }
    }
    walk(schema.data);

    if (columnsToFix.length === 0) continue;

    console.log(`\n── ${page.name}: ${columnsToFix.length} columns to fix ──`);

    for (const col of columnsToFix) {
      console.log(`  ${col.propertyKey} → ${col.fix.newKey} (parent=${col.parentUid})`);

      try {
        // Step 1: Remove the old inner CollectionField node
        await api("POST", `uiSchemas:remove/${col.innerUid}`);
        console.log(`    Removed old node ${col.innerUid}`);
        await delay(200);

        // Step 2: Insert new CollectionField with correct key
        const newSchema = {
          name: col.fix.newKey,
          "x-collection-field": col.fix.collectionField,
          "x-component": "CollectionField",
          "x-component-props": {
            fieldNames: col.fix.fieldNames,
            ellipsis: true,
          },
          "x-read-pretty": true,
          "x-decorator": null,
          "x-decorator-props": {},
        };

        await api("POST", `uiSchemas:insertAdjacent/${col.parentUid}?position=beforeEnd`, {
          schema: newSchema,
        });
        console.log(`    ✅ Inserted new node with key "${col.fix.newKey}"`);
        totalFixed++;
      } catch (e: any) {
        console.error(`    ❌ ${e.message.slice(0, 120)}`);
      }
      await delay(200);
    }
  }

  console.log(`\n✅ Total columns fixed: ${totalFixed}`);
}

main().catch(console.error);
