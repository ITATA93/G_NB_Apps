/**
 * Playwright configuration for G_NB_Apps (NocoBase Applications)
 *
 * Tests run against a remote NocoBase instance. The base URL and credentials
 * are read from environment variables (typically from .env).
 *
 * Setup:
 *   1. Copy .env.example to .env (if not done)
 *   2. Set NOCOBASE_BASE_URL, E2E_USERNAME, E2E_PASSWORD
 *   3. npx playwright install --with-deps chromium
 *   4. npm run test:e2e
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve('.', '.env') });

const NOCOBASE_URL = process.env.NOCOBASE_BASE_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:13000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential: tests share state (login session)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // NocoBase E2E tests must run sequentially
  reporter: process.env.CI ? 'html' : 'list',
  timeout: 60_000, // NocoBase pages can be slow to load

  use: {
    baseURL: NOCOBASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
