import "dotenv/config";
const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY = process.env.NOCOBASE_API_KEY!;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

const RULES = [
  {
    role: "enfermera_ugco",
    collection: "ugco_casooncologico",
    body: {
      name: "ugco_casooncologico",
      usingConfig: "individual",
      actions: [
        { name: "list", scope: { filter: { fallecido: { $ne: true } } } },
        { name: "get" },
        { name: "create" },
        { name: "update", fields: ["estado_adm_id", "estado_seguimiento_id", "fecha_ultimo_contacto"] },
      ],
    },
  },
  {
    role: "enfermera_gestora_onco",
    collection: "ugco_casooncologico",
    body: {
      name: "ugco_casooncologico",
      usingConfig: "individual",
      actions: [
        { name: "list", scope: { filter: { fallecido: { $ne: true } } } },
        { name: "get" },
        { name: "create" },
        { name: "update", fields: ["estado_adm_id", "estado_seguimiento_id", "estado_clinico_id", "intencion_trat_id", "fecha_ultimo_contacto"] },
      ],
    },
  },
];

async function main() {
  console.log("Applying RLS + FLS...");
  for (const rule of RULES) {
    try {
      await api("POST", `roles/${rule.role}/resources:update?filterByTk=${rule.collection}`, rule.body);
      console.log(`  ✅ ${rule.role} → ${rule.collection} (updated)`);
    } catch (e: any) {
      console.log(`  ℹ️  Update failed, trying create: ${e.message.slice(0, 100)}`);
      try {
        await api("POST", `roles/${rule.role}/resources:create`, rule.body);
        console.log(`  ✅ ${rule.role} → ${rule.collection} (created)`);
      } catch (e2: any) {
        console.error(`  ❌ ${rule.role}: ${e2.message.slice(0, 200)}`);
      }
    }
  }
  console.log("Done.");
}
main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
