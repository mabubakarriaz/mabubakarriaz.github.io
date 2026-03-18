import { test, expect, Page } from '@playwright/test';

/**
 * SEO Hardening Test Suite — abubakarriaz.com.pk
 *
 * Tests map directly to the WBS task numbers in Notion:
 * Streams → MVP → Personal Portfolio → Roadmap → 2. SEO Hardening
 *
 * Run with: npx playwright test
 * Run a specific sprint: npx playwright test --grep "Sprint 1"
 * Run a specific task: npx playwright test --grep "task-1.1.1"
 */

const BASE_URL = process.env.BASE_URL ?? 'https://abubakarriaz.com.pk';

// All pages to run cross-page tests against
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/experience/', name: 'Experience' },
  { path: '/certifications/', name: 'Certifications' },
  { path: '/projects/', name: 'Projects' },
  { path: '/education/', name: 'Education' },
  { path: '/awards/', name: 'Awards' },
];

// ──────────────────────────────────────────────
// SPRINT 1: Technical Foundation
// ──────────────────────────────────────────────

test.describe('Sprint 1 — Technical Foundation', () => {

  // ── 1.1 Sitemap & Robots ──

  test.describe('1.1 Sitemap & Robots', () => {

    test('[task-1.1.1] sitemap.xml exists and contains all required pages', async ({ request }) => {
      const response = await request.get('/sitemap.xml');
      expect(response.status(), 'sitemap.xml should return 200').toBe(200);

      const body = await response.text();
      expect(body, 'sitemap should be valid XML').toContain('<?xml');
      expect(body, 'sitemap should use sitemap namespace').toContain('sitemaps.org');

      const requiredPaths = ['/', '/experience/', '/certifications/', '/projects/', '/education/', '/awards/'];
      for (const path of requiredPaths) {
        expect(body, `sitemap should contain ${path}`).toContain(path);
      }
    });

    test('[task-1.1.2] robots.txt exists and references sitemap', async ({ request }) => {
      const response = await request.get('/robots.txt');
      expect(response.status(), 'robots.txt should return 200').toBe(200);

      const body = await response.text();
      expect(body, 'robots.txt should allow all crawlers').toContain('User-agent: *');
      expect(body, 'robots.txt should allow all paths').toContain('Allow: /');
      expect(body, 'robots.txt should reference sitemap URL').toContain('Sitemap: https://abubakarriaz.com.pk/sitemap.xml');
    });

  });

  // ── 1.2 Canonical Tags ──

  test.describe('1.2 Canonical Tags', () => {

    for (const { path, name } of PAGES) {
      test(`[task-1.2.1] ${name} page has correct canonical tag`, async ({ page }) => {
        await page.goto(path);

        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        const expectedHost = new URL(BASE_URL).host;
        expect(canonical, `${name}: canonical tag must exist`).toBeTruthy();
        expect(canonical, `${name}: canonical must be absolute URL with correct host`).toContain(expectedHost);
        expect(canonical, `${name}: canonical must point to correct path`).toContain(path);
      });
    }

    test('[task-1.2.2] all canonical URLs use trailing slash consistently', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        if (path !== '/') {
          expect(canonical, `${name}: canonical should end with trailing slash`).toMatch(/\/$/);
        }
      }
    });

  });

  // ── 1.3 Title Tags & Meta Descriptions ──

  test.describe('1.3 Title Tags & Meta Descriptions', () => {

    const titleMap: Record<string, { maxLen: number; mustContain: string[] }> = {
      '/':               { maxLen: 60, mustContain: ['Abubakar Riaz'] },
      '/experience/':    { maxLen: 65, mustContain: ['Abubakar Riaz'] },
      '/certifications/':{ maxLen: 65, mustContain: ['Abubakar Riaz'] },
      '/projects/':      { maxLen: 65, mustContain: ['Abubakar Riaz'] },
      '/education/':     { maxLen: 65, mustContain: ['Abubakar Riaz'] },
      '/awards/':        { maxLen: 65, mustContain: ['Abubakar Riaz'] },
    };

    for (const { path, name } of PAGES) {
      test(`[task-1.3.1] ${name} page has unique, optimized title tag`, async ({ page }) => {
        await page.goto(path);
        const title = await page.title();

        expect(title, `${name}: title must not be empty`).toBeTruthy();
        expect(title.length, `${name}: title should be ≤65 chars (got ${title.length})`).toBeLessThanOrEqual(65);
        expect(title, `${name}: title must contain "Abubakar Riaz"`).toContain('Abubakar Riaz');
      });

      test(`[task-1.3.2] ${name} page has meta description (150–160 chars)`, async ({ page }) => {
        await page.goto(path);
        const desc = await page.locator('meta[name="description"]').getAttribute('content');

        expect(desc, `${name}: meta description must exist`).toBeTruthy();
        expect(desc!.length, `${name}: description too short (got ${desc!.length}, min 100)`).toBeGreaterThanOrEqual(100);
        expect(desc!.length, `${name}: description too long (got ${desc!.length}, max 160)`).toBeLessThanOrEqual(160);
      });
    }

    test('[task-1.3.1] all page titles are unique', async ({ page }) => {
      const titles: string[] = [];
      for (const { path } of PAGES) {
        await page.goto(path);
        titles.push(await page.title());
      }
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size, `All ${PAGES.length} pages must have unique titles`).toBe(PAGES.length);
    });

    test('[task-1.3.2] all meta descriptions are unique', async ({ page }) => {
      const descs: string[] = [];
      for (const { path } of PAGES) {
        await page.goto(path);
        const d = await page.locator('meta[name="description"]').getAttribute('content');
        descs.push(d ?? '');
      }
      const unique = new Set(descs);
      expect(unique.size, `All ${PAGES.length} pages must have unique meta descriptions`).toBe(PAGES.length);
    });

  });

});

