# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal portfolio site hosted on GitHub Pages with a custom domain (`abubakarriaz.com.pk`). It uses Jekyll to render Markdown files. There is no local build step — pushing to `main` deploys the site automatically via GitHub Pages.

## Site Configuration

- [`_config.yml`](_config.yml): Jekyll site metadata (title, description). The remote theme and Google Analytics are commented out here but Analytics is embedded inline in each page.
- [`CNAME`](CNAME): Routes the custom domain `abubakarriaz.com.pk` to the GitHub Pages site.

## Content Architecture

All content is authored in Markdown. The site is organized as a flat set of section directories, each with its own `index.md`:

- [`index.md`](index.md) — Main landing page with intro, summarized experience, education, certifications, projects, and awards. Links out to full-list pages in each section.
- [`certifications/index.md`](certifications/index.md) — Full certifications list, grouped by skill category (e.g., Azure Cloud Engineer, DevOps Engineer). Also has `yearly.md` for a chronological view.
- [`experience/index.md`](experience/index.md) — Full work history.
- [`education/index.md`](education/index.md) — Full education history.
- [`projects/index.md`](projects/index.md) — Full projects list.
- [`awards/index.md`](awards/index.md) — Full awards list.

## Content Conventions

**External links** use Jekyll's Kramdown attribute syntax to open in a new tab, followed by the external link icon image:
```md
[Link text](https://example.com "tooltip"){:target="_blank"} ![External Link](../assets/external_link_icon_12_12.png)
```

**Certifications hierarchy** uses two visual levels:
- Primary certifications: `🎖️ __Cert Name__`
- Sub-certifications (part of a specialization): blockquote with `✨ __Cert Name__`

**Google Analytics** tag is embedded at the bottom of each page directly in Markdown (not in a layout file).

**Local certificate images** are stored as `.webp` files under each section's `assets/` folder (e.g., `certifications/assets/`). External verifications link to credly.com, linkedin.com, or coursera.org.

**Date format** used in content: `` `Mon YYYY` `` for certification dates, `` `Mon YYYY – Mon YYYY (duration)` `` for employment periods.
