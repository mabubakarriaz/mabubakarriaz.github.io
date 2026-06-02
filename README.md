# abubakarriaz.github.io

Personal portfolio site for **Abubakar Riaz** — Associate Architect @ tkxel 🚀| Full Stack Developer👨‍💻| 12x Azure Certified 🏅| MCT 🏆| Microsoft for life📎|⚡️xJazz

Live at: [abubakarriaz.com](https://abubakarriaz.com)

## Tech Stack

- **Platform:** GitHub Pages
- **Generator:** Jekyll 4.4
- **Content:** Markdown (Kramdown)
- **Domain:** Custom domain via `CNAME`
- **Plugins:** `jekyll-feed`, `jekyll-seo-tag`

## Site Structure

```text
/                         # Landing page (intro, experience summary, certifications, projects, awards)
/certifications/          # Full certifications list grouped by skill category
/experience/              # Full work history
/education/               # Full education history
/projects/                # Full projects list
/awards/                  # Full awards list
```

## Local Development

### Prerequisites

- [Ruby](https://www.ruby-lang.org/en/downloads/) (3.x recommended)
- [Bundler](https://bundler.io/)

```bash
gem install bundler
```

### Run locally

> **Note:** Use the full Ruby path (`/c/Ruby32-x64/bin/bundle`) rather than the bare `bundle` shim — the system shim is broken on this machine and will fail silently.

```bash
# Build once and serve (no auto-rebuild)
/c/Ruby32-x64/bin/bundle exec jekyll serve --no-watch
```

Then open [http://127.0.0.1:4000](http://127.0.0.1:4000) in your browser.

**Other useful commands:**

```bash
# Auto-rebuild on file changes (best while iterating on design)
/c/Ruby32-x64/bin/bundle exec jekyll serve --livereload

# Serve on a different port
/c/Ruby32-x64/bin/bundle exec jekyll serve --no-watch --port 4001

# Build only, no server (output goes to _site/)
/c/Ruby32-x64/bin/bundle exec jekyll build
```

Press `Ctrl-C` in the terminal to stop the server.