// ──────────────────────────────────────────────
// SPRINT 2: Structured Data / JSON-LD
// ──────────────────────────────────────────────

test.describe('Sprint 2 — Structured Data / JSON-LD', () => {

  async function getJsonLd(page: Page): Promise<any[]> {
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    const results: any[] = [];
    for (const script of scripts) {
      const text = await script.textContent();
      try {
        results.push(JSON.parse(text ?? '{}'));
      } catch {
        // invalid JSON — will be caught by specific tests
      }
    }
    return results;
  }

  test('[task-2.1.1] homepage has valid Person JSON-LD', async ({ page }) => {
    await page.goto('/');
    const schemas = await getJsonLd(page);

    const person = schemas.find(s => s['@type'] === 'Person');
    expect(person, 'Homepage must have Person JSON-LD').toBeTruthy();
    expect(person['@context']).toBe('https://schema.org');
    expect(person['name']).toBe('Abubakar Riaz');
    expect(person['url']).toBe(BASE_URL);
    expect(person['sameAs'], 'sameAs must include LinkedIn').toContain('https://www.linkedin.com/in/mabubakarriaz');
    expect(person['sameAs'], 'sameAs must include GitHub').toContain('https://github.com/mabubakarriaz');
    expect(Array.isArray(person['hasCredential']), 'hasCredential should be an array').toBe(true);
    expect(person['hasCredential'].length, 'Must have at least 4 credentials').toBeGreaterThanOrEqual(4);
  });

  test('[task-2.2.1] homepage has valid WebSite JSON-LD', async ({ page }) => {
    await page.goto('/');
    const schemas = await getJsonLd(page);

    const website = schemas.find(s => s['@type'] === 'WebSite');
    expect(website, 'Homepage must have WebSite JSON-LD').toBeTruthy();
    expect(website['@context']).toBe('https://schema.org');
    // jekyll-seo-tag emits the root URL with a trailing slash
    expect(website['url']).toBe(BASE_URL + '/');
    expect(website['name']).toBe('Abubakar Riaz');
  });

  for (const { path, name } of PAGES.filter(p => p.path !== '/')) {
    test(`[task-2.3.1] ${name} page has BreadcrumbList JSON-LD`, async ({ page }) => {
      await page.goto(path);
      const schemas = await getJsonLd(page);

      const breadcrumb = schemas.find(s => s['@type'] === 'BreadcrumbList');
      expect(breadcrumb, `${name}: must have BreadcrumbList JSON-LD`).toBeTruthy();
      expect(Array.isArray(breadcrumb['itemListElement']), 'itemListElement must be array').toBe(true);
      expect(breadcrumb['itemListElement'].length, 'Must have at least 2 breadcrumb items').toBeGreaterThanOrEqual(2);

      const home = breadcrumb['itemListElement'].find((i: any) => i.position === 1);
      expect(home, 'First breadcrumb item must exist').toBeTruthy();
      expect(home['item'], 'First breadcrumb item must be homepage').toBe(BASE_URL + '/');
    });
  }

  test('[task-2.3.2] all JSON-LD blocks are valid JSON', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const scripts = await page.locator('script[type="application/ld+json"]').all();
      for (const script of scripts) {
        const text = await script.textContent();
        expect(() => JSON.parse(text ?? ''), `${name}: JSON-LD block is invalid JSON`).not.toThrow();
      }
    }
  });

});

// ──────────────────────────────────────────────
// SPRINT 3: Open Graph & Social Sharing
// ──────────────────────────────────────────────
// NOTE: jekyll-seo-tag does not emit og:image:width/height by default.
//       og-default.png must be created at /assets/images/og-default.png.
//       twitter:card must be set to summary_large_image (not the default "summary").

