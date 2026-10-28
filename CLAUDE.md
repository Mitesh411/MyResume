# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mitesh Dandade's resume/portfolio site, published with GitHub Pages at https://mitesh411.github.io/MyResume/ from `master`. It is plain static HTML/CSS/JS with no package manager, no build step, no linter and no test suite. The repo holds two sites:

- **`portfolio/`** is the current redesign: a single, self-contained page. Most new work goes here.
- **The repo root** is the original live site, built on the BootstrapMade "MyResume" v4.7.0 template.

## Running locally

- Preview: open `portfolio/index.html` (or the root `index.html`) in a browser, or serve the folder with a static server, for example `python -m http.server`.
- Docker (nginx:alpine) serves the repo root: `docker build -t my-resume .` then `docker run -p 80:80 my-resume`.
- Lighthouse CI (`.github/workflows/LightHouseCI.yml`) runs only when triggered manually (`workflow_dispatch`). It audits the live URL, not the working tree.

## portfolio/ — single-page site

- **`index.html` is the whole site.** It is laid out as: left floating side menu (`#header` / `#navbar`), `#hero`, then `<main id="main">`, which holds a ticker, the "by the numbers" ledger, and one `<div class="chapter">` per menu entry: `#about`, `#resume`, `#portfolio`, `#services`, `#contact`. The footer comes last.
- **The side menu and hero are copied verbatim from the root `index1.html`. Don't change them.** Menu links are in-page anchors with class `.scrollto`. A chapter `id` must match its menu `href`, because `assets/js/main.js` smooth-scrolls on click and toggles `.active` by comparing `scrollY + 200` with each target's `offsetTop` and `offsetHeight`. Below 992px the menu becomes a drawer, opened by `.mobile-nav-toggle` toggling `body.mobile-nav-active`.
- **There are two stylesheets, with separate jobs:**
  - `assets/css/styles.css` is the editorial design system: colour tokens on `:root` plus a dark set under `[data-theme="dark"]` and `prefers-color-scheme`, a 12-column `.grid`, and component classes.
  - `assets/css/hero.css` holds the hero and side-menu rules copied verbatim from the root `assets/css/style.css`, and only the few Bootstrap 5.1.3 classes the hero uses. It loads after `styles.css`. Don't load full Bootstrap, because it would restyle the rest of the page. `#main { margin-left: 100px }` at ≥992px makes room for the menu, and `#hero` sits above the paper-grain overlay (`body::before`, z-index 100).
- **Scripts:** `assets/vendor/` (Typed.js, AOS, boxicons, bootstrap-icons) is copied locally so the folder deploys on its own. Keep `portfolio/` free of `../` references. `assets/js/main.js` handles:
  - the theme toggle (key `md-theme`; an inline `<head>` script sets `data-theme` before the page paints)
  - side-menu behaviour
  - Typed and AOS, using the original settings
  - reveal-on-scroll (`[data-reveal]`, `.fig`, `.case`)
  - portfolio filters (`.filter[data-filter]` matched against `.case[data-tags]`)
  - the contact form, which composes a `mailto:` link because there is no backend
- **Content** comes only from the résumé PDF. The About portrait is an "md" monogram, with a commented-out `<img>` for `assets/img/portrait.jpg`. `DEPLOY.md` is a beginner-friendly publishing guide (Netlify Drop or GitHub Pages).

## Repo root — original template site

- **Pages:** `index.html` is the live single-page template. `index1.html` contains only the hero and side menu, and is the source `portfolio/` copies them from. `portfolio-details.html` is the template's project-detail page.
- **`assets/js/main.js`** initialises the vendor libraries by selector (Typed, Waypoints, Isotope, GLightbox, Swiper, AOS), so renaming a markup class silently disables that feature.
- **`assets/vendor/`** is committed even though `.gitignore` lists it. New files there need `git add -f`.
- **Contact form:** `validate.js` posts to `forms/contact.php`, which sends mail with PHPMailer using settings from `forms/config.php` and must return JSON `{success, message}`. It needs a PHP server, so it doesn't work on GitHub Pages or in the nginx image. `config.php` holds SMTP secrets; never commit real values.

## Conventions

- **Images:** never put `loading="lazy"` on the LCP image. Always give images explicit `width`/`height` (see `.jules/bolt.md`).
- **Content:** don't invent project names, dates, employers or contact details. `llms.txt` lists the approved profile facts, the site structure and SEO rules. Keep it updated when sections or facts change.
- The default branch is `master`, even though the README's Contributing section says `main`.
