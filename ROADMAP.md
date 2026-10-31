# Product Roadmap — MyResume

_Last updated: 2026-10-31_

This is the roadmap for Mitesh Dandade's resume and portfolio site at https://mitesh411.github.io/MyResume/.

## Ground rules

- **Static only.** Use plain HTML, CSS and vanilla JavaScript, hosted on GitHub Pages. No React, Angular, Next or any other framework, and no build step for the site. npm is used for dev and test tooling only.
- **No invented content.** Every fact must come from the résumé PDF and `llms.txt`. Items marked 🧾 need real material from the owner before work can start.
- **Template boundary.** The side menu and hero come from the BootstrapMade template, and their markup is kept as-is. Items marked 🔒 change that markup and need the owner's sign-off.
- **Keep the docs in sync.** When an item ships, update `llms.txt`, `README.md`, `DEPLOY.md` and this file, and bump the `?v=` cache-busting query in `index.html`.

**Legend:** Impact is H, M or L (high, medium, low). Effort is S (< 1 day), M (1–3 days) or L (> 3 days).

---

## Phase 0: Fix first

Bugs and quick wins.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 0.1 | ✅ Fix the hero social links | H | S | Done 2026-10-31. Now LinkedIn, GitHub and email, each labelled. The wrong Twitter/Instagram icons and the unapproved Facebook link are removed. |
| 0.2 | ✅ Put real text in the `<h1>` | H | S | Done 2026-10-31. The name is in a visually hidden span, and the Typed animation is `aria-hidden`. Stray whitespace in the typed items is fixed too. |
| 0.3 | ✅ Add the missing SEO tags | H | S | Done 2026-10-31. Canonical, Open Graph and Twitter card tags, plus a new `assets/img/og-card.png` preview image. |
| 0.4 | ✅ Add `robots.txt` and `sitemap.xml` | M | S | Done 2026-10-31. Submit the sitemap in Google Search Console; `robots.txt` only takes effect at a domain root (see 5.2). |
| 0.5 | ✅ Delete the leftover pages | M | S | Done 2026-10-31. A test makes sure they stay deleted. |
| 0.6 | ✅ Add a custom `404.html` | L | S | Done 2026-10-31. Self-contained, with light and dark themes. Docker's nginx doesn't use it yet; that needs an `error_page` config. |

---

## Phase 1: Recruiter conversion

Timeline: now, 1–2 weeks.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 1.1 | 🧾 Downloadable résumé PDF | H | S | Add a "Download CV" button to the hero and footer, and store the PDF in `assets/docs/`. |
| 1.2 | ✅ Print stylesheet | M | S | Done 2026-10-31. Prints a one-page A4 résumé (header, summary, experience, skills, certifications) in black on white, in either theme. |
| 1.3 | A contact form that actually sends | H | M | Post to a static form endpoint such as Formspree, Web3Forms or Getform, and keep `mailto:` as a no-JS fallback. Add a honeypot field against spam. Update the tests that currently spy on `encodeURIComponent`. |
| 1.4 | 🧾 "Open to work" status and booking link | M | S | An availability badge near the contact section, plus a Cal.com or Calendly link for intro calls. |
| 1.5 | ✅ Copy-email button | L | S | Done 2026-10-31. Next to all three email links (hero, contact, footer), with a "Copied" toast and a fallback for browsers without the Clipboard API. |
| 1.6 | ✅ Fuller JSON-LD | M | S | Done 2026-10-31. Adds `worksFor`, `alumniOf`, `hasCredential` (3), `knowsAbout`, `email`, `url` and `image`, mirrored in `llms.txt`. |

---

## Phase 2: Engineering quality

Timeline: next, 2–3 weeks. This phase uses the site itself as a showcase of the owner's QA skills.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 2.1 | CI on every push and PR | H | S | A GitHub Actions workflow that runs `npm test` (with the coverage thresholds), `html-validate`, `stylelint` and the `lychee` link checker. |
| 2.2 | Playwright end-to-end suite | H | M | Run in a real browser: menu navigation and active state, theme toggle and persistence, portfolio filters, contact-form validation, and the mobile drawer at 375px. |
| 2.3 | Accessibility gate | H | S | Run `@axe-core/playwright` or `pa11y-ci` against WCAG 2.2 AA, in both light and dark themes. |
| 2.4 | Visual regression | M | M | Use Playwright `toHaveScreenshot()` at 375, 768 and 1440px widths in both themes. It replaces the manual headless-Chrome checks. |
| 2.5 | Lighthouse CI on PRs | M | S | Run `@lhci/cli` against the branch's build, not the live URL, with budgets: Performance ≥ 90, and Accessibility, SEO and Best Practices ≥ 95. |
| 2.6 | "How this site is tested" section | M | S | Show the CI badges, coverage figures and the test pyramid, with links to the workflows. |
| 2.7 | Dependency and security scanning | M | S | Dependabot for npm and GitHub Actions, plus CodeQL or Snyk. |