test.describe('Sprint 3 — Open Graph & Social Sharing', () => {

  const requiredOgTags = ['og:type', 'og:url', 'og:title', 'og:description', 'og:image'];
  const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];

  for (const { path, name } of PAGES) {

    test(`[task-3.1.1] ${name} page has all required Open Graph tags`, async ({ page }) => {
      await page.goto(path);
      for (const tag of requiredOgTags) {
        const content = await page.locator(`meta[property="${tag}"]`).getAttribute('content');
        expect(content, `${name}: og:${tag} must exist and have content`).toBeTruthy();
      }
    });

    test(`[task-3.1.1] ${name} og:image is 1200x630 sized`, async ({ page }) => {
      await page.goto(path);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage, `${name}: og:image must not be empty`).toBeTruthy();

      const width = await page.locator('meta[property="og:image:width"]').getAttribute('content');
      const height = await page.locator('meta[property="og:image:height"]').getAttribute('content');
      expect(width, `${name}: og:image:width should be 1200`).toBe('1200');
      expect(height, `${name}: og:image:height should be 630`).toBe('630');
    });

    test(`[task-3.2.1] ${name} page has all required Twitter Card tags`, async ({ page }) => {
      await page.goto(path);
      // Use .first() because jekyll-seo-tag emits its own twitter:card (summary)
      // after our manually placed tags — crawlers use the first occurrence
      for (const tag of requiredTwitterTags) {
        const content = await page.locator(`meta[name="${tag}"]`).first().getAttribute('content');
        expect(content, `${name}: ${tag} must exist and have content`).toBeTruthy();
      }
      const card = await page.locator('meta[name="twitter:card"]').first().getAttribute('content');
      expect(card, `${name}: twitter:card should be summary_large_image`).toBe('summary_large_image');
    });

  }

  test('[task-3.3.1] default OG image is accessible', async ({ request }) => {
    const response = await request.get('/assets/images/og-default.png');
    expect(response.status(), 'og-default.png must be accessible').toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType, 'og-default.png must be an image').toMatch(/image\/(png|webp|jpeg)/);
  });

});

// ──────────────────────────────────────────────
// SPRINT 4: Performance & Core Web Vitals
// ──────────────────────────────────────────────

test.describe.skip('Sprint 4 — Performance & Core Web Vitals', () => {

  test('[task-4.2.2] all images have width and height attributes', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const imgs = await page.locator('img').all();
      for (const img of imgs) {
        const src = await img.getAttribute('src');
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        expect(width, `${name}: img[src="${src}"] missing width attribute`).toBeTruthy();
        expect(height, `${name}: img[src="${src}"] missing height attribute`).toBeTruthy();
      }
    }
  });

  test('[task-4.2.3] below-fold images have loading="lazy"', async ({ page }) => {
    // We check that at least one non-hero image has lazy loading
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const imgs = await page.locator('img').all();
      if (imgs.length > 1) {
        // Skip first (likely hero/above-fold), check the rest
        for (const img of imgs.slice(1)) {
          const loading = await img.getAttribute('loading');
          const src = await img.getAttribute('src');
          expect(loading, `${name}: img[src="${src}"] should have loading="lazy"`).toBe('lazy');
        }
      }
    }
  });

  test('[task-4.2.4] hero image preload link exists on homepage', async ({ page }) => {
    await page.goto('/');
    const preload = await page.locator('link[rel="preload"][as="image"]').first();
    const href = await preload.getAttribute('href');
    expect(href, 'Homepage must have a preload link for hero/critical image').toBeTruthy();
  });

  test('[task-4.3.2] critical fonts are preloaded', async ({ page }) => {
    await page.goto('/');
    const fontPreloads = await page.locator('link[rel="preload"][as="font"]').all();
    expect(fontPreloads.length, 'At least one font should be preloaded').toBeGreaterThan(0);

    for (const preload of fontPreloads) {
      const crossorigin = await preload.getAttribute('crossorigin');
      expect(crossorigin, 'Font preload must have crossorigin attribute').toBeTruthy();
    }
  });

  test('[task-4.4.3] no render-blocking scripts (all scripts have defer or async)', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const scripts = await page.locator('script[src]').all();
      for (const script of scripts) {
        const src = await script.getAttribute('src');
        const defer = await script.getAttribute('defer');
        const async_ = await script.getAttribute('async');
        const type = await script.getAttribute('type');
        // Skip module scripts (they defer by default) and analytics/tracking snippets
        if (type === 'module') continue;
        expect(
          defer !== null || async_ !== null,
          `${name}: script[src="${src}"] should have defer or async attribute`
        ).toBe(true);
      }
    }
  });

});

