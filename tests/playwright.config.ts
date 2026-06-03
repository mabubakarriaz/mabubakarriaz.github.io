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
  // Several specs loop a single test over all 6 pages, and every page.goto
  // waits for the `load` event — which is gated on the async Google Analytics
  // script (an external request). Six sequential navigations behind a slow
  // third-party fetch, under parallel worker load, overruns a 30s budget and
  // flakes. 60s gives the cross-page loops headroom without masking real hangs.
  timeout: 60_000,
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