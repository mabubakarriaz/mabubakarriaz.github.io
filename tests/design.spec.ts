import { test, expect, Page } from '@playwright/test';

/**
 * Design Modernization Test Suite — abubakarriaz.com.pk
 *
 * Tests map directly to the WBS task numbers in Notion:
 * Streams → MVP → Personal Portfolio → Roadmap → 4. Design Modernization
 *
 * Run all:          npx playwright test design.spec.ts
 * Run a phase:      npx playwright test --grep "Phase 1"
 * Run a single task: npx playwright test --grep "task-1.1.1"
 * Run local:        BASE_URL=http://localhost:4000 npx playwright test design.spec.ts
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

/** WCAG relative luminance for an sRGB colour */
function luminance(r: number, g: number, b: number): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio between two hex colours */
function contrastRatio(hex1: string, hex2: string): number {
  const parse = (h: string) => {
    const c = h.replace('#', '');
    return {
      r: parseInt(c.substring(0, 2), 16),
      g: parseInt(c.substring(2, 4), 16),
      b: parseInt(c.substring(4, 6), 16),
    };
  };
  const c1 = parse(hex1);
  const c2 = parse(hex2);
  const l1 = luminance(c1.r, c1.g, c1.b);
  const l2 = luminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ──────────────────────────────────────────────
// PHASE 1 — Foundation & Design System Setup
// ──────────────────────────────────────────────

test.describe('Phase 1 — Foundation & Design System Setup', () => {

  // ── 1.1 Design Tokens ──

  test.describe('1.1 Design Tokens', () => {

    test('[task-1.1.1] color tokens are defined on :root', async ({ page }) => {
      await page.goto('/');
      const colorVars = [
        '--color-primary', '--color-primary-dark', '--color-primary-light',
        '--color-bg', '--color-surface', '--color-border',
        '--color-text', '--color-text-muted', '--color-text-disabled',
        '--color-success', '--color-warning', '--color-info', '--color-error',
      ];
      for (const v of colorVars) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined on :root`).toBeTruthy();
      }
    });

    test('[task-1.1.1] primary brand color is Azure blue #0078D4 in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const primary = await getCssVar(page, '--color-primary');
      expect(primary.toLowerCase(), '--color-primary should be #0078d4 in light mode').toBe('#0078d4');
    });

    test('[task-1.1.1] background token is white in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const bg = await getCssVar(page, '--color-bg');
      expect(bg.toLowerCase(), '--color-bg should be #ffffff in light mode').toBe('#ffffff');
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

    test('[task-1.1.1] shadow tokens are defined', async ({ page }) => {
      await page.goto('/');
      for (const v of ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl']) {
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
      for (const v of ['--duration-fast', '--duration-normal', '--duration-slow', '--ease-default']) {
        const value = await getCssVar(page, v);
        expect(value, `${v} must be defined`).toBeTruthy();
      }
    });

    test('[task-1.1.2] dark mode switches --color-primary to #2B88D8', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const primary = await getCssVar(page, '--color-primary');
      expect(primary.toLowerCase(), '--color-primary in dark mode should be #2b88d8').toBe('#2b88d8');
    });

    test('[task-1.1.2] dark mode switches --color-bg to #1A1A1A', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const bg = await getCssVar(page, '--color-bg');
      expect(bg.toLowerCase(), '--color-bg in dark mode should be #1a1a1a').toBe('#1a1a1a');
    });

    test('[task-1.1.2] dark mode switches --color-text to #F0F0F0', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const text = await getCssVar(page, '--color-text');
      expect(text.toLowerCase(), '--color-text in dark mode should be #f0f0f0').toBe('#f0f0f0');
    });

    test('[task-1.1.2] prefers-color-scheme media query is present in CSS', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must contain prefers-color-scheme: dark media query').toContain('prefers-color-scheme');
    });

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

    test('[task-1.1.3] --font-sans uses Segoe UI or system-ui stack', async ({ page }) => {
      await page.goto('/');
      const fontSans = await getCssVar(page, '--font-sans');
      expect(fontSans, '--font-sans must include Segoe UI or system-ui').toMatch(/Segoe UI|system-ui|-apple-system/i);
    });

    test('[task-1.1.3] no external font file downloads (self-hosted or system only)', async ({ page }) => {
      const externalFontRequests: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (
          req.resourceType() === 'font' &&
          !url.includes('abubakarriaz.com.pk') &&
          !url.includes('localhost')
        ) {
          externalFontRequests.push(url);
        }
      });
      await page.goto('/');
      expect(externalFontRequests, `External font downloads found: ${externalFontRequests.join(', ')}`).toHaveLength(0);
    });

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

    test('[task-1.1.4] spacing tokens are rem-based', async ({ page }) => {
      await page.goto('/');
      expect(await getCssVar(page, '--space-4'), '--space-4 should be 1rem').toBe('1rem');
      expect(await getCssVar(page, '--space-8'), '--space-8 should be 2rem').toBe('2rem');
      expect(await getCssVar(page, '--space-16'), '--space-16 should be 4rem').toBe('4rem');
    });

  });

  // ── 1.2 Global Layout ──

  test.describe('1.2 Global Layout', () => {

    test('[task-1.2.1] hero section is visible on homepage', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('.hero, [class*="hero"], section').first();
      await expect(hero, 'Hero section must be visible').toBeVisible();
    });

    test('[task-1.2.1] hero section contains a visible H1 headline', async ({ page }) => {
      await page.goto('/');
      const h1 = page.locator('h1').first();
      await expect(h1, 'H1 must be visible in the hero').toBeVisible();
      const text = await h1.textContent();
      expect(text?.trim().length, 'H1 must not be empty').toBeGreaterThan(0);
    });

    test('[task-1.2.1] hero section contains a CTA link or button', async ({ page }) => {
      await page.goto('/');
      const cta = page.locator(
        '.hero a, [class*="hero"] a, .hero button, [class*="cta"], a[class*="btn"], a[class*="button"]',
      ).first();
      await expect(cta, 'Hero must contain at least one CTA link or button').toBeVisible();
    });

    test('[task-1.2.2] navigation bar is present on homepage', async ({ page }) => {
      await page.goto('/');
      const nav = page.locator('nav, header').first();
      await expect(nav, 'Navigation element must be visible').toBeVisible();
    });

    test('[task-1.2.2] navigation is sticky (position: sticky or fixed)', async ({ page }) => {
      await page.goto('/');
      const nav = page.locator('nav, header').first();
      const position = await nav.evaluate((el) => getComputedStyle(el).position);
      expect(['sticky', 'fixed'], `Navigation position must be sticky or fixed, got: "${position}"`).toContain(position);
    });

    test('[task-1.2.2] navigation contains at least 4 links', async ({ page }) => {
      await page.goto('/');
      const navLinks = await page.locator('nav a, header a').all();
      expect(navLinks.length, 'Navigation must contain at least 4 links').toBeGreaterThanOrEqual(4);
    });

    test('[task-1.2.3] footer is visible on all pages', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        await expect(page.locator('footer'), `${name}: footer must be visible`).toBeVisible();
      }
    });

    test('[task-1.2.3] footer contains a GitHub link', async ({ page }) => {
      await page.goto('/');
      const footerLinks = await page.locator('footer a').all();
      const hrefs = await Promise.all(footerLinks.map((l) => l.getAttribute('href')));
      expect(hrefs.some((h) => h?.includes('github.com')), 'Footer must contain a GitHub link').toBe(true);
    });

    test('[task-1.2.3] footer contains a LinkedIn link', async ({ page }) => {
      await page.goto('/');
      const footerLinks = await page.locator('footer a').all();
      const hrefs = await Promise.all(footerLinks.map((l) => l.getAttribute('href')));
      expect(hrefs.some((h) => h?.includes('linkedin.com')), 'Footer must contain a LinkedIn link').toBe(true);
    });

    test('[task-1.2.3] footer external links have target="_blank" and rel="noopener"', async ({ page }) => {
      await page.goto('/');
      const footerLinks = await page.locator('footer a[href^="http"]').all();
      for (const link of footerLinks) {
        const href   = await link.getAttribute('href');
        const target = await link.getAttribute('target');
        const rel    = await link.getAttribute('rel');
        expect(target, `Footer link to ${href} must have target="_blank"`).toBe('_blank');
        expect(rel, `Footer link to ${href} must include "noopener"`).toContain('noopener');
      }
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 2 — Component Modernization
// ──────────────────────────────────────────────

test.describe('Phase 2 — Component Modernization', () => {

  // ── 2.1 Card & Timeline Redesigns ──

  test.describe('2.1 Card & Timeline Redesigns', () => {

    test('[task-2.1.1] projects page has card components', async ({ page }) => {
      await page.goto('/projects/');
      const cards = page.locator('.card, [class*="card"], article');
      expect(await cards.count(), 'Projects page must have at least 1 card component').toBeGreaterThan(0);
    });

    test('[task-2.1.1] project cards have a visible background color', async ({ page }) => {
      await page.goto('/projects/');
      const card = page.locator('.card, [class*="card"], article').first();
      await expect(card, 'Project card must be visible').toBeVisible();
      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg, 'Project card must have a background color').toBeTruthy();
      expect(bg, 'Project card background must not be fully transparent').not.toBe('rgba(0, 0, 0, 0)');
    });

    test('[task-2.1.2] certifications page has cert-card components', async ({ page }) => {
      await page.goto('/certifications/');
      const cards = page.locator('.cert-card, [class*="cert-card"], [class*="badge"], [class*="card"]');
      expect(await cards.count(), 'Certifications page must have at least 1 card/badge component').toBeGreaterThan(0);
    });

    test('[task-2.1.2] certification cards display a cert name', async ({ page }) => {
      await page.goto('/certifications/');
      const certName = page.locator('.cert-name, [class*="cert-name"], .cert-card h3, .cert-card h4').first();
      await expect(certName, 'Each cert card must display a certificate name').toBeVisible();
    });

    test('[task-2.1.3] experience page has a timeline wrapper', async ({ page }) => {
      await page.goto('/experience/');
      const timeline = page.locator('.timeline, [class*="timeline"]').first();
      await expect(timeline, 'Experience page must have a .timeline wrapper').toBeVisible();
    });

    test('[task-2.1.3] experience timeline has at least 1 item', async ({ page }) => {
      await page.goto('/experience/');
      const items = page.locator('.timeline-item, [class*="timeline-item"], .timeline > li, .timeline > article');
      expect(await items.count(), 'Timeline must contain at least 1 item').toBeGreaterThan(0);
    });

    test('[task-2.1.3] each timeline item has a date/period label', async ({ page }) => {
      await page.goto('/experience/');
      const dates = page.locator('.timeline-date, [class*="date"], time');
      expect(await dates.count(), 'Timeline items must show a date or period').toBeGreaterThan(0);
    });

  });

  // ── 2.2 Animations ──

  test.describe('2.2 Animations', () => {

    test('[task-2.2.1] hover transitions are defined in CSS', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must include :hover rules with transition').toMatch(/:hover/);
    });

    test('[task-2.2.1] card hover: transform or box-shadow changes on hover', async ({ page }) => {
      await page.goto('/projects/');
      const card = page.locator('.card, [class*="card"]').first();
      if (await card.count() === 0) return; // skip if no cards yet
      const transition = await card.evaluate((el) => getComputedStyle(el).transition);
      expect(transition, 'Cards must have a CSS transition defined').toBeTruthy();
      expect(transition, 'Cards transition must not be "none"').not.toBe('none 0s ease 0s');
    });

    test('[task-2.2.2] scroll-reveal class is applied to elements', async ({ page }) => {
      await page.goto('/');
      const animated = page.locator('.animate-on-scroll, [data-aos], [class*="reveal"], [class*="fade-in"]');
      expect(await animated.count(), 'At least some elements must carry a scroll-reveal class').toBeGreaterThan(0);
    });

    test('[task-2.2.1] all animations are guarded by prefers-reduced-motion', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(
        cssText,
        'CSS must contain a prefers-reduced-motion guard for all animations',
      ).toContain('prefers-reduced-motion');
    });

    test('[task-2.2.1] no CSS animations play when prefers-reduced-motion: reduce', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      // Check that animated elements report animation: none or transition: none under reduced motion
      const result = await page.evaluate(() => {
        const els = document.querySelectorAll('.animate-on-scroll, [data-aos]');
        for (const el of Array.from(els)) {
          const anim = getComputedStyle(el).animationName;
          if (anim && anim !== 'none') return false;
        }
        return true;
      });
      expect(result, 'No animations should run when prefers-reduced-motion is "reduce"').toBe(true);
    });

    test('[task-2.2.3] body is fully visible after page load (no lingering hidden state)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const visible = await page.locator('body').evaluate((el) => {
        const s = getComputedStyle(el);
        return s.opacity !== '0' && s.visibility !== 'hidden' && s.display !== 'none';
      });
      expect(visible, 'Body must be fully visible after page load completes').toBe(true);
    });

  });

  // ── 2.3 Additional Components ──

  test.describe('2.3 Additional Components', () => {

    test('[task-2.3.1] homepage has a skills or tech stack section', async ({ page }) => {
      await page.goto('/');
      // Accept a section with a matching class or a heading containing relevant keywords
      const byClass   = await page.locator('.skills, [class*="skill"], .tech-stack, [class*="tech"]').count();
      const byHeading = await page.locator('h2, h3').filter({ hasText: /skill|tech|tool|stack|expertise/i }).count();
      expect(byClass + byHeading, 'Homepage must have a skills or tech section').toBeGreaterThan(0);
    });

    test('[task-2.3.2] page contains at least 1 inline SVG icon', async ({ page }) => {
      await page.goto('/');
      const svgs = await page.locator('svg').count();
      expect(svgs, 'Page must contain at least 1 inline SVG icon').toBeGreaterThan(0);
    });

    test('[task-2.3.2] decorative SVGs are aria-hidden; informative SVGs have accessible label', async ({ page }) => {
      await page.goto('/');
      const svgs = await page.locator('svg').all();
      for (const svg of svgs) {
        const ariaHidden   = await svg.getAttribute('aria-hidden');
        const ariaLabel    = await svg.getAttribute('aria-label');
        const role         = await svg.getAttribute('role');
        const hasTitle     = await svg.locator('title').count() > 0;
        const accessible   = ariaHidden === 'true' || !!ariaLabel || !!role || hasTitle;
        expect(accessible, 'Every SVG must be aria-hidden="true" or carry an accessible label').toBeTruthy();
      }
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 3 — Responsive & Accessibility
// ──────────────────────────────────────────────

test.describe('Phase 3 — Responsive & Accessibility', () => {

  // ── 3.1 Responsive Layouts ──

  test.describe('3.1 Responsive Layouts', () => {

    for (const viewport of [
      { width: 375, height: 812,  label: '375px (iPhone SE)' },
      { width: 480, height: 900,  label: '480px (large phone)' },
    ]) {
      test(`[task-3.1.1] no horizontal overflow at ${viewport.label}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `Must not have horizontal scroll at ${viewport.label}`).toBe(false);
      });

      test(`[task-3.1.1] main content is visible at ${viewport.label}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        const main = page.locator('main, [role="main"]').first();
        await expect(main, `Main content must be visible at ${viewport.label}`).toBeVisible();
      });
    }

    test('[task-3.1.2] no horizontal overflow at 768px (tablet)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, 'Must not have horizontal scroll at 768px tablet').toBe(false);
    });

    test('[task-3.1.2] navigation is visible at 768px', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.locator('nav, header').first(), 'Navigation must be visible at 768px').toBeVisible();
    });

    test('[task-3.1.3] hamburger toggle is visible at 375px', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      const toggle = page.locator(
        '[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"], button[aria-expanded]',
      ).first();
      await expect(toggle, 'Hamburger menu toggle must be visible at 375px').toBeVisible();
    });

    test('[task-3.1.3] hamburger toggle expands and collapses nav (aria-expanded)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      const toggle = page.locator(
        '[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"], button[aria-expanded]',
      ).first();

      await toggle.click();
      expect(
        await toggle.getAttribute('aria-expanded'),
        'aria-expanded must be "true" after opening menu',
      ).toBe('true');

      await toggle.click();
      expect(
        await toggle.getAttribute('aria-expanded'),
        'aria-expanded must be "false" after closing menu',
      ).toBe('false');
    });

    // Repeat no-overflow check on all pages at mobile
    for (const { path, name } of PAGES) {
      test(`[task-3.1.1] ${name} has no horizontal overflow at 375px`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(path);
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${name} must not overflow horizontally at 375px`).toBe(false);
      });
    }

  });

  // ── 3.2 Accessibility ──

  test.describe('3.2 Accessibility', () => {

    test('[task-3.2.1] --color-text on --color-bg meets WCAG AA (4.5:1) in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      const textColor = await getCssVar(page, '--color-text');
      const bgColor   = await getCssVar(page, '--color-bg');
      const ratio = contrastRatio(textColor, bgColor);
      expect(
        ratio,
        `Text (${textColor}) on bg (${bgColor}) contrast ${ratio.toFixed(2)} must be ≥4.5 (WCAG AA)`,
      ).toBeGreaterThanOrEqual(4.5);
    });

    test('[task-3.2.1] --color-text on --color-bg meets WCAG AA in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      const textColor = await getCssVar(page, '--color-text');
      const bgColor   = await getCssVar(page, '--color-bg');
      const ratio = contrastRatio(textColor, bgColor);
      expect(
        ratio,
        `Dark: text (${textColor}) on bg (${bgColor}) contrast ${ratio.toFixed(2)} must be ≥4.5`,
      ).toBeGreaterThanOrEqual(4.5);
    });

    test('[task-3.2.1] brand blue #0078D4 on white meets WCAG AA for large text (3:1)', async ({ page }) => {
      await page.goto('/');
      const ratio = contrastRatio('#0078D4', '#FFFFFF');
      expect(ratio, `Brand blue on white (${ratio.toFixed(2)}) must be ≥3:1 for large text`).toBeGreaterThanOrEqual(3);
    });

    test('[task-3.2.2] CSS defines :focus or :focus-visible styles', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must define :focus or :focus-visible styles').toMatch(/:focus(-visible)?/);
    });

    test('[task-3.2.2] first Tab stop has a visible outline', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused, 'First Tab-focused element must be visible').toBeVisible();
      const outline = await focused.evaluate((el) => {
        const s = getComputedStyle(el);
        return s.outlineWidth !== '0px' && s.outlineStyle !== 'none';
      });
      expect(outline, 'Focused element must have a visible outline (non-zero, non-none)').toBe(true);
    });

    test('[task-3.2.3] all icon-only buttons have an accessible label', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const buttons = await page.locator('button, a[role="button"]').all();
        for (const btn of buttons) {
          const visibleText = (await btn.textContent())?.trim() ?? '';
          if (visibleText.length > 0) continue; // has visible text — fine
          const ariaLabel      = await btn.getAttribute('aria-label');
          const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
          const title          = await btn.getAttribute('title');
          expect(
            ariaLabel || ariaLabelledBy || title,
            `${name}: icon-only button must have aria-label, aria-labelledby, or title`,
          ).toBeTruthy();
        }
      }
    });

    test('[task-3.2.4] skip-to-content link exists in <head>/<body> start', async ({ page }) => {
      await page.goto('/');
      const skip = page.locator('a[href="#main-content"], a[href="#content"], a[href="#main"]');
      expect(await skip.count(), 'Page must have a skip-to-content link').toBeGreaterThan(0);
    });

    test('[task-3.2.4] skip link is the first focusable element (first Tab stop)', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      const href = await page.locator(':focus').getAttribute('href');
      expect(href, 'First Tab stop must be the skip-to-content link').toMatch(/^#(main|content|main-content)$/);
    });

    test('[task-3.2.3] all images have alt attributes on all pages', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const imgs = await page.locator('img').all();
        for (const img of imgs) {
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          expect(alt, `${name}: img[src="${src}"] must have an alt attribute`).not.toBeNull();
        }
      }
    });

  });

});

