import "dotenv/config";
const B = process.env.NOCOBASE_BASE_URL!, K = process.env.NOCOBASE_API_KEY!;

async function main() {
  const pw = process.argv[2] || "Imedicine2025!";
  const userId = process.argv[3] || "1";

  const res = await fetch(`${B}/users:update?filterByTk=${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw }),
  });
  console.log("Target:", B.replace("/api", ""));
  console.log("User ID:", userId);
  console.log("Status:", res.status, res.ok ? "OK" : "FAIL");
  if (res.ok) console.log("Password updated successfully");
  else console.log(await res.text());
}
main().catch(e => console.error(e));
