# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mitesh Dandade's resume/portfolio site, published with GitHub Pages at https://mitesh411.github.io/MyResume/ from `master`. It is a single static page (`index.html` + `assets/`) with no build step and no linter. npm is used only for the Jest test suite (`devDependencies`); the site itself has no runtime dependencies.

## Running locally

- Preview: open `index.html` in a browser, or run `python -m http.server` and visit http://localhost:8000.
- Docker (nginx:alpine, with a healthcheck): `docker build -t my-resume .` then `docker run -p 80:80 my-resume`. The image copies the whole repo (`COPY .`), so the leftover pages and docs are served too.
- Tests: `npm install` once, then `npm test`. `npm run test:coverage` writes a coverage report to `coverage/` (open `coverage/lcov-report/index.html`). Run a single file with `npx jest tests/main.test.js`, or a single test with `npx jest -t "filter"`.
- Lighthouse CI (`.github/workflows/LightHouseCI.yml`) runs only when triggered manually (`workflow_dispatch`). It audits the live URL, not the working tree.

## Architecture

- **`index.html` is the whole site.** It is laid out as: left floating side menu (`#header` / `#navbar`), `#hero`, then `<main id="main">`, which holds a ticker, the "by the numbers" ledger, and one `<div class="chapter">` per menu entry: `#about`, `#resume`, `#portfolio`, `#services`, `#contact`. The footer comes last. A fixed `.page-bg` layer puts the hero image behind the whole page, and a floating `.theme-toggle--floating` sits top-right.
- **The side menu and hero come from the original BootstrapMade "MyResume" template. Don't change their markup or light-mode styles.** The hero's only addition is a dark-theme block at the end of `hero.css`. Menu links are in-page anchors with class `.scrollto`. A chapter `id` must match its menu `href`, because `assets/js/main.js` smooth-scrolls on click and toggles `.active` by comparing `scrollY + 200` with each target's `offsetTop` and `offsetHeight`. Below 992px the menu becomes a drawer, opened by `.mobile-nav-toggle` toggling `body.mobile-nav-active`.
- **There are two stylesheets, with separate jobs:**
  - `assets/css/styles.css` is the editorial design system: colour tokens on `:root` (including `--page-veil`) plus a dark set under `[data-theme="dark"]` and `prefers-color-scheme`, a 12-column `.grid`, and component classes.
  - `assets/css/hero.css` holds the template's hero and side-menu rules, copied verbatim, and only the few Bootstrap 5.1.3 classes the hero uses. It loads after `styles.css`. Don't load full Bootstrap, because it would restyle the rest of the page. `#main { margin-left: 100px }` at ≥992px makes room for the menu, and `#hero` sits above the paper-grain overlay (`body::before`, z-index 100).
- **Scripts:** `assets/vendor/` holds Typed.js, AOS, boxicons and bootstrap-icons, committed normally (`.gitignore` no longer excludes them). `assets/js/main.js` is a single IIFE that handles:
  - the theme toggle (key `md-theme`; an inline `<head>` script sets `data-theme` before the page paints)
  - side-menu behaviour
  - Typed and AOS, using the template's settings
  - reveal-on-scroll (`[data-reveal]`, `.fig`, `.case`)
  - portfolio filters (`.filter[data-filter]` matched against `.case[data-tags]`)
  - the contact form, which composes a `mailto:` link because there is no backend
- **Fonts** come from Google Fonts: Fraunces, Instrument Sans and JetBrains Mono for the site; Open Sans, Raleway and Poppins for the hero and menu.
- **Certification badges** are stored locally in `assets/img/badges/`. The AWS and Azure badges link to Credly, and the ISTQB badge links to ISTQB India. The badges belong to their issuers; the ISTQB logo may only be shown while the certification is valid.

## Supporting files