// ──────────────────────────────────────────────
// PHASE 4 — Polish & Performance
// ──────────────────────────────────────────────

test.describe('Phase 4 — Polish & Performance', () => {

  // ── 4.1 Image Optimization ──

  test.describe('4.1 Image Optimization', () => {

    test('[task-4.1.1] all images have alt attributes', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const imgs = await page.locator('img').all();
        for (const img of imgs) {
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          expect(alt, `${name}: img[src="${src}"] must have alt attribute (empty is OK for decorative)`).not.toBeNull();
        }
      }
    });

    test('[task-4.1.2] below-fold images have loading="lazy"', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const imgs = await page.locator('img').all();
        if (imgs.length <= 1) continue; // single or no images — skip
        for (const img of imgs.slice(1)) {
          const loading = await img.getAttribute('loading');
          const src     = await img.getAttribute('src');
          expect(loading, `${name}: img[src="${src}"] must have loading="lazy"`).toBe('lazy');
        }
      }
    });

    test('[task-4.1.1] local images use .webp format', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const imgs = await page.locator('img').all();
        for (const img of imgs) {
          const src = (await img.getAttribute('src')) ?? '';
          // Skip external images and data URIs
          if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
          // Local images should not be unoptimised JPEG/PNG
          const isUnoptimised = /\.(jpg|jpeg|png)(\?.*)?$/i.test(src);
          expect(
            isUnoptimised,
            `${name}: local img "${src}" should be converted to .webp for performance`,
          ).toBe(false);
        }
      }
    });

  });

  // ── 4.2 Custom 404 & Print Stylesheet ──

  test.describe('4.2 Custom 404 & Print Stylesheet', () => {

    test('[task-4.2.1] custom 404 page returns HTTP 404', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-xyz-404-check');
      expect(response?.status(), '404 page must return HTTP 404 status').toBe(404);
    });

    test('[task-4.2.1] 404 page shows branded navigation', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-xyz-404-check');
      await expect(page.locator('nav, header').first(), '404 page must show site navigation').toBeVisible();
    });

    test('[task-4.2.1] 404 page has a link back to homepage', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-xyz-404-check');
      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink, '404 page must have a link back to homepage').toBeVisible();
    });

    test('[task-4.2.1] 404 page has a descriptive heading', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-xyz-404-check');
      const heading = page.locator('h1, h2').first();
      await expect(heading, '404 page must have a heading').toBeVisible();
      const text = await heading.textContent();
      expect(text?.trim().length, '404 heading must not be empty').toBeGreaterThan(0);
    });

    test('[task-4.2.2] print stylesheet is linked in document head', async ({ page }) => {
      await page.goto('/');
      const printLink = page.locator('link[media="print"], link[href*="print"]');
      expect(await printLink.count(), 'A print stylesheet must be linked in <head>').toBeGreaterThan(0);
    });

    test('[task-4.2.2] CSS contains @media print rules', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      expect(cssText, 'CSS must contain @media print rules').toContain('@media print');
    });

    test('[task-4.2.2] @media print hides navigation and non-content elements', async ({ page }) => {
      await page.goto('/');
      const cssText = await getAllCssText(page);
      // The print block should hide at least one structural element
      expect(
        cssText,
        '@media print block must hide nav, header, footer, or similar elements',
      ).toMatch(/@media print[^{]*\{[^}]*(nav|header|footer|button)[^}]*display\s*:\s*none/s);
    });

  });

  // ── 4.3 Performance ──

  test.describe('4.3 Performance', () => {

    test('[task-4.1.3] all external scripts are deferred or async', async ({ page }) => {
      for (const { path, name } of PAGES) {
        await page.goto(path);
        const scripts = await page.locator('script[src]').all();
        for (const script of scripts) {
          const src       = await script.getAttribute('src') ?? '';
          const defer     = await script.getAttribute('defer');
          const asyncAttr = await script.getAttribute('async');
          const type      = await script.getAttribute('type');
          // Module scripts defer by default; skip them
          if (type === 'module') continue;
          expect(
            defer !== null || asyncAttr !== null,
            `${name}: script[src="${src}"] must have defer or async attribute`,
          ).toBe(true);
        }
      }
    });

    test('[task-4.1.3] no render-blocking external CSS stylesheets', async ({ page }) => {
      const blockingCSS: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        const isExternal = !url.includes('abubakarriaz.com.pk') && !url.includes('localhost');
        if (req.resourceType() === 'stylesheet' && isExternal) {
          blockingCSS.push(url);
        }
      });
      await page.goto('/');
      expect(blockingCSS, `Render-blocking external CSS: ${blockingCSS.join(', ')}`).toHaveLength(0);
    });

    test('[task-4.3.2] total page weight is under 2 MB', async ({ page }) => {
      let totalBytes = 0;
      page.on('response', async (resp) => {
        const contentLength = parseInt(resp.headers()['content-length'] ?? '0', 10);
        totalBytes += contentLength;
      });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const totalKB = (totalBytes / 1024).toFixed(0);
      expect(
        totalBytes,
        `Total page weight ${totalKB} KB must be under 2048 KB (2 MB)`,
      ).toBeLessThan(2 * 1024 * 1024);
    });

    test('[task-4.3.1] Lighthouse: no font preloads needed (system font stack)', async ({ page }) => {
      // Design task 1.1.3 switched to a system font stack — no font files, no preload links required
      await page.goto('/');
      const fontPreloads = await page.locator('link[rel="preload"][as="font"]').count();
      expect(
        fontPreloads,
        'System font stack requires zero font file preloads — expected 0',
      ).toBe(0);
    });

  });

});

