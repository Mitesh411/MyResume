# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mitesh Dandade's resume/portfolio site, published with GitHub Pages at https://mitesh411.github.io/MyResume/ from `master`. It is a single static page (`index.html` + `assets/`) with no build step and no linter. npm is used only for the Jest test suite (`devDependencies`); the site itself has no runtime dependencies.

## Running locally

- Preview: open `index.html` in a browser, or run `python -m http.server` and visit http://localhost:8000.
- Docker (nginx:alpine, with a healthcheck): `docker build -t my-resume .` then `docker run -p 80:80 my-resume`. The image copies the whole repo (`COPY .`), and `.dockerignore` keeps tests, tooling and `*.md` docs out.
- Tests: `npm install` once, then `npm test`. `npm run test:coverage` writes a coverage report to `coverage/` (open `coverage/lcov-report/index.html`). Run a single file with `npx jest tests/main.test.js`, or a single test with `npx jest -t "filter"`.
- Lighthouse CI (`.github/workflows/LightHouseCI.yml`) runs only when triggered manually (`workflow_dispatch`). It audits the live URL, not the working tree.

## Architecture

- **`index.html` is the whole site.** It is laid out as: left floating side menu (`#header` / `#navbar`), `#hero`, then `<main id="main">`, which holds a ticker, the "by the numbers" ledger, and one `<div class="chapter">` per menu entry: `#about`, `#resume`, `#portfolio`, `#services`, `#contact`. The footer comes last. A fixed `.page-bg` layer puts the hero image behind the whole page, and a floating `.theme-toggle--floating` sits top-right.
- **The side menu and hero come from the original BootstrapMade "MyResume" template. Don't change their markup or light-mode styles.** The hero's additions are a dark-theme block at the end of `hero.css`, plus these approved markup fixes (roadmap Phase 0):
  - The `<h1>` holds the name as real text in a `.visually-hidden` span, for search engines, link previews and screen readers. The `.typed` span next to it is `aria-hidden="true"`, because the typing animation is decorative. Keep the `data-typed-items` list free of line breaks and stray spaces.
  - `.social-links` has only LinkedIn, GitHub and email, each with an `aria-label`, followed by a `.copy-email--icon` button styled like the icons (rules at the end of the template section in `hero.css`, plus the dark-theme block). Don't add profiles that aren't in `llms.txt`.
- **Side menu:** links are in-page anchors with class `.scrollto`. A chapter `id` must match its menu `href`, because `assets/js/main.js` smooth-scrolls on click and toggles `.active` by comparing `scrollY + 200` with each target's `offsetTop` and `offsetHeight`. Below 992px the menu becomes a drawer, opened by `.mobile-nav-toggle` toggling `body.mobile-nav-active` and its `aria-expanded`. The button holds two sprite icons (`.icon-open` ☰ and `.icon-close` ✕); CSS in `hero.css` shows one per state, so the JS doesn't touch the icons.
- **There are two stylesheets, with separate jobs:**
  - `assets/css/styles.css` is the editorial design system: colour tokens on `:root` (including `--page-veil`) plus a dark set under `[data-theme="dark"]` and `prefers-color-scheme`, a 12-column `.grid`, and component classes.
  - `assets/css/hero.css` holds the template's hero and side-menu rules, copied verbatim, and only the few Bootstrap 5.1.3 classes the hero uses. It loads after `styles.css`. Don't load full Bootstrap, because it would restyle the rest of the page. `#main { margin-left: 100px }` at ≥992px makes room for the menu, and `#hero` sits above the paper-grain overlay (`body::before`, z-index 100).
