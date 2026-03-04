/**
 * create-kanban-tasks.ts  (P2-04)
 *
 * Agrega una vista Kanban a la página "Tareas Pendientes" de UGCO.
 * El Kanban agrupa onco_casos por el campo `estado` en columnas:
 *   Activo | En Tratamiento | Seguimiento | Egresado | Fallecido | Perdido de Vista
 *
 * La página ya existe (routeId: 350480708206594).
 * El script agrega el KanbanBlock al Grid existente.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-kanban-tasks.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-kanban-tasks.ts
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

const TAREAS_ROUTE_ID = 350480708206594;
const COLLECTION      = "onco_casos";
const GROUP_FIELD     = "estado";  // Columnas Kanban

function uid(): string {
  return randomBytes(5).toString("hex");
}

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ── Schema del Kanban block ─────────────────────────────────────────────────

function buildKanbanBlock(): object {
  const blockUid  = uid();
  const actionBarUid = uid();
  const filterUid = uid();
  const createUid = uid();
  const cardUid   = uid();
  const cardFieldUid = uid();

  return {
    type: "void",
    "x-uid": blockUid,
    name: blockUid,
    "x-decorator": "KanbanBlockProvider",
    "x-decorator-props": {
      collection: COLLECTION,
      dataSource: "main",
      action: "list",
      groupField: GROUP_FIELD,
      params: {
        pageSize: 200,
        sort: ["-fecha_ingreso"],
      },
    },
    "x-component": "CardItem",
    "x-component-props": {
      title: "Casos por Estado — Vista Kanban",
    },
    "x-settings": "blockSettings:kanban",
    "x-toolbar": "BlockSchemaToolbar",
    "x-async": false,
    "x-index": 1,
    properties: {
      [actionBarUid]: {
        type: "void",
        "x-uid": actionBarUid,
        name: actionBarUid,
        "x-component": "ActionBar",
        "x-component-props": { style: { marginBottom: 16 } },
        "x-initializer": "kanban:configureActions",
        "x-async": false,
        "x-index": 1,
        properties: {
          [filterUid]: {
            type: "void",
            "x-uid": filterUid,
            name: "filter",
            title: '{{ t("Filter") }}',
            "x-action": "filter",
            "x-component": "Filter.Action",
            "x-component-props": {
              icon: "FilterOutlined",
              useProps: "{{ useFilterActionProps }}",
            },
            "x-align": "left",
            "x-async": false,
            "x-index": 1,
          },
          [createUid]: {
            type: "void",
            "x-uid": createUid,
            name: createUid,
            title: '{{ t("Add new") }}',
            "x-action": "create",
            "x-acl-action": `${COLLECTION}:create`,
            "x-component": "Action",
            "x-component-props": {
              type: "primary",
              icon: "PlusOutlined",
              openMode: "drawer",
            },
            "x-align": "right",
            "x-async": false,
            "x-index": 2,
          },
        },
      },
      [cardUid]: {
        type: "array",
        "x-uid": cardUid,
        name: cardUid,
        "x-component": "Kanban",
        "x-component-props": {
          useProps: "{{ useKanbanBlockProps }}",
        },
        "x-initializer": "kanban:configureColumns",
        "x-async": false,
        "x-index": 2,
        properties: {
          card: {
            type: "void",
            "x-uid": uid(),
            name: "card",
            "x-component": "Kanban.Card",
            "x-initializer": "kanban:configureItemFields",
            "x-async": false,
            "x-index": 1,
            properties: {
              [cardFieldUid]: {
                type: "void",
                "x-uid": cardFieldUid,
                name: cardFieldUid,
                "x-component": "CollectionField",
                "x-collection-field": `${COLLECTION}.paciente_nombre`,
                "x-component-props": { ellipsis: true },
                "x-read-pretty": true,
                "x-decorator": "FormItem",
                "x-async": false,
                "x-index": 1,
              },
            },
          },
        },
      },
    },
  };
}

async function main(): Promise<void> {
  console.log("=== CREATE KANBAN TASKS (P2-04) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // 1. Obtener el tab child de la ruta Tareas Pendientes
  console.log("▶ Obteniendo schema de Tareas Pendientes...");
  const childrenResult = await api("GET", `desktopRoutes:list?filter[parentId]=${TAREAS_ROUTE_ID}&sort=sort`);
  const children: any[] = childrenResult.data || [];
  const tabsChild = children.find((c: any) => c.type === "tabs");

  if (!tabsChild?.schemaUid) {
    console.error("❌ No se encontró el tabs child de Tareas Pendientes.");
    process.exit(1);
  }

  const gridUid      = tabsChild.schemaUid;
  const tabSchemaName = tabsChild.tabSchemaName;
  console.log(`  Grid UID: ${gridUid}  |  Tab name: ${tabSchemaName}`);

  // 2. Verificar si ya existe un Kanban block
  try {
    const schema = await api("GET", `uiSchemas:getJsonSchema/${gridUid}`);
    const content = schema.data || schema;
    const tabContent = tabSchemaName ? content.properties?.[tabSchemaName] : content;
    const existing = tabContent?.properties || {};
    const hasKanban = Object.values(existing).some(
      (b: any) => b?.["x-decorator"] === "KanbanBlockProvider",
    );
    if (hasKanban) {
      console.log("ℹ  Ya existe un bloque Kanban en esta página. No se duplicará.");
      return;
    }
  } catch (_e) {
    // Si no se puede verificar, continuar
  }

  // 3. Crear Grid.Row + Grid.Col
  console.log("\n▶ Insertando Grid.Row y Grid.Col...");
  const rowUid = uid();
  const colUid = uid();

  if (!DRY) {
    await api("POST", `uiSchemas:insertAdjacent/${gridUid}?position=afterBegin`, {
      schema: {
        type: "void",
        "x-uid": rowUid,
        name: rowUid,
        "x-component": "Grid.Row",
        "x-async": false,
        "x-index": 1,
        properties: {
          [colUid]: {
            type: "void",
            "x-uid": colUid,
            name: colUid,
            "x-component": "Grid.Col",
            "x-async": false,
            "x-index": 1,
            properties: {},
          },
        },
      },
    });
    console.log(`  ✅ Row/Col insertados (rowUid: ${rowUid}, colUid: ${colUid})`);
  } else {
    console.log(`  [DRY-RUN] Insertaría Grid.Row/Col`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 4. Insertar Kanban block
  console.log("\n▶ Insertando bloque Kanban...");
  const kanbanSchema = buildKanbanBlock();

  if (!DRY) {
    await api("POST", `uiSchemas:insertAdjacent/${colUid}?position=afterBegin`, {
      schema: kanbanSchema,
    });
    const kanbanUid = (kanbanSchema as any)["x-uid"];
    console.log(`  ✅ Kanban insertado (uid: ${kanbanUid})`);
  } else {
    console.log(`  [DRY-RUN] Insertaría KanbanBlockProvider en colUid`);
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ Kanban creado en Tareas Pendientes");
  console.log(`   Colección: ${COLLECTION}  |  Agrupado por: ${GROUP_FIELD}`);
  console.log("   Columnas: activo | seguimiento | tratamiento | egresado | fallecido | perdido");
  console.log("   Recarga la UI de NocoBase y navega a UGCO → Tareas Pendientes");
  if (DRY) console.log("\n[DRY-RUN] Ejecutar sin --dry-run para aplicar.");
}

main().catch(console.error);