- **`404.html`** is served by GitHub Pages for any missing URL, at any path depth. Because of that it's self-contained: inline CSS (tokens copied from `styles.css`, so keep them in sync), an inline data-URI favicon, and no relative asset paths. It reads the same `md-theme` key as `index.html`. Its links default to `/MyResume/…`, and a small inline script switches them to `/…` when the page is served from the root (local preview, Docker). It has `noindex`. Docker's nginx doesn't serve it for 404s; that would need an `error_page` config.
- **`sitemap.xml`** lists only the home page. Update `<lastmod>` when content changes.
- **`robots.txt`** allows everything, disallows the 404 and leftover pages, and points to the sitemap. Crawlers only read `robots.txt` at a host's root, so under `/MyResume/` it has no effect until the site has a custom domain. Submit the sitemap in Google Search Console instead (see `DEPLOY.md`).
- **`ROADMAP.md`** is the prioritised future-work list (static HTML/CSS/JS only). Mark items ✅ when they ship.

## Leftovers

- `Landing Page.html` and `testindex.html` are old template pages. They now load the new `assets/js/main.js` against old markup, and their template CSS, Bootstrap and other vendor files have been deleted. Console errors from these pages don't indicate bugs in `index.html`. Nothing links to them.

## Tests

- `tests/main.test.js` loads the real `index.html` into jsdom and runs `assets/js/main.js` through `tests/helpers.js` (`loadPage()`). `loadPage()` mocks what jsdom lacks (`matchMedia`, `scrollTo`, `IntersectionObserver`, `Typed`, `AOS`), accepts a `mutate(doc)` hook for edge cases, and removes the previous test's window/document listeners.
- `tests/static-files.test.js` checks `404.html` (one `h1`, `noindex`, no relative asset paths, home and section links), `robots.txt` (sitemap pointer) and `sitemap.xml` (well-formed, home URL, ISO `lastmod`).
- `tests/index.html.test.js` checks structure: menu ↔ section ids, one `h1`, image `alt`/`width`/`height`, `rel=noopener`, SEO limits from `llms.txt`, JSON-LD, local asset paths, and a matching `?v=` cache-busting version.
- Coverage is measured on `assets/js/main.js` only, with thresholds in `jest.config.js` (statements, functions and lines 95%; branches 90%). The one uncovered branch is the defensive `if (!el) return` in `scrollto`, which its callers never reach.
- jsdom can't follow `mailto:` links or replace `window.location`, so the contact-form test checks the composed email by spying on `encodeURIComponent`.
- `node_modules/` and `coverage/` are git-ignored, and `.dockerignore` keeps the test tooling out of the Docker image.

## Verifying changes visually

Check layout changes with headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new --screenshot=... --window-size=...`). To test a specific width or scroll position, load the page in an `<iframe>` inside a scratch HTML file. Three quirks have caused false alarms:

- **Smooth scrolling never finishes under `--virtual-time-budget`.** Scroll with `scrollTo({top, behavior: 'instant'})`.
- **CSS transitions stay frozen at their start value.** Inject `*{transition:none!important}` before reading colours after a theme switch.
- **Screenshotting a scrolled top-level page, or a window narrower than about 500px, comes out blank or clipped.** Use iframes instead.

## Conventions

- **Content** comes only from the résumé PDF. Don't invent project names, dates, employers, metrics or contact details. `llms.txt` lists the approved facts, the site structure and SEO rules. Keep it, `README.md` (project structure) and `DEPLOY.md` (publishing steps) updated when sections, files or facts change.
- **Images:** never put `loading="lazy"` on the LCP image (the hero background). Always give images explicit `width`/`height` (see `.jules/bolt.md`). The About portrait is an "md" monogram, with a commented-out `<img>` for `assets/img/portrait.jpg`.
- **Cache busting:** `index.html` loads `styles.css`, `hero.css` and `main.js` with a `?v=YYYYMMDD` query. Bump it whenever any of those files changes. Otherwise browsers keep running the old copy, because GitHub Pages sends `max-age=600`.
- The default branch is `master`.
