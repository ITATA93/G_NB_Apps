/**
 * Configure page visibility per UGCO role
 *
 * Uses DYNAMIC route lookup by title (not hardcoded IDs) so it works across instances.
 *
 * Matrix:
 * - ALL roles: Dashboard, Casos Oncológicos, Episodios, Tareas Pendientes
 * - Clinical (not administrativa): Comité, Especialidades (all 9), Ficha 360°
 * - Jefatura + Ref. Técnico: Reportes
 * - Jefatura only: Configuración (Catálogos, Equipos, REF)
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/set-page-visibility.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing env vars"); process.exit(1); }

let okCount = 0, errCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════════════════════
// PAGE SETS (by title pattern)
// ═══════════════════════════════════════════════════════════

// Titles that all roles see
const COMMON_TITLES = [
  "UGCO",                  // root group
  "Dashboard",             // matches "📊 Dashboard"
  "Casos Oncológicos",
  "Episodios",
  "Tareas Pendientes",
];

// Titles for clinical roles
const CLINICAL_TITLES = [
  "Comité",                // group
  "Sesiones de Comité",
  "Casos en Comité",
  "Especialidades",        // group
  "Digestivo Alto",
  "Digestivo Bajo",
  "Mama",
  "Ginecología",
  "Urología",
  "Tórax",
  "Piel y Partes Blandas",
  "Endocrinología",
  "Hematología",
  "Ficha 360",             // matches "🗂️ Ficha 360° Paciente"
];

const REPORTES_TITLES = ["Reportes"];

const CONFIG_TITLES = [
  "Configuración",         // group
  "Especialidades (Catálogo)",
  "Equipos de Seguimiento",
  "Catálogos REF",
];

// ═══════════════════════════════════════════════════════════
// ROLE → TITLE SETS
// ═══════════════════════════════════════════════════════════

const ROLE_SETS: { role: string; titleSets: string[][] }[] = [
  // Jefatura: everything
  { role: "ugco_enfermera_jefe",        titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES, CONFIG_TITLES] },
  { role: "ugco_medico_jefe",           titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES, CONFIG_TITLES] },
  { role: "ugco_enfermera_subrogante",  titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES, CONFIG_TITLES] },
  { role: "ugco_medico_subrogante",     titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES, CONFIG_TITLES] },
  // Enfermera Gestora: common + clinical + reportes
  { role: "ugco_enfermera_gestora",     titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES] },
  // Médico Referente: common + clinical
  { role: "ugco_medico_referente",      titleSets: [COMMON_TITLES, CLINICAL_TITLES] },
  // Médico Ref. Técnico: common + clinical + reportes
  { role: "ugco_medico_ref_tecnico",    titleSets: [COMMON_TITLES, CLINICAL_TITLES, REPORTES_TITLES] },
  // TENS Gestora: common + clinical
  { role: "ugco_tens_gestora",          titleSets: [COMMON_TITLES, CLINICAL_TITLES] },
  // Administrativa: common only
  { role: "ugco_administrativa",        titleSets: [COMMON_TITLES] },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Page Visibility per Role                     ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // Fetch all routes dynamically
  const allRoutes = await api("GET", "desktopRoutes:list?pageSize=200&sort=id");
  const routeData: any[] = allRoutes.data || [];

  // Build lookup: find route by title (partial match)
  function findRoutesByTitles(titles: string[]): number[] {
    const ids: number[] = [];
    for (const title of titles) {
      const matches = routeData.filter((r: any) =>
        r.title && !r.hidden && r.title.includes(title)
      );
      for (const m of matches) {
        ids.push(m.id);
      }
    }
    return ids;
  }

  // For each page, find its direct hidden tab children
  function getHiddenTabChildren(parentId: number): number[] {
    return routeData
      .filter((r: any) => r.parentId === parentId && r.hidden === true && r.type === "tabs")
      .map((r: any) => r.id);
  }

  for (const { role, titleSets } of ROLE_SETS) {
    // Resolve titles to route IDs
    const allTitles = titleSets.flat();
    const pageIds = findRoutesByTitles(allTitles);

    // Expand pages to include hidden tab children
    const expandedIds = new Set<number>();
    for (const pageId of pageIds) {
      expandedIds.add(pageId);
      const route = routeData.find((r: any) => r.id === pageId);
      if (route && route.type !== "group") {
        for (const tabId of getHiddenTabChildren(pageId)) {
          expandedIds.add(tabId);
        }
      }
    }
    const allIds = [...expandedIds];

    // Remove existing route associations
    try {
      const existing = await api("GET", `roles/${role}/desktopRoutes:list?pageSize=200`);
      const existingIds = (existing.data || []).map((r: any) => r.id);
      if (existingIds.length > 0) {
        await api("POST", `roles/${role}/desktopRoutes:remove`, { tk: existingIds });
      }
    } catch { /* ignore */ }

    // Add the new routes
    try {
      await api("POST", `roles/${role}/desktopRoutes:add`, { tk: allIds });
      console.log(`  ✅ ${role}: ${allIds.length} routes (${pageIds.length} pages + ${allIds.length - pageIds.length} tabs)`);
    } catch (e: any) {
      console.error(`  ❌ ${role}: ${e.message.slice(0, 200)}`);
      errCount++;
    }
  }

  // Ensure admin/member/root see all pages
  console.log("\n── Ensuring admin/member/root see all pages ──");
  const allIds = routeData.map((r: any) => r.id);
  for (const role of ["admin", "member", "root"]) {
    try {
      await api("POST", `roles/${role}/desktopRoutes:add`, { tk: allIds });
      console.log(`  ✅ ${role}: ${allIds.length} routes`);
    } catch (e: any) {
      console.error(`  ❌ ${role}: ${e.message.slice(0, 200)}`);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
