import "dotenv/config";
const B = process.env.NOCOBASE_BASE_URL!, K = process.env.NOCOBASE_API_KEY!;

async function main() {
  const res = await fetch(`${B}/users:list?pageSize=50`, {
    headers: { Authorization: `Bearer ${K}` },
  });
  const d = await res.json();
  console.log("Users on", B.replace("/api", ""));
  for (const u of (d.data || [])) {
    console.log(`  id=${u.id} | email=${u.email} | username=${u.username} | nickname=${u.nickname} | phone=${u.phone}`);
  }
  if ((d.data || []).length === 0) console.log("  (no users found)");
}
main().catch(e => console.error(e));
