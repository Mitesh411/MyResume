# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mitesh Dandade's resume/portfolio site, published with GitHub Pages at https://mitesh411.github.io/MyResume/ from `master`. It is a single static page (`index.html` + `assets/`) with no package manager, no build step, no linter and no test suite.

## Running locally

- Preview: open `index.html` in a browser, or run `python -m http.server` and visit http://localhost:8000.
- Docker (nginx:alpine): `docker build -t my-resume .` then `docker run -p 80:80 my-resume`.
- Lighthouse CI (`.github/workflows/LightHouseCI.yml`) runs only when triggered manually (`workflow_dispatch`). It audits the live URL, not the working tree.

## Architecture

- **`index.html` is the whole site.** It is laid out as: left floating side menu (`#header` / `#navbar`), `#hero`, then `<main id="main">`, which holds a ticker, the "by the numbers" ledger, and one `<div class="chapter">` per menu entry: `#about`, `#resume`, `#portfolio`, `#services`, `#contact`. The footer comes last. A fixed `.page-bg` layer puts the hero image behind the whole page.
- **The side menu and hero come from the original BootstrapMade "MyResume" template (`Landing Page.html`). Don't change their markup or light-mode styles.** The hero's only addition is a dark-theme block at the end of `hero.css`. Menu links are in-page anchors with class `.scrollto`. A chapter `id` must match its menu `href`, because `assets/js/main.js` smooth-scrolls on click and toggles `.active` by comparing `scrollY + 200` with each target's `offsetTop` and `offsetHeight`. Below 992px the menu becomes a drawer, opened by `.mobile-nav-toggle` toggling `body.mobile-nav-active`.
- **There are two stylesheets, with separate jobs:**
  - `assets/css/styles.css` is the editorial design system: colour tokens on `:root` (including `--page-veil`) plus a dark set under `[data-theme="dark"]` and `prefers-color-scheme`, a 12-column `.grid`, and component classes.
  - `assets/css/hero.css` holds the template's hero and side-menu rules, copied verbatim, and only the few Bootstrap 5.1.3 classes the hero uses. It loads after `styles.css`. Don't load full Bootstrap, because it would restyle the rest of the page. `#main { margin-left: 100px }` at ≥992px makes room for the menu, and `#hero` sits above the paper-grain overlay (`body::before`, z-index 100).
- **Scripts:** `assets/vendor/` holds Typed.js, AOS, boxicons and bootstrap-icons. `assets/js/main.js` handles:
  - the theme toggle (key `md-theme`; an inline `<head>` script sets `data-theme` before the page paints)
  - side-menu behaviour
  - Typed and AOS, using the template's settings
  - reveal-on-scroll (`[data-reveal]`, `.fig`, `.case`)
  - portfolio filters (`.filter[data-filter]` matched against `.case[data-tags]`)
  - the contact form, which composes a `mailto:` link because there is no backend
- **Certification badges** are stored locally in `assets/img/badges/`. Each badge links to its Credly or ISTQB India page.
- `DEPLOY.md` is a beginner-friendly publishing guide (GitHub Pages or Netlify Drop).

## Leftovers to be aware of

- `Landing Page.html` and `testindex.html` are old template pages. Their template assets (`assets/css/style.css`, Bootstrap, the old `main.js`, and so on) have been deleted, so they no longer render correctly. Nothing links to them.

## Conventions

- **Content** comes only from the résumé PDF. Don't invent project names, dates, employers, metrics or contact details. `llms.txt` lists the approved facts, the site structure and SEO rules; keep it updated when sections or facts change.
- **Images:** never put `loading="lazy"` on the LCP image (the hero background). Always give images explicit `width`/`height` (see `.jules/bolt.md`). The About portrait is an "md" monogram, with a commented-out `<img>` for `assets/img/portrait.jpg`.
- The default branch is `master`, even though the README's Contributing section says `main`.
