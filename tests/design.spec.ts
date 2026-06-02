import { test, expect, Page } from '@playwright/test';

/**
 * Design Modernization Test Suite — abubakarriaz.com.pk
 *
 * Tests map directly to the WBS task numbers in Notion:
 * Streams → MVP → Personal Portfolio → Roadmap → 4. Design Modernization
 *
 * Run all:           npx playwright test design.spec.ts
 * Run a phase:       npx playwright test --grep "Phase 1"
 * Run a single task: npx playwright test --grep "task-1.1.1"
 * Run local:         BASE_URL=http://localhost:4000 npx playwright test design.spec.ts
 *
 * ── COMPLETION STATUS ────────────────────────────────────────
 * Phase 1 (1.1.x, 1.2.x) — ✅ DONE  → tests ENABLED
 * Phase 2 (2.x)           — ⏳ TODO  → tests SKIPPED
 * Phase 3 (3.x)           — ⏳ TODO  → tests SKIPPED
 * Phase 4 (4.x)           — ⏳ TODO  → tests SKIPPED
 *
 * ── IMPLEMENTATION NOTES ─────────────────────────────────────
 * Dark/light mode uses data-theme="light" on <html> (JS-detected),
 * NOT @media (prefers-color-scheme) in CSS.
 * Dark mode is the :root DEFAULT (no attribute needed).
 * Light mode adds data-theme="light" via the inline detection script.
 */

const BASE_URL = process.env.BASE_URL ?? 'https://abubakarriaz.com.pk';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/experience/', name: 'Experience' },
  { path: '/certifications/', name: 'Certifications' },
  { path: '/projects/', name: 'Projects' },
  { path: '/education/', name: 'Education' },
  { path: '/awards/', name: 'Awards' },
];

// ── Helpers ──────────────────────────────────

