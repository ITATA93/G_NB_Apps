/**
 * fix-comite-casos-columns.ts  (P1-01)
 *
 * Agrega las 7 columnas faltantes a la tabla "Casos en Comité" (onco_comite_casos).
 * Actualmente solo muestra 2 columnas (Decisión, Fecha Presentación).
 *
 * Columnas a agregar:
 *   1. caso.paciente_nombre  → Paciente
 *   2. caso.especialidad     → Especialidad
 *   3. sesion.numero_sesion  → N° Sesión
 *   4. prioridad             → Prioridad
 *   5. recomendacion         → Recomendación
 *   6. seguimiento_requerido → Seguimiento
 *   7. estado (si existe)    → Estado
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-comite-casos-columns.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-comite-casos-columns.ts --dry-run
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

const TABLE_UID     = "uzuw452137g"; // TableBlockProvider de Casos en Comité
const TABLE_V2_UID  = "h5xorxr1jcn"; // TableV2 de Casos en Comité

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

// ── Construir schema de una columna simple ────────────────────────────────────────
function buildColumn(opts: {
  fieldName: string;
  title: string;
  xIndex: number;
  width?: number;
}): object {
  const colUid  = uid();
  const fieldUid = uid();

  return {
    type: "void",
    "x-uid": colUid,
    name: colUid,
    "x-component": "TableV2.Column",
    "x-component-props": {
      width: opts.width || 150,
    },
    "x-index": opts.xIndex,
    "x-async": false,
    properties: {
      [fieldUid]: {
        type: "string",
        "x-uid": fieldUid,
        name: fieldUid,
        "x-component": "CollectionField",
        "x-component-props": {
          ellipsis: true,
        },
        "x-read-pretty": true,
        "x-decorator": "FormItem",
        "x-collection-field": `onco_comite_casos.${opts.fieldName}`,
        "x-async": false,
        "x-index": 1,
      },
    },
  };
}

// ── Columnas a agregar ────────────────────────────────────────────────────────────
// Nota: Los campos de relación (caso.paciente_nombre) usan CollectionField con
// x-collection-field apuntando al path completo
const COLUMNS_TO_ADD = [
  // Datos del paciente (vía relación caso)
  { fieldName: "caso.paciente_nombre", title: "Paciente",      width: 200, xIndex: 1 },
  { fieldName: "caso.especialidad",    title: "Especialidad",  width: 150, xIndex: 2 },
  // Datos de la sesión
  { fieldName: "sesion.numero_sesion", title: "N° Sesión",     width: 100, xIndex: 3 },
  { fieldName: "sesion.fecha",         title: "Fecha Sesión",  width: 130, xIndex: 4 },
  // Datos del caso en comité
  { fieldName: "prioridad",            title: "Prioridad",     width: 120, xIndex: 5 },
  { fieldName: "recomendacion",        title: "Recomendación", width: 250, xIndex: 6 },
  { fieldName: "seguimiento_requerido",title: "Seguimiento",   width: 110, xIndex: 7 },
];

async function main(): Promise<void> {
  console.log("=== FIX COMITÉ CASOS COLUMNS (P1-01) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // 1. Verificar que el TableV2 existe
  console.log(`▶ Inspeccionando TableV2: ${TABLE_V2_UID}`);
  const schema = await api("GET", `uiSchemas:getJsonSchema/${TABLE_V2_UID}`);
  const tableNode = schema.data || schema;

  const existingCols = Object.keys(tableNode.properties || {});
  console.log(`  Columnas actuales: ${existingCols.length} → ${existingCols.join(", ")}`);

  // 2. Verificar campos disponibles en onco_comite_casos
  const fieldsResult = await api("GET", "collections/onco_comite_casos/fields:list?pageSize=100");
  const availableFields: string[] = (fieldsResult.data || []).map((f: any) => f.name);
  console.log(`  Campos en colección: ${availableFields.join(", ")}`);

  // 3. Insertar columnas
  console.log(`\n▶ Insertando ${COLUMNS_TO_ADD.length} columnas...`);
  let ok = 0, skip = 0, fail = 0;

  for (const col of COLUMNS_TO_ADD) {
    const colSchema = buildColumn(col);
    const colUid = (colSchema as any)["x-uid"];

    console.log(`  Col: ${col.fieldName} (${col.title}) → uid=${colUid}`);

    if (DRY) {
      console.log("  [DRY-RUN] Insertaría columna");
      ok++;
      continue;
    }

    try {
      // Insertar en el TableV2 en posición afterBegin (al inicio)
      // Para que queden en orden, las insertamos en reversa (ultimo primero)
      await api(
        "POST",
        `uiSchemas:insertAdjacent/${TABLE_V2_UID}?position=afterBegin`,
        { schema: colSchema }
      );
      console.log(`  ✅ Insertada`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Insertadas: ${ok}  ⏭  Saltadas: ${skip}  ❌ Fallidas: ${fail}`);
  console.log("\nRecarga la página Casos en Comité para ver los cambios.");
}

main().catch(console.error);
