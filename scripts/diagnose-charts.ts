/**
 * diagnose-charts.ts
 * Captures console errors, DOM structure, and network requests for UGCO Dashboard charts.
 * Helps diagnose why ChartV2Block blocks render blank.
 */
import { chromium } from 'playwright';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const BASE_URL = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || 'https://mira.hospitaldeovalle.cl';
const API_TOKEN = process.env.NOCOBASE_API_KEY || '';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const apiRequests: string[] = [];
  const chartRequests: any[] = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Capture network requests
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/') && !url.includes('static')) {
      const short = url.replace('https://mira.hospitaldeovalle.cl/api/', '');
      apiRequests.push(`${req.method()} ${short.split('?')[0]}`);
      if (url.includes('chart') || url.includes('query')) {
        chartRequests.push({ method: req.method(), url, body: req.postData() });
      }
    }
  });

  // Login
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((token) => { localStorage.setItem('NOCOBASE_TOKEN', token); }, API_TOKEN);

  // Navigate to UGCO Dashboard
  await page.goto(`${BASE_URL}/admin/dpjuonzjgna`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll to chart area (Row 4)
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div')) as HTMLElement[];
    for (const div of divs) {
      if (div.scrollHeight > div.clientHeight + 300) {
        div.scrollTop = 3000;
      }
    }
    window.scrollTo(0, 3000);
  });
  await page.waitForTimeout(5000);

  // Capture screenshot
  await page.screenshot({ path: 'docs/ui-validation/screenshots/diagnose-charts.png', fullPage: false });

  // Get DOM structure of chart area
  const chartDom = await page.evaluate(() => {
    // Find elements with ChartCardItem-related classes or data attributes
    const chartCards = document.querySelectorAll('[class*="chart"], [class*="Chart"], [data-testid*="chart"]');
    const results: any[] = [];
    chartCards.forEach(el => {
      results.push({
        tag: el.tagName,
        class: el.className.substring(0, 100),
        text: el.textContent?.substring(0, 200),
        height: (el as HTMLElement).offsetHeight,
        children: el.children.length,
      });
    });

    // Also get ant-card elements (ChartCardItem likely renders as ant-card)
    const cards = document.querySelectorAll('.ant-card');
    const cardResults: any[] = [];
    cards.forEach(el => {
      const body = el.querySelector('.ant-card-body');
      cardResults.push({
        tag: el.tagName,
        class: el.className.substring(0, 80),
        bodyHeight: (body as HTMLElement)?.offsetHeight,
        bodyContent: body?.innerHTML.substring(0, 300),
        title: el.querySelector('.ant-card-head-title')?.textContent,
      });
    });
    return { chartCards: results, antCards: cardResults };
  });

  // Get any NocoBase schema errors from the page
  const pageErrors = await page.evaluate(() => {
    // Look for error boundaries or error messages
    const errors = document.querySelectorAll('[class*="error"], [class*="Error"]');
    const errorTexts: string[] = [];
    errors.forEach(el => {
      if (el.textContent && el.textContent.length > 5) {
        errorTexts.push(el.textContent.substring(0, 200));
      }
    });
    return errorTexts;
  });

  // Report
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors');
  } else {
    consoleErrors.forEach(e => console.log('ERROR:', e));
  }

  console.log('\n=== CHART API REQUESTS ===');
  if (chartRequests.length === 0) {
    console.log('No chart/query requests made');
  } else {
    chartRequests.forEach(r => console.log(r));
  }

  console.log('\n=== ALL API REQUESTS (deduplicated) ===');
  const unique = [...new Set(apiRequests)];
  unique.forEach(r => console.log(r));

  console.log('\n=== ANT-CARD ELEMENTS ===');
  chartDom.antCards.forEach((c: any) => {
    console.log(`Card: "${c.title}" | bodyHeight: ${c.bodyHeight}px`);
    console.log(`  bodyContent: ${c.bodyContent?.substring(0, 200)}`);
  });

  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(e => console.log(e));

  // Save full diagnosis
  const report = {
    consoleErrors,
    chartRequests,
    apiRequests: unique,
    chartDom,
    pageErrors,
  };
  fs.writeFileSync('docs/ui-validation/chart-diagnosis.json', JSON.stringify(report, null, 2));
  console.log('\nDiagnosis saved to docs/ui-validation/chart-diagnosis.json');
  console.log('Screenshot: docs/ui-validation/screenshots/diagnose-charts.png');

  await browser.close();
}

main().catch(console.error);
