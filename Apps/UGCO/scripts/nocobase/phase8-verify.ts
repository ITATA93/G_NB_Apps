/**
 * Phase 8 — Quick verification: list all routes and check API health
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase8-verify.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

async function api(path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return JSON.parse(text);
}

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 8 — Verification                       ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // 1. Check routes
  console.log("── Routes ──\n");
  const routes = await api("desktopRoutes:list?pageSize=100&sort=id");
  const allRoutes = routes.data || [];
  const pages = allRoutes.filter((r: any) => r.type === "page" && !r.hidden);
  const groups = allRoutes.filter((r: any) => r.type === "group");
  const tabs = allRoutes.filter((r: any) => r.type === "tabs");

  console.log(`  Total routes: ${allRoutes.length}`);
  console.log(`  Groups: ${groups.length}`);
  console.log(`  Pages: ${pages.length}`);
  console.log(`  Tabs: ${tabs.length}`);

  console.log("\n  Menu structure:");
  for (const r of allRoutes) {
    if (r.hidden) continue;
    const indent = r.parentId ? (groups.find((g: any) => g.id === r.parentId)?.parentId ? "      " : "    ") : "  ";
    console.log(`${indent}${r.type === "group" ? "📁" : "📄"} ${r.title} (${r.id})`);
  }

  // 2. Check collections
  console.log("\n── Collections ──\n");
  const cols = await api("collections:list?pageSize=200");
  const allCols = (cols.data || []).filter((c: any) => !c.name.startsWith("_"));

  const refCols = allCols.filter((c: any) => c.name.startsWith("ref_"));
  const ugcoCols = allCols.filter((c: any) => c.name.startsWith("ugco_"));
  const almaCols = allCols.filter((c: any) => c.name.startsWith("alma_"));
  const systemCols = allCols.filter((c: any) => !c.name.startsWith("ref_") && !c.name.startsWith("ugco_") && !c.name.startsWith("alma_"));

  console.log(`  REF catalogs: ${refCols.length}`);
  console.log(`  UGCO operational: ${ugcoCols.length}`);
  console.log(`  ALMA integration: ${almaCols.length}`);
  console.log(`  System/other: ${systemCols.length}`);
  console.log(`  Total: ${allCols.length}`);

  // 3. Check roles
  console.log("\n── Roles ──\n");
  const roles = await api("roles:list?pageSize=50");
  const ugcoRoles = (roles.data || []).filter((r: any) =>
    r.name.includes("ugco") || r.name.includes("onco") || r.name.includes("medico")
  );
  for (const r of ugcoRoles) {
    console.log(`  ✅ ${r.name}: ${r.title}`);
  }

  // 4. Check sample data in REF tables
  console.log("\n── Seed Data ──\n");
  const refSamples = ["ref_oncoespecialidad", "ref_oncoestadocaso", "ref_cie10", "ref_oncoecog"];
  for (const col of refSamples) {
    try {
      const count = await api(`${col}:count`);
      console.log(`  ${col}: ${count.data} rows`);
    } catch (e: any) {
      console.log(`  ${col}: ❌ ${e.message}`);
    }
  }

  // 5. Check page schemas render (try fetching a schema)
  console.log("\n── Schema Health ──\n");
  for (const page of pages.slice(0, 5)) {
    if (!page.schemaUid) continue;
    try {
      await api(`uiSchemas:getJsonSchema/${page.schemaUid}`);
      console.log(`  ✅ ${page.title} (${page.schemaUid})`);
    } catch {
      console.log(`  ❌ ${page.title} (${page.schemaUid})`);
    }
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log("Verification complete.");
  console.log(`URL: ${BASE.replace("/api", "")}/admin/`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
