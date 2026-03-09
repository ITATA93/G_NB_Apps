/**
 * Quick connectivity check for a target NocoBase instance
 * Usage: NOCOBASE_BASE_URL=... NOCOBASE_API_KEY=... npx tsx Apps/UGCO/scripts/nocobase/check-target.ts
 */

// Load .env but don't override existing env vars
import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

async function main() {
  console.log("Target:", BASE);
  console.log("Key:", KEY.slice(0, 30) + "...");

  // 1. Check API health
  const res = await fetch(`${BASE}/app:getLang`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  console.log("\nAPI health:", res.status, res.ok ? "OK" : "FAIL");

  // 2. Count collections
  const cols = await fetch(`${BASE}/collections:list?pageSize=200`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const colData = await cols.json();
  const allCols = (colData.data || []).filter((c: any) => !c.name.startsWith("_"));
  console.log("Collections:", allCols.length);

  // 3. Count routes
  const routes = await fetch(`${BASE}/desktopRoutes:list?pageSize=200`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const routeData = await routes.json();
  console.log("Routes:", (routeData.data || []).length);

  // 4. Count roles
  const roles = await fetch(`${BASE}/roles:list?pageSize=50`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const roleData = await roles.json();
  console.log("Roles:", (roleData.data || []).map((r: any) => r.name).join(", "));

  console.log("\nReady for deployment:", allCols.length <= 10 ? "YES (clean instance)" : "WARNING: instance has existing data");
}
main().catch(e => { console.error("Connection failed:", e.message); process.exit(1); });
