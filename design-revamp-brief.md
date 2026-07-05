# Master Prompt — Brand Realignment for abubakarriaz.com.pk

> **How to use this file:** Drop it into the portfolio site repo and prompt:
> *"Use the impeccable design skill to execute the brand realignment described in this file. Audit the current site first, propose the token + component plan, then work through the tasks in order — verifying every change in both light and dark themes."*
> This brief is **self-contained** — everything the design work needs (brand system, decisions, constraints, tasks, definition of done) is below. No external files required.

---

## Mission

Strip the generic, AI-generated look off the portfolio and rebuild its visual layer on the owner's **real brand system**. The site should read as **deliberately designed** — a credible technical-authority hub for an Azure / DevOps / cloud-native engineer — not a default template.

**The "AI slop" to remove (concrete tells on the current site):**
- Emoji icons used as UI (☁️ 🔧 🐙 📊) — everywhere they appear.
- Off-brand type + palette: **Inter** font, **GitHub-dark `#0D1117` / Azure `#0078D4`** colors.
- Trend-chasing effects: **gradient clip-text hero headline**, **heavy staggered scroll-reveal** animations.
- Flat, undifferentiated tag/pill list for skills.
- Dark-mode-as-default with no real brand identity behind it.

---

## Decisions already made (do not re-litigate)

1. **Brand-light is the DEFAULT theme; a brand-derived dark variant is kept.** The existing dark/light toggle stays — re-skin **both** themes in brand colors, and flip the default from dark to light.
2. **Re-spec to brand, cut the slop.** Keep the useful *structure* (hero, skills, footer, mobile, a11y) and rebuild it on the brand system. Drop the gradient clip-text, the heavy scroll-stagger, all emoji, Inter, and the Azure palette.

---

## The brand system (single source of truth)

Define these once as CSS custom properties and reference them everywhere. **Brand-light = `:root` (default); brand-dark = `[data-theme="dark"]`.** Light values are canonical (from the brand guidelines); dark values are derived to keep the same hues legible on Midnight — verify their contrast and tune if needed.

### Color + type tokens

```css
/* ========== BRAND LIGHT (default) ========== */
:root {
  /* Surfaces */
  --color-bg-primary:   #FFFFFF;   /* White — page background */
  --color-bg-surface:   #F4F7FC;   /* Mist — section bands */
  --color-bg-elevated:  #EEF3FB;   /* Frost — cards, raised surfaces */
  --color-border:       #E3EAF6;   /* Border */

  /* Text */
  --color-text-primary:   #10306B; /* Navy — headings */
  --color-text-body:      #33415C; /* Ink — body copy */
  --color-text-secondary: #5A6B8C; /* Slate — metadata, captions */

  /* Brand accents */
  --color-accent:        #1550B8;  /* Royal — links, primary buttons */
  --color-accent-hover:  #10306B;  /* Navy — button/link hover */
  --color-accent-bright: #3D8BF2;  /* Sky — highlights, gradient top */
  --color-accent-orange: #F5871F;  /* Orange — eyebrow, signature period; ≤10% of any view */

  /* Type */
  --font-sans:   'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace;
  --fw-body:     400;   /* body 15–16px */
  --fw-medium:   500;   /* emphasis / secondary body */
  --fw-label:    600;   /* labels */
  --fw-heading:  700;   /* headings */
  --fw-display:  800;   /* display / wordmarks */
  --leading-body: 1.7;

  /* Spacing scale (4px base) */
  --space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 1rem;
  --space-lg: 1.5rem;  --space-xl: 2rem;   --space-2xl: 3rem; --space-3xl: 4rem;

  /* Shape + depth */
  --radius-card: 20px;
  --radius-sm:   8px;
  --radius-full: 9999px;
  --shadow-card: 0 8px 30px rgba(16,48,107,.08);

  /* Brand gradients */
  --gradient-mark: linear-gradient(135deg, #3D8BF2, #1550B8);
  --gradient-hero: linear-gradient(160deg, #4D95F5, #2568D6 55%, #123C8F);
  /* + a soft orange radial glow layered over the hero at low opacity (stays within the ≤10% budget) */

  --transition-base: 250ms ease;
}

/* ========== BRAND DARK (derived variant) ========== */
[data-theme="dark"] {
  --color-bg-primary:   #0B1526;   /* Midnight */
  --color-bg-surface:   #101E38;   /* derived */
  --color-bg-elevated:  #15264A;   /* derived */
  --color-border:       #24365C;   /* derived */

  --color-text-primary:   #EEF3FB; /* Frost */
  --color-text-body:      #C6D2E8; /* derived */
  --color-text-secondary: #8DA0C4; /* derived */

  --color-accent:        #3D8BF2;  /* Sky reads better than Royal on Midnight */
  --color-accent-hover:  #6FA9F6;  /* derived lighter */
  --color-accent-bright: #4D95F5;
  --color-accent-orange: #F5871F;

  --shadow-card: 0 8px 30px rgba(0,0,0,.35);
}
```

