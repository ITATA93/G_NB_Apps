
/**
 * Unified E2E Injection Test (Playwright Version)
 * 
 * PURPOSE:
 * 1. Inject data via API (Write)
 * 2. Login to UI (Headless)
 * 3. Verify data appears in Browser UI via Playwright
 * 4. Clean up data via API (Delete)
 */

import { chromium } from 'playwright';
import * as dotenv from 'dotenv';
import { ApiClient } from '../shared/scripts/ApiClient.js';

dotenv.config();

const NOCOBASE_URL = process.env.NOCOBASE_BASE_URL?.replace('/api', '') || 'https://mira.hospitaldeovalle.cl';
const TEST_COLLECTION = 'departments'; 
const TEST_TITLE = `AUTO_TEST_${Date.now()}`;

// Credentials provided by user
const VISUAL_USER = 'Matias'; 
const VISUAL_PASS = 'Marcus133+';

async function runTest() {
  console.log('🚀 Starting Unified E2E Injection Test (Headless + Login)...');
  
  // 1. INJECT DATA
  console.log(`\n💉 STEP 1: Injecting data into '${TEST_COLLECTION}'...`);
  const api = new ApiClient();
  let createdRecord: any = null;

  try {
    createdRecord = await api.post(TEST_COLLECTION, {
      title: TEST_TITLE,
      name: TEST_TITLE
    });
    console.log(`✅ Record created. Response:`, JSON.stringify(createdRecord, null, 2));

    const recordId = createdRecord?.data?.id || createdRecord?.id;
    if (!recordId) {
        console.error('❌ ID not returned in creation response.');
        process.exit(1);
    }
    createdRecord = { id: recordId }; 

  } catch (e: any) {
    console.error('❌ API Injection Failed:', e.message);
    process.exit(1);
  }

  // 2. VERIFY IN BROWSER
  console.log(`\n🌍 STEP 2: Verifying in Browser (Playwright Headless)...`);
  let browser;
  try {
      browser = await chromium.launch({ headless: true }); 
      const context = await browser.newContext();
      const page = await context.newPage();

      // A. Login Flow
      console.log(`   Navigating to Login: ${NOCOBASE_URL}/signin...`);
      await page.goto(`${NOCOBASE_URL}/signin`, { waitUntil: 'domcontentloaded' });
      
      console.log('   Attempting Login...');
      // Wait for inputs
      // await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.waitForTimeout(2000); // Wait for render

      // DEBUG: Print form HTML to identifying selectors
      const formHtml = await page.evaluate(() => document.querySelector('form')?.outerHTML || document.body.innerHTML);
      console.log('   DEBUG: Login Form HTML:', formHtml.substring(0, 500)); // Log first 500 chars

      // Fill credentials (using robust selectors)
      // Try to find by placeholder or name if possible
      await page.fill('input[name="auth"]', VISUAL_USER).catch(() => page.fill('input[type="text"]', VISUAL_USER)); 
      await page.fill('input[type="password"]', VISUAL_PASS);
      
      // Click Login
      await page.click('button[type="submit"]');
      
      // Wait for Dashboard/Redirect
      await page.waitForURL(`**/admin/**`, { timeout: 15000 });
      console.log('✅ Login Successful (Redirected to Admin area)');

      // B. Verify Data
      console.log(`   Navigating to Collection: ${NOCOBASE_URL}/admin/collections/departments...`);
      await page.goto(`${NOCOBASE_URL}/admin/collections/departments`, { waitUntil: 'networkidle', timeout: 30000 });

      console.log('   Checking UI for injected content...');
      
      try {
          // Check for the text anywhere in the body
          await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 15000 });
          console.log(`🎉 SUCCESS: Found text "${TEST_TITLE}" in the UI!`);
          
          await page.screenshot({ path: 'docs/e2e-success.png' });
          console.log('   Screenshot saved: docs/e2e-success.png');

      } catch (timeout) {
          console.error(`❌ FAILURE: Text "${TEST_TITLE}" NOT found in UI.`);
          await page.screenshot({ path: 'docs/e2e-failure.png' });
          console.log('   Screenshot saved: docs/e2e-failure.png');
          
          // Debug: Dump context
          const text = await page.evaluate(() => document.body.innerText);
          console.log('\n--- PAGE TEXT DUMP (First 1000 chars) ---');
          console.log(text.substring(0, 1000));
          console.log('-----------------------------------------\n');

          const html = await page.content();
          console.log('\n--- PAGE HTML DUMP (Table/List Context) ---');
          // Try to find if there is a table or list
          if (html.includes('ant-table') || html.includes('nb-block')) {
              console.log('Table/Block Detected directly in HTML source.');
          } else {
              console.log('No standard table/block classes found in HTML source.');
          }
          console.log('-------------------------------------------\n');
      }

  } catch (e: any) {
      console.error('❌ Browser Error:', e.message);
      if (browser) await browser.close();
  } finally {
      if (browser) await browser.close();
  }

  // 3. CLEANUP
  await cleanup(api, createdRecord.id);
}

async function cleanup(api: ApiClient, id: any) {
    console.log(`\n🧹 STEP 3: Cleaning up ID: ${id}...`);
    try {
        await api.delete(`${TEST_COLLECTION}/${id}`);
        console.log('✅ Test record deleted.');
    } catch (e: any) {
        console.error('⚠️ Cleanup failed:', e.message);
    }
}

runTest();
