# How to put your portfolio online

This guide assumes no coding or hosting experience. The website is the `MyResume` folder: a single page (`index.html`), plus an `assets` folder holding the styles, scripts, fonts and images. There is nothing to install or build. You upload the files as they are.

Choose **one** of the two options below.

- **Option A (Netlify Drop)** is the quickest. It takes about five minutes and needs only a web browser.
- **Option B (GitHub Pages)** is free and uses the GitHub account you already have. The site is updated whenever you push changes.

---

## Before you start: check the site on your computer

1. Open the `MyResume` folder in File Explorer.
2. Double-click `index.html`. The site opens in your browser.
3. Click each round button in the menu on the left (Home, About, Resume, Portfolio, Services, Contact). The page should scroll to that section.
4. Click the round moon/sun button at the top right to switch between light and dark mode.
5. Make your browser window narrow. The left menu should be replaced by a ☰ button that slides it open.

If all of that works, the site is ready to publish.

**Optional: add your photo.** Save a portrait as `assets/img/portrait.jpg`. A tall image works best, for example 720 × 900 pixels. Then open `index.html` in Notepad, find the line that starts with `<!-- <img src="assets/img/portrait.jpg"`, delete the `<!--` at its start and the `-->` at its end, and save. Until you do this, a large "md" monogram appears in place of the photo.

---

## Option A: Netlify Drop (quickest)

1. Go to **https://app.netlify.com/drop** in your browser.
2. Sign up for a free account, or log in. "Sign up with GitHub" is the fastest way.
3. You'll see a box that says *"Drag and drop your site output folder here"*.
4. Make a new, empty folder (for example `site`). Copy `index.html` and the `assets` folder into it, then drag that whole folder onto the box. This keeps the repository's other files, such as `.git` and `CLAUDE.md`, off the public site.
5. Wait about 10–30 seconds. Netlify shows **"Your site is published"** and a link such as `https://glittering-otter-12ab34.netlify.app`.
6. Click the link. Your site is live, and you can share that address with anyone.

**Give it a nicer address:**
1. On the Netlify site page, go to **Site configuration → Change site name**.
2. Type a name, for example `mitesh-dandade`, and click **Save**.
3. The address becomes `https://mitesh-dandade.netlify.app`.

**Update the site later:** open the site in Netlify, click the **Deploys** tab, and drag the updated `site` folder onto the box at the bottom of that page.

---

## Option B: GitHub Pages (uses your existing repository)

Your repository `Mitesh411/MyResume` is published at **`https://mitesh411.github.io/MyResume/`**. Because `index.html` is at the top of the repository, this new site becomes your main page as soon as you push it.

### Using the command line

From the `MyResume` folder:

```
git add -A
git commit -m "Replace template site with new portfolio"
git push
```

`git add -A` records everything: the new files, and the old template files you deleted.

### Using the GitHub website (no command line)

1. Go to **https://github.com/Mitesh411/MyResume** and sign in.
2. Click **Add file → Upload files**.
3. Drag `index.html` and the `assets` folder from File Explorer onto the page. GitHub keeps the folder structure.
4. Scroll down, type a short message such as `Update portfolio site`, and click **Commit changes**.

The upload page can only add or replace files. To remove old template files from the repository, use the command-line steps above.

Wait one to two minutes, then visit `https://mitesh411.github.io/MyResume/`. To check on progress, open the **Actions** tab. The most recent "pages build and deployment" run shows a green ✓ when it has finished.

---

## After publishing: quick checklist

- [ ] Open the live link on your phone as well as your computer.
- [ ] Click every item in the left menu, and every project link.
- [ ] Try the theme button.
- [ ] Fill in the contact form and click **Compose email**. Your email app should open with the message ready to send.
- [ ] Visit a made-up address, such as `https://mitesh411.github.io/MyResume/nope`. The "Page not found" page should appear, and its buttons should take you back to the site.
- [ ] Submit `https://mitesh411.github.io/MyResume/sitemap.xml` in Google Search Console (**Sitemaps**). This is needed because search engines only read `robots.txt` at the root of a domain, so the copy under `/MyResume/` is ignored until the site has its own domain.
- [ ] On your phone, open the live link and choose **Add to Home screen** (Android: browser menu; iPhone: Share button). The site should open full-screen from the new icon.
- [ ] Turn on airplane mode and reopen the site. It should still load, because the service worker keeps a copy.
- [ ] After you change `styles.css`, `hero.css` or `main.js`, update the `?v=` date in `index.html` **and** `VERSION` in `sw.js` to the same value. Otherwise returning visitors keep seeing the old version.
- [ ] Add the live link to your LinkedIn profile (**Contact info → Website**) and to your résumé.

## About the contact form

The site has no server, so the form doesn't store anything. When a visitor clicks **Compose email**, their own email app opens with a pre-filled message to you. This works on every free host with no setup. If you'd rather receive messages without the visitor's email app opening, a free service such as Formspree (formspree.io) can do that. It requires a small change to the contact form in `index.html`.
