import { chromium } from 'playwright';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || 'https://mira.hospitaldeovalle.cl';
const API_TOKEN = process.env.NOCOBASE_API_KEY || '';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const apiRequests: string[] = [];
  page.on('request', req => {
    if (req.url().includes('/api/') && !req.url().includes('static')) {
      const short = req.url().replace('https://mira.hospitaldeovalle.cl/api/', '');
      apiRequests.push(`${req.method()} ${short.split('?')[0]}`);
    }
  });

  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((token) => { localStorage.setItem('NOCOBASE_TOKEN', token); }, API_TOKEN);

  await page.goto(`${BASE_URL}/admin/dpjuonzjgna`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Scroll to show chart row (Row 4 is approximately 1800px from top)
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div')) as HTMLElement[];
    for (const div of divs) {
      if (div.scrollHeight > div.clientHeight + 300) {
        div.scrollTop = 1500;
      }
    }
  });
  await page.waitForTimeout(7000);

  // Check if any chart-related requests were made
  const chartReqs = apiRequests.filter(r => r.includes('chart') || r.includes('query'));
  console.log('Chart API requests:', chartReqs.length > 0 ? chartReqs : 'NONE');
  console.log('All API requests:', [...new Set(apiRequests)].slice(0, 25));

  await page.screenshot({ path: 'docs/ui-validation/screenshots/dashboard-charts-scroll.png', fullPage: false });
  console.log('Screenshot saved');
  await browser.close();
}

main().catch(console.error);