### Typography scale (Poppins)

```css
--text-display: clamp(2.5rem, 5vw + 1rem, 4.25rem); /* hero headline, fw 800 */
--text-h1:      clamp(2rem, 3vw + .5rem, 3rem);      /* fw 700 */
--text-h2:      clamp(1.5rem, 2vw + .5rem, 2.25rem); /* fw 700 */
--text-h3:      clamp(1.125rem, 1.5vw + .25rem, 1.5rem); /* fw 600 */
--text-body:    1rem;       /* 16px, line-height 1.7, fw 400/500 */
--text-small:   0.875rem;   /* 14px */
--text-eyebrow: 0.75rem;    /* 12px — uppercase, +2.5px tracking, orange, fw 600 */
```

### Signature components

- **Eyebrow label** (kicker above section headings): `text-transform: uppercase; letter-spacing: 2.5px; font: var(--fw-label) var(--text-eyebrow)/1 var(--font-sans); color: var(--color-accent-orange);`
- **Signature**: the name in Navy followed by an **orange period** — `Abubakar Riaz` + `<span style="color:var(--color-accent-orange)">.</span>`
- **Card**: `background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-card);`
- **Primary button**: Royal background → **Navy on hover**, white text, `--radius-full` or `--radius-sm`, `--fw-label`.
- **Secondary button**: transparent, `1px solid var(--color-border)` → border/text become Royal on hover.

### Hard rules (non-negotiable)

- **Orange ≤ 10% of any single view** — eyebrows, the signature period, one focal highlight. Never a background or large fill.
- **No emoji anywhere in the UI.** Replace with brand-colored text labels or minimal inline SVG using `currentColor` — **never a stock icon set**.
- **JetBrains Mono only for code, hex values, and URLs.** Never body text, never headings, never labels.
- **Poppins for everything else** (body 400/500, labels 600, headings 700, display 800).

---

## Tech constraints

- **Stack:** Jekyll + GitHub Pages, **vanilla CSS custom properties**, minimal vanilla JS. No frameworks, no build-heavy tooling.
- **Fonts self-hosted** (woff2, `@font-face`, `font-display: swap`, preload the primary weight). **No Google Fonts / external font CDN** — the site already hardened this for SEO; do not regress it.
- **Don't regress performance or SEO.** The site has prior PageSpeed/SEO work (canonicals, schema, OG/Twitter cards, WebP, lazy-loading, self-hosted fonts). Keep all of it intact.
- **Accessibility is part of done:** WCAG 2.1 AA contrast in both themes, visible `:focus-visible` rings, logical tab order, `prefers-reduced-motion` respected, Lighthouse a11y ≥ 95.

## Current site inventory (what exists to work with)

- Dark/light **toggle plumbing already built** — but on the wrong (generic) tokens. Migrate it; don't rebuild from scratch.
- Typing animation ✓ · `<AR/>` nav logo ✓ · stats bar (15+ Years / 25+ Certs / 40+ Projects / 8 Companies) ✓ · footer newsletter CTA + RSS ✓ · social links (GitHub, LinkedIn, MS Learn, Hashnode) ✓ · resume download button ✓ — **keep these; re-skin them.**
- **Remove:** emoji icons, flat skill pills, Inter font, Azure/GitHub-dark palette, gradient clip-text hero, heavy scroll-stagger.

---

## The work — ordered tasks (each with acceptance criteria)

