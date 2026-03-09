/**
 * Update Episodios page — Add new columns for modalidad, centro, estado seguimiento
 *
 * Adds a second table block for "Seguimiento Pendiente" view
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/update-episodios-page.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

let okCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  okCount++;
  return text ? JSON.parse(text) : {};
}

function uid() { return Math.random().toString(36).substring(2, 13); }

// Episodios page gridUid from Phase 5
const EPISODIOS_GRID_UID = "v08vqxnrjxp";

function buildTableBlock(collection: string, title: string, columns: string[], sortField: string, filter?: object) {
  const columnProps: Record<string, any> = {};

  // Action column
  columnProps[uid()] = {
    _isJSONSchemaObject: true, version: "2.0", type: "void",
    title: '{{ t("Actions") }}', "x-action-column": "actions",
    "x-decorator": "TableV2.Column.ActionBar", "x-component": "TableV2.Column",
    "x-component-props": { width: 150, fixed: "right" },
    "x-initializer": "table:configureItemActions", properties: {},
  };

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

  const decoratorProps: any = {
    collection, dataSource: "main", action: "list",
    params: { pageSize: 20, sort: [sortField] },
    showIndex: true, dragSort: false,
  };
  if (filter) {
    decoratorProps.params.filter = filter;
  }

  const rowUid = uid();
  return {
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
            "x-decorator-props": decoratorProps,
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
}

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Update Episodios Page                         ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // Add "Seguimiento Pendiente" table (filtered: estado_seguimiento != CERRADO && != CANCELADO)
  console.log("Adding 'Seguimiento Pendiente' table block...");
  const pendienteBlock = buildTableBlock(
    "ugco_eventoclinico",
    "Seguimiento Pendiente",
    [
      "tipo_evento", "subtipo_evento_id", "modalidad_prestacion_id",
      "centro_destino_id", "estado_seguimiento_id",
      "fecha_solicitud", "fecha_programada", "fecha_resultado",
      "profesional_responsable", "notas_seguimiento",
    ],
    "-fecha_solicitud",
  );

  await api("POST", `uiSchemas:insertAdjacent/${EPISODIOS_GRID_UID}?position=beforeEnd`, {
    schema: pendienteBlock,
  });
  console.log("  ✅ Seguimiento Pendiente table added");

  console.log(`\n✅ Done. API calls: ${okCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
