# Product Roadmap — MyResume

_Last updated: 2026-11-01_

This is the roadmap for Mitesh Dandade's resume and portfolio site at https://mitesh411.github.io/MyResume/.

## Ground rules

- **Static only.** Use plain HTML, CSS and vanilla JavaScript, hosted on GitHub Pages. No React, Angular, Next or any other framework, and no build step for the site. npm is used for dev and test tooling only.
- **No invented content.** Every fact must come from the résumé PDF and `llms.txt`. Items marked 🧾 need real material from the owner before work can start.
- **Template boundary.** The side menu and hero come from the BootstrapMade template, and their markup is kept as-is. Items marked 🔒 change that markup and need the owner's sign-off.
- **Keep the docs in sync.** When an item ships, update `llms.txt`, `README.md`, `DEPLOY.md` and this file, and bump the `?v=` cache-busting query in `index.html` (and `VERSION` in `sw.js`).
- **Only open work lives here.** Once an item is committed to `master` and deployed, remove its row. Git history is the record of what shipped. Item numbers aren't reused.

**Legend:** Impact is H, M or L (high, medium, low). Effort is S (< 1 day), M (1–3 days) or L (> 3 days). 🚀 means built and tested but not yet committed; remove the row once it's deployed.

---

## Phase 0: Quick wins

Timeline: now, about one day in total.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 0.7 | Fix the tool-cloud count label | M | S | `main.js` puts `aria-label` on a plain `<span class="tool__count">`, which most screen readers ignore, so "3 projects" isn't announced. Use visually hidden text instead, and update the test. |
| 0.8 | One command to bump the cache-busting version | M | S | The version is edited by hand in four places: three `?v=` links in `index.html` and `VERSION` in `sw.js`. Add a dev-only `npm run bump` script that sets them all to today's date. The existing test already checks they match. |
| 0.9 | `ProfilePage` and `WebSite` structured data | M | S | Google supports `ProfilePage` for personal profile pages. Wrap the existing `Person` JSON-LD in it (`mainEntity`), add a `WebSite` node and `og:locale` (`en_IN`). Mirror the change in `llms.txt`. |
| 0.10 | Replace AOS with the existing reveal-on-scroll | M | S | AOS is loaded only for one zoom-in on the hero container, while `main.js` already has its own reveal system. Remove `aos.css` and `aos.js` from the page, `sw.js` and the CSP checks. 🔒 Touches the hero's `data-aos` attribute. |

---

## Phase 1: Recruiter conversion

Timeline: 1–2 weeks.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 1.1 | 🧾 Downloadable résumé PDF | H | S | Add a "Download CV" button to the hero and footer, and store the PDF in `assets/docs/`. Add it to `PRECACHE` in `sw.js`. |
| 1.3 | A contact form that actually sends | H | M | Post to a static form endpoint such as Formspree, Web3Forms or Getform, and keep `mailto:` as a no-JS fallback. Add a honeypot field against spam. Add the endpoint to the CSP's `form-action` and `connect-src`. Update the tests that currently spy on `encodeURIComponent`. |
| 1.4 | 🧾 "Open to work" status and booking link | M | S | An availability badge near the contact section, plus a Cal.com or Calendly link for intro calls. |
| 1.5 | 🧾🔒 Sharper hero tagline | M | S | "Passionate about quality assurance…" is the template's generic text. Replace it with a result-led line from the résumé, for example the 800+ test Playwright migration in 3 weeks. |
| 1.6 | QR code on the printed résumé | L | S | A printed CV can't be clicked. Add a static SVG QR code for the live URL to `.print-header` (print only), and keep the page to one A4 sheet. Can share its QR with 5.3. |

---

## Phase 2: Engineering quality