Do them in this order. **Task 1 is the keystone** — every later task references the migrated tokens.

### 1 · Brand token migration (MIT — do first)

- **1a** Replace the token file (`_sass/_tokens.scss` or `assets/css/tokens.css`) with the brand tokens above (light `:root` + dark `[data-theme="dark"]`). Swap every `Inter` → `Poppins`, every `#0078D4` / `#0D1117` / GitHub-dark hex → brand values.
  *Done:* no Inter / `#0D1117` / `#0078D4` remains in the CSS (outside token comments); both themes render in brand colors.
- **1b** Self-host **Poppins** (400/500/600/700/800) + **JetBrains Mono** (500/600); preload primary Poppins weight; scope mono to `code, .hex, .url` only.
  *Done:* no external font requests; body = Poppins, code/hex/URLs = JetBrains Mono; no FOIT.
- **1c** Flip the default to **brand-light** (`:root`) with `[data-theme="dark"]` as the variant; update the inline no-flash theme script + toggle labels.
  *Done:* first visit (no stored pref) = brand-light; toggle + OS-pref sync work; no flash on load.

### 2 · De-slop pass

- **2a** Remove **every emoji icon** across all pages; replace with brand text labels or minimal `currentColor` SVG — no stock icon library.
  *Done:* zero emoji in rendered markup; no icon library loaded.
- **2b** Cut the **gradient clip-text** hero headline (→ solid Navy display type) and reduce **scroll-stagger** to a single subtle fade-in or remove it; keep it under `prefers-reduced-motion`.
  *Done:* headline is solid Navy; no cascading stagger; reduced-motion disables what remains.

### 3 · Hero, on brand

- **3a** Rebuild the hero: **eyebrow** (orange, uppercase, tracked) → **Poppins 800 Navy** display headline → typing animation (cursor in Royal) → body → dual CTAs → stats bar. Optional background: `--gradient-hero` + a soft orange radial glow (≤10%).
- **3b** Buttons per the rules — primary Royal → Navy on hover; secondary outline → Royal on hover. Apply site-wide.
- **3c** Add the **orange-period signature** to the name/wordmark in nav, hero, and footer.

### 4 · Skills + section headers

- **4a** Rebuild Core Competencies as restrained **brand cards** (20px radius, `--shadow-card`, Frost/Mist surface, brand border) with **JetBrains Mono category labels** — responsive grid (3 / 2 / 1 columns), no pills, no emoji.
- **4b** Give every section header the **eyebrow pattern** above the Navy H2.

### 5 · Footer + full-site brand QA

- **5a** Re-skin nav + footer on brand (Frost/Mist surfaces, Navy text, Royal links, mono footer headings, orange-period signature); **preserve the newsletter CTA + RSS link.**
- **5b** Brand QA sweep on every page in **both themes** (see Definition of Done).

---

## Definition of Done

- [ ] Both **brand-light (default)** and **brand-dark** render correctly on every page — no invisible text, broken borders, or off-brand color.
- [ ] **Poppins** on all UI text; **JetBrains Mono only** on code / hex / URLs.
- [ ] **Zero emoji**; no stock icon set; icons are text labels or `currentColor` SVG.
- [ ] **Orange ≤ 10%** of every view.
- [ ] No gradient clip-text; motion is subtle and respects `prefers-reduced-motion`.
- [ ] Cards use 20px radius + `0 8px 30px rgba(16,48,107,.08)` (light); buttons follow Royal → Navy.
- [ ] Theme toggle works, persists, respects OS pref, no flash; brand-light is the default.
- [ ] WCAG AA contrast in both themes; visible focus rings; logical tab order; **Lighthouse a11y ≥ 95**.
- [ ] No external font requests; prior SEO/PSI hardening intact (canonicals, schema, OG/Twitter, WebP, lazy-load).
- [ ] Screenshots of hero, skills, and footer in both themes captured for the record.

## Guardrails

- Don't introduce a CSS framework, icon font, or JS animation library.
- Don't touch canonical URLs, structured data, OG/Twitter tags, or the RSS/newsletter wiring except to re-skin.
- Propose the token + component approach before large refactors; work in reviewable increments; verify each change in both themes before moving on.
