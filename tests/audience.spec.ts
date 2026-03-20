import { test, expect } from '@playwright/test';

/**
 * Audience Infrastructure Test Suite — abubakarriaz.com.pk
 *
 * Tests map directly to the WBS task numbers in Notion:
 * Streams → MVP → Personal Portfolio → Roadmap → 3. Audience Infrastructure
 *
 * Run with: npx playwright test audience.spec.ts
 * Run a specific sprint: npx playwright test audience.spec.ts --grep "Sprint 1"
 * Run a specific task: npx playwright test audience.spec.ts --grep "task-1.2.1"
 */

const NEWSLETTER_URL_PATTERN = /linkedin\.com\/newsletters\//;

// All portfolio pages to run cross-page tests against
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/experience/', name: 'Experience' },
  { path: '/certifications/', name: 'Certifications' },
  { path: '/projects/', name: 'Projects' },
  { path: '/education/', name: 'Education' },
  { path: '/awards/', name: 'Awards' },
];

// Pages that should have "Share This Page" links (task 2.2.3)
const SHAREABLE_PAGES = PAGES.filter(p =>
  ['/experience/', '/projects/', '/certifications/'].includes(p.path)
);

// ──────────────────────────────────────────────
// SPRINT 1: Newsletter CTAs & LinkedIn Integration
// ──────────────────────────────────────────────

test.describe('Sprint 1 — Newsletter CTAs & LinkedIn Integration', () => {

  // ── 1.2 Newsletter CTA on Portfolio Homepage ──

  test.describe('1.2 Newsletter CTA on Portfolio Homepage', () => {

    test('[task-1.2.1] hero section has a newsletter subscribe CTA button', async ({ page }) => {
      await page.goto('/');

      // Look for a newsletter CTA link in the hero section
      const heroSection = page.locator('.hero, #home, [class*="hero"]').first();
      const newsletterLink = heroSection.locator('a').filter({ hasText: /newsletter|subscribe/i });

      expect(await newsletterLink.count(), 'Hero section must have a newsletter CTA link').toBeGreaterThan(0);

      const href = await newsletterLink.first().getAttribute('href');
      expect(href, 'Newsletter CTA must link to LinkedIn newsletter').toMatch(NEWSLETTER_URL_PATTERN);

      const target = await newsletterLink.first().getAttribute('target');
      expect(target, 'Newsletter CTA must open in new tab').toBe('_blank');

      const rel = await newsletterLink.first().getAttribute('rel');
      expect(rel, 'Newsletter CTA must have rel="noopener"').toContain('noopener');
    });

    test('[task-1.2.2] site footer has a newsletter CTA on all pages', async ({ page }) => {
      test.skip(true, 'task 1.2.2 not yet implemented — footer newsletter CTA pending');
      for (const { path, name } of PAGES) {
        await page.goto(path);

        const footer = page.locator('footer').first();
        const newsletterLink = footer.locator('a').filter({ hasText: /newsletter|subscribe/i });

        expect(
          await newsletterLink.count(),
          `${name}: footer must have a newsletter CTA link`
        ).toBeGreaterThan(0);

        const href = await newsletterLink.first().getAttribute('href');
        expect(href, `${name}: footer newsletter CTA must link to LinkedIn newsletter`).toMatch(NEWSLETTER_URL_PATTERN);

        const target = await newsletterLink.first().getAttribute('target');
        expect(target, `${name}: footer newsletter CTA must open in new tab`).toBe('_blank');
      }
    });

    test('[task-1.2.3] homepage has a dedicated newsletter banner section', async ({ page }) => {
      test.skip(true, 'task 1.2.3 not yet implemented — newsletter banner section pending');
      await page.goto('/');

      const newsletterSection = page.locator(
        'section:has(a[href*="linkedin.com/newsletters"]), ' +
        '[class*="newsletter"], ' +
        '[id*="newsletter"]'
      ).first();

      expect(
        await newsletterSection.count(),
        'Homepage must have a dedicated newsletter banner section'
      ).toBeGreaterThan(0);

      const text = await newsletterSection.textContent();
      expect(
        text?.toLowerCase(),
        'Newsletter banner should mention subscribing or the newsletter'
      ).toMatch(/subscribe|newsletter|devops/i);

      const ctaLink = newsletterSection.locator('a[href*="linkedin.com/newsletters"]');
      expect(await ctaLink.count(), 'Newsletter banner must have a LinkedIn newsletter link').toBeGreaterThan(0);
    });

  });

});