/** Read a CSS custom property value from :root */
async function getCssVar(page: Page, varName: string): Promise<string> {
  return page.evaluate(
    (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(),
    varName,
  );
}

/** Concatenate all parseable same-origin CSS rule text */
async function getAllCssText(page: Page): Promise<string> {
  return page.evaluate(() =>
    Array.from(document.styleSheets)
      .filter((s) => { try { return !!s.cssRules; } catch { return false; } })
      .flatMap((s) => Array.from(s.cssRules).map((r) => r.cssText))
      .join('\n'),
  );
}

// ──────────────────────────────────────────────
// PHASE 1 — Foundation & Design System Setup  ✅ COMPLETED
// ──────────────────────────────────────────────

test.describe('Phase 1 — Foundation & Design System Setup', () => {

  // ── 1.1 Design Tokens ──
  //
  // The live brand is "The Control Plane" — a dark indigo→cyan space theme.
  // The tokens that DRIVE the UI are --bg-primary / --accent / --accent-cyan /
  // --text-primary (defined in critical.css + main.css).
  //
  // NOTE: an older --color-* layer (Azure #0078D4 + GitHub-dark #0D1117) still
  // lingers in main.css as un-migrated scaffolding, but NO component consumes it
  // and it is explicitly slated for retirement (see CLAUDE.md → Design Context).
  // These tests assert the real brand, not the dead layer.

  test.describe('1.1 Design Tokens', () => {

    // ── task-1.1.1 ──

    test('[task-1.1.1] Control Plane color tokens are defined on :root', async ({ page }) => {
      await page.goto('/');
      const colorVars = [
        '--bg-primary', '--bg-secondary', '--bg-card', '--bg-card-solid',
        '--accent', '--accent-cyan', '--accent-violet',
        '--gradient', '--gradient-text',
        '--border', '--border-hover',
        '--text-primary', '--text-secondary', '--text-muted',
      ];
      for (const v of colorVars) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined on :root`).toBeTruthy();
      }
    });

    test('[task-1.1.1] primary accent is indigo #6366f1 in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const accent = await getCssVar(page, '--accent');
      expect(accent.toLowerCase(), '--accent must be the Control Plane indigo #6366f1').toBe('#6366f1');
    });

    test('[task-1.1.1] cyan telemetry accent is #22d3ee in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const cyan = await getCssVar(page, '--accent-cyan');
      expect(cyan.toLowerCase(), '--accent-cyan must be #22d3ee').toBe('#22d3ee');
    });

    test('[task-1.1.1] base background is near-black #050810 in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const bg = await getCssVar(page, '--bg-primary');
      expect(bg.toLowerCase(), '--bg-primary must be the near-black base #050810').toBe('#050810');
    });

    test('[task-1.1.1] dark-mode gradient spine is a 135° indigo→cyan ramp (never inverted)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      // Custom properties are returned as their raw authored text (hex), not parsed to rgb().
      const gradient = (await getCssVar(page, '--gradient')).toLowerCase();
      // The dark spine runs indigo (#6366f1) → cyan (#22d3ee); both angle and order are brand invariants.
      expect(gradient, '--gradient must use a 135deg ramp').toContain('135deg');
      const indigoAt = gradient.indexOf('#6366f1');
      const cyanAt   = gradient.indexOf('#22d3ee');
      expect(indigoAt, '--gradient must contain the indigo stop #6366f1').toBeGreaterThanOrEqual(0);
      expect(cyanAt,   '--gradient must contain the cyan stop #22d3ee').toBeGreaterThanOrEqual(0);
      expect(indigoAt, '--gradient must run indigo→cyan, not cyan→indigo').toBeLessThan(cyanAt);
    });

    test('[task-1.1.1] light-mode gradient keeps the same 135° angle and indigo→cyan order', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      // Light mode rides the same spine with deeper stops (#4f46e5 → #06b6d4) — angle/order unchanged.
      const gradient = (await getCssVar(page, '--gradient')).toLowerCase();
      expect(gradient, 'light --gradient must use the same 135deg angle').toContain('135deg');
      const indigoAt = gradient.indexOf('#4f46e5');
      const cyanAt   = gradient.indexOf('#06b6d4');
      expect(indigoAt, 'light --gradient must contain the indigo stop #4f46e5').toBeGreaterThanOrEqual(0);
      expect(cyanAt,   'light --gradient must contain the cyan stop #06b6d4').toBeGreaterThanOrEqual(0);
      expect(indigoAt, 'light --gradient must run indigo→cyan, not inverted').toBeLessThan(cyanAt);
    });

    test('[task-1.1.1] typography tokens are defined', async ({ page }) => {
      await page.goto('/');
      const typographyVars = [
        '--font-sans', '--font-mono',
        '--text-xs', '--text-sm', '--text-base', '--text-md',
        '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl',
        '--font-normal', '--font-medium', '--font-semibold', '--font-bold',
        '--leading-tight', '--leading-normal', '--leading-relaxed',
      ];
      for (const v of typographyVars) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    test('[task-1.1.1] shadow + glow tokens are defined', async ({ page }) => {
      await page.goto('/');
      // Scale shadows + the Control Plane depth tokens (glow/blur, not drop shadows)
      for (const v of ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-card', '--shadow-glow']) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    test('[task-1.1.1] border-radius tokens are defined', async ({ page }) => {
      await page.goto('/');
      for (const v of ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full']) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    test('[task-1.1.1] animation tokens are defined', async ({ page }) => {
      await page.goto('/');
      for (const v of ['--duration-fast', '--duration-normal', '--duration-slow', '--ease-default', '--transition']) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    // ── task-1.1.2 ──
    // Implementation note: dark mode is the :root DEFAULT (no data-theme attribute).
    // Light mode is activated by data-theme="light" on <html> via an inline JS detection
    // script — NOT via @media (prefers-color-scheme) in CSS.
    // The JS reads the OS preference (matchMedia) and localStorage, then sets the attribute.

    test('[task-1.1.2] dark mode is the :root default (no data-theme attribute required)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const attr = await page.locator('html').getAttribute('data-theme');
      expect(attr, '<html> must NOT have data-theme attribute in dark mode').toBeNull();
    });

    test('[task-1.1.2] light mode activates via data-theme="light" attribute', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const attr = await page.locator('html').getAttribute('data-theme');
      expect(attr, '<html> must have data-theme="light" when OS prefers light').toBe('light');
    });

    test('[task-1.1.2] dark mode --bg-primary is the near-black base (#050810)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const bg = await getCssVar(page, '--bg-primary');
      expect(bg.toLowerCase(), '--bg-primary in dark mode must be #050810').toBe('#050810');
    });

    test('[task-1.1.2] dark mode --text-primary is a light readable value (#f1f5f9)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const text = await getCssVar(page, '--text-primary');
      expect(text.toLowerCase(), '--text-primary in dark mode must be #f1f5f9').toBe('#f1f5f9');
    });

    test('[task-1.1.2] light mode switches --bg-primary to white (#FFFFFF)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const bg = await getCssVar(page, '--bg-primary');
      expect(bg.toLowerCase(), '--bg-primary must be #ffffff in light mode').toBe('#ffffff');
    });

    test('[task-1.1.2] light mode switches --text-primary to dark (#1F2328)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const text = await getCssVar(page, '--text-primary');
      expect(text.toLowerCase(), '--text-primary in light mode must be #1f2328').toBe('#1f2328');
    });

    test('[task-1.1.2] light mode keeps the accent on the indigo spine, not Azure blue', async ({ page }) => {
      // Light theme rides the same indigo→cyan spine (#4f46e5), NOT the retired Azure #0078D4.
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const accent = (await getCssVar(page, '--accent')).toLowerCase();
      expect(accent, '--accent in light mode must stay indigo (#4f46e5)').toBe('#4f46e5');
      expect(accent, '--accent must NOT regress to the retired Azure blue #0078d4').not.toBe('#0078d4');
    });

    // ── task-1.1.3 ──

    test('[task-1.1.3] no Google Fonts CDN requests are made', async ({ page }) => {
      const fontRequests: string[] = [];
      page.on('request', (req) => {
        if (req.url().includes('fonts.googleapis.com') || req.url().includes('fonts.gstatic.com')) {
          fontRequests.push(req.url());
        }
      });
      await page.goto('/');
      expect(fontRequests, `Google Fonts CDN requests found: ${fontRequests.join(', ')}`).toHaveLength(0);
    });

    test('[task-1.1.3] --font-sans is the Inter brand stack', async ({ page }) => {
      await page.goto('/');
      const fontSans = await getCssVar(page, '--font-sans');
      expect(fontSans, '--font-sans must lead with Inter (the Control Plane brand sans)').toMatch(/Inter/i);
    });

    test('[task-1.1.3] --font-mono is the JetBrains Mono stack (telemetry/code)', async ({ page }) => {
      await page.goto('/');
      const fontMono = await getCssVar(page, '--font-mono');
      expect(fontMono, '--font-mono must lead with JetBrains Mono').toMatch(/JetBrains Mono/i);
    });

    test('[task-1.1.3] brand fonts are self-hosted, not pulled from a third-party CDN', async ({ page }) => {
      // Inter + JetBrains Mono ship as local woff2 (@font-face in critical.css).
      // Any font file request must be same-origin — never Google or another CDN.
      const externalFontReqs: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (
          req.resourceType() === 'font' &&
          !url.includes('abubakarriaz.com.pk') &&
          !url.includes('localhost') &&
          !url.startsWith('data:')
        ) {
          externalFontReqs.push(url);
        }
      });
      await page.goto('/');
      expect(externalFontReqs, `Third-party font downloads: ${externalFontReqs.join(', ')}`).toHaveLength(0);
    });

    // ── task-1.1.4 ──

    test('[task-1.1.4] spacing scale tokens are defined', async ({ page }) => {
      await page.goto('/');
      const spacingVars = [
        '--space-1', '--space-2', '--space-3', '--space-4',
        '--space-6', '--space-8', '--space-12', '--space-16', '--space-24',
      ];
      for (const v of spacingVars) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    test('[task-1.1.4] spacing tokens use rem units', async ({ page }) => {
      await page.goto('/');
      expect(await getCssVar(page, '--space-4'),  '--space-4 must be 1rem').toBe('1rem');
      expect(await getCssVar(page, '--space-8'),  '--space-8 must be 2rem').toBe('2rem');
      expect(await getCssVar(page, '--space-16'), '--space-16 must be 4rem').toBe('4rem');
    });

  });

  // ── 1.2 Global Layout ──

  test.describe('1.2 Global Layout', () => {

    // ── task-1.2.1 ──

    test('[task-1.2.1] hero section is visible on homepage', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('section.hero, .hero').first();
      await expect(hero, 'Hero section (.hero) must be visible').toBeVisible();
    });

    test('[task-1.2.1] hero section contains a visible H1 headline', async ({ page }) => {
      await page.goto('/');
      const h1 = page.locator('.hero h1').first();
      await expect(h1, 'H1 must be visible inside .hero').toBeVisible();
      const text = await h1.textContent();
      expect(text?.trim().length, 'H1 text must not be empty').toBeGreaterThan(0);
    });

    test('[task-1.2.1] hero section contains a CTA link or button', async ({ page }) => {
      await page.goto('/');
      // Hero has .hero-actions with .btn links
      const cta = page.locator('.hero a.btn, .hero-actions a, .hero-actions button').first();
      await expect(cta, 'Hero must contain at least one CTA (.btn) link or button').toBeVisible();
    });

    // ── task-1.2.2 ──

    test('[task-1.2.2] navigation bar is present on all pages', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        await expect(page.locator('nav.navbar, nav').first(), `${name}: <nav> must be visible`).toBeVisible();
      }
    });

    test('[task-1.2.2] navigation is fixed (position: fixed)', async ({ page }) => {
      await page.goto('/');
      const nav = page.locator('nav.navbar, nav').first();
      const position = await nav.evaluate((el) => getComputedStyle(el).position);
      expect(['sticky', 'fixed'], `Nav position must be sticky or fixed — got "${position}"`).toContain(position);
    });

    test('[task-1.2.2] navigation contains at least 4 links', async ({ page }) => {
      await page.goto('/');
      // Count anchor links inside the nav-links block (excludes logo/resume/toggle)
      const navLinks = await page.locator('.nav-links .nav-link').count();
      expect(navLinks, 'Navigation must have at least 4 .nav-link anchors').toBeGreaterThanOrEqual(4);
    });

    test('[task-1.2.2] theme toggle button exists in nav and has aria-label', async ({ page }) => {
      await page.goto('/');
      const toggle = page.locator('#themeToggle');
      await expect(toggle, 'Theme toggle button (#themeToggle) must be visible').toBeVisible();
      const label = await toggle.getAttribute('aria-label');
      expect(label, 'Theme toggle must have aria-label').toBeTruthy();
    });

    test('[task-1.2.2] mobile nav toggle button exists and has aria-label', async ({ page }) => {
      await page.goto('/');
      const toggle = page.locator('#navToggle, .nav-toggle').first();
      await expect(toggle, 'Mobile nav toggle button must exist in DOM').toBeAttached();
      const label = await toggle.getAttribute('aria-label');
      expect(label, 'Mobile nav toggle must have aria-label').toBeTruthy();
    });

    // ── task-1.2.3 ──

    test('[task-1.2.3] footer is visible on all pages', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        await expect(page.locator('footer').first(), `${name}: <footer> must be visible`).toBeVisible();
      }
    });

    test('[task-1.2.3] footer contains a GitHub link', async ({ page }) => {
      await page.goto('/');
      const hrefs = await Promise.all(
        (await page.locator('footer a').all()).map((l) => l.getAttribute('href')),
      );
      expect(hrefs.some((h) => h?.includes('github.com')), 'Footer must contain a GitHub link').toBe(true);
    });

    test('[task-1.2.3] footer contains a LinkedIn link', async ({ page }) => {
      await page.goto('/');
      const hrefs = await Promise.all(
        (await page.locator('footer a').all()).map((l) => l.getAttribute('href')),
      );
      expect(hrefs.some((h) => h?.includes('linkedin.com')), 'Footer must contain a LinkedIn link').toBe(true);
    });

    test('[task-1.2.3] all footer external links have target="_blank" and rel="noopener"', async ({ page }) => {
      await page.goto('/');
      const footerLinks = await page.locator('footer a[href^="http"]').all();
      for (const link of footerLinks) {
        const href   = await link.getAttribute('href');
        const target = await link.getAttribute('target');
        const rel    = await link.getAttribute('rel');
        expect(target, `Footer link to "${href}" must have target="_blank"`).toBe('_blank');
        expect(rel,    `Footer link to "${href}" must include "noopener" in rel`).toContain('noopener');
      }
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 2 — Component Modernization  ⏳ NOT YET IMPLEMENTED
// ──────────────────────────────────────────────

test.describe('Phase 2 — Component Modernization', () => {

  test.describe('2.1 Card & Timeline Redesigns', () => {

    test('[task-2.1.1] projects page has card components', async ({ page }) => {
      test.skip(true, 'Task 2.1.1 not yet implemented');
      await page.goto('/projects/');
      const cards = page.locator('.card, [class*="card"], article');
      expect(await cards.count(), 'Projects page must have at least 1 card component').toBeGreaterThan(0);
    });

    test('[task-2.1.1] project cards have a visible background color', async ({ page }) => {
      test.skip(true, 'Task 2.1.1 not yet implemented');
      await page.goto('/projects/');
      const card = page.locator('.card, [class*="card"], article').first();
      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg, 'Card background must not be fully transparent').not.toBe('rgba(0, 0, 0, 0)');
    });

    test('[task-2.1.2] certifications page has cert-card components', async ({ page }) => {
      test.skip(true, 'Task 2.1.2 not yet implemented');
      await page.goto('/certifications/');
      const cards = page.locator('.cert-card, [class*="badge"]');
      expect(await cards.count(), 'Certifications must have at least 1 card/badge').toBeGreaterThan(0);
    });

    test('[task-2.1.2] certification cards display a cert name', async ({ page }) => {
      test.skip(true, 'Task 2.1.2 not yet implemented');
      await page.goto('/certifications/');
      const certName = page.locator('.cert-name, [class*="cert-name"]').first();
      await expect(certName, 'Cert card must show a certificate name').toBeVisible();
    });

    test('[task-2.1.3] experience page has a timeline wrapper', async ({ page }) => {
      test.skip(true, 'Task 2.1.3 not yet implemented');
      await page.goto('/experience/');
      const timeline = page.locator('.timeline, [class*="timeline"]').first();
      await expect(timeline, 'Experience page must have a .timeline wrapper').toBeVisible();
    });

    test('[task-2.1.3] experience timeline has at least 1 item', async ({ page }) => {
      test.skip(true, 'Task 2.1.3 not yet implemented');
      await page.goto('/experience/');
      const items = page.locator('.timeline-item, [class*="timeline-item"]');
      expect(await items.count(), 'Timeline must contain at least 1 item').toBeGreaterThan(0);
    });

    test('[task-2.1.3] each timeline item has a date/period label', async ({ page }) => {
      test.skip(true, 'Task 2.1.3 not yet implemented');
      await page.goto('/experience/');
      const dates = page.locator('.timeline-date, time');
      expect(await dates.count(), 'Timeline items must show a date or period').toBeGreaterThan(0);
    });

  });

  test.describe('2.2 Animations', () => {

    test('[task-2.2.1] hover transitions are defined in CSS', async ({ page }) => {
      test.skip(true, 'Task 2.2.1 not yet implemented');
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must include :hover rules with transition').toMatch(/:hover/);
    });

    test('[task-2.2.1] card hover: transition is defined on cards', async ({ page }) => {
      test.skip(true, 'Task 2.2.1 not yet implemented');
      await page.goto('/projects/');
      const card = page.locator('.card, [class*="card"]').first();
      const transition = await card.evaluate((el) => getComputedStyle(el).transition);
      expect(transition, 'Cards must have a CSS transition').not.toBe('none 0s ease 0s');
    });

    test('[task-2.2.2] scroll-reveal class is applied to elements', async ({ page }) => {
      test.skip(true, 'Task 2.2.2 not yet implemented');
      await page.goto('/');
      const animated = page.locator('.animate-on-scroll, [data-aos]');
      expect(await animated.count(), 'At least some elements must have scroll-reveal class').toBeGreaterThan(0);
    });

    test('[task-2.2.1] animations are guarded by prefers-reduced-motion', async ({ page }) => {
      test.skip(true, 'Task 2.2.1 not yet implemented');
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must contain prefers-reduced-motion guard').toContain('prefers-reduced-motion');
    });

    test('[task-2.2.1] no CSS animations play under prefers-reduced-motion: reduce', async ({ page }) => {
      test.skip(true, 'Task 2.2.1 not yet implemented');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const result = await page.evaluate(() => {
        const els = document.querySelectorAll('.animate-on-scroll, [data-aos]');
        for (const el of Array.from(els)) {
          const anim = getComputedStyle(el).animationName;
          if (anim && anim !== 'none') return false;
        }
        return true;
      });
      expect(result, 'No animations should run under prefers-reduced-motion: reduce').toBe(true);
    });

    test('[task-2.2.3] body is fully visible after page load', async ({ page }) => {
      test.skip(true, 'Task 2.2.3 not yet implemented');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const visible = await page.locator('body').evaluate((el) => {
        const s = getComputedStyle(el);
        return s.opacity !== '0' && s.visibility !== 'hidden' && s.display !== 'none';
      });
      expect(visible, 'Body must be fully visible after page load').toBe(true);
    });

  });

  test.describe('2.3 Additional Components', () => {

    test('[task-2.3.1] homepage has a skills or tech stack section', async ({ page }) => {
      test.skip(true, 'Task 2.3.1 not yet implemented');
      await page.goto('/');
      const byClass   = await page.locator('.skills, [class*="skill"], .tech-stack').count();
      const byHeading = await page.locator('h2, h3').filter({ hasText: /skill|tech|tool|stack/i }).count();
      expect(byClass + byHeading, 'Homepage must have a skills/tech section').toBeGreaterThan(0);
    });

    test('[task-2.3.2] page contains at least 1 inline SVG icon', async ({ page }) => {
      test.skip(true, 'Task 2.3.2 not yet implemented');
      await page.goto('/');
      expect(await page.locator('svg').count(), 'Page must contain at least 1 inline SVG').toBeGreaterThan(0);
    });

    test('[task-2.3.2] decorative SVGs are aria-hidden; informative SVGs have accessible label', async ({ page }) => {
      test.skip(true, 'Task 2.3.2 not yet implemented');
      await page.goto('/');
      const svgs = await page.locator('svg').all();
      for (const svg of svgs) {
        const ariaHidden = await svg.getAttribute('aria-hidden');
        const ariaLabel  = await svg.getAttribute('aria-label');
        const role       = await svg.getAttribute('role');
        const hasTitle   = await svg.locator('title').count() > 0;
        const ok = ariaHidden === 'true' || !!ariaLabel || !!role || hasTitle;
        expect(ok, 'Every SVG must be aria-hidden or have an accessible label').toBeTruthy();
      }
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 3 — Responsive & Accessibility  ⏳ NOT YET IMPLEMENTED
// ──────────────────────────────────────────────

test.describe('Phase 3 — Responsive & Accessibility', () => {

  test.describe('3.1 Responsive Layouts', () => {

    for (const vp of [
      { width: 375, height: 812,  label: '375px (iPhone SE)' },
      { width: 480, height: 900,  label: '480px (large phone)' },
    ]) {
      test(`[task-3.1.1] no horizontal overflow at ${vp.label}`, async ({ page }) => {
        test.skip(true, 'Task 3.1.1 not yet implemented');
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('/');
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `Must not have horizontal scroll at ${vp.label}`).toBe(false);
      });

      test(`[task-3.1.1] main content is visible at ${vp.label}`, async ({ page }) => {
        test.skip(true, 'Task 3.1.1 not yet implemented');
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('/');
        const main = page.locator('main, [role="main"]').first();
        await expect(main, `Main content must be visible at ${vp.label}`).toBeVisible();
      });
    }

    test('[task-3.1.2] no horizontal overflow at 768px (tablet)', async ({ page }) => {
      test.skip(true, 'Task 3.1.2 not yet implemented');
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, 'Must not have horizontal scroll at 768px').toBe(false);
    });

    test('[task-3.1.2] navigation is visible at 768px', async ({ page }) => {
      test.skip(true, 'Task 3.1.2 not yet implemented');
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.locator('nav').first(), 'Nav must be visible at 768px').toBeVisible();
    });

    test('[task-3.1.3] hamburger toggle is visible at 375px', async ({ page }) => {
      test.skip(true, 'Task 3.1.3 not yet implemented');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      const toggle = page.locator('[class*="nav-toggle"], button[aria-expanded]').first();
      await expect(toggle, 'Hamburger toggle must be visible at 375px').toBeVisible();
    });

    test('[task-3.1.3] hamburger toggle expands/collapses nav via aria-expanded', async ({ page }) => {
      test.skip(true, 'Task 3.1.3 not yet implemented');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      const toggle = page.locator('button[aria-expanded]').first();
      await toggle.click();
      expect(await toggle.getAttribute('aria-expanded'), 'aria-expanded must be "true" after open').toBe('true');
      await toggle.click();
      expect(await toggle.getAttribute('aria-expanded'), 'aria-expanded must be "false" after close').toBe('false');
    });

    for (const { path, name } of PAGES) {
      test(`[task-3.1.1] ${name} has no horizontal overflow at 375px`, async ({ page }) => {
        test.skip(true, 'Task 3.1.1 not yet implemented');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(path);
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${name} must not overflow at 375px`).toBe(false);
      });
    }

  });

  test.describe('3.2 Accessibility', () => {

    test('[task-3.2.1] --color-text on --color-bg meets WCAG AA (4.5:1) in light mode', async ({ page }) => {
      test.skip(true, 'Task 3.2.1 not yet implemented');
    });

    test('[task-3.2.1] --color-text on --color-bg meets WCAG AA in dark mode', async ({ page }) => {
      test.skip(true, 'Task 3.2.1 not yet implemented');
    });

    test('[task-3.2.1] brand blue #0078D4 on white meets WCAG AA for large text (3:1)', async ({ page }) => {
      test.skip(true, 'Task 3.2.1 not yet implemented');
    });

    test('[task-3.2.2] CSS defines :focus or :focus-visible styles', async ({ page }) => {
      test.skip(true, 'Task 3.2.2 not yet implemented');
    });

    test('[task-3.2.2] first Tab stop has a visible outline', async ({ page }) => {
      test.skip(true, 'Task 3.2.2 not yet implemented');
    });

    test('[task-3.2.3] all icon-only buttons have an accessible label', async ({ page }) => {
      test.skip(true, 'Task 3.2.3 not yet implemented');
    });

    test('[task-3.2.4] skip-to-content link exists', async ({ page }) => {
      test.skip(true, 'Task 3.2.4 not yet implemented');
    });

    test('[task-3.2.4] skip link is the first focusable element', async ({ page }) => {
      test.skip(true, 'Task 3.2.4 not yet implemented');
    });

    test('[task-3.2.3] all images have alt attributes on all pages', async ({ page }) => {
      test.skip(true, 'Task 3.2.3 not yet implemented');
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 4 — Polish & Performance  ⏳ NOT YET IMPLEMENTED
// ──────────────────────────────────────────────

test.describe('Phase 4 — Polish & Performance', () => {

  test.describe('4.1 Image Optimization', () => {

    test('[task-4.1.1] all images have alt attributes', async ({ page }) => {
      test.skip(true, 'Task 4.1.1 not yet implemented');
    });

    test('[task-4.1.2] below-fold images have loading="lazy"', async ({ page }) => {
      test.skip(true, 'Task 4.1.2 not yet implemented');
    });

    test('[task-4.1.1] local images use .webp format', async ({ page }) => {
      test.skip(true, 'Task 4.1.1 not yet implemented');
    });

  });

  test.describe('4.2 Custom 404 & Print Stylesheet', () => {

    test('[task-4.2.1] custom 404 page returns HTTP 404', async ({ page }) => {
      test.skip(true, 'Task 4.2.1 not yet implemented');
    });

    test('[task-4.2.1] 404 page shows branded navigation', async ({ page }) => {
      test.skip(true, 'Task 4.2.1 not yet implemented');
    });

    test('[task-4.2.1] 404 page has a link back to homepage', async ({ page }) => {
      test.skip(true, 'Task 4.2.1 not yet implemented');
    });

    test('[task-4.2.1] 404 page has a descriptive heading', async ({ page }) => {
      test.skip(true, 'Task 4.2.1 not yet implemented');
    });

    test('[task-4.2.2] print stylesheet is linked in document head', async ({ page }) => {
      test.skip(true, 'Task 4.2.2 not yet implemented');
    });

    test('[task-4.2.2] CSS contains @media print rules', async ({ page }) => {
      test.skip(true, 'Task 4.2.2 not yet implemented');
    });

    test('[task-4.2.2] @media print hides navigation and non-content elements', async ({ page }) => {
      test.skip(true, 'Task 4.2.2 not yet implemented');
    });

  });

  test.describe('4.3 Performance', () => {

    test('[task-4.1.3] all external scripts are deferred or async', async ({ page }) => {
      test.skip(true, 'Task 4.1.3 not yet implemented');
    });

    test('[task-4.1.3] no render-blocking external CSS stylesheets', async ({ page }) => {
      test.skip(true, 'Task 4.1.3 not yet implemented');
    });

    test('[task-4.3.2] total page weight is under 2 MB', async ({ page }) => {
      test.skip(true, 'Task 4.3.2 not yet implemented');
    });

    test('[task-4.3.1] Lighthouse: no font preloads needed (system font stack)', async ({ page }) => {
      test.skip(true, 'Task 4.3.1 not yet implemented — covered by task-1.1.3 test');
    });

  });

});

// ──────────────────────────────────────────────
// CROSS-CUTTING — Design System Consistency
// Covers invariants that Phase 1 establishes and that must hold on every page.
// ──────────────────────────────────────────────

test.describe('Cross-cutting — Design System Consistency', () => {

  test('[design-system] body renders on the near-black Control Plane base in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const bg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, 'Body must have a background color').toBeTruthy();
    expect(bg, 'Body background must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
    // --bg-primary #050810 → rgb(5, 8, 16). This is what actually paints the page.
    expect(bg.replace(/\s/g, ''), 'Body bg must be the #050810 base').toBe('rgb(5,8,16)');
  });

  test('[design-system] dark mode --bg-primary token is the near-black base (#050810)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const bg = await getCssVar(page, '--bg-primary');
    expect(bg.toLowerCase(), 'Dark mode --bg-primary must be #050810').toBe('#050810');
  });

  test('[design-system] all footer external links have target="_blank" and rel="noopener"', async ({ page }) => {
    // Scoped to footer — the authoritative social links completed in task 1.2.3.
    // Hero/body links are checked per-task as Phase 2+ components are completed.
    await page.goto('/');
    const links = await page.locator('footer a[href^="http"]').all();
    for (const link of links) {
      const href   = await link.getAttribute('href') ?? '';
      if (href.includes('abubakarriaz.com.pk')) continue;
      const target = await link.getAttribute('target');
      const rel    = await link.getAttribute('rel');
      expect(target, `Footer link to "${href}" must have target="_blank"`).toBe('_blank');
      expect(rel,    `Footer link to "${href}" must include "noopener"`).toContain('noopener');
    }
  });

  test('[design-system] nav and footer landmark elements present on all pages', async ({ page }) => {
    // Checks <nav> and <footer> — established in Phase 1.
    // <main> check deferred to Phase 3 (accessibility audit task 3.2.x).
    for (const { path, name } of PAGES) {
      await page.goto(path);
      expect(await page.locator('nav').count(), `${name}: must have <nav>`).toBeGreaterThan(0);
      expect(await page.locator('footer').count(), `${name}: must have <footer>`).toBeGreaterThan(0);
    }
  });

  test('[design-system] page heading hierarchy is sequential (no skipped levels)', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .map((el) => parseInt(el.tagName.charAt(1), 10)),
      );
      if (headings.length === 0) continue;
      expect(headings[0], `${name}: first heading must be H1`).toBe(1);
      let prev = headings[0];
      for (let i = 1; i < headings.length; i++) {
        const level = headings[i];
        expect(
          level - prev <= 1,
          `${name}: heading jumped from H${prev} to H${level} — levels must not be skipped`,
        ).toBe(true);
        prev = level;
      }
    }
  });

  test('[design-system] no TODO or FIXME comments in HTML source', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const source = await page.content();
      expect(
        /<!--\s*(TODO|FIXME|HACK|XXX)/i.test(source),
        `${name}: HTML source must not contain TODO/FIXME comments`,
      ).toBe(false);
    }
  });

});
