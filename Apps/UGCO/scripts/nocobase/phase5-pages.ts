/**
 * Phase 5 — Create UGCO menu group + all pages with table blocks
 * UGCO rebuild from scratch
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase5-pages.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing env vars"); process.exit(1); }

let okCount = 0; const errCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  okCount++;
  return text ? JSON.parse(text) : {};
}

function uid() { return Math.random().toString(36).substring(2, 13); }

// ─── Create a group route ───
async function createGroup(title: string, parentId?: number): Promise<number> {
  const body: any = { type: "group", title, hidden: false };
  if (parentId) body.parentId = parentId;
  const res = await api("POST", "desktopRoutes:create", body);
  const id = res.data?.id;
  console.log(`  📁 Group: "${title}" → id=${id}`);
  return id;
}

// ─── Create a page (route + schema) ───
async function createPage(title: string, parentId: number): Promise<{ routeId: number; gridUid: string }> {
  const pageUid = uid(), gridUid = uid(), gridName = uid(), menuUid = uid();

  const routeRes = await api("POST", "desktopRoutes:create", {
    type: "page", title, parentId,
    schemaUid: pageUid, menuSchemaUid: menuUid, enableTabs: false,
    children: [{ type: "tabs", schemaUid: gridUid, tabSchemaName: gridName, hidden: true }],
  });
  const routeId = routeRes.data?.id;

  await api("POST", "uiSchemas:insert", {
    type: "void", "x-component": "Page", "x-uid": pageUid,
    properties: {
      [gridName]: {
        type: "void", "x-component": "Grid",
        "x-initializer": "page:addBlock", "x-uid": gridUid, "x-async": true,
        properties: {},
      },
    },
  });

  console.log(`  📄 Page: "${title}" → route=${routeId}, grid=${gridUid}`);
  return { routeId, gridUid };
}

// ─── Add a table block to a grid ───
async function addTableBlock(
  gridUid: string,
  collection: string,
  title: string,
  columns: string[],
  sortField = "-id",
) {
  const columnProps: Record<string, any> = {};
  // Action column
  columnProps[uid()] = {
    _isJSONSchemaObject: true, version: "2.0", type: "void",
    title: '{{ t("Actions") }}', "x-action-column": "actions",
    "x-decorator": "TableV2.Column.ActionBar", "x-component": "TableV2.Column",
    "x-component-props": { width: 150, fixed: "right" },
    "x-initializer": "table:configureItemActions", properties: {},
  };
  // Data columns
  for (const col of columns) {
    columnProps[uid()] = {
      _isJSONSchemaObject: true, version: "2.0", type: "void",
      "x-decorator": "TableV2.Column.Decorator", "x-component": "TableV2.Column",
      properties: {
        [col]: {
          _isJSONSchemaObject: true, version: "2.0",
          "x-collection-field": `${collection}.${col}`,
          "x-component": "CollectionField", "x-component-props": {},
          "x-read-pretty": true, "x-decorator": null, "x-decorator-props": {},
        },
      },
    };
  }

  const rowUid = uid();
  const blockSchema = {
    _isJSONSchemaObject: true, version: "2.0", type: "void",
    "x-component": "Grid.Row", "x-uid": rowUid, name: rowUid,
    properties: {
      [uid()]: {
        _isJSONSchemaObject: true, version: "2.0", type: "void",
        "x-component": "Grid.Col",
        properties: {
          [uid()]: {
            _isJSONSchemaObject: true, version: "2.0", type: "void",
            "x-acl-action": `${collection}:list`,
            "x-decorator": "TableBlockProvider",
            "x-decorator-props": {
              collection, dataSource: "main", action: "list",
              params: { pageSize: 20, sort: [sortField] },
              showIndex: true, dragSort: false,
            },
            "x-component": "CardItem",
            "x-component-props": { title },
            "x-toolbar": "BlockSchemaToolbar",
            "x-settings": "blockSettings:table",
            properties: {
              actions: {
                _isJSONSchemaObject: true, version: "2.0", type: "void",
                "x-initializer": "table:configureActions",
                "x-component": "ActionBar",
                "x-component-props": { style: { marginBottom: "var(--nb-spacing)" } },
                properties: {
                  filter: {
                    _isJSONSchemaObject: true, version: "2.0", type: "void",
                    title: '{{ t("Filter") }}', "x-action": "filter",
                    "x-component": "Filter.Action",
                    "x-use-component-props": "useFilterActionProps",
                    "x-component-props": { icon: "FilterOutlined" }, "x-align": "left",
                  },
                  create: {
                    _isJSONSchemaObject: true, version: "2.0", type: "void",
                    title: '{{ t("Add new") }}', "x-action": "create",
                    "x-component": "Action",
                    "x-component-props": { openMode: "drawer", type: "primary", icon: "PlusOutlined" },
                    "x-align": "right", "x-acl-action": `${collection}:create`,
                    properties: {
                      drawer: {
                        _isJSONSchemaObject: true, version: "2.0", type: "void",
                        title: '{{ t("Add record") }}', "x-component": "Action.Container",
                        "x-component-props": { className: "nb-action-popup" },
                        properties: {
                          grid: {
                            _isJSONSchemaObject: true, version: "2.0", type: "void",
                            "x-component": "Grid", "x-initializer": "popup:addNew:addBlock", properties: {},
                          },
                        },
                      },
                    },
                  },
                },
              },
              [uid()]: {
                _isJSONSchemaObject: true, version: "2.0", type: "array",
                "x-initializer": "table:configureColumns",
                "x-component": "TableV2",
                "x-use-component-props": "useTableBlockProps",
                "x-component-props": { rowKey: "id", rowSelection: { type: "checkbox" } },
                properties: columnProps,
              },
            },
          },
        },
      },
    },
  };

  await api("POST", `uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, { schema: blockSchema });
  console.log(`    📊 Table: ${collection} (${columns.length} cols)`);
}

// ═══════════════════════════════════════════════════════════
// PAGE DEFINITIONS
// ═══════════════════════════════════════════════════════════

const CASO_COLS = ["UGCO_COD01", "codigo_cie10", "diagnostico_principal", "fecha_diagnostico", "estadio_clinico", "estado_clinico_id", "estado_adm_id"];
const CASO_COLS_SPEC = ["UGCO_COD01", "codigo_cie10", "diagnostico_principal", "fecha_diagnostico", "tnm_t", "tnm_n", "tnm_m", "estadio_clinico"];

const SPECIALTIES = [
  "Digestivo Alto", "Digestivo Bajo", "Mama", "Ginecología",
  "Urología", "Tórax", "Piel y Partes Blandas", "Endocrinología", "Hematología",
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 5 — UGCO Pages & Menu                  ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // 1. Top-level UGCO group
  const ugcoId = await createGroup("UGCO");

  // 2. Dashboard
  console.log("\n── Dashboard ──");
  const dash = await createPage("📊 Dashboard", ugcoId);
  await addTableBlock(dash.gridUid, "ugco_casooncologico", "Casos Oncológicos Activos", CASO_COLS, "-createdAt");
  await addTableBlock(dash.gridUid, "ugco_comitecaso", "Casos en Comité", ["caso_id", "decision_resumen", "plan_tratamiento", "responsable_seguimiento"], "-createdAt");

  // 3. Casos Oncológicos
  console.log("\n── Casos Oncológicos ──");
  const casos = await createPage("Casos Oncológicos", ugcoId);
  await addTableBlock(casos.gridUid, "ugco_casooncologico", "Casos Oncológicos",
    ["UGCO_COD01", "paciente_id", "codigo_cie10", "diagnostico_principal", "fecha_diagnostico",
     "estadio_clinico", "estado_clinico_id", "estado_adm_id", "estado_seguimiento_id", "fallecido"],
    "-fecha_diagnostico");

  // 4. Episodios
  console.log("\n── Episodios ──");
  const episodios = await createPage("Episodios", ugcoId);
  await addTableBlock(episodios.gridUid, "ugco_eventoclinico", "Eventos Clínicos",
    ["UGCO_COD01", "tipo_evento", "subtipo_evento", "fecha_solicitud", "fecha_realizacion", "resultado_resumen", "origen_dato"],
    "-fecha_realizacion");

  // 5. Comité group
  console.log("\n── Comité ──");
  const comiteId = await createGroup("Comité", ugcoId);

  const sesiones = await createPage("Sesiones de Comité", comiteId);
  await addTableBlock(sesiones.gridUid, "ugco_comiteoncologico", "Sesiones de Comité",
    ["UGCO_COD01", "nombre", "fecha_comite", "tipo_comite", "especialidad_id", "lugar"],
    "-fecha_comite");

  const comiteCasos = await createPage("Casos en Comité", comiteId);
  await addTableBlock(comiteCasos.gridUid, "ugco_comitecaso", "Casos en Comité",
    ["comite_id", "caso_id", "es_caso_principal", "decision_resumen", "plan_tratamiento", "responsable_seguimiento", "requiere_tareas"],
    "-createdAt");

  // 6. Especialidades group
  console.log("\n── Especialidades ──");
  const especId = await createGroup("Especialidades", ugcoId);
  for (const spec of SPECIALTIES) {
    const p = await createPage(spec, especId);
    const cols = spec === "Ginecología"
      ? [...CASO_COLS_SPEC, "figo"]
      : CASO_COLS_SPEC;
    await addTableBlock(p.gridUid, "ugco_casooncologico", `Casos — ${spec}`, cols, "-fecha_diagnostico");
  }

  // 7. Tareas Pendientes
  console.log("\n── Tareas Pendientes ──");
  const tareas = await createPage("Tareas Pendientes", ugcoId);
  await addTableBlock(tareas.gridUid, "ugco_tarea", "Tareas",
    ["titulo", "tipo_tarea_id", "estado_tarea_id", "fecha_vencimiento", "responsable_usuario", "es_interna"],
    "-fecha_vencimiento");

  // 8. Reportes
  console.log("\n── Reportes ──");
  await createPage("Reportes", ugcoId);

  // 9. Configuración group
  console.log("\n── Configuración ──");
  const configId = await createGroup("Configuración", ugcoId);

  const especConfig = await createPage("Especialidades (Catálogo)", configId);
  await addTableBlock(especConfig.gridUid, "ref_oncoespecialidad", "Especialidades Oncológicas",
    ["codigo_oficial", "nombre", "activo"], "-id");

  const equipos = await createPage("Equipos de Seguimiento", configId);
  await addTableBlock(equipos.gridUid, "ugco_equiposeguimiento", "Equipos",
    ["nombre", "descripcion", "especialidad_id", "activo"], "-id");

  const catalogos = await createPage("Catálogos REF", configId);
  await addTableBlock(catalogos.gridUid, "ref_oncoestadocaso", "Estados de Caso",
    ["codigo", "nombre", "es_final", "activo"], "orden");
  await addTableBlock(catalogos.gridUid, "ref_oncoestadoclinico", "Estados Clínicos",
    ["codigo", "nombre", "es_maligno", "activo"], "orden");
  await addTableBlock(catalogos.gridUid, "ref_oncoestadoadm", "Estados Administrativos",
    ["codigo", "nombre", "es_final", "activo"], "orden");

  // 10. Ficha 360°
  console.log("\n── Ficha 360° ──");
  await createPage("🗂️ Ficha 360° Paciente", ugcoId);

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
  console.log(`Base URL: ${BASE.replace("/api", "")}/admin/`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