Timeline: 2–3 weeks. This phase uses the site itself as a showcase of the owner's QA skills.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 2.1 | CI on every push and PR | H | S | A GitHub Actions workflow that runs `npm test` (with the coverage thresholds), `html-validate`, `stylelint` and the `lychee` link checker. |
| 2.2 | Playwright end-to-end suite | H | M | Run in a real browser: menu navigation and active state, theme toggle and persistence, portfolio filters, the tool cloud, copy-email, contact-form validation, and the mobile drawer at 375px. |
| 2.3 | Accessibility gate | H | S | Run `@axe-core/playwright` or `pa11y-ci` against WCAG 2.2 AA, in both light and dark themes. |
| 2.4 | Visual regression | M | M | Use Playwright `toHaveScreenshot()` at 375, 768 and 1440px widths in both themes, plus the print layout. It replaces the manual headless-Chrome checks. |
| 2.5 | Lighthouse CI on PRs | M | S | Replace the manual `foo-software/lighthouse-check-action` workflow with `@lhci/cli`, run against the branch's build rather than the live URL. Budgets: Performance ≥ 90; Accessibility, SEO and Best Practices ≥ 95; PWA installable. |
| 2.6 | "How this site is tested" section | M | S | Show the CI badges, coverage and mutation scores and the test pyramid, with links to the workflows. |
| 2.7 | Dependency and security scanning | M | S | Dependabot for npm, GitHub Actions and the Docker base image, plus CodeQL or Snyk (code and container). |
| 2.8 | Mutation testing | M | S | Run Stryker on `main.js`. Line coverage is already 99%; a mutation score shows whether the tests actually catch bugs. |
| 2.9 | Docker build check in CI | L | S | Build the image and assert that `/nope` returns the 404 page with status 404, `/sw.js` is `no-cache`, `/Dockerfile` isn't served and the healthcheck is healthy. Automates the manual check done for the Docker 404 work. |
| 2.10 | Offline check in CI | M | M | A Playwright test that loads the site, waits for the service worker, goes offline and reloads. Also assert no CSP violations on `index.html` and `404.html`. Automates the manual DevTools-protocol checks. |
| 2.11 | 🚀 404 page colour-token sync test | L | S | Built 2026-11-01, awaiting commit and deploy. `tests/static-files.test.js` compares every token in `404.html`'s light, dark and OS-dark blocks with `styles.css`, and fails with the token name and both values on drift. |
| 2.12 | Automatic sitemap date | L | S | A CI step sets `<lastmod>` in `sitemap.xml` from the last commit that changed `index.html`, so the date isn't edited by hand. |

---

## Phase 3: Performance, security and resilience

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 3.1 | Modern hero image formats | M | S | Add AVIF/WebP versions of `hero-bg.jpg`, served with `image-set()` and a JPEG fallback, and `<link rel="preload">` the hero image. Never lazy-load it, because it's the LCP image. Update `PRECACHE` in `sw.js`. |
| 3.2 | Font diet | M | M | Six font families are loaded. Drop unused weights, subset the fonts, and consider self-hosting them as WOFF2 files with `font-display: swap` (which would also remove Google Fonts from the CSP). |
| 3.4 | Defer the vendor scripts | L | S | Add `defer` to `typed.js` (and `aos.js`, unless 0.10 removes it first), and skip Typed when `prefers-reduced-motion` is on. |
| 3.8 | Remove `'unsafe-inline'` from the style policy | M | M | The 28 `style="--d:…"` and `--w` attributes plus the cursor style Typed.js injects are the only reason styles are loosely locked. Move the values into classes or `data-*` attributes, put the cursor style in `styles.css` with Typed's `autoInsertCss: false`, then drop `'unsafe-inline'` from `style-src`. |
| 3.9 | Trusted Types | L | S | Add `require-trusted-types-for 'script'` to the CSP. `main.js` already builds the page without `innerHTML`; check Typed.js runs in plain-text mode (or land 3.10 first). |
| 3.10 | Replace Typed.js with vanilla JS | L | S | About 30 lines in `main.js` can type and delete the four name spellings. Removes the last vendor script and makes 3.8 and 3.9 easier. 🔒 Touches the hero animation. |
| 3.11 | "New version available" notice | L | S | When the service worker installs an update, show the existing toast with a "Reload" button, so returning visitors don't keep a stale copy. |
| 3.12 | Offline indicator | L | S | A small "You're offline: showing a saved copy" label, driven by the browser's `online` and `offline` events. |

