---
name: seo-hardening
description: >
  Execute SEO hardening tasks for the personal portfolio site abubakarriaz.com.pk (Jekyll + GitHub Pages).
  Use this skill whenever Abubakar mentions an SEO task number (e.g. 1.1.1, 2.3.2), says "work on SEO", references
  the SEO Hardening WBS, or asks to implement sitemap, robots.txt, canonical tags, JSON-LD, Open Graph, Twitter Cards,
  Core Web Vitals, or any structured data for the portfolio site.
  Also trigger when asked to create a branch, open a PR, or implement any SEO sprint task on the portfolio repo.
---

# SEO Hardening Skill — abubakarriaz.com.pk

## Context

- **Site:** `abubakarriaz.com.pk` — Jekyll + GitHub Pages, custom `.pk` domain
- **Repo:** `github.com/mabubakarriaz/mabubakarriaz.github.io` (or the portfolio repo — confirm with user if unsure)
- **Branch strategy:** Always create a new branch from `main` named after the task number
- **PR:** Open a PR from the task branch → `main` once work is complete
- **Notion WBS:** Streams → MVP → Personal Portfolio → Roadmap → 2. SEO Hardening

---

## Workflow (Always Follow This Order)

### Step 1 — Load the Task

1. Go to the Notion SEO Hardening page (fetch it via the Notion MCP if needed)
2. Locate the task number given by the user (e.g. `1.1.1`)
3. Read the task description, code snippets, and **acceptance criteria** carefully
4. If the task is unclear or has dependencies, mention them before starting

### Step 2 — Identify the Files to Change

Based on the task, determine which Jekyll files are affected. Common targets:

| Task Area | File(s) |
|---|---|
| Sitemap | `_config.yml`, `Gemfile` |
| Robots.txt | `robots.txt` (root) |
| Canonical tags | `_includes/head.html` |
| Title / meta description | `_includes/head.html`, front matter in `.md` / `.html` pages |
| JSON-LD (Person, WebSite) | `_includes/head.html` or a new `_includes/jsonld-person.html` |
| JSON-LD (BreadcrumbList) | `_layouts/default.html` or `_includes/head.html` |
| OG / Twitter Card tags | `_includes/head.html` |
| OG images | `/assets/images/` |
| Font self-hosting | `/assets/fonts/`, CSS files |
| Critical CSS / JS defer | `_includes/head.html`, `_layouts/default.html` |
| Image optimization | Any `.html` / `.md` page with `<img>` tags |
| Favicon / icons | `_includes/head.html`, root |
| 404 page | `404.html` (root) |
| Heading structure | Individual page `.html` / `.md` files |

### Step 3 — Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b seo/task-<TASK_NUMBER>
# Example: git checkout -b seo/task-1.1.1
```

Branch naming convention: `seo/task-<TASK_NUMBER>` (e.g. `seo/task-1.1.1`, `seo/task-2.1.1`)

### Step 4 — Implement the Task

- Follow the code snippets in the Notion task exactly
- Use Jekyll Liquid syntax where needed (`{{ page.url | absolute_url }}`, etc.)
- Never break existing functionality — treat every file edit as surgical
- For `_includes/head.html` edits: place new tags **inside `<head>`**, in logical groupings (canonical → meta → OG → Twitter → JSON-LD)
- For JSON-LD blocks: wrap in `<script type="application/ld+json">...</script>`
- For front matter additions: add to the top YAML block of each page

### Step 5 — Self-Validate Against Acceptance Criteria

Before committing, mentally verify each acceptance criterion from the Notion task:
- Does the code change satisfy the stated acceptance criterion?
- Is the output valid (well-formed XML, valid JSON, valid HTML)?
- Are Jekyll Liquid variables used correctly?
- Are there any hardcoded values that should be dynamic?

### Step 6 — Commit and Push

```bash
git add <changed files>
git commit -m "SEO: <task number> — <short description>"
# Example: git commit -m "SEO: 1.1.1 — Add jekyll-sitemap plugin and verify sitemap.xml"
git push origin seo/task-<TASK_NUMBER>
```

Commit message format: `SEO: <task number> — <short description of what was done>`

### Step 7 — Open a Pull Request

Create the PR with this template:

```
Title: SEO <task number> — <short description>

## What this PR does
<1–3 sentence summary of the change>

## Files changed
- `<file1>` — <why>
- `<file2>` — <why>

## Acceptance criteria (from Notion WBS)
- [ ] <criterion 1>
- [ ] <criterion 2>

## How to verify
<step-by-step validation instructions matching the Notion task>

## Notion task
Streams → MVP → Personal Portfolio → Roadmap → 2. SEO Hardening → <task number>
```

### Step 8 — Report Back

Tell the user:
- What branch was created
- What files were changed and why
- How to verify the acceptance criteria
- That they should review the PR, merge it, and then mark the task as done in Notion

---

## Quick Reference — Task Number Index

See `references/wbs-index.md` for the full task list with brief descriptions. Load it when you need to quickly look up what a task number refers to.

---

## Important Notes

- **Never push directly to `main`** — always use a task branch
- **Never mark tasks done in Notion** — the user does this manually after reviewing and merging the PR
- **Jekyll Liquid syntax matters** — test mentally that filters like `| absolute_url` and `| default:` work correctly
- **JSON-LD must be valid JSON** — double-check bracket/brace matching and quote escaping
- **The blog subdomain (blog.abubakarriaz.com.pk) is out of scope** — don't touch it
- **If the GitHub repo URL is uncertain**, ask the user before creating the branch
- **For image tasks (3.3, 4.2)**, describe what the image/change should look like and provide the code — actual image file generation may need a separate tool or manual step