/**
 * cleanup-legacy-collections.ts  (P2-07)
 *
 * Elimina las colecciones UGCO_* legacy que:
 *   1. Tienen 0 registros
 *   2. NO son tablas de referencia (UGCO_REF_*)
 *   3. Han sido reemplazadas por las colecciones onco_* activas
 *
 * ⚠  PRECAUCIÓN: Verifica referencias antes de eliminar.
 *    Usa --dry-run para previsualizar sin aplicar cambios.
 *
 * Colecciones a eliminar:
 *   UGCO_casooncologico    → reemplazada por onco_casos
 *   UGCO_eventoclinico     → reemplazada por onco_episodios
 *   UGCO_comitecaso        → reemplazada por onco_comite_casos
 *   UGCO_tarea             → pendiente migración
 *   UGCO_contactopaciente  → sin reemplazo (feature no usada)
 *   UGCO_casoespecialidad  → pivot table sin uso real
 *   UGCO_equiposeguimiento → feature no implementada
 *   UGCO_equipomiembro     → feature no implementada
 *   UGCO_documentocaso     → feature no implementada
 *   UGCO_personasignificativa → feature no implementada
 *   UGCO_ALMA_episodio     → ETL pendiente (P3)
 *   UGCO_ALMA_paciente     → ETL pendiente (P3)
 *   UGCO_ALMA_diagnostico  → ETL pendiente (P3)
 *
 * Colecciones PRESERVADAS:
 *   UGCO_REF_*             → Datos de referencia (CIE-10, TNM, etc.) con miles de registros
 *   ugco_comiteoncologico  → 2 registros activos (verificar manualmente)
 *   ugco_garantias_ges     → Recién creada
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/cleanup-legacy-collections.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/cleanup-legacy-collections.ts
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

// ── Colecciones a eliminar (confirmadas con 0 registros) ──────────────────────────
const LEGACY_TO_DELETE = [
  // Reemplazadas por onco_*
  { name: "UGCO_casooncologico",     reason: "Reemplazada por onco_casos (1035 registros)" },
  { name: "UGCO_eventoclinico",      reason: "Reemplazada por onco_episodios (2529 registros)" },
  { name: "UGCO_comitecaso",         reason: "Reemplazada por onco_comite_casos (605 registros)" },
  // Funcionalidades no implementadas (0 registros)
  { name: "UGCO_tarea",              reason: "Sin uso activo, workflows usan onco_* " },
  { name: "UGCO_contactopaciente",   reason: "Feature no usada en producción" },
  { name: "UGCO_casoespecialidad",   reason: "Pivot table sin uso real" },
  { name: "UGCO_equiposeguimiento",  reason: "Feature Equipos de Seguimiento no implementada" },
  { name: "UGCO_equipomiembro",      reason: "Feature no implementada" },
  { name: "UGCO_documentocaso",      reason: "Feature de documentos no implementada" },
  { name: "UGCO_personasignificativa", reason: "Feature no implementada" },
  // ETL pendiente — las tablas ALMA se llenarán cuando exista el ETL real (P3)
  { name: "UGCO_ALMA_episodio",      reason: "Tabla staging ETL — recrear cuando exista etl-alma-ugco.ts" },
  { name: "UGCO_ALMA_paciente",      reason: "Tabla staging ETL — recrear cuando exista etl-alma-ugco.ts" },
  { name: "UGCO_ALMA_diagnostico",   reason: "Tabla staging ETL — recrear cuando exista etl-alma-ugco.ts" },
];

// ── Colecciones que NO deben eliminarse (safety check) ────────────────────────────
const PROTECTED_PATTERNS = [
  /^UGCO_REF_/,          // Datos de referencia
  /^onco_/,              // Colecciones activas
  /^ugco_garantias_ges/, // Recién creada
  /^ugco_comiteoncologico/, // Tiene 2 registros
];

function isProtected(name: string): boolean {
  return PROTECTED_PATTERNS.some(p => p.test(name));
}

async function getRecordCount(collectionName: string): Promise<number> {
  try {
    const result = await api("GET", `${collectionName}:list?pageSize=1`);
    return result.meta?.count ?? 0;
  } catch (_e) {
    return -1; // Error al consultar
  }
}

async function main(): Promise<void> {
  console.log("=== CLEANUP LEGACY UGCO COLLECTIONS (P2-07) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios — solo visualización\n");
  else console.log("");

  if (!DRY) {
    console.log("⚠  ADVERTENCIA: Este script ELIMINARÁ colecciones de producción.");
    console.log("   Ejecuta con --dry-run primero para revisar.\n");
  }

  let deleted = 0, skipped = 0, errors = 0;

  for (const { name, reason } of LEGACY_TO_DELETE) {
    process.stdout.write(`▶ ${name}...`);

    // Safety check
    if (isProtected(name)) {
      console.log(` 🛡️  PROTEGIDA — skipping`);
      skipped++;
      continue;
    }

    // Verificar que realmente tiene 0 registros
    const count = await getRecordCount(name);

    if (count === -1) {
      console.log(` ⚠ No accesible (puede que ya no exista)`);
      skipped++;
      continue;
    }

    if (count > 0) {
      console.log(` ⛔ TIENE ${count} REGISTROS — NO se eliminará`);
      console.log(`   Si deseas eliminarla, hazlo manualmente desde la UI de NocoBase`);
      skipped++;
      continue;
    }

    // 0 registros — eliminar
    console.log(` 0 registros | ${reason}`);

    if (DRY) {
      console.log(`  [DRY-RUN] Eliminaría: ${name}`);
      deleted++;
      continue;
    }

    try {
      await api("POST", `collections:destroy?filterByTk=${name}`);
      console.log(`  ✅ Eliminada`);
      deleted++;
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      errors++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Eliminadas: ${deleted}  ⏭  Saltadas: ${skipped}  ❌ Errores: ${errors}`);

  if (DRY) {
    console.log("\nEjecuta sin --dry-run para aplicar los cambios.");
  } else {
    console.log("\nColecciones UGCO_REF_* preservadas (datos de referencia).");
    console.log("Para reconstruir tablas ALMA, ejecutar etl-alma-ugco.ts cuando esté listo (P3).");
  }
}

main().catch(console.error);
