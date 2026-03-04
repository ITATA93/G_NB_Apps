/**
 * create-patient-drawer.ts  (P2-05)
 *
 * Crea la página "🗂️ Ficha 360° Paciente" bajo el grupo UGCO.
 * Esta página muestra una visión completa del caso oncológico con 5 secciones:
 *
 *   1. Datos Generales    — Details block de onco_casos
 *   2. Episodios Clínicos — Tabla de onco_episodios
 *   3. Sesiones de Comité — Tabla de onco_comite_casos
 *   4. Garantías GES      — Tabla de ugco_garantias_ges
 *   5. Historia / Notas   — Details de observaciones e historia
 *
 * Nota: Esta es una "ficha de referencia" global. Para ver la ficha de un caso
 * específico, usa el filtro de paciente en la barra de acciones.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-patient-drawer.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-patient-drawer.ts
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

const UGCO_GROUP_ID = 349160760737793;

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

// ── Construir tabla para una colección relacionada ───────────────────────────

function buildTableBlock(
  collection: string,
  title: string,
  columns: Array<{ field: string; width: number }>,
  xIndex: number,
): object {
  const blockUid    = uid();
  const actionUid   = uid();
  const tableV2Uid  = uid();
  const filterUid   = uid();

  const columnSchemas: Record<string, object> = {};
  columns.forEach((col, i) => {
    const colUid   = uid();
    const fieldUid = uid();
    columnSchemas[colUid] = {
      type: "void",
      "x-uid": colUid,
      name: colUid,
      "x-component": "TableV2.Column",
      "x-component-props": { width: col.width },
      "x-index": i + 1,
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
          "x-collection-field": `${collection}.${col.field}`,
          "x-index": 1,
          "x-async": false,
        },
      },
    };
  });

  return {
    type: "void",
    "x-uid": blockUid,
    name: blockUid,
    "x-decorator": "TableBlockProvider",
    "x-decorator-props": {
      collection,
      dataSource: "main",
      action: "list",
      params: { pageSize: 20, sort: ["-createdAt"] },
      showIndex: true,
      dragSort: false,
    },
    "x-component": "CardItem",
    "x-component-props": { title },
    "x-settings": "blockSettings:table",
    "x-toolbar": "BlockSchemaToolbar",
    "x-async": false,
    "x-index": xIndex,
    properties: {
      [actionUid]: {
        type: "void",
        "x-uid": actionUid,
        name: actionUid,
        "x-component": "ActionBar",
        "x-component-props": { style: { marginBottom: 12 } },
        "x-initializer": "table:configureActions",
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

// ── Construir Details block para datos generales ─────────────────────────────

function buildDetailsBlock(
  collection: string,
  title: string,
  fields: string[],
  xIndex: number,
): object {
  const blockUid   = uid();
  const detailsUid = uid();

  const fieldSchemas: Record<string, object> = {};
  fields.forEach((field, i) => {
    const fieldUid = uid();
    fieldSchemas[fieldUid] = {
      type: "void",
      "x-uid": fieldUid,
      name: fieldUid,
      "x-component": "CollectionField",
      "x-collection-field": `${collection}.${field}`,
      "x-component-props": { ellipsis: false },
      "x-read-pretty": true,
      "x-decorator": "FormItem",
      "x-index": i + 1,
      "x-async": false,
    };
  });

  return {
    type: "void",
    "x-uid": blockUid,
    name: blockUid,
    "x-decorator": "DetailsBlockProvider",
    "x-decorator-props": {
      collection,
      dataSource: "main",
      action: "list",
      params: { pageSize: 1 },
    },
    "x-component": "CardItem",
    "x-component-props": { title },
    "x-settings": "blockSettings:details",
    "x-toolbar": "BlockSchemaToolbar",
    "x-async": false,
    "x-index": xIndex,
    properties: {
      [detailsUid]: {
        type: "void",
        "x-uid": detailsUid,
        name: detailsUid,
        "x-component": "Details",
        "x-component-props": {
          useProps: "{{ useDetailsBlockProps }}",
        },
        "x-initializer": "details:configureFields",
        "x-async": false,
        "x-index": 1,
        properties: fieldSchemas,
      },
    },
  };
}

async function main(): Promise<void> {
  console.log("=== CREATE PATIENT 360° DRAWER (P2-05) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // 1. Verificar si la página ya existe
  const existingRoutes = await api("GET", `desktopRoutes:list?filter[parentId]=${UGCO_GROUP_ID}&sort=sort&pageSize=50`);
  const existingFicha = (existingRoutes.data || []).find((r: any) =>
    r.title?.toLowerCase().includes("ficha") || r.title?.toLowerCase().includes("360"),
  );
  if (existingFicha) {
    console.log(`ℹ  La página Ficha 360° ya existe: "${existingFicha.title}" (id: ${existingFicha.id})`);
    return;
  }

  // 2. Crear ruta de página
  const pageUid  = uid();
  const gridUid  = uid();
  const gridName = uid();
  const menuUid  = uid();

  console.log("▶ Creando ruta de página Ficha 360°...");
  if (!DRY) {
    const routeRes = await api("POST", "desktopRoutes:create", {
      type: "page",
      title: "🗂️ Ficha 360° Paciente",
      icon: "ProfileOutlined",
      parentId: UGCO_GROUP_ID,
      schemaUid: pageUid,
      menuSchemaUid: menuUid,
      enableTabs: false,
      children: [{ type: "tabs", schemaUid: gridUid, tabSchemaName: gridName, hidden: true }],
    });
    console.log(`  ✅ Ruta creada — id: ${routeRes.data?.id}`);
  } else {
    console.log(`  [DRY-RUN] Crearía ruta "🗂️ Ficha 360° Paciente"`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 3. Crear schema de la página
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
    console.log(`  ✅ Schema creado`);
  } else {
    console.log(`  [DRY-RUN] Crearía schema pageUid=${pageUid}`);
  }

  await new Promise(r => setTimeout(r, 500));

  // 4. Definir las 5 secciones de la ficha
  const SECTIONS = [
    {
      title: "1. Datos Generales del Caso",
      type: "details" as const,
      collection: "onco_casos",
      fields: ["paciente_nombre", "paciente_rut", "especialidad", "diagnostico_principal",
               "codigo_cie10", "estadio_clinico", "estado", "fecha_ingreso", "observaciones"],
    },
    {
      title: "2. Episodios Clínicos",
      type: "table" as const,
      collection: "onco_episodios",
      columns: [
        { field: "tipo_episodio", width: 150 },
        { field: "fecha_episodio", width: 120 },
        { field: "descripcion", width: 250 },
        { field: "resultado", width: 200 },
        { field: "profesional_responsable", width: 150 },
      ],
    },
    {
      title: "3. Sesiones de Comité",
      type: "table" as const,
      collection: "onco_comite_casos",
      columns: [
        { field: "prioridad", width: 100 },
        { field: "recomendacion", width: 250 },
        { field: "seguimiento_requerido", width: 150 },
        { field: "decision", width: 200 },
      ],
    },
    {
      title: "4. Garantías GES",
      type: "table" as const,
      collection: "ugco_garantias_ges",
      columns: [
        { field: "tipo_garantia", width: 150 },
        { field: "fecha_inicio", width: 120 },
        { field: "fecha_limite", width: 120 },
        { field: "dias_restantes", width: 100 },
        { field: "estado_garantia", width: 140 },
      ],
    },
    {
      title: "5. Resumen Clínico e Historia",
      type: "details" as const,
      collection: "onco_casos",
      fields: ["diagnostico_principal", "estadio_clinico", "observaciones"],
    },
  ];

  // 5. Insertar cada sección como Grid.Row > Grid.Col > Block
  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    const rowUid  = uid();
    const colUid  = uid();

    console.log(`\n▶ Sección ${i + 1}: ${section.title}`);

    if (!DRY) {
      // Insertar row
      await api("POST", `uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
        schema: {
          type: "void",
          "x-uid": rowUid,
          name: rowUid,
          "x-component": "Grid.Row",
          "x-async": false,
          "x-index": i + 1,
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

      await new Promise(r => setTimeout(r, 400));

      // Insertar bloque
      let blockSchema: object;
      if (section.type === "details") {
        blockSchema = buildDetailsBlock(section.collection!, section.title, section.fields!, i + 1);
      } else {
        blockSchema = buildTableBlock(section.collection!, section.title, section.columns!, i + 1);
      }

      await api("POST", `uiSchemas:insertAdjacent/${colUid}?position=afterBegin`, {
        schema: blockSchema,
      });
      console.log(`  ✅ Sección ${i + 1} insertada`);
    } else {
      console.log(`  [DRY-RUN] Insertaría sección ${i + 1} (${section.type})`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ Página Ficha 360° Paciente creada con 5 secciones:");
  SECTIONS.forEach((s, i) => console.log(`   ${i + 1}. ${s.title}`));
  console.log("\n   Navega a UGCO → 🗂️ Ficha 360° Paciente");
  console.log("   Usa los filtros de cada tabla para ver datos de un paciente específico.");
  if (DRY) console.log("\n[DRY-RUN] Ejecutar sin --dry-run para aplicar.");
}

main().catch(console.error);
