/**
 * Fix CollectionField x-component-props: add fieldNames for association columns.
 *
 * The issue: x-collection-field was changed from FK (e.g. estado_clinico_id) to
 * association (e.g. estado_clinico), but the CollectionField component still has
 * empty x-component-props and doesn't know how to render the association label.
 *
 * Fix: patch each CollectionField node that references a belongsTo association
 * to add fieldNames: { label, value } based on the field definition.
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

// Map: collection.field → fieldNames for belongsTo associations
const FIELD_NAMES_MAP: Record<string, { label: string; value: string }> = {
  "ugco_casooncologico.paciente": { label: "nombres", value: "id" },
  "ugco_casooncologico.estado_clinico": { label: "nombre", value: "id" },
  "ugco_casooncologico.estado_adm": { label: "nombre", value: "id" },
  "ugco_casooncologico.estado_seguimiento": { label: "nombre", value: "id" },
  "ugco_casooncologico.intencion_trat": { label: "nombre", value: "id" },
  "ugco_comitecaso.comite": { label: "nombre", value: "id" },
  "ugco_comitecaso.caso": { label: "UGCO_COD01", value: "id" },
  "ugco_comiteoncologico.especialidad": { label: "nombre", value: "id" },
  "ugco_eventoclinico.caso": { label: "codigo_cie10", value: "id" },
  "ugco_eventoclinico.modalidad_prestacion": { label: "nombre", value: "id" },
  "ugco_eventoclinico.centro_destino": { label: "nombre", value: "id" },
  "ugco_eventoclinico.estado_seguimiento": { label: "nombre", value: "id" },
  "ugco_tarea.tipo_tarea": { label: "nombre", value: "id" },
  "ugco_tarea.estado_tarea": { label: "nombre", value: "id" },
  "ugco_tarea.caso": { label: "UGCO_COD01", value: "id" },
  "ugco_equiposeguimiento.especialidad": { label: "nombre", value: "id" },
};

async function main() {
  console.log("=== Fix CollectionField Props ===\n");

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

  console.log(`Found ${pages.length} pages\n`);

  let totalFixed = 0;

  for (const page of pages) {
    let schema: any;
    try {
      schema = await api("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    } catch { continue; }

    // Find ALL CollectionField nodes in the page schema
    interface CFNode {
      uid: string;
      collectionField: string;
      componentProps: any;
      propertyKey: string;
    }
    const cfNodes: CFNode[] = [];

    function walk(node: any, key: string) {
      if (!node || typeof node !== "object") return;
      if (node["x-component"] === "CollectionField" && node["x-uid"] && node["x-collection-field"]) {
        cfNodes.push({
          uid: node["x-uid"],
          collectionField: node["x-collection-field"],
          componentProps: node["x-component-props"] || {},
          propertyKey: key,
        });
      }
      if (node.properties) {
        for (const [k, v] of Object.entries(node.properties) as any) walk(v, k);
      }
    }
    walk(schema.data, "root");

    const toFix = cfNodes.filter(n => {
      const fn = FIELD_NAMES_MAP[n.collectionField];
      if (!fn) return false;
      // Check if already has fieldNames
      const existing = n.componentProps?.fieldNames;
      return !existing || !existing.label;
    });

    if (toFix.length === 0) continue;

    console.log(`── ${page.name}: ${toFix.length} CollectionField(s) to fix ──`);

    for (const cf of toFix) {
      const fn = FIELD_NAMES_MAP[cf.collectionField]!;
      console.log(`  ${cf.propertyKey} (${cf.collectionField}) → fieldNames=${JSON.stringify(fn)}`);

      try {
        await api("POST", "uiSchemas:patch", {
          "x-uid": cf.uid,
          "x-component-props": {
            ...cf.componentProps,
            fieldNames: fn,
            ellipsis: true,
          },
        });
        console.log(`    ✅ Patched`);
        totalFixed++;
      } catch (e: any) {
        console.error(`    ❌ ${e.message.slice(0, 100)}`);
      }
      await delay(150);
    }
  }

  console.log(`\n✅ Total CollectionField nodes fixed: ${totalFixed}`);
}

main().catch(console.error);
