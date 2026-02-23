/**
 * Script de Validación UI de NocoBase con Playwright
 * 
 * PROPÓSITO:
 * - Abrir NocoBase en navegador automatizado
 * - Capturar errores de consola
 * - Verificar elementos UI del blueprint
 * - Generar reporte automático con screenshots
 * 
 * INSTALACIÓN:
 * npm install --save-dev @playwright/test
 * npx playwright install chromium
 * 
 * USO:
 * npx tsx scripts/validate-ui-browser.ts
 */

import { chromium, Browser, Page, ConsoleMessage } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const NOCOBASE_URL = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || 'https://mira.hospitaldeovalle.cl';
const REPORT_DIR = 'docs/ui-validation';
const SCREENSHOTS_DIR = path.join(REPORT_DIR, 'screenshots');

// Asegurar que existen los directorios
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

interface ValidationResult {
  timestamp: string;
  url: string;
  errors: string[];
  warnings: string[];
  networkErrors: Array<{ url: string; status: number; statusText: string }>;
  menuItems: string[];
  collectionsFound: string[];
  rolesFound: string[];
  screenshots: string[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    totalNetworkFailures: number;
    uiLoaded: boolean;
    functionalityWorking: boolean;
  };
}

async function validateNocoBaseUI(): Promise<ValidationResult> {
  const result: ValidationResult = {
    timestamp: new Date().toISOString(),
    url: NOCOBASE_URL,
    errors: [],
    warnings: [],
    networkErrors: [],
    menuItems: [],
    collectionsFound: [],
    rolesFound: [],
    screenshots: [],
    summary: {
      totalErrors: 0,
      totalWarnings: 0,
      totalNetworkFailures: 0,
      uiLoaded: false,
      functionalityWorking: false,
    },
  };

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Iniciando validación UI de NocoBase...');
    console.log(`📍 URL: ${NOCOBASE_URL}\n`);

    // Lanzar navegador
    browser = await chromium.launch({ headless: false }); // headless: false para ver qué pasa
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: SCREENSHOTS_DIR },
    });
    page = await context.newPage();

    // Capturar errores de consola
    page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
        result.errors.push(text);
      } else if (type === 'warning') {
        console.log(`⚠️  Console Warning: ${text}`);
        result.warnings.push(text);
      }
    });

    // Capturar fallos de red
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        const error = {
          url: response.url(),
          status,
          statusText: response.statusText(),
        };
        console.log(`🔴 Network Error: ${status} ${response.url()}`);
        result.networkErrors.push(error);
      }
    });

    // PASO 1: Cargar página inicial
    console.log('📄 Cargando página inicial...');
    await page.goto(NOCOBASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    result.summary.uiLoaded = true;

    // Screenshot 1: Página inicial
    const screenshot1 = path.join(SCREENSHOTS_DIR, '01-initial-load.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    result.screenshots.push(screenshot1);
    console.log('✅ Página cargada');

    // PASO 2: Verificar si necesita login
    const loginVisible = await page.locator('input[type="text"], input[type="email"], input[name="username"]').isVisible().catch(() => false);
    
    if (loginVisible) {
      console.log('🔐 Detectado formulario de login - requiere autenticación manual');
      console.log('⚠️  Este script no puede autenticarse automáticamente por seguridad.');
      console.log('    Por favor, inicia sesión manualmente y luego ejecuta la parte 2 del script.');
      
      const screenshot2 = path.join(SCREENSHOTS_DIR, '02-login-form.png');
      await page.screenshot({ path: screenshot2 });
      result.screenshots.push(screenshot2);
    } else {
      console.log('✅ Ya autenticado o no requiere login');

      // PASO 3: Extraer elementos del menú
      console.log('\n🧭 Extrayendo elementos del menú...');
      try {
        await page.waitForSelector('[class*="Menu"], [role="navigation"], nav', { timeout: 5000 });
        const menuTexts = await page.locator('[class*="MenuItem"], [role="menuitem"], nav a').allTextContents();
        result.menuItems = menuTexts.filter(text => text.trim().length > 0);
        console.log(`   Encontrados ${result.menuItems.length} items de menú`);
        result.menuItems.forEach((item, i) => console.log(`   ${i + 1}. ${item}`));
      } catch (e) {
        console.log('⚠️  No se pudo extraer menú:', e);
      }

      const screenshot3 = path.join(SCREENSHOTS_DIR, '03-dashboard.png');
      await page.screenshot({ path: screenshot3, fullPage: true });
      result.screenshots.push(screenshot3);

      // PASO 4: Verificar colecciones (si es accesible)
      console.log('\n📦 Intentando acceder a Colecciones...');
      try {
        // Buscar enlace a collections/configuración
        const collectionsLink = page.locator('text=/Collections|Colecciones|Configuration|Configuración/i').first();
        if (await collectionsLink.isVisible({ timeout: 3000 })) {
          await collectionsLink.click();
          await page.waitForTimeout(2000);

          const screenshot4 = path.join(SCREENSHOTS_DIR, '04-collections.png');
          await page.screenshot({ path: screenshot4, fullPage: true });
          result.screenshots.push(screenshot4);

          // Extraer nombres de colecciones
          const collectionNames = await page.locator('[class*="collection"], [data-testid*="collection"]').allTextContents();
          result.collectionsFound = collectionNames.filter(name => name.trim().length > 0);
          console.log(`   Encontradas ${result.collectionsFound.length} colecciones`);
        }
      } catch (e) {
        console.log('⚠️  No se pudo acceder a colecciones:', e);
      }

      result.summary.functionalityWorking = true;
    }

    // Resumen de errores
    result.summary.totalErrors = result.errors.length;
    result.summary.totalWarnings = result.warnings.length;
    result.summary.totalNetworkFailures = result.networkErrors.length;

  } catch (error: any) {
    console.error('❌ Error fatal durante validación:', error);
    result.errors.push(`Fatal error: ${error.message}`);
    
    if (page) {
      const errorScreenshot = path.join(SCREENSHOTS_DIR, '99-error.png');
      await page.screenshot({ path: errorScreenshot }).catch(() => {});
      result.screenshots.push(errorScreenshot);
    }
  } finally {
    // Cerrar navegador
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

async function generateReport(result: ValidationResult) {
  console.log('\n📊 Generando reporte...');

  const reportPath = path.join(REPORT_DIR, `validation-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

  // Reporte Markdown
  const mdReport = `
# 🌐 Reporte de Validación UI - NocoBase

**Fecha**: ${result.timestamp}  
**URL**: ${result.url}

---

## 📊 Resumen

| Métrica | Valor |
|---------|-------|
| **UI Cargada** | ${result.summary.uiLoaded ? '✅ Sí' : '❌ No'} |
| **Funcional** | ${result.summary.functionalityWorking ? '✅ Sí' : '⚠️ Requiere Login'} |
| **Errores de Consola** | ${result.summary.totalErrors} |
| **Advertencias** | ${result.summary.totalWarnings} |
| **Fallos de Red** | ${result.summary.totalNetworkFailures} |

---

## ❌ Errores de Consola (${result.errors.length})

${result.errors.length > 0 ? result.errors.map((err, i) => `${i + 1}. \`${err}\``).join('\n') : '_Ninguno detectado_'}

---

## ⚠️ Advertencias (${result.warnings.length})

${result.warnings.length > 0 ? result.warnings.slice(0, 10).map((warn, i) => `${i + 1}. \`${warn}\``).join('\n') : '_Ninguna detectada_'}

---

## 🔴 Fallos de Red (${result.networkErrors.length})

${result.networkErrors.length > 0 ? result.networkErrors.map((err, i) => `${i + 1}. **${err.status}** ${err.statusText} - \`${err.url}\``).join('\n') : '_Ninguno detectado_'}

---

## 🧭 Elementos del Menú (${result.menuItems.length})

${result.menuItems.length > 0 ? result.menuItems.map((item, i) => `${i + 1}. ${item}`).join('\n') : '_No extraído_'}

---

## 📦 Colecciones Detectadas (${result.collectionsFound.length})

${result.collectionsFound.length > 0 ? result.collectionsFound.map((col, i) => `${i + 1}. ${col}`).join('\n') : '_No extraído_'}

---

## 📸 Capturas de Pantalla

${result.screenshots.map((path, i) => `${i + 1}. \`${path}\``).join('\n')}

---

**Reporte completo (JSON)**: \`${reportPath}\`
`;

  const mdReportPath = path.join(REPORT_DIR, `validation-report-${Date.now()}.md`);
  fs.writeFileSync(mdReportPath, mdReport);

  console.log(`✅ Reporte JSON: ${reportPath}`);
  console.log(`✅ Reporte MD: ${mdReportPath}`);
  console.log(`📸 Screenshots en: ${SCREENSHOTS_DIR}`);

  // Resumen en consola
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 RESUMEN DE VALIDACIÓN');
  console.log('═'.repeat(60));
  console.log(`UI Cargada:        ${result.summary.uiLoaded ? '✅' : '❌'}`);
  console.log(`Funcional:         ${result.summary.functionalityWorking ? '✅' : '⚠️'}`);
  console.log(`Errores:           ${result.summary.totalErrors}`);
  console.log(`Advertencias:      ${result.summary.totalWarnings}`);
  console.log(`Fallos de Red:     ${result.summary.totalNetworkFailures}`);
  console.log(`Items de Menú:     ${result.menuItems.length}`);
  console.log(`Colecciones:       ${result.collectionsFound.length}`);
  console.log('═'.repeat(60) + '\n');

  if (result.summary.totalErrors === 0 && result.summary.uiLoaded) {
    console.log('🎉 ¡VALIDACIÓN EXITOSA! No se detectaron errores críticos.');
  } else if (result.summary.totalErrors > 0) {
    console.log('⚠️  Se detectaron errores. Revisa el reporte para más detalles.');
  }
}

// Ejecutar validación
validateNocoBaseUI()
  .then(generateReport)
  .catch(console.error);
