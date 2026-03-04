/**
 * create-ges-page.ts  (P1-05)
 *
 * Crea la página "Garantías GES" en el menú UGCO con:
 *   - Tabla de ugco_garantias_ges con semáforo visual
 *   - Filtros por tipo_garantia y estado_garantia
 *   - Ordenada por dias_restantes ASC (urgentes primero)
 *   - Columnas: paciente, tipo, N° problema, fechas, días, estado
 *
 * Prerequisito: Ejecutar create-ges-collection.ts primero.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-ges-page.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-ges-page.ts --dry-run
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

const UGCO_GROUP_ID = 349160760737793; // Grupo raíz UGCO
const COLLECTION    = "ugco_garantias_ges";

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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ── Construir schema de columna ──────────────────────────────────────────────────
function buildColumn(collField: string, width = 150, xIndex = 1): object {
  const colUid   = uid();
  const fieldUid = uid();
  return {
    type: "void",
    "x-uid": colUid,
    name: colUid,
    "x-component": "TableV2.Column",
    "x-component-props": { width },
    "x-index": xIndex,
    "x-async": false,
    properties: {
      [fieldUid]: {
        type: "string",
        "x-uid": fieldUid,
        name: fieldUid,
        "x-component": "CollectionField",
        "x-component-props": { ellipsis: true },
        "x-read-pretty": true,
        "x-decorator": "FormItem",
        "x-collection-field": `${COLLECTION}.${collField}`,
        "x-index": 1,
        "x-async": false,
      },
    },
  };
}

// ── Schema completo del table block ──────────────────────────────────────────────
function buildTableBlock(gridColUid: string): object {
  const tableBlockUid   = uid();
  const actionBarUid    = uid();
  const createActionUid = uid();
  const tableV2Uid      = uid();
  const actionsColUid   = uid();
  const actionsSpaceUid = uid();
  const viewActionUid   = uid();

  const COLUMNS = [
    { field: "caso.paciente_nombre",  width: 200, xIndex: 1 },
    { field: "tipo_garantia",         width: 150, xIndex: 2 },
    { field: "numero_problema_ges",   width: 160, xIndex: 3 },
    { field: "fecha_inicio",          width: 130, xIndex: 4 },
    { field: "fecha_limite",          width: 130, xIndex: 5 },
    { field: "dias_restantes",        width: 110, xIndex: 6 },
    { field: "estado_garantia",       width: 150, xIndex: 7 },
    { field: "responsable",           width: 150, xIndex: 8 },
  ];

  const columnSchemas: Record<string, object> = {};
  for (const col of COLUMNS) {
    const colSchema = buildColumn(col.field, col.width, col.xIndex) as any;
    columnSchemas[colSchema["x-uid"]] = colSchema;
  }

  // Actions column (View button)
  columnSchemas[actionsColUid] = {
    type: "void",
    "x-uid": actionsColUid,
    name: actionsColUid,
    "x-component": "TableV2.Column",
    "x-component-props": { width: 120, fixed: "right" },
    "x-initializer": "table:configureItemActions",
    "x-index": 9,
    "x-async": false,
    properties: {
      [actionsSpaceUid]: {
        type: "void",
        "x-uid": actionsSpaceUid,
        name: actionsSpaceUid,
        "x-component": "Space",
        "x-component-props": { split: "|" },
        "x-async": false,
        "x-index": 1,
        properties: {
          [viewActionUid]: {
            type: "void",
            "x-uid": viewActionUid,
            name: viewActionUid,
            title: '{{ t("View") }}',
            "x-action": "view",
            "x-component": "Action.Link",
            "x-component-props": { openMode: "drawer" },
            "x-async": false,
            "x-index": 1,
          },
        },
      },
    },
  };

  return {
    type: "void",
    "x-uid": tableBlockUid,
    name: tableBlockUid,
    "x-decorator": "TableBlockProvider",
    "x-decorator-props": {
      collection: COLLECTION,
      dataSource: "main",
      action: "list",
      params: {
        sort: ["dias_restantes"],  // urgentes primero
        pageSize: 30,
      },
      showIndex: true,
      dragSort: false,
    },
    "x-component": "CardItem",
    "x-component-props": { title: "Garantías GES — Semáforo de Plazos" },
    "x-settings": "blockSettings:table",
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
        "x-initializer": "table:configureActions",
        "x-async": false,
        "x-index": 1,
        properties: {
          // Filter action
          filter: {
            type: "void",
            "x-uid": uid(),
            name: "filter",
            title: '{{ t("Filter") }}',
            "x-action": "filter",
            "x-component": "Filter.Action",
            "x-component-props": { icon: "FilterOutlined", useProps: "{{ useFilterActionProps }}" },
            "x-align": "left",
            "x-async": false,
            "x-index": 1,
          },
          // Create action
          [createActionUid]: {
            type: "void",
            "x-uid": createActionUid,
            name: createActionUid,
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
      [tableV2Uid]: {
        type: "array",
        "x-uid": tableV2Uid,
        name: tableV2Uid,
        "x-component": "TableV2",
        "x-component-props": {
          rowKey: "id",
          rowSelection: { type: "checkbox" },
          useProps: "{{ useTableBlockProps }}",
        },
        "x-initializer": "table:configureColumns",
        "x-async": false,
        "x-index": 2,
        properties: columnSchemas,
      },
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("=== CREATE GES PAGE (P1-05) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // 1. Verificar que la colección existe
  const col = await api("GET", `collections:get?filterByTk=${COLLECTION}`);
  if (!col.data) {
    console.error("❌ Colección ugco_garantias_ges no existe. Ejecuta create-ges-collection.ts primero.");
    process.exit(1);
  }
  console.log(`✅ Colección ${COLLECTION} verificada\n`);

  // 2. Verificar que la página no existe ya
  const existingRoutes = await api("GET", `desktopRoutes:list?filter[parentId]=${UGCO_GROUP_ID}&sort=sort`);
  const existingGes = (existingRoutes.data || []).find((r: any) =>
    r.title?.toLowerCase().includes("ges") || r.title?.toLowerCase().includes("garantía")
  );
  if (existingGes) {
    console.log(`ℹ  La página GES ya existe: "${existingGes.title}" (id: ${existingGes.id})`);
    console.log("   Usa el id para agregar bloques manualmente si es necesario.");
    return;
  }

  // 3. UIDs de la página
  const pageUid    = uid();
  const gridUid    = uid();
  const gridName   = uid();
  const menuUid    = uid();

  console.log("▶ Creando ruta de página...");
  if (DRY) {
    console.log(`  [DRY-RUN] Crearía ruta "Garantías GES" bajo parent ${UGCO_GROUP_ID}`);
  } else {
    const routeRes = await api("POST", "desktopRoutes:create", {
      type: "page",
      title: "Garantías GES",
      icon: "SafetyOutlined",
      parentId: UGCO_GROUP_ID,
      schemaUid: pageUid,
      menuSchemaUid: menuUid,
      enableTabs: false,
      children: [{
        type: "tabs",
        schemaUid: gridUid,
        tabSchemaName: gridName,
        hidden: true,
      }],
    });
    const routeId = routeRes.data?.id;
    console.log(`  ✅ Ruta creada — id: ${routeId}`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 4. Crear schema de la página
  console.log("▶ Insertando schema de página...");
  if (!DRY) {
    await api("POST", "uiSchemas:insert", {
      type: "void",
      "x-component": "Page",
      "x-uid": pageUid,
      properties: {
        [gridName]: {
          type: "void",
          "x-component": "Grid",
          "x-initializer": "page:addBlock",
          "x-uid": gridUid,
          "x-async": true,
          properties: {},
        },
      },
    });
    console.log(`  ✅ Schema creado (pageUid: ${pageUid}, gridUid: ${gridUid})`);
  } else {
    console.log(`  [DRY-RUN] Crearía schema pageUid=${pageUid}`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 5. Crear Grid.Row > Grid.Col para el table block
  const rowUid = uid();
  const colUid = uid();

  console.log("▶ Insertando Grid.Row y Grid.Col...");
  if (!DRY) {
    // Insertar row en el grid
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
    console.log(`  [DRY-RUN] Insertaría Row/Col en grid`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 6. Insertar tabla con semáforo
  console.log("▶ Insertando tabla de Garantías GES...");
  const tableSchema = buildTableBlock(colUid);

  if (!DRY) {
    await api("POST", `uiSchemas:insertAdjacent/${colUid}?position=afterBegin`, {
      schema: tableSchema,
    });
    const tableUid = (tableSchema as any)["x-uid"];
    console.log(`  ✅ Tabla insertada (tableBlockUid: ${tableUid})`);
  } else {
    console.log(`  [DRY-RUN] Insertaría tabla con ${Object.keys((tableSchema as any).properties).length} bloques`);
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ Página Garantías GES creada");
  console.log("   Recarga la UI de NocoBase y navega a UGCO → Garantías GES");
}

main().catch(console.error);