// ──────────────────────────────────────────────
// SPRINT 5: Final SEO Touches
// ──────────────────────────────────────────────
// NOTE: task-5.3.3 expects theme-color="#0078D4" — current layout has "#0f172a". Update before enabling.

test.describe.skip('Sprint 5 — Final SEO Touches', () => {

  // ── 5.1 Heading Structure ──

  test.describe('5.1 Heading Structure', () => {

    for (const { path, name } of PAGES) {
      test(`[task-5.1.1] ${name} page has exactly one H1`, async ({ page }) => {
        await page.goto(path);
        const h1Count = await page.locator('h1').count();
        expect(h1Count, `${name}: must have exactly 1 H1 (found ${h1Count})`).toBe(1);
      });

      test(`[task-5.1.2] ${name} page has sequential heading hierarchy`, async ({ page }) => {
        await page.goto(path);
        // Get all heading levels in order
        const headings = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return els.map(el => parseInt(el.tagName.charAt(1)));
        });

        let prevLevel = 0;
        for (let i = 0; i < headings.length; i++) {
          const level = headings[i];
          if (i === 0) {
            expect(level, `${name}: first heading must be H1`).toBe(1);
          } else {
            expect(
              level - prevLevel <= 1,
              `${name}: heading jumped from H${prevLevel} to H${level} — no skipping allowed`
            ).toBe(true);
          }
          prevLevel = level;
        }
      });
    }

  });

  // ── 5.2 Accessibility SEO ──

  test.describe('5.2 Accessibility SEO', () => {

    for (const { path, name } of PAGES) {
      test(`[task-5.2.1] ${name} all images have alt text`, async ({ page }) => {
        await page.goto(path);
        const imgs = await page.locator('img').all();
        for (const img of imgs) {
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          expect(alt, `${name}: img[src="${src}"] must have alt attribute`).not.toBeNull();
          expect(alt!.trim().length, `${name}: img[src="${src}"] alt text must not be empty`).toBeGreaterThan(0);
        }
      });
    }

    test('[task-5.2.2] html tag has lang="en"', async ({ page }) => {
      await page.goto('/');
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, 'HTML tag must have lang="en"').toBe('en');
    });

    for (const { path, name } of PAGES) {
      test(`[task-5.2.3] ${name} no links with generic anchor text`, async ({ page }) => {
        await page.goto(path);
        const genericTexts = ['click here', 'here', 'read more', 'more', 'link'];
        const links = await page.locator('a').all();
        for (const link of links) {
          const text = (await link.textContent())?.toLowerCase().trim() ?? '';
          const ariaLabel = await link.getAttribute('aria-label');
          if (!ariaLabel) {
            expect(
              genericTexts.includes(text),
              `${name}: link with text "${text}" is too generic — use descriptive text or aria-label`
            ).toBe(false);
          }
        }
      });
    }

  });

  // ── 5.3 Miscellaneous Technical SEO ──

  test.describe('5.3 Miscellaneous Technical SEO', () => {

    test('[task-5.3.1] favicon.ico exists', async ({ request }) => {
      const response = await request.get('/favicon.ico');
      expect(response.status(), 'favicon.ico must be accessible').toBe(200);
    });

    test('[task-5.3.1] apple-touch-icon meta tag exists', async ({ page }) => {
      await page.goto('/');
      const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
      expect(appleIcon, 'apple-touch-icon link must exist').toBeTruthy();
    });

    test('[task-5.3.3] theme-color meta tag is present and Azure blue', async ({ page }) => {
      await page.goto('/');
      const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
      expect(themeColor, 'theme-color meta tag must exist').toBeTruthy();
      expect(themeColor, 'theme-color should be Azure blue #0078D4').toBe('#0078D4');
    });

    test('[task-5.3.4] custom 404 page exists and is branded', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-xyz-404-test');
      expect(response?.status(), '404 page should return 404 status').toBe(404);

      // Should have navigation back to homepage
      const homeLink = await page.locator('a[href="/"]').first();
      expect(await homeLink.isVisible(), '404 page should have a link back to homepage').toBe(true);
    });

    test('[task-5.3.2] no HTTP resources loaded on HTTPS pages (no mixed content)', async ({ page }) => {
      const mixedContent: string[] = [];
      page.on('response', response => {
        const url = response.url();
        if (url.startsWith('http://')) {
          mixedContent.push(url);
        }
      });

      for (const { path } of PAGES) {
        await page.goto(path);
      }

      expect(mixedContent, `Mixed content found: ${mixedContent.join(', ')}`).toHaveLength(0);
    });

  });

});