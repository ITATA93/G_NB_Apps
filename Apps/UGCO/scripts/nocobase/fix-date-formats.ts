/**
 * fix-date-formats.ts  (P1-02)
 *
 * Corrige el formato de fechas en las tablas de UGCO.
 * Cambia de ISO (2025-12-29T00:00:00.000Z) a DD/MM/YYYY.
 *
 * Estrategia:
 *   1. Para cada página UGCO core, obtiene el schema completo
 *   2. Busca todos los nodos con x-component = "DatePicker" o CollectionField de tipo date
 *   3. Parchea x-component-props.format = "DD/MM/YYYY" y dateFormat = "DD/MM/YYYY"
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-date-formats.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-date-formats.ts --dry-run
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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ── UIDs de los Grid schemas de las páginas core ──────────────────────────────────
// (tabsChild schemaUid de cada página)
const PAGES = [
  { name: "Casos Oncológicos",  gridUid: "kkcolmf4bc7" },
  { name: "Episodios",          gridUid: "roks71uff2s" },
  { name: "Sesiones de Comité", gridUid: "agcxxqd5if0" },
  { name: "Casos en Comité",    gridUid: "abryj1xvn0c" },
];

// Campos de fecha conocidos por colección (para verificación adicional)
const DATE_FIELDS: Record<string, string[]> = {
  onco_casos:            ["fecha_ingreso", "fecha_diagnostico", "fecha_primera_consulta", "createdAt", "updatedAt"],
  onco_episodios:        ["fecha", "createdAt"],
  onco_comite_sesiones:  ["fecha", "createdAt"],
  onco_comite_casos:     ["fecha_presentacion", "createdAt"],
};

interface DateNode {
  uid: string;
  componentField: string;
  path: string;
}

// ── Buscar recursivamente nodos de fecha ──────────────────────────────────────────
function findDateNodes(node: any, path = "root"): DateNode[] {
  if (!node || typeof node !== "object") return [];

  const results: DateNode[] = [];
  const uid = node["x-uid"];
  const comp = node["x-component"];
  const collField = node["x-collection-field"] || "";

  // Es un campo de fecha si:
  // - x-component es DatePicker, o
  // - x-collection-field apunta a un campo de fecha conocido
  const isDateField =
    comp === "DatePicker" ||
    DATE_FIELDS[collField.split(".")[0]]?.some(f => collField.endsWith(`.${f}`));

  if (uid && isDateField) {
    results.push({ uid, componentField: collField || comp, path });
  }

  for (const key of Object.keys(node.properties || {})) {
    const nested = findDateNodes(node.properties[key], `${path}.${key}`);
    results.push(...nested);
  }

  return results;
}

async function main(): Promise<void> {
  console.log("=== FIX DATE FORMATS (P1-02) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  let totalPatched = 0, totalFail = 0;

  for (const page of PAGES) {
    console.log(`\n▶ ${page.name} (${page.gridUid})`);

    const schema = await api("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    const dateNodes = findDateNodes(schema.data || schema);

    console.log(`  Nodos de fecha encontrados: ${dateNodes.length}`);
    if (dateNodes.length === 0) {
      console.log("  (ninguno con DatePicker o campo de fecha conocido)");
      continue;
    }

    for (const node of dateNodes) {
      console.log(`  Campo: ${node.componentField} | uid: ${node.uid}`);

      if (DRY) {
        console.log(`  [DRY-RUN] Parchearía formato → DD/MM/YYYY`);
        totalPatched++;
        continue;
      }

      try {
        await api("POST", "uiSchemas:patch", {
          "x-uid": node.uid,
          "x-component-props": {
            format: "DD/MM/YYYY",
            dateFormat: "DD/MM/YYYY",
            showTime: false,
          },
        });
        console.log(`  ✅ Formato aplicado`);
        totalPatched++;
      } catch (e: any) {
        console.error(`  ❌ Error: ${e.message}`);
        totalFail++;
      }

      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Parcheados: ${totalPatched}  ❌ Fallidos: ${totalFail}`);
  if (totalPatched === 0) {
    console.log("\n⚠  No se encontraron nodos de fecha.");
    console.log("   Los DatePicker pueden tener UIDs que no están en el schema raíz.");
    console.log("   Alternativa: configurar manualmente desde la UI de NocoBase.");
  }
}

main().catch(console.error);
