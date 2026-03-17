# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal portfolio site hosted on GitHub Pages with a custom domain (`abubakarriaz.com.pk`). It uses Jekyll 4.4 with a custom layout — no remote theme. Pushing to `main` deploys automatically via GitHub Pages.

For local development, run `/c/Ruby32-x64/bin/bundle exec jekyll serve --no-watch` (requires Ruby + Bundler). **Do not use the bare `bundle` shim** — the system shim is broken on this machine and will fail silently or error out.

## Site Configuration

- [`_config.yml`](_config.yml): Jekyll site metadata (title, description, url, author). CLAUDE.md and README.md are in the `exclude` list so they don't get built.
- [`CNAME`](CNAME): Routes the custom domain `abubakarriaz.com.pk` to the GitHub Pages site.
- [`Gemfile`](Gemfile): Jekyll 4.4 + `jekyll-feed` + `jekyll-seo-tag` plugins.

## Content Architecture

All pages are Jekyll HTML files (`.html`) with YAML front matter. The site uses a flat section-directory structure, each with its own `index.html`:

- [`index.html`](index.html) — Main landing page (hero, summarized experience, education, certifications, projects, awards). Links out to full-list pages in each section.
- [`certifications/index.html`](certifications/index.html) — Full certifications list grouped by skill category. Also has [`certifications/yearly.html`](certifications/yearly.html) for a chronological view.
- [`experience/index.html`](experience/index.html) — Full work history (timeline layout).
- [`education/index.html`](education/index.html) — Full education history.
- [`projects/index.html`](projects/index.html) — Full projects list.
- [`awards/index.html`](awards/index.html) — Full awards list.

## Layout System

**[`_layouts/default.html`](_layouts/default.html)** is the single shared layout, applied via `layout: default` in each page's front matter. It provides:

- Navbar with anchor links (About, Experience, Certs, Projects, Education, Awards)
- Inter + JetBrains Mono fonts from Google Fonts
- `assets/css/main.css` and `assets/js/main.js`
- Footer with GitHub/LinkedIn icons
- Google Analytics (tag `G-T8M8FBW7SY`) — **centralized here, not per-page**

Do **not** add GA tags or `<head>` content to individual pages — the layout handles it.

## Content Conventions

**Page front matter** structure:

```html
---
layout: default
title: Page Title
description: Page meta description for SEO.
---
```

**External links** use standard HTML with `target="_blank" rel="noopener noreferrer"`:

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>
```

**Certifications** use card components (`cert-card` class) grouped under `cert-category` headers. Each card has:

- `cert-issuer-bar` with an issuer class (e.g., `azure`, `github`, `google`)
- `cert-icon` (emoji), `cert-name`, `cert-issuer-label`, `cert-date`

**Experience** uses a `timeline` layout with `timeline-item` → `timeline-card` → `timeline-header` + `timeline-bullets`.

**Awards** use `award-full-item` with icon, title, issuer, and date.

**Date format** used in content: `Mon YYYY` (e.g., `Mar 2025`) for certifications; `Mon YYYY – Present` or `Mon YYYY – Mon YYYY` for employment periods.

**Animation class**: Add `animate-on-scroll` to any card/item that should fade in on scroll.

**Local images** (e.g., certificate screenshots) are stored as `.webp` files under each section's `assets/` folder (e.g., `certifications/assets/`). External verifications link to credly.com, linkedin.com, or coursera.org.

**Internal links** use Jekyll's `relative_url` filter:

```html
<a href="{{ '/' | relative_url }}">Home</a>
<a href="{{ '/certifications/yearly' | relative_url }}">By Year</a>
```

## Git Workflow

**Date format** used in content: `` `Mon YYYY` `` for certification dates, `` `Mon YYYY – Mon YYYY (duration)` `` for employment periods.

## Git Workflow

- **New branch per session**: At the start of each working session, create a new branch from `main` with a short descriptive name (e.g., `update-experience-titles`, `add-certifications`).
- **Create a PR after final changes**: Once all changes in the session are complete, create a pull request from the session branch to `main`.
- **Update the same PR if the session continues**: If the conversation continues with more changes, push additional commits to the same branch — do not create a new PR. Always update the existing PR's title and body to reflect the full set of changes made, whether the PR was just created or already existed.
- **Never push directly to `main`**.

## Local Environment Quirks

These commands **fail on this machine** — use the alternatives instead:

| Broken | Use instead | Why |
| --- | --- | --- |
| `bundle exec jekyll serve` | `/c/Ruby32-x64/bin/bundle exec jekyll serve --no-watch` | System `bundle` shim is broken |
| `python3 -c "..."` | `node -e "..."` | Python is not installed |
| `gh pr edit --body "..."` | `gh api repos/mabubakarriaz/mabubakarriaz.github.io/pulls/{N} -X PATCH -f body="..."` | `gh pr edit` fails with GitHub Projects (classic) deprecation GraphQL error |
