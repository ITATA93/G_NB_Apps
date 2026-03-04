/**
 * enable-ugco-workflows.ts  (P0-03)
 *
 * Lista y activa los 6 workflows UGCO que fueron creados con enabled: false.
 * Activa en orden de menor a mayor riesgo, con pausa y confirmación entre cada uno.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/enable-ugco-workflows.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/enable-ugco-workflows.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/enable-ugco-workflows.ts --all
 */

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");
const ALL  = process.argv.includes("--all");  // Sin --all activa solo de bajo riesgo

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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

interface Workflow {
  id: number;
  key: string;
  title: string;
  type: string;
  enabled: boolean;
  current: boolean;
  executed: number;
}

// ── Workflows UGCO por orden de activación (riesgo ascendente) ────────────────────
// Estos son los títulos esperados — el script los busca por título
const UGCO_WORKFLOW_ORDER = [
  // Bajo riesgo: solo actualizan datos, no crean efectos secundarios
  { titleHint: "re_estadificacion",        risk: "bajo",  description: "Actualiza snapshot TNM al RE_ESTADIFICAR" },
  { titleHint: "tarea completada",         risk: "bajo",  description: "Crea log al completar tarea" },
  // Medio riesgo: crean registros derivados
  { titleHint: "resolucion",               risk: "medio", description: "Cierra caso al crear evento Resolución" },
  { titleHint: "comite",                   risk: "medio", description: "Crea tarea urgente al presentar en comité" },
  { titleHint: "gatilla_tarea",            risk: "medio", description: "Auto-crea tarea al crear evento" },
  // Alto riesgo: cron que crea múltiples registros
  { titleHint: "inactividad",              risk: "alto",  description: "Alertas diarias por inactividad >30 días (CRON)" },
];

function matchWorkflow(wf: Workflow): { risk: string; description: string } | null {
  const title = wf.title?.toLowerCase() || wf.key?.toLowerCase() || "";
  for (const hint of UGCO_WORKFLOW_ORDER) {
    if (title.includes(hint.titleHint.toLowerCase())) {
      return { risk: hint.risk, description: hint.description };
    }
  }
  return null;
}

async function main(): Promise<void> {
  console.log("=== ENABLE UGCO WORKFLOWS (P0-03) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios");
  if (!ALL) console.log("  Tip: usa --all para activar también los de riesgo alto\n");
  else console.log("");

  // 1. Listar todos los workflows
  const result = await api("GET", "workflows:list?pageSize=100");
  const allWorkflows: Workflow[] = result.data || [];

  console.log(`Total workflows en el sistema: ${allWorkflows.length}`);

  // 2. Filtrar los que parecen UGCO (por título/key) y están desactivados
  const ugcoWorkflows = allWorkflows.filter(wf =>
    (wf.title?.toLowerCase().includes("ugco") ||
     wf.title?.toLowerCase().includes("onco") ||
     wf.title?.toLowerCase().includes("caso") ||
     wf.title?.toLowerCase().includes("episodio") ||
     wf.title?.toLowerCase().includes("tarea") ||
     wf.title?.toLowerCase().includes("comite") ||
     wf.title?.toLowerCase().includes("inactividad") ||
     wf.key?.toLowerCase().includes("ugco"))
  );

  console.log(`Workflows UGCO encontrados: ${ugcoWorkflows.length}`);
  console.log("\n=== ESTADO ACTUAL ===");

  for (const wf of allWorkflows) {
    const icon = wf.enabled ? "✅" : "⏸️ ";
    const risk = matchWorkflow(wf);
    console.log(`  ${icon} [${wf.id}] ${wf.title || wf.key} | type: ${wf.type} | ejecutado: ${wf.executed || 0}x${risk ? ` | riesgo: ${risk.risk}` : ""}`);
  }

  if (allWorkflows.length === 0) {
    console.log("  ⚠ No se encontraron workflows — verifica que el plugin workflows esté activo");
    return;
  }

  // 3. Activar workflows desactivados
  const toActivate = ugcoWorkflows.filter(wf => !wf.enabled && wf.current !== false);

  console.log(`\n=== ACTIVACIÓN (${toActivate.length} pendientes) ===`);

  if (toActivate.length === 0) {
    console.log("  ℹ Todos los workflows UGCO ya están activos");
    return;
  }

  // Ordenar por riesgo (bajo → medio → alto)
  const riskOrder: Record<string, number> = { bajo: 0, medio: 1, alto: 2 };
  toActivate.sort((a, b) => {
    const ra = riskOrder[matchWorkflow(a)?.risk || "medio"] ?? 1;
    const rb = riskOrder[matchWorkflow(b)?.risk || "medio"] ?? 1;
    return ra - rb;
  });

  let ok = 0, skip = 0, fail = 0;

  for (const wf of toActivate) {
    const meta = matchWorkflow(wf);
    const isHighRisk = meta?.risk === "alto";

    if (isHighRisk && !ALL) {
      console.log(`\n  ⏭  [${wf.id}] ${wf.title} — Saltado (riesgo alto, usa --all para activar)`);
      skip++;
      continue;
    }

    console.log(`\n▶ [${wf.id}] ${wf.title}`);
    console.log(`  Tipo: ${wf.type} | Riesgo: ${meta?.risk || "desconocido"}`);
    if (meta?.description) console.log(`  Descripción: ${meta.description}`);

    if (DRY) {
      console.log("  [DRY-RUN] Activaría este workflow");
      ok++;
      continue;
    }

    try {
      await api("POST", `workflows:update?filterByTk=${wf.id}`, { enabled: true });
      console.log(`  ✅ Activado`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Activados: ${ok}  ⏭  Saltados: ${skip}  ❌ Fallidos: ${fail}`);
  if (!ALL && skip > 0) {
    console.log(`\n⚠  ${skip} workflow(s) de alto riesgo no fueron activados.`);
    console.log("   Revisa el log de la sesión anterior y usa --all cuando estés listo.");
  }
}

main().catch(console.error);
