import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration — SEO & Audience Infrastructure Tests
 * Site: abubakarriaz.com.pk
 *
 * Targets the live production site by default.
 * For local testing: BASE_URL=http://localhost:4000 npx playwright test
 * Run only SEO:      npx playwright test seo.spec.ts
 * Run only Audience: npx playwright test audience.spec.ts
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  retries: 1,            // Retry once on flaky network responses
  workers: 2,            // 2 parallel workers — polite to production server
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://abubakarriaz.com.pk',
    extraHTTPHeaders: {
      // Identify the test bot in server logs
      'User-Agent': 'Playwright-Test/1.0 (abubakarriaz.com.pk regression suite)',
    },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});