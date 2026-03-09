/**
 * Take screenshots of UGCO pages with proper authentication
 * Uses NocoBase signin endpoint for real browser auth
 * v2: Enhanced with more pages and better wait strategy
 */
import "dotenv/config";
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1200 } });
  const page = await context.newPage();

  // Step 1: Auth via API signin to get a proper session token
  console.log("Authenticating...");
  const signinRes = await page.request.post("https://mira.imedicina.cl/api/auth:signIn", {
    data: { account: "admin@nocobase.com", password: "admin123" },
    headers: { "Content-Type": "application/json" },
  });

  let token = "";
  if (signinRes.ok()) {
    const body = await signinRes.json();
    token = body.data?.token || "";
    console.log("Got session token:", token.slice(0, 30) + "...");
  }

  if (!token) {
    // Fallback to API key
    token = process.env.NOCOBASE_MIRA_IMED_API_KEY || "";
    console.log("Using API key as fallback");
  }

  // Set token and navigate
  await page.goto("https://mira.imedicina.cl/admin/");
  await page.evaluate((t) => {
    localStorage.setItem("NOCOBASE_TOKEN", t);
  }, token);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(4000);

  const outDir = "docs/ui-validation/screenshots";
  const ts = Date.now();

  async function navAndScreenshot(name: string, clicks: string[], filename: string, opts?: { scrollY?: number; fullPage?: boolean }) {
    console.log(`Navigating to ${name}...`);
    for (const click of clicks) {
      const el = page.locator("span").filter({ hasText: new RegExp(`^${click}$`) }).first();
      await el.click().catch(() => console.log(`  ⚠️ Could not click "${click}"`));
      await page.waitForTimeout(1000);
    }
    // Wait for data loading
    await page.waitForTimeout(8000);

    if (opts?.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), opts.scrollY);
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: `${outDir}/${filename}`,
      fullPage: opts?.fullPage !== false,
    });
    console.log(`  ✅ ${filename}`);
  }

  // Dashboard - full page
  await navAndScreenshot("Dashboard", ["UGCO", "📊 Dashboard"], `v3-${ts}-dashboard-full.png`, { fullPage: true });

  // Dashboard - charts area (scroll down)
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${outDir}/v3-${ts}-dashboard-charts.png` });
  console.log(`  ✅ v3-${ts}-dashboard-charts.png`);

  // Reportes
  await navAndScreenshot("Reportes", ["📊 Reportes"], `v3-${ts}-reportes.png`, { fullPage: true });

  // Casos Oncológicos
  await navAndScreenshot("Casos Oncológicos", ["Casos Oncológicos"], `v3-${ts}-casos.png`, { fullPage: true });

  // Episodios
  await navAndScreenshot("Episodios", ["Episodios"], `v3-${ts}-episodios.png`, { fullPage: true });

  // Tareas Pendientes
  await navAndScreenshot("Tareas Pendientes", ["Tareas Pendientes"], `v3-${ts}-tareas.png`, { fullPage: true });

  // Ficha 360
  await navAndScreenshot("Ficha 360°", ["🗂️ Ficha 360° Paciente"], `v3-${ts}-ficha360.png`, { fullPage: true });

  // Specialty - Mama
  await navAndScreenshot("Mama", ["Especialidades", "Mama"], `v3-${ts}-mama.png`, { fullPage: true });

  // Specialty - Digestivo Alto
  await navAndScreenshot("Digestivo Alto", ["Digestivo Alto"], `v3-${ts}-digestivo-alto.png`, { fullPage: true });

  // Comité - Sesiones
  await navAndScreenshot("Sesiones de Comité", ["Comité", "Sesiones de Comité"], `v3-${ts}-sesiones-comite.png`, { fullPage: true });

  // Equipos de Seguimiento
  await navAndScreenshot("Equipos", ["Configuración", "Equipos de Seguimiento"], `v3-${ts}-equipos.png`, { fullPage: true });

  await browser.close();
  console.log("\nAll screenshots saved!");
}

main().catch(console.error);
