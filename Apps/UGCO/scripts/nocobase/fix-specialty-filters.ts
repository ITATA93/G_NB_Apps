/**
 * fix-specialty-filters.ts  (P0-05)
 *
 * Agrega filtro fijo por especialidad en cada una de las 9 páginas de especialidad UGCO.
 * El filtro se aplica en x-decorator-props.params.filter del TableBlockProvider.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-specialty-filters.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-specialty-filters.ts --dry-run
 */

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// ── Páginas de especialidad (route id → nombre de especialidad en la colección) ──────
// El valor de especialidad debe coincidir exactamente con el campo en onco_casos
const SPECIALTY_PAGES = [
  { routeId: "350480704012291", especialidad: "Digestivo Alto" },
  { routeId: "350480704012293", especialidad: "Digestivo Bajo" },
  { routeId: "350480704012295", especialidad: "Mama" },
  { routeId: "350480706109441", especialidad: "Ginecología" },
  { routeId: "350480706109443", especialidad: "Urología" },
  { routeId: "350480706109445", especialidad: "Tórax" },
  { routeId: "350480706109447", especialidad: "Piel y Partes Blandas" },
  { routeId: "350480706109449", especialidad: "Endocrinología" },
  { routeId: "350480708206592", especialidad: "Hematología" },
];

// ── Buscar recursivamente el nodo TableBlockProvider ─────────────────────────────────
function findTableBlock(node: any): { uid: string; props: any } | null {
  if (!node || typeof node !== "object") return null;
  if (node["x-decorator"] === "TableBlockProvider" && node["x-uid"]) {
    return { uid: node["x-uid"], props: node["x-decorator-props"] || {} };
  }
  for (const key of Object.keys(node.properties || {})) {
    const found = findTableBlock(node.properties[key]);
    if (found) return found;
  }
  return null;
}

// ── Obtener el Grid schema de una página via sus rutas ──────────────────────────────
async function getPageGridSchema(routeId: string): Promise<{ gridUid: string; schema: any } | null> {
  // Obtener children de la ruta (el nodo tabs oculto)
  const childrenResult = await api("GET", `desktopRoutes:list?filter[parentId]=${routeId}&sort=sort`);
  const children: any[] = childrenResult.data || [];
  const tabsChild = children.find((c: any) => c.type === "tabs");
  if (!tabsChild?.schemaUid) return null;

  // El schema completo de la página está en tabsChild.schemaUid
  // La propiedad tabSchemaName es la key del tab dentro de ese schema
  const schema = await api("GET", `uiSchemas:getJsonSchema/${tabsChild.schemaUid}`);
  const rootSchema = schema.data || schema;

  // Si hay tabSchemaName, el contenido real está en esa propiedad
  const tabKey = tabsChild.tabSchemaName;
  const tabContent = tabKey ? rootSchema.properties?.[tabKey] : rootSchema;
  const effectiveSchema = tabContent || rootSchema;

  return { gridUid: tabsChild.schemaUid, schema: effectiveSchema };
}

// ── Main ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("=== FIX SPECIALTY FILTERS (P0-05) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  let ok = 0, fail = 0;

  for (const { routeId, especialidad } of SPECIALTY_PAGES) {
    console.log(`▶ ${especialidad} (route ${routeId})`);

    try {
      const grid = await getPageGridSchema(routeId);
      if (!grid) {
        console.warn("  ⚠ No se encontró el grid de la página — skipping");
        fail++;
        continue;
      }

      const tableBlock = findTableBlock(grid.schema);
      if (!tableBlock) {
        console.warn("  ⚠ No se encontró TableBlockProvider en el schema — skipping");
        fail++;
        continue;
      }

      const { uid, props } = tableBlock;
      const collection = props.collection || "onco_casos";
      console.log(`  TableBlock: ${uid} | collection: ${collection}`);

      // Determinar el campo de especialidad según la colección
      const filterField = collection.startsWith("ugco_") ? "especialidad" : "especialidad";
      const currentFilter = props.params?.filter;
      console.log(`  Filter actual: ${JSON.stringify(currentFilter || "ninguno")}`);

      const newFilter = { "$and": [{ [filterField]: { "$eq": especialidad } }] };

      if (DRY) {
        console.log(`  [DRY-RUN] Patch → filter: ${JSON.stringify(newFilter)}`);
        ok++;
        continue;
      }

      // Construir props completas preservando las existentes
      const newDecoratorProps = {
        ...props,
        params: {
          ...(props.params || {}),
          filter: newFilter,
          sort: ["-createdAt"],
          pageSize: props.params?.pageSize || 20,
        },
      };

      await api("POST", "uiSchemas:patch", {
        "x-uid": uid,
        "x-decorator-props": newDecoratorProps,
      });

      console.log(`  ✅ Filtro aplicado: especialidad = "${especialidad}"`);
      ok++;

    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ OK: ${ok}  ❌ Falló: ${fail}`);
  if (DRY) console.log("  [DRY-RUN] sin cambios en producción");
}

main().catch(console.error);