---

## Phase 4: Content depth

Timeline: later. Every item here needs real content from the owner.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 4.1 | 🧾 Case-study detail pages | H | L | One static page per case, for example `work/playwright-migration.html`, covering the problem, approach, before/after metrics and stack. Link each one from its `.case` card and from the tool cloud, and add them to `sitemap.xml`. |
| 4.2 | 🧾 Writing section ("Field notes") | M | L | Hand-written HTML articles with an RSS `feed.xml`. |
| 4.3 | 🧾 Testimonials | M | S | Quotes from LinkedIn recommendations, used with permission. |
| 4.4 | 🧾 Speaking, mentoring and open source | L | S | Expand the ISTQB CTFL 4.0 Exam Prep project into its own section. |
| 4.6 | 🧾 Hindi and Gujarati versions | L | L | Separate `/hi/` and `/gu/` pages with `hreflang` tags. The hero already types the name in both scripts. |

---

## Phase 5: Insight and growth

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 5.1 | Privacy-friendly analytics | M | S | GoatCounter or Cloudflare Web Analytics. Both are cookieless, so no consent banner is needed. Track visits, CV downloads, copy-email clicks and contact submissions. Add the provider to the CSP. |
| 5.2 | 🧾 Custom domain | M | S | Add a `CNAME` file and enforce HTTPS. Update the canonical tag, Open Graph URLs, JSON-LD, the sitemap and `llms.txt` to the new domain. `robots.txt` only takes effect once the site is at a domain root. |
| 5.3 | vCard and QR code | L | S | A `.vcf` contact-card download and a QR code for in-person networking. |
| 5.4 | Uptime monitoring | L | S | UptimeRobot, or a scheduled Action that pings the live URL. |
| 5.5 | Freshness and expiry check | M | S | A scheduled Action that flags a stale `llms.txt` "Last-updated" date and upcoming certification expiries. The ISTQB logo may only be shown while the certification is valid. |

---

## Phase 6: Accessibility and polish

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 6.1 | Three-way theme switch | L | S | Light, Dark and System. Today, once someone toggles the theme, the site stops following their device setting and there's no way back. Keep the `md-theme` key; add a `system` value. |
| 6.2 | 🚀 🔒 Bring the hero's colours into the palette | L | S | Built 2026-11-01, awaiting commit and deploy. Dark mode only (light stays as the template). The hero highlights, menu pills, mobile drawer and open-menu button now use `--accent`, `--ink`, `--paper` and `--paper-3`; active and hover pills are accent-filled. A test bans hard-coded colours in the block. Contrast: 6.5:1 to 14.9:1. |
| 6.3 | Pause button for the ticker | L | S | The ticker pauses on hover and respects reduced-motion settings, but keyboard and touch users can't stop it. WCAG 2.2.2 asks for a pause control on moving content. |

---

## Suggested sequencing

| Sprint | Scope | Outcome |
|--------|-------|---------|
| Now | Phase 0 (0.7 – 0.10) | Accessible tool cloud, safer releases, richer search results, one less library |
| 1 | 1.1, 1.3 and 1.5 | A recruiter can download the CV or send a message, and the hero leads with a result |
| 2 | 2.1 – 2.5 and 2.8 – 2.10 | Every change is gated by tests, accessibility, Lighthouse, mutation, Docker and offline checks |
| 3 | 3.1, 3.2, 3.4, 3.8 and 3.10 | Faster load and a strict style policy, measured by the Sprint 2 Lighthouse gate |
| Ongoing | Phases 4, 5 and 6 | Deeper content, growth and polish, as the owner supplies material |

## Open decisions

- [ ] Pick a form endpoint provider (item 1.3), or keep `mailto:` only.
- [ ] Approve hero changes: the new tagline (1.5), removing AOS (0.10), replacing Typed.js (3.10) and the hero colours (6.2).
- [ ] Pick an analytics provider (item 5.1), or no analytics.
- [ ] Decide whether to use a custom domain (item 5.2).