// ──────────────────────────────────────────────
// SPRINT 2: RSS Feed & Social Sharing Links
// ──────────────────────────────────────────────

test.describe('Sprint 2 — RSS Feed & Social Sharing Links', () => {

  // ── 2.1 Surface Hashnode RSS Feed ──

  test.describe('2.1 Surface Hashnode RSS Feed', () => {

    test('[task-2.1.4] portfolio site footer has an RSS feed link', async ({ page }) => {
      test.skip(true, 'task 2.1.4 not yet implemented — RSS link in footer pending');
      for (const { path, name } of PAGES) {
        await page.goto(path);

        const footer = page.locator('footer').first();
        const rssLink = footer.locator('a[href*="rss"], a[href*="feed"]');

        expect(
          await rssLink.count(),
          `${name}: footer must have an RSS feed link`
        ).toBeGreaterThan(0);

        const href = await rssLink.first().getAttribute('href');
        expect(
          href,
          `${name}: RSS link must point to blog RSS feed`
        ).toContain('rss');

        const target = await rssLink.first().getAttribute('target');
        expect(target, `${name}: RSS link must open in new tab`).toBe('_blank');
      }
    });

  });

  // ── 2.2 Social Sharing Links on Portfolio ──

  test.describe('2.2 Social Sharing Links on Portfolio', () => {

    test('[task-2.2.1] homepage hero has social profile links (GitHub, LinkedIn, MS Learn)', async ({ page }) => {
      await page.goto('/');

      const heroSection = page.locator('.hero, #home, [class*="hero"]').first();

      const expectedProfiles = [
        { name: 'GitHub', pattern: /github\.com\/mabubakarriaz/i },
        { name: 'LinkedIn', pattern: /linkedin\.com\/in\/mabubakarriaz/i },
        { name: 'Microsoft Learn', pattern: /learn\.microsoft\.com/i },
      ];

      for (const profile of expectedProfiles) {
        const links = heroSection.locator('a');
        const allHrefs: string[] = [];
        const count = await links.count();
        for (let i = 0; i < count; i++) {
          const href = await links.nth(i).getAttribute('href');
          if (href) allHrefs.push(href);
        }

        const found = allHrefs.some(href => profile.pattern.test(href));
        expect(found, `Hero must have a ${profile.name} profile link`).toBe(true);
      }
    });

    test('[task-2.2.1] hero social profile links open in new tab with rel="noopener"', async ({ page }) => {
      await page.goto('/');

      const heroSection = page.locator('.hero, #home, [class*="hero"]').first();
      const externalLinks = heroSection.locator('a[target="_blank"]');
      const count = await externalLinks.count();

      expect(count, 'Hero should have external social links').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const rel = await link.getAttribute('rel');
        const href = await link.getAttribute('href');
        expect(rel, `Hero link to ${href} must have rel containing "noopener"`).toContain('noopener');
      }
    });

    test('[task-2.2.2] site footer has social links row (GitHub, LinkedIn)', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);

        const footer = page.locator('footer').first();
        const links = footer.locator('a');
        const allHrefs: string[] = [];
        const count = await links.count();
        for (let i = 0; i < count; i++) {
          const href = await links.nth(i).getAttribute('href');
          if (href) allHrefs.push(href);
        }

        const requiredLinks = [
          { name: 'GitHub', pattern: /github\.com/i },
          { name: 'LinkedIn', pattern: /linkedin\.com/i },
        ];

        for (const required of requiredLinks) {
          const found = allHrefs.some(href => required.pattern.test(href));
          expect(found, `${name}: footer must have a ${required.name} link`).toBe(true);
        }
      }
    });

    test('[task-2.2.2] footer social links open in new tab with rel="noopener"', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer').first();
      const externalLinks = footer.locator('a[target="_blank"]');
      const count = await externalLinks.count();

      expect(count, 'Footer should have external social links').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const rel = await link.getAttribute('rel');
        const href = await link.getAttribute('href');
        expect(rel, `Footer link to ${href} must have rel containing "noopener"`).toContain('noopener');
      }
    });

    for (const { path, name } of SHAREABLE_PAGES) {
      test(`[task-2.2.3] ${name} page has "Share This Page" links (LinkedIn + X)`, async ({ page }) => {
        test.skip(true, 'task 2.2.3 not yet implemented — share buttons pending');
        await page.goto(path);

        const shareSection = page.locator(
          '[class*="share"], [id*="share"], [aria-label*="share" i]'
        ).first();

        expect(
          await shareSection.count(),
          `${name}: must have a share section`
        ).toBeGreaterThan(0);

        const linkedinShare = shareSection.locator('a[href*="linkedin.com/sharing"], a[href*="linkedin.com/shareArticle"]');
        expect(
          await linkedinShare.count(),
          `${name}: share section must have LinkedIn share link`
        ).toBeGreaterThan(0);

        const twitterShare = shareSection.locator('a[href*="twitter.com/intent"], a[href*="x.com/intent"]');
        expect(
          await twitterShare.count(),
          `${name}: share section must have X/Twitter share link`
        ).toBeGreaterThan(0);
      });
    }

  });

});

