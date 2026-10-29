# [Mitesh Dandade — QA Lead & Test Automation](https://mitesh411.github.io/MyResume/)

The personal resume and portfolio site of Mitesh Dandade, a QA Lead with 8+ years in CI-driven test automation for SaaS and product companies.

**Live site:** https://mitesh411.github.io/MyResume/

## Overview

The site is one static page made of HTML, CSS and plain JavaScript. It has no framework, no build step and no backend. Visitors move between sections with a floating menu on the left; on phones the menu becomes a slide-out drawer.

### Sections

| Menu item | Section | What it contains |
|---|---|---|
| Home | `#hero` | Animated name and a short introduction, with social links |
| About | `#about` | Background, working approach and principles |
| Resume | `#resume` | Career timeline, toolbox, certifications with badges, and education |
| Portfolio | `#portfolio` | Nine case studies with measured outcomes, filterable by area |
| Services | `#services` | Eight areas of specialisation, each backed by a real result |
| Contact | `#contact` | Email, LinkedIn, GitHub and a contact form |

### Features

- **Light and dark themes.** A toggle at the top right switches themes and remembers the choice. Without JavaScript, the site follows the device's setting.
- **Responsive layout.** The editorial 12-column grid stacks into one column on phones.
- **Verified certifications.** The AWS and Azure badges link to their Credly records, and the ISTQB badge links to ISTQB India.
- **Static contact form.** It opens the visitor's own email app with the message filled in, so no server is needed.
- **Accessibility.** The site has a skip link, semantic headings, focus styles and labelled controls, and it respects reduced-motion settings.
- **Structured data.** The page includes Schema.org `Person` JSON-LD and an `llms.txt` for search engines and AI tools.

## Project structure

```
MyResume/
├── index.html              # The whole site
├── assets/
│   ├── css/
│   │   ├── styles.css      # Design system: colour tokens, light/dark themes, grid, components
│   │   └── hero.css        # Hero and side-menu styles (from the BootstrapMade template) + hero dark theme
│   ├── js/
│   │   └── main.js         # Theme toggle, side menu, Typed/AOS, reveal-on-scroll, filters, contact form
│   ├── img/
│   │   ├── hero-bg.jpg     # Hero and page background
│   │   ├── favicon.svg
│   │   └── badges/         # AWS, Azure and ISTQB certification badges
│   └── vendor/             # Typed.js, AOS, Boxicons, Bootstrap Icons (stored locally)
├── DEPLOY.md               # Step-by-step publishing guide for beginners
├── Dockerfile              # nginx image that serves the site
├── llms.txt                # Site facts and SEO guidance for search engines and AI tools
├── CLAUDE.md               # Notes for AI coding assistants
└── .github/workflows/
    └── LightHouseCI.yml    # Manual Lighthouse audit of the live site
```

`Landing Page.html` and `testindex.html` are pages left over from the old template. Their stylesheets and scripts have been removed, so they no longer display correctly, and nothing links to them.

## Run it locally

You don't need to install anything.

- **Quickest:** open `index.html` in your browser.
- **With a local server:** use this to check behaviour that depends on a real web server.
  ```bash
  python -m http.server
  ```
  Then visit http://localhost:8000.

## Editing content

- **Text:** everything is in `index.html`, grouped by section (`#about`, `#resume`, `#portfolio`, `#services`, `#contact`). Use only facts from the résumé; `llms.txt` lists the approved ones.
- **Portrait:** save a photo as `assets/img/portrait.jpg`, then uncomment the `<img>` in the About section. Until then, an "md" monogram is shown.
- **Colours and themes:** change the tokens at the top of `assets/css/styles.css`. The light set is on `:root` and the dark set under `[data-theme="dark"]`.
- **Hero and side menu:** don't change their markup or light-mode styles, which come from the original template. Each side-menu link must match a section `id`.

## Deployment

### GitHub Pages

The site is published from the `master` branch. Push to `master` and GitHub Pages updates https://mitesh411.github.io/MyResume/ within a minute or two. [DEPLOY.md](DEPLOY.md) has beginner-friendly steps for GitHub Pages and Netlify Drop.

### Docker

The `Dockerfile` serves the site with nginx and includes a healthcheck:

```dockerfile
FROM nginx:1.29.3-alpine3.22
COPY . /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost || exit 1
CMD [ "nginx", "-g", "daemon off;" ]
```

```bash
docker build -t my-resume .
docker run -p 80:80 my-resume
```

Then open http://localhost.

### Lighthouse audit

`.github/workflows/LightHouseCI.yml` runs a Lighthouse audit of the live site. It only runs when started manually from the repository's **Actions** tab, and the reports are saved as workflow artifacts.

## Contributing

1. Fork the repository and clone your fork.
2. Create a branch, such as `feature/short-description` or `fix/short-description`.
3. Make your changes and check them by opening `index.html` in a browser, in both light and dark themes and at phone width.
4. Commit with a clear message and push to your fork.
5. Open a pull request against the **`master`** branch.

Issues and suggestions are welcome on [GitHub Issues](https://github.com/mitesh411/MyResume/issues).

## Credits

- The hero section and floating side menu are adapted from the [MyResume template by BootstrapMade](https://bootstrapmade.com/free-html-bootstrap-template-my-resume/).
- [Typed.js](https://github.com/mattboldt/typed.js), [AOS](https://github.com/michalsnik/aos), [Boxicons](https://boxicons.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/).
- The fonts are Fraunces, Instrument Sans and JetBrains Mono, plus Open Sans, Raleway and Poppins for the hero. All come from Google Fonts.
- The certification badges belong to their issuers (AWS, Microsoft, ISTQB) and are shown under each issuer's rules for credential holders.

## License

This project is licensed under the MIT License. No `LICENSE` file is included in the repository yet. The BootstrapMade template and the vendor libraries keep their own licences.
