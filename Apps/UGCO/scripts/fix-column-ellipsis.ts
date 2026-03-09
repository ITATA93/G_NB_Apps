/**
 * fix-column-ellipsis.ts
 * Sets ellipsis: false on all text-heavy columns across UGCO pages
 * so long text wraps instead of being truncated.
 *
 * Affected columns:
 *   - diagnostico_principal  → 9 specialty pages
 *   - descripcion            → Episodios table
 *   - notas_clinicas         → Episodios table
 *   - resultado              → Episodios table
 *   - decision               → Casos en Comité table
 *   - recomendacion          → Casos en Comité table
 *   - acta                   → Sesiones de Comité table
 *   - asistentes             → Sesiones de Comité table
 *   - paciente_nombre        → all tables (allow wrap on long names)
 */

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

/** Get column wrapper UIDs for text-heavy fields in a table block */
async function getTextColumnUids(blockUid: string, targetFields: string[]): Promise<Record<string, string>> {
  const schema = await api("GET", `uiSchemas:getJsonSchema/${blockUid}`);
  const result: Record<string, string> = {};

  function walk(obj: any): void {
    if (typeof obj !== "object" || obj === null) return;
    if (obj["x-component"] === "TableV2") {
      for (const [, col] of Object.entries<any>(obj.properties || {})) {
        if (col["x-action-column"] === "actions") continue;
        const innerKeys = Object.keys(col.properties || {});
        for (const fieldKey of innerKeys) {
          if (targetFields.includes(fieldKey)) {
            result[fieldKey] = col["x-uid"];
          }
        }
      }
    }
    for (const v of Object.values(obj)) walk(v);
  }

  walk(schema.data);
  return result;
}

/** Patch a column wrapper to disable text truncation */
async function setNoEllipsis(colUid: string, label: string): Promise<void> {
  await api("POST", `uiSchemas:patch`, {
    "x-uid": colUid,
    "x-component-props": { ellipsis: false },
  });
  console.log(`  ✓ ellipsis:false → ${label} (${colUid})`);
}

// ──────────────────────────────────────────────────────────────────────────────
// SPECIALTY PAGES — tab schema UIDs
// ──────────────────────────────────────────────────────────────────────────────
const SPECIALTY_TABS = [
  { name: "Digestivo Alto",       tabUid: "whi112loap" },
  { name: "Digestivo Bajo",       tabUid: "vs3hrzebl28" },
  { name: "Mama",                 tabUid: "z36ew42hs8" },
  { name: "Ginecología",          tabUid: "sl13b38jxrj" },
  { name: "Urología",             tabUid: "x9aqvsenjvk" },
  { name: "Tórax",                tabUid: "61snvkjwtw7" },
  { name: "Piel y Partes Blandas",tabUid: "5k1lzg8hdm8" },
  { name: "Endocrinología",       tabUid: "booh3xdsl86" },
  { name: "Hematología",          tabUid: "0tkcxfdduik" },
];

// Text-heavy fields per table (block uid → target fields)
const MAIN_TABLES: Array<{ name: string; blockUid: string; fields: string[] }> = [
  {
    name: "Episodios",
    blockUid: "6az86nznuks",
    fields: ["descripcion", "notas_clinicas", "resultado", "caso.paciente_nombre"],
  },
  {
    name: "Casos en Comité",
    blockUid: "uzuw452137g",
    fields: ["decision", "recomendacion", "caso.paciente_nombre"],
  },
  {
    name: "Sesiones de Comité",
    blockUid: "7v770k387m4",
    fields: ["acta", "asistentes"],
  },
];

async function main(): Promise<void> {
  console.log("=== FIX TEXT COLUMN ELLIPSIS ===\n");

  // ── 1. Specialty pages: diagnostico_principal ────────────────────────────
  console.log("▶ Specialty pages — diagnostico_principal\n");

  for (const spec of SPECIALTY_TABS) {
    try {
      const cols = await getTextColumnUids(spec.tabUid, ["diagnostico_principal", "paciente_nombre"]);
      for (const [field, uid] of Object.entries(cols)) {
        await setNoEllipsis(uid, `${spec.name}.${field}`);
        await new Promise(r => setTimeout(r, 150));
      }
      if (Object.keys(cols).length === 0) {
        console.log(`  ⚠ ${spec.name}: no text columns found`);
      }
    } catch (e: any) {
      console.error(`  ❌ ${spec.name}: ${e.message}`);
    }
  }

  // ── 2. Main UGCO tables ───────────────────────────────────────────────────
  console.log("\n▶ Main UGCO tables\n");

  for (const table of MAIN_TABLES) {
    console.log(`  ${table.name} (${table.blockUid})`);
    try {
      const cols = await getTextColumnUids(table.blockUid, table.fields);
      for (const [field, uid] of Object.entries(cols)) {
        await setNoEllipsis(uid, `${table.name}.${field}`);
        await new Promise(r => setTimeout(r, 150));
      }
      if (Object.keys(cols).length === 0) {
        console.log(`    ⚠ no matching text columns found`);
      }
    } catch (e: any) {
      console.error(`  ❌ ${table.name}: ${e.message}`);
    }
  }

  console.log("\n=== DONE ===");
}

main().catch(console.error);