---

## Phase 3: Performance and resilience

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 3.1 | Modern hero image formats | M | S | Add AVIF/WebP versions of `hero-bg.jpg`, served with `image-set()` and a JPEG fallback, and `<link rel="preload">` the hero image. Never lazy-load it, because it's the LCP image. |
| 3.2 | Font diet | M | M | Six font families are loaded. Drop unused weights, subset the fonts, and consider self-hosting them as WOFF2 files with `font-display: swap`. |
| 3.3 | SVG icon sprite | M | M | Replace the full boxicons and bootstrap-icons font sets with an inline sprite of the roughly 12 icons actually used. |
| 3.4 | Defer the vendor scripts | L | S | Add `defer` to `aos.js` and `typed.js`, and skip Typed when `prefers-reduced-motion` is on. |
| 3.5 | PWA basics | L | M | A `manifest.webmanifest`, app icons, and a small service worker that caches the site for offline viewing. |
| 3.6 | Content Security Policy | M | S | Add a `<meta http-equiv="Content-Security-Policy">` tag (GitHub Pages can't send custom headers). Move the inline theme script into its own file or use a hash, and add `<meta name="referrer">`. |

---

## Phase 4: Content depth

Timeline: later. Every item here needs real content from the owner.

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 4.1 | 🧾 Case-study detail pages | H | L | One static page per case, for example `work/playwright-migration.html`, covering the problem, approach, before/after metrics and stack. Link each one from its `.case` card. |
| 4.2 | 🧾 Writing section ("Field notes") | M | L | Hand-written HTML articles with an RSS `feed.xml`. |
| 4.3 | 🧾 Testimonials | M | S | Quotes from LinkedIn recommendations, used with permission. |
| 4.4 | 🧾 Speaking, mentoring and open source | L | S | Expand the ISTQB CTFL 4.0 Exam Prep project into its own section. |
| 4.5 | Interactive skills matrix | M | M | Filter by tool, with each tool linking to the case studies that used it. Vanilla JS, reusing the `data-tags` pattern from the portfolio filters. |
| 4.6 | 🧾 Hindi and Gujarati versions | L | L | Separate `/hi/` and `/gu/` pages with `hreflang` tags. The hero already types the name in both scripts. |

---

## Phase 5: Insight and growth

| # | Item | Impact | Effort | Notes |
|---|------|:-:|:-:|-------|
| 5.1 | Privacy-friendly analytics | M | S | GoatCounter or Cloudflare Web Analytics. Both are cookieless, so no consent banner is needed. Track visits, CV downloads and contact submissions. |
| 5.2 | 🧾 Custom domain | M | S | Add a `CNAME` file and enforce HTTPS. Update the canonical tag, the sitemap and `llms.txt` to the new domain. |
| 5.3 | vCard and QR code | L | S | A `.vcf` contact-card download and a QR code for in-person networking. |
| 5.4 | Uptime monitoring | L | S | UptimeRobot, or a scheduled Action that pings the live URL. |
| 5.5 | Freshness and expiry check | M | S | A scheduled Action that flags a stale `llms.txt` "Last-updated" date and upcoming certification expiries. The ISTQB logo may only be shown while the certification is valid. |

---

## Suggested sequencing

| Sprint | Scope | Outcome |
|--------|-------|---------|
| 1 | All of Phase 0, plus 1.1, 1.3 and 1.6 | Fewer defects, better link previews, and a recruiter can download the CV or send a message |
| 2 | 2.1 – 2.5 | Every change is gated by tests, accessibility checks and Lighthouse |
| 3 | 3.1 – 3.4, 3.6 | Faster load, measured by the Sprint 2 Lighthouse gate |
| Ongoing | Phases 4 and 5 | Deeper content and growth, as the owner supplies material |

## Open decisions

- [x] Approve changes to the hero markup (items 0.1 and 0.2).
- [ ] Pick a form endpoint provider (item 1.3), or keep `mailto:` only.
- [ ] Pick an analytics provider (item 5.1), or no analytics.
- [ ] Decide whether to use a custom domain (item 5.2).