// ──────────────────────────────────────────────
// SPRINT 4: Analytics Setup
// ──────────────────────────────────────────────

test.describe('Sprint 4 — Analytics Setup', () => {

  // ── 4.1 Portfolio Site Analytics ──

  test.describe('4.1 Portfolio Site Analytics', () => {

    test('[task-4.1.3] tracking script is present on all pages', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);

        // Look for any analytics script (GA4, Plausible, Umami, Cloudflare)
        const analyticsScript = page.locator([
          'script[src*="googletagmanager"]',
          'script[src*="google-analytics"]',
          'script[src*="plausible"]',
          'script[src*="umami"]',
          'script[src*="cloudflareinsights"]',
          'script[src*="gtag"]',
        ].join(', '));

        expect(
          await analyticsScript.count(),
          `${name}: must have an analytics tracking script`
        ).toBeGreaterThan(0);
      }
    });

    test('[task-4.1.3] analytics script uses defer or async', async ({ page }) => {
      await page.goto('/');

      const analyticsScript = page.locator([
        'script[src*="googletagmanager"]',
        'script[src*="google-analytics"]',
        'script[src*="plausible"]',
        'script[src*="umami"]',
        'script[src*="cloudflareinsights"]',
        'script[src*="gtag"]',
      ].join(', ')).first();

      if (await analyticsScript.count() > 0) {
        const defer = await analyticsScript.getAttribute('defer');
        const async_ = await analyticsScript.getAttribute('async');
        expect(
          defer !== null || async_ !== null,
          'Analytics script must have defer or async attribute'
        ).toBe(true);
      }
    });

    test('[task-4.1.5] newsletter CTA clicks are trackable', async ({ page }) => {
      test.skip(true, 'task 4.1.5 not yet implemented — event tracking pending');
      await page.goto('/');

      const newsletterLinks = page.locator('a[href*="linkedin.com/newsletters"]');
      const count = await newsletterLinks.count();

      expect(count, 'Must have at least one newsletter CTA link on homepage').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = newsletterLinks.nth(i);
        const href = await link.getAttribute('href');
        const className = await link.getAttribute('class');
        const dataAttr = await link.getAttribute('data-event');
        const id = await link.getAttribute('id');

        const isTrackable = (className && className.length > 0) ||
                            (id && id.length > 0) ||
                            dataAttr !== null;
        expect(
          isTrackable,
          `Newsletter CTA (${href}) must have class, id, or data-event for tracking`
        ).toBe(true);
      }
    });

  });

});

// ──────────────────────────────────────────────
// SPRINT 5: "Latest from the Blog" Section
// ──────────────────────────────────────────────

