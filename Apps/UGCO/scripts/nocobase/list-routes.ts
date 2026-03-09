import "dotenv/config";
const B = process.env.NOCOBASE_BASE_URL!, K = process.env.NOCOBASE_API_KEY!;

async function main() {
  const res = await fetch(`${B}/desktopRoutes:list?pageSize=100&sort=id`, {
    headers: { Authorization: `Bearer ${K}` },
  });
  const data = await res.json();
  const all = data.data || [];

  console.log("All routes:\n");
  for (const r of all) {
    if (r.hidden) continue;
    const indent = r.parentId ? "    " : "";
    const icon = r.type === "group" ? "📁" : "📄";
    console.log(`${indent}${icon} ${r.title || "(no title)"} [id=${r.id}] type=${r.type}`);
  }

  // Also check allowMenuItemIds from roles:check
  console.log("\n\nCurrent allowMenuItemIds:");
  const check = await fetch(`${B}/roles:check`, {
    headers: { Authorization: `Bearer ${K}` },
  });
  const cd = await check.json();
  console.log(JSON.stringify(cd.data?.allowMenuItemIds, null, 2));
}
main().catch(e => console.error(e));
