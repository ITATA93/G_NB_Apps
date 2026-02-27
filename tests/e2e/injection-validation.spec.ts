/**
 * injection-validation.spec.ts - Structured Playwright E2E tests for G_NB_Apps
 *
 * This test suite wraps the logic from scripts/validate-injection-e2e.ts into
 * a proper @playwright/test format with proper assertions, lifecycle hooks,
 * and screenshot baselines.
 *
 * FLOW:
 *   1. Inject a test record via NocoBase API
 *   2. Login to NocoBase UI via Playwright
 *   3. Navigate to the collection page
 *   4. Assert the injected record is visible in the browser UI
 *   5. Capture screenshot baselines for visual regression
 *   6. Clean up the test record via API
 *
 * PREREQUISITES:
 *   - .env file with NOCOBASE_BASE_URL, NOCOBASE_API_KEY, E2E_USERNAME, E2E_PASSWORD
 *   - NocoBase instance must be reachable
 *   - npx playwright install --with-deps chromium
 *
 * USAGE:
 *   npm run test:e2e
 *   npx playwright test tests/e2e/injection-validation.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import axios, { type AxiosInstance } from 'axios';

// Load environment from project root .env
dotenv.config({ path: path.resolve('.', '.env') });

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const NOCOBASE_API_URL = process.env.NOCOBASE_BASE_URL || 'http://localhost:13000/api';
const NOCOBASE_API_KEY = process.env.NOCOBASE_API_KEY || '';
const NOCOBASE_URL = NOCOBASE_API_URL.replace(/\/api\/?$/, '');
const E2E_USERNAME = process.env.E2E_USERNAME || '';
const E2E_PASSWORD = process.env.E2E_PASSWORD || '';
const TEST_COLLECTION = process.env.E2E_TEST_COLLECTION || 'departments';
const TEST_TITLE = `AUTO_TEST_${Date.now()}`;

// ---------------------------------------------------------------------------
// API Helper (lightweight, no dependency on shared/scripts/ApiClient)
// ---------------------------------------------------------------------------

function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: NOCOBASE_API_URL,
    headers: {
      Authorization: `Bearer ${NOCOBASE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Test State
// ---------------------------------------------------------------------------

let createdRecordId: string | number | null = null;
const api = NOCOBASE_API_KEY ? createApiClient() : null;

// ---------------------------------------------------------------------------
// Skip guard: all tests require credentials
// ---------------------------------------------------------------------------

test.beforeAll(() => {
  if (!NOCOBASE_API_KEY || !E2E_USERNAME || !E2E_PASSWORD) {
    test.skip(
      !NOCOBASE_API_KEY || !E2E_USERNAME || !E2E_PASSWORD,
      'E2E credentials not configured. Set NOCOBASE_API_KEY, E2E_USERNAME, E2E_PASSWORD in .env',
    );
  }
});

// ---------------------------------------------------------------------------
// Login helper
// ---------------------------------------------------------------------------

async function loginToNocoBase(page: Page): Promise<void> {
  await page.goto(`${NOCOBASE_URL}/signin`, { waitUntil: 'domcontentloaded' });

  // Wait for the login form to render
  await page.waitForTimeout(2000);

  // Fill credentials using robust selectors
  const authInput = page.locator('input[name="auth"]');
  const textInput = page.locator('input[type="text"]').first();

  if (await authInput.isVisible().catch(() => false)) {
    await authInput.fill(E2E_USERNAME);
  } else {
    await textInput.fill(E2E_USERNAME);
  }

  await page.locator('input[type="password"]').fill(E2E_PASSWORD);

  // Submit
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to admin area
  await page.waitForURL('**/admin/**', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('NocoBase Injection E2E', () => {
  test.describe.configure({ mode: 'serial' });

  test('Step 1: Inject test record via API @smoke', async () => {
    test.skip(!api, 'API client not configured');

    const response = await api!.post(`/${TEST_COLLECTION}:create`, {
      title: TEST_TITLE,
      name: TEST_TITLE,
    });

    expect(response.status).toBe(200);

    const data = response.data?.data;
    expect(data).toBeTruthy();

    createdRecordId = data.id;
    expect(createdRecordId).toBeTruthy();
  });

  test('Step 2: Login to NocoBase UI', async ({ page }) => {
    test.skip(!E2E_USERNAME || !E2E_PASSWORD, 'Login credentials not set');

    await loginToNocoBase(page);

    // Verify we reached the admin area
    await expect(page).toHaveURL(/\/admin\//);
  });

  test('Step 3: Verify injected record visible in UI', async ({ page }) => {
    test.skip(!createdRecordId, 'No record was created in Step 1');

    await loginToNocoBase(page);

    // Navigate to the collection page
    await page.goto(
      `${NOCOBASE_URL}/admin/collections/${TEST_COLLECTION}`,
      { waitUntil: 'networkidle', timeout: 30_000 },
    );

    // Try to find the injected text in the UI
    try {
      await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 15_000 });
    } catch {
      // If direct text not found, check page content
      const bodyText = await page.evaluate(() => document.body.innerText);
      expect(bodyText).toContain(TEST_TITLE);
    }

    // Visual regression: capture the collection page
    await expect(page).toHaveScreenshot('collection-page.png', {
      maxDiffPixelRatio: 0.05, // NocoBase UI may have dynamic elements
      fullPage: true,
    });
  });

  test('Step 4: Login page visual baseline @smoke', async ({ page }) => {
    await page.goto(`${NOCOBASE_URL}/signin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Let the page fully render

    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Step 5: Cleanup test record via API', async () => {
    test.skip(!api || !createdRecordId, 'Nothing to clean up');

    const response = await api!.post(`/${TEST_COLLECTION}:destroy`, {
      filter: { id: createdRecordId },
    });

    // NocoBase returns 200 on successful delete
    expect(response.status).toBe(200);
    createdRecordId = null;
  });
});

// ---------------------------------------------------------------------------
// Standalone smoke tests (no API injection needed)
// ---------------------------------------------------------------------------

test.describe('NocoBase Smoke Tests', () => {
  test('NocoBase instance is reachable @smoke', async ({ page }) => {
    const response = await page.goto(NOCOBASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });

    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(500);
  });

  test('signin page renders form elements @smoke', async ({ page }) => {
    await page.goto(`${NOCOBASE_URL}/signin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify basic form structure exists
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // At least one of these should be visible if the signin page loaded
    const hasPassword = await passwordInput.isVisible().catch(() => false);
    const hasSubmit = await submitButton.isVisible().catch(() => false);

    expect(hasPassword || hasSubmit).toBeTruthy();
  });
});