test.describe('Sprint 5 — Latest from the Blog', () => {

  // ── 5.2 Implementation ──

  test.describe('5.2 Blog Section Implementation', () => {

    test('[task-5.2.1] homepage has a "Latest from the Blog" section', async ({ page }) => {
      test.skip(true, 'task 5.2.1 not yet implemented — blog section pending');
      await page.goto('/');

      const blogSection = page.locator(
        'section:has(a[href*="blog.abubakarriaz"]), ' +
        '[class*="blog"], ' +
        '[id*="blog"]'
      ).first();

      expect(
        await blogSection.count(),
        'Homepage must have a "Latest from the Blog" section'
      ).toBeGreaterThan(0);

      const heading = blogSection.locator('h2, h3').first();
      const headingText = await heading.textContent();
      expect(
        headingText?.toLowerCase(),
        'Blog section heading should reference blog or posts'
      ).toMatch(/blog|post|article|latest/i);
    });

    test('[task-5.2.1] blog section displays at least 3 post cards', async ({ page }) => {
      test.skip(true, 'task 5.2.1 not yet implemented — blog section pending');
      await page.goto('/');

      const blogSection = page.locator(
        '[class*="blog"], [id*="blog"]'
      ).first();

      const cards = blogSection.locator(
        '[class*="card"], [class*="post"], article, [class*="item"]'
      );

      expect(
        await cards.count(),
        'Blog section must show at least 3 post cards'
      ).toBeGreaterThanOrEqual(3);
    });

    test('[task-5.2.1] blog post cards link to Hashnode blog', async ({ page }) => {
      test.skip(true, 'task 5.2.1 not yet implemented — blog section pending');
      await page.goto('/');

      const blogSection = page.locator(
        '[class*="blog"], [id*="blog"]'
      ).first();

      const blogLinks = blogSection.locator('a[href*="blog.abubakarriaz"]');
      const count = await blogLinks.count();

      expect(count, 'Blog section must have links to Hashnode blog').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = blogLinks.nth(i);
        const target = await link.getAttribute('target');
        expect(target, 'Blog links must open in new tab').toBe('_blank');

        const rel = await link.getAttribute('rel');
        expect(rel, 'Blog links must have rel="noopener"').toContain('noopener');
      }
    });

    test('[task-5.2.1] blog post cards have meaningful content', async ({ page }) => {
      test.skip(true, 'task 5.2.1 not yet implemented — blog section pending');
      await page.goto('/');

      const blogSection = page.locator(
        '[class*="blog"], [id*="blog"]'
      ).first();

      const cards = blogSection.locator(
        '[class*="card"], [class*="post"], article, [class*="item"]'
      );

      const count = await cards.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = cards.nth(i);
        const text = await card.textContent();

        expect(
          text && text.trim().length > 20,
          `Blog card ${i + 1} must have meaningful content (title + excerpt)`
        ).toBe(true);
      }
    });

    test('[task-5.2.2] blog section is responsive on mobile', async ({ page }) => {
      test.skip(true, 'task 5.2.2 not yet implemented — blog section pending');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      const blogSection = page.locator(
        '[class*="blog"], [id*="blog"]'
      ).first();

      if (await blogSection.count() > 0) {
        const box = await blogSection.boundingBox();
        expect(box, 'Blog section must be visible on mobile').toBeTruthy();
        expect(
          box!.width,
          'Blog section must not overflow mobile viewport'
        ).toBeLessThanOrEqual(375);
      }
    });

  });

});

// ──────────────────────────────────────────────
// Cross-cutting: External Link Safety
// ──────────────────────────────────────────────

test.describe('Cross-cutting — Audience Link Safety', () => {

  test('all external audience links with target="_blank" have rel="noopener"', async ({ page }) => {
    await page.goto('/');

    // Check that every external audience link that opens in a new tab also has rel="noopener"
    // Note: some links (e.g. "Explore My Blog") intentionally navigate in the same tab
    const audiencePatterns = [
      'linkedin.com/newsletters',
      'blog.abubakarriaz.com.pk',
      'linkedin.com/in/mabubakarriaz',
      'github.com/mabubakarriaz',
    ];

    for (const pattern of audiencePatterns) {
      const links = page.locator(`a[href*="${pattern}"][target="_blank"]`);
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        const rel = await link.getAttribute('rel');

        expect(rel, `Link to ${href} must have rel containing "noopener"`).toContain('noopener');
      }
    }
  });

});
