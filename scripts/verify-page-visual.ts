/**
 * Visual Page Verifier — Playwright-based verification of NocoBase pages
 *
 * Navigates to a specific page (by route ID or title) and verifies:
 * - Page loads without errors
 * - Expected blocks/components render
 * - Takes screenshots for evidence
 * - Reports console errors
 *
 * Usage:
 *   npx tsx scripts/verify-page-visual.ts --route-id <id>
 *   npx tsx scripts/verify-page-visual.ts --title "Page Title"
 *   npx tsx scripts/verify-page-visual.ts --all
 *
 * Prerequisites:
 *   npx playwright install chromium
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || 'https://mira.hospitaldeovalle.cl';
const API_URL = process.env.NOCOBASE_BASE_URL || `${BASE_URL}/api`;
const API_TOKEN = process.env.NOCOBASE_API_KEY || '';
const OUTPUT_DIR = 'docs/ui-validation';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

interface PageVerification {
    routeId: string | number;
    title: string;
    url: string;
    loaded: boolean;
    hasContent: boolean;
    consoleErrors: string[];
    networkErrors: Array<{ url: string; status: number }>;
    screenshot: string;
    blockCount: number;
    timestamp: string;
}

function ensureDirs() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function parseArgs(): { routeId?: string; title?: string; all?: boolean } {
    const args = process.argv.slice(2);
    const result: { routeId?: string; title?: string; all?: boolean } = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--route-id' && args[i + 1]) result.routeId = args[++i];
        if (args[i] === '--title' && args[i + 1]) result.title = args[++i];
        if (args[i] === '--all') result.all = true;
    }
    return result;
}

async function fetchRoutes(): Promise<Array<{ id: string | number; title: string; schemaUid?: string }>> {
    const res = await fetch(`${API_URL}/desktopRoutes:list?pageSize=200`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'X-Role': 'root',
        },
    });
    const json = await res.json() as { data?: Array<Record<string, unknown>> };
    return (json.data || []).map((r) => ({
        id: r.id as string | number,
        title: String(r.title || ''),
        schemaUid: r.schemaUid as string | undefined,
    }));
}

async function setupAuthenticatedContext(browser: Browser): Promise<BrowserContext> {
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
    });

    // Set auth token via cookie and localStorage
    await context.addCookies([{
        name: 'NOCOBASE_TOKEN',
        value: API_TOKEN,
        domain: new URL(BASE_URL).hostname,
        path: '/',
    }]);

    return context;
}

async function authenticatePage(page: Page): Promise<boolean> {
    // Navigate to admin and inject token via localStorage
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Inject auth token into localStorage (NocoBase stores it there)
    await page.evaluate((token) => {
        localStorage.setItem('NOCOBASE_TOKEN', token);
    }, API_TOKEN);

    // Reload with token
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });

    // Check if we're authenticated (no login form visible)
    const hasLoginForm = await page.locator('input[name="username"], input[type="email"]').isVisible().catch(() => false);
    return !hasLoginForm;
}

async function verifyPage(
    page: Page,
    route: { id: string | number; title: string; schemaUid?: string },
): Promise<PageVerification> {
    const result: PageVerification = {
        routeId: route.id,
        title: route.title,
        url: `${BASE_URL}/admin/${route.schemaUid || route.id}`,
        loaded: false,
        hasContent: false,
        consoleErrors: [],
        networkErrors: [],
        screenshot: '',
        blockCount: 0,
        timestamp: new Date().toISOString(),
    };

    const consoleHandler = (msg: import('playwright').ConsoleMessage) => {
        if (msg.type() === 'error') {
            result.consoleErrors.push(msg.text());
        }
    };

    const responseHandler = (response: import('playwright').Response) => {
        if (response.status() >= 400) {
            result.networkErrors.push({ url: response.url(), status: response.status() });
        }
    };

    page.on('console', consoleHandler);
    page.on('response', responseHandler);

    try {
        // Navigate to the page via admin route
        const pageUrl = `${BASE_URL}/admin/${route.schemaUid || route.id}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
        result.loaded = true;

        // Wait for NocoBase to render
        await page.waitForTimeout(2000);

        // Check for content — NocoBase renders blocks inside .nb-block-item or CardItem
        const blocks = await page.locator('[class*="nb-block"], [class*="CardItem"], [class*="Grid"], [class*="ant-table"], [class*="Markdown"]').count();
        result.blockCount = blocks;
        result.hasContent = blocks > 0;

        // Check for empty page indicator
        const isEmpty = await page.locator('text=/No data|No content|空/i').isVisible().catch(() => false);
        if (isEmpty && blocks === 0) {
            result.hasContent = false;
        }

        // Take screenshot
        const safeTitle = route.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
        const screenshotPath = path.join(SCREENSHOTS_DIR, `verify-${route.id}-${safeTitle}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshot = screenshotPath;

    } catch (err: unknown) {
        result.consoleErrors.push(`Navigation error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        page.off('console', consoleHandler);
        page.off('response', responseHandler);
    }

    return result;
}

async function main() {
    ensureDirs();
    const args = parseArgs();

    if (!args.routeId && !args.title && !args.all) {
        console.log('Usage:');
        console.log('  npx tsx scripts/verify-page-visual.ts --route-id <id>');
        console.log('  npx tsx scripts/verify-page-visual.ts --title "Page Title"');
        console.log('  npx tsx scripts/verify-page-visual.ts --all');
        process.exit(0);
    }

    console.log('Fetching routes from NocoBase...');
    const allRoutes = await fetchRoutes();
    console.log(`Found ${allRoutes.length} routes`);

    // Filter routes based on args
    let targetRoutes = allRoutes;
    if (args.routeId) {
        targetRoutes = allRoutes.filter(r => String(r.id) === args.routeId);
    } else if (args.title) {
        targetRoutes = allRoutes.filter(r => r.title.toLowerCase().includes(args.title!.toLowerCase()));
    } else if (args.all) {
        // Only verify routes with schemas (actual pages)
        targetRoutes = allRoutes.filter(r => r.schemaUid);
    }

    if (targetRoutes.length === 0) {
        console.log('No matching routes found.');
        process.exit(1);
    }

    console.log(`Verifying ${targetRoutes.length} page(s)...\n`);

    let browser: Browser | null = null;
    const results: PageVerification[] = [];

    try {
        browser = await chromium.launch({ headless: true });
        const context = await setupAuthenticatedContext(browser);
        const page = await context.newPage();

        // Authenticate
        console.log('Authenticating...');
        const authed = await authenticatePage(page);
        if (!authed) {
            console.log('WARNING: Could not authenticate automatically. Results may be limited.');
        } else {
            console.log('Authenticated successfully.\n');
        }

        // Verify each page
        for (const route of targetRoutes) {
            process.stdout.write(`  [${route.id}] ${route.title}... `);
            const result = await verifyPage(page, route);
            results.push(result);

            const status = result.hasContent ? 'OK' : (result.loaded ? 'EMPTY' : 'FAIL');
            const errors = result.consoleErrors.length > 0 ? ` (${result.consoleErrors.length} errors)` : '';
            console.log(`${status} — ${result.blockCount} blocks${errors}`);
        }

        await context.close();
    } finally {
        if (browser) await browser.close();
    }

    // Generate report
    const passed = results.filter(r => r.loaded && r.hasContent).length;
    const empty = results.filter(r => r.loaded && !r.hasContent).length;
    const failed = results.filter(r => !r.loaded).length;
    const totalErrors = results.reduce((sum, r) => sum + r.consoleErrors.length, 0);

    console.log('\n' + '='.repeat(60));
    console.log('VISUAL VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`Pages verified: ${results.length}`);
    console.log(`  Passed (content renders): ${passed}`);
    console.log(`  Empty (no blocks):        ${empty}`);
    console.log(`  Failed (did not load):    ${failed}`);
    console.log(`  Console errors total:     ${totalErrors}`);
    console.log('='.repeat(60));

    // Save JSON report
    const reportPath = path.join(OUTPUT_DIR, `visual-verification-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), summary: { passed, empty, failed, totalErrors }, results }, null, 2));
    console.log(`\nReport saved: ${reportPath}`);

    // Save markdown report
    const mdLines = [
        '# Visual Verification Report',
        '',
        `**Date**: ${new Date().toISOString()}`,
        `**Server**: ${BASE_URL}`,
        '',
        `| Status | Count |`,
        `|--------|-------|`,
        `| Passed | ${passed} |`,
        `| Empty | ${empty} |`,
        `| Failed | ${failed} |`,
        `| Console Errors | ${totalErrors} |`,
        '',
        '## Details',
        '',
        '| Route ID | Title | Status | Blocks | Errors | Screenshot |',
        '|----------|-------|--------|--------|--------|------------|',
        ...results.map(r => {
            const status = r.hasContent ? 'OK' : (r.loaded ? 'EMPTY' : 'FAIL');
            return `| ${r.routeId} | ${r.title} | ${status} | ${r.blockCount} | ${r.consoleErrors.length} | ${r.screenshot ? 'Yes' : 'No'} |`;
        }),
    ];

    const mdPath = path.join(OUTPUT_DIR, `visual-verification-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdLines.join('\n'));
    console.log(`Report (MD): ${mdPath}`);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('FATAL:', err instanceof Error ? err.message : String(err));
    process.exit(1);
});