// ──────────────────────────────────────────────
// CROSS-CUTTING — Design System Consistency
// ──────────────────────────────────────────────

test.describe('Cross-cutting — Design System Consistency', () => {

  test('[design-system] body has a non-transparent background color', async ({ page }) => {
    await page.goto('/');
    const bg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, 'Body must have a background color').toBeTruthy();
    expect(bg, 'Body background must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
  });

  test('[design-system] dark mode applies dark background to body', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const bg = await getCssVar(page, '--color-bg');
    expect(bg.toLowerCase(), 'Dark mode --color-bg must be #1a1a1a').toBe('#1a1a1a');
  });

  test('[design-system] all external links have target="_blank" and rel="noopener"', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const links = await page.locator('a[href^="http"]').all();
      for (const link of links) {
        const href = await link.getAttribute('href') ?? '';
        // Skip own-domain links
        if (href.includes('abubakarriaz.com.pk')) continue;
        const target = await link.getAttribute('target');
        const rel    = await link.getAttribute('rel');
        expect(target, `${name}: link to "${href}" must have target="_blank"`).toBe('_blank');
        expect(rel, `${name}: link to "${href}" must include rel="noopener"`).toContain('noopener');
      }
    }
  });

  test('[design-system] all pages use semantic landmark elements (nav, main, footer)', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      expect(await page.locator('nav').count(), `${name}: must have <nav>`).toBeGreaterThan(0);
      expect(await page.locator('main, [role="main"]').count(), `${name}: must have <main>`).toBeGreaterThan(0);
      expect(await page.locator('footer').count(), `${name}: must have <footer>`).toBeGreaterThan(0);
    }
  });

  test('[design-system] no inline style attributes with hardcoded colors', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const inlineColors = await page.evaluate(() => {
        const els = document.querySelectorAll('[style]');
        const found: string[] = [];
        for (const el of Array.from(els)) {
          const style = (el as HTMLElement).style;
          if (style.color && !style.color.startsWith('var(')) {
            found.push(`color: ${style.color}`);
          }
          if (style.backgroundColor && !style.backgroundColor.startsWith('var(')) {
            found.push(`background-color: ${style.backgroundColor}`);
          }
        }
        return found;
      });
      expect(
        inlineColors.length,
        `${name}: found hardcoded inline colors: ${inlineColors.join('; ')} — use CSS variables instead`,
      ).toBe(0);
    }
  });

  test('[design-system] page heading hierarchy is sequential (no skipped levels)', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .map((el) => parseInt(el.tagName.charAt(1), 10)),
      );
      let prev = 0;
      for (let i = 0; i < headings.length; i++) {
        const level = headings[i];
        if (i === 0) {
          expect(level, `${name}: first heading must be H1`).toBe(1);
        } else {
          expect(
            level - prev <= 1,
            `${name}: heading jumped from H${prev} to H${level} — no skipping allowed`,
          ).toBe(true);
        }
        prev = level;
      }
    }
  });

  test('[design-system] no TODO or FIXME comments left in HTML source', async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      const source = await page.content();
      const hasTodo = /<!--\s*(TODO|FIXME|HACK|XXX)/i.test(source);
      expect(hasTodo, `${name}: HTML source must not contain TODO/FIXME comments`).toBe(false);
    }
  });

});