- **Icons** are an inline SVG sprite (`<svg class="sprite">` at the top of `<body>`), used as `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-NAME"/></svg>`. The symbols are `home user file book server envelope linkedin github copy` (Boxicons 2.0.7 glyph paths, flipped from font coordinates with `matrix(1 0 0 -1 0 960)` in a 1024 viewBox) and `list x` (Bootstrap Icons, 16 viewBox, class `icon--bi`). Both are MIT. `.icon` is 1em square with `fill: currentColor`, so icons size and colour like the old font glyphs. `hero.css` gives `.nav-menu a .icon` the template's 20px. The Boxicons and Bootstrap Icons fonts (about 2.4 MB) were deleted. To add an icon, copy the SVG path of the same family into a new `<symbol>`; don't bring back the fonts. Tests fail on any `bx`/`bi` class, and check that every `<use>` resolves.
- **Scripts:** `assets/vendor/` holds Typed.js and AOS, committed normally (`.gitignore` no longer excludes them). `assets/js/main.js` is a single IIFE that handles:
  - the theme toggle (key `md-theme`; an inline `<head>` script sets `data-theme` before the page paints)
  - side-menu behaviour
  - Typed and AOS, using the template's settings
  - reveal-on-scroll (`[data-reveal]`, `.fig`, `.case`)
  - portfolio filters (`.filter[data-filter]` matched against `.case[data-tags]`)
  - the tool cloud (`#tool-cloud`, `#tool-result`, in the Resume chapter's "§ 02 — In practice" section): one `.tool` button per distinct `.case .tags .tag` text, sorted by use count. `data-weight` (1–3) sets the size. Choosing a tool lists links to the case studies that used it, and a link to a case hidden by a portfolio filter clicks "All" first. It's built from the tags, so to change it, edit a case's tags. There is no separate list, and no proficiency or years data, because those aren't on the résumé. Without JS the section is hidden (`html:not(.js)`), and it's hidden in print.
  - the contact form, which composes a `mailto:` link because there is no backend
  - service-worker registration (`sw.js`, on `load`, http(s) only; failures are ignored)
  - copy-email buttons (`[data-copy]`): they use `navigator.clipboard.writeText`, falling back to a hidden textarea and `document.execCommand("copy")`, then show "Copied" (or an error) in the `#toast` live region for 2 seconds. Every `mailto:` link must have a `[data-copy]` button in the same parent element; a test enforces this. The form's `action` doesn't count, because it isn't a link.
- **Print stylesheet** (the `@media print` block at the end of `styles.css`): printing produces a one-page A4 résumé. It shows the `.print-header` block at the top of `<main>` (hidden on screen and `aria-hidden`) and the About lede as a summary, followed by experience, skills, and certifications and education. Everything else is hidden. The editorial `h2`s are replaced by CSS-generated section titles (`.section-head::before`, keyed on each section's `aria-labelledby`). The print page is narrower than 760px, so the small-screen `grid-column: 1 / -1 !important` rule applies; the print rules for `.role` and `.skill-row` use `!important` to win. Forced `color-scheme: light` keeps the page margins white when printing from dark mode. After any change to the résumé content, check that it still fits on one page: `chrome --headless=new --no-pdf-header-footer --print-to-pdf=out.pdf file:///…/index.html`, then look for `/Count 1` in the PDF.
- **Fonts** come from Google Fonts: Fraunces, Instrument Sans and JetBrains Mono for the site; Open Sans, Raleway and Poppins for the hero and menu.
- **SEO head tags:** `<link rel="canonical">`, Open Graph (`og:url`, `og:image` with width, height and alt) and Twitter card tags. All of them use absolute `https://mitesh411.github.io/MyResume/` URLs, so update them all if the domain changes. The preview image is `assets/img/og-card.png` (1200×630). It was rendered with headless Chrome from a scratch HTML card in the site's style, so to change the text, re-render it rather than editing the PNG.
- **Person JSON-LD** in `<head>` has `@id`, `url`, `image` (the og-card), `email`, `jobTitle`, `worksFor` (CREST InfoSystems Pvt. Ltd.), `alumniOf` (UKA Tarsadia University), `hasCredential` (ISTQB CTFL, AWS CCP and AZ-900, with the same verification URLs as the badges), `knowsAbout` (the `Skills:` list in `llms.txt`), `address` and `sameAs`. `llms.txt` holds an identical copy, so update both together. Tests check employer, university, credential links and skills against the page and `llms.txt`. When the job changes, update `worksFor` too.
- **Content Security Policy and referrer policy** are `<meta>` tags placed right after `viewport`, before any script or stylesheet (GitHub Pages can't send headers). The policy: `default-src 'self'`; `script-src 'self'` plus the SHA-256 hash of the inline theme script; `style-src 'self' 'unsafe-inline'` plus Google Fonts; `font-src` gstatic; `img-src 'self' data:`; `form-action mailto:`; `object-src 'none'`; `base-uri 'self'`; `upgrade-insecure-requests`.
  - Styles need `'unsafe-inline'` because of the many `style="--d:…"`/`--w` attributes and the cursor `<style>` that Typed.js injects.
  - **If you edit the inline theme script, recompute its hash:** base64 SHA-256 of the exact text between `<script>` and `</script>`, with LF line endings. The test prints the expected value when it fails.
  - Never add inline `<script>` blocks or `on*=` handlers. Put code in `main.js`. A new third-party origin must be added to the matching directive.
  - `frame-ancestors` and `report-uri` don't work in a meta tag.
  - Referrer policy: `strict-origin-when-cross-origin`.
- **Certification badges** are stored locally in `assets/img/badges/`. The AWS and Azure badges link to Credly, and the ISTQB badge links to ISTQB India. The badges belong to their issuers; the ISTQB logo may only be shown while the certification is valid.

## Supporting files

- **PWA:** `manifest.webmanifest` (`start_url` and `scope` are `./`, so it works under `/MyResume/`; `display: standalone`; paper-coloured theme) and icons in `assets/img/icons/`: `icon-192.png`, `icon-512.png` (rounded, purpose `any`), `icon-maskable-512.png` (full-bleed; the check mark sits inside the safe zone) and `apple-touch-icon.png` (180). The PNGs were rendered from the favicon SVG with headless Chrome at window 512×512, using `--force-device-scale-factor` for the smaller sizes (0.375 → 192, 0.3515625 → 180) and `--default-background-color=00000000` for transparency, because PIL isn't installed.
- **`sw.js`** (at the repo root, so its scope is the whole site): it precaches the page, `404.html`, the manifest, the versioned CSS and JS, the vendor scripts, the hero image, the badges and an icon. Navigations are network-first, falling back to the cache, then to `./`. Same-origin files and Google Fonts are stale-while-revalidate. **`VERSION` in `sw.js` must equal the `?v=` in `index.html`.** Bump both together; the new cache name (`md-VERSION`) then replaces the old one on activate. Add any new local asset the page needs offline to `PRECACHE`. A test checks the version and that every precached file exists.
- **`404.html`** is served by GitHub Pages for any missing URL, at any path depth. Because of that it's self-contained: inline CSS (tokens copied from `styles.css`, so keep them in sync), an inline data-URI favicon, and no relative asset paths. It reads the same `md-theme` key as `index.html`. Its links default to `/MyResume/…`, and a small inline script switches them to `/…` when the page is served from the root (local preview, Docker). It has `noindex`, a referrer policy, and its own CSP, which uses SHA-256 hashes for both inline scripts and the `<style>` block. **Recompute the hashes after any edit to them**; `tests/static-files.test.js` checks them. Docker's nginx doesn't serve it for 404s; that would need an `error_page` config.
- **`sitemap.xml`** lists only the home page, with `og-card.png` as an image entry (the `image:` namespace). Update `<lastmod>` when content changes. `index.html` links to it with `<link rel="sitemap">`.
- **`robots.txt`** allows everything except `/404.html`, and points to the sitemap. Crawlers only read `robots.txt` at a host's root, so under `/MyResume/` it has no effect until the site has a custom domain. Submit the sitemap in Google Search Console instead (see `DEPLOY.md`).
- **`ROADMAP.md`** lists only open work, prioritised (static HTML/CSS/JS only). When an item is built but not yet committed, mark it 🚀 ("awaiting commit and deploy"). Once it's committed to `master` and deployed, delete its row, and update the "Suggested sequencing" and "Open decisions" sections that mention it. Git history is the record of what shipped.

The old template pages (`Landing Page.html`, `testindex.html`) were deleted on 2026-10-31, and a test makes sure they don't come back.

## Tests

- `tests/main.test.js` loads the real `index.html` into jsdom and runs `assets/js/main.js` through `tests/helpers.js` (`loadPage()`). `loadPage()` mocks what jsdom lacks (`matchMedia`, `scrollTo`, `IntersectionObserver`, `Typed`, `AOS`), accepts a `mutate(doc)` hook for edge cases, and removes the previous test's window/document listeners.
- `tests/static-files.test.js` checks:
  - `404.html`: one `h1`, `noindex`, no relative asset paths, home and section links, CSP hashes and referrer policy
  - `robots.txt`: the sitemap pointer
  - `sitemap.xml`: well-formed, home URL, ISO `lastmod`, listed images exist
  - `manifest.webmanifest`: installable fields, and icon PNGs at their stated sizes (read from the PNG header)
  - `sw.js`: version matches `?v=`, and precached files exist
  - that the old template pages stay deleted
- `tests/index.html.test.js` checks structure: menu ↔ section ids, one `h1` with the name as real text, hero social links (approved profiles, labelled), canonical/Open Graph/Twitter tags, image `alt`/`width`/`height`, `rel=noopener`, SEO limits from `llms.txt`, JSON-LD (including `worksFor`, `alumniOf`, `hasCredential` and `knowsAbout` against `llms.txt`), the print-only header and print stylesheet, the CSP (placed before resources, theme-script hash, locked-down directives, external origins allowed), the icon sprite (no icon-font classes, every `<use>` resolves, icons `aria-hidden`), the manifest and touch-icon links, local asset paths, and a matching `?v=` cache-busting version.
- The copy-email tests define `navigator.clipboard` (and `document.execCommand` for the fallback) themselves, because jsdom has neither. They flush promises with two `await Promise.resolve()` calls.
- The service-worker tests define `navigator.serviceWorker` themselves and dispatch `load`. jsdom's URL is `http://localhost/`, so the http(s) check passes.
- Coverage is measured on `assets/js/main.js` only, with thresholds in `jest.config.js` (statements, functions and lines 95%; branches 90%). The one uncovered branch is the defensive `if (!el) return` in `scrollto`, which its callers never reach.
- jsdom can't follow `mailto:` links or replace `window.location`, so the contact-form test checks the composed email by spying on `encodeURIComponent`.
- `node_modules/` and `coverage/` are git-ignored, and `.dockerignore` keeps the test tooling out of the Docker image.

## Verifying changes visually

Check layout changes with headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new --screenshot=... --window-size=...`). To test a specific width or scroll position, load the page in an `<iframe>` inside a scratch HTML file. Three quirks have caused false alarms:

- **Smooth scrolling never finishes under `--virtual-time-budget`.** Scroll with `scrollTo({top, behavior: 'instant'})`.
- **CSS transitions stay frozen at their start value.** Inject `*{transition:none!important}` before reading colours after a theme switch.
- **Screenshotting a scrolled top-level page, or a window narrower than about 500px, comes out blank or clipped.** Use iframes instead.

For anything that needs http, such as the service worker, offline mode or CSP violations, serve the repo with `python -m http.server 8123` and drive Chrome over the DevTools protocol from a scratch Node script (Node 24 has a built-in `WebSocket`):
- Launch with `--headless=new --remote-debugging-port=…`, enable `Runtime`, `Log` and `Network`, then navigate.
- CSP violations arrive as `Log.entryAdded` with `source: "security"`.
- Test offline mode with `Network.emulateNetworkConditions({offline: true})` followed by a reload.
- `--enable-logging=stderr` doesn't show console messages in new headless, so don't rely on it.

## Conventions

- **Content** comes only from the résumé PDF. Don't invent project names, dates, employers, metrics or contact details. `llms.txt` lists the approved facts, the site structure and SEO rules. Keep it, `README.md` (project structure) and `DEPLOY.md` (publishing steps) updated when sections, files or facts change.
- **Images:** never put `loading="lazy"` on the LCP image (the hero background). Always give images explicit `width`/`height` (see `.jules/bolt.md`). The About portrait is an "md" monogram, with a commented-out `<img>` for `assets/img/portrait.jpg`.
- **Cache busting:** `index.html` loads `styles.css`, `hero.css` and `main.js` with a `?v=YYYYMMDD` query. Bump it whenever any of those files changes, and set `VERSION` in `sw.js` to the same value. Otherwise browsers keep running the old copy, because GitHub Pages sends `max-age=600` and the service worker serves its cache.
- The default branch is `master`.
