/**
 * Structural tests for index.html: navigation, accessibility, SEO metadata
 * and asset references. These guard the rules in CLAUDE.md and llms.txt.
 */
const fs = require("fs");
const path = require("path");
const { ROOT, parseIndex } = require("./helpers");

const doc = parseIndex();
const $ = (sel) => doc.querySelector(sel);
const $$ = (sel) => [...doc.querySelectorAll(sel)];

const MENU = ["#hero", "#about", "#resume", "#portfolio", "#services", "#contact"];

describe("navigation", () => {
  test("side menu has the six template entries, in order", () => {
    expect($$("#navbar a.scrollto").map((a) => a.getAttribute("href"))).toEqual(MENU);
  });

  test("every side-menu link points at a section that exists", () => {
    MENU.forEach((hash) => expect(doc.getElementById(hash.slice(1))).not.toBeNull());
  });

  test("Home is marked active by default", () => {
    expect($$("#navbar a.active").map((a) => a.getAttribute("href"))).toEqual(["#hero"]);
  });

  test("chapters appear in menu order", () => {
    const order = $$("#hero, main .chapter").map((el) => `#${el.id}`);
    expect(order).toEqual(MENU);
  });

  test("in-page links all resolve", () => {
    $$('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      expect({ href: a.getAttribute("href"), found: !!doc.getElementById(id) }).toEqual({
        href: a.getAttribute("href"),
        found: true,
      });
    });
  });

  test("ids are unique", () => {
    const ids = $$("[id]").map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });
});

describe("accessibility", () => {
  test("has exactly one h1, inside the hero", () => {
    const h1s = $$("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].closest("#hero")).not.toBeNull();
  });

  test("declares the page language", () => {
    expect(doc.documentElement.getAttribute("lang")).toBe("en");
  });

  test("skip link targets the main content", () => {
    expect($(".skip-link").getAttribute("href")).toBe("#main");
    expect(doc.getElementById("main").tagName).toBe("MAIN");
  });

  test("every image has alt text and explicit width/height", () => {
    const imgs = $$("img");
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      expect({ src, alt: !!img.getAttribute("alt") }).toEqual({ src, alt: true });
      expect({ src, w: img.getAttribute("width"), h: img.getAttribute("height") }).toEqual({
        src,
        w: expect.stringMatching(/^\d+$/),
        h: expect.stringMatching(/^\d+$/),
      });
    });
  });

  test("links that open a new tab use rel=noopener", () => {
    $$('a[target="_blank"]').forEach((a) => {
      expect({ href: a.href, rel: a.getAttribute("rel") || "" }).toEqual({
        href: a.href,
        rel: expect.stringContaining("noopener"),
      });
    });
  });

  test("every contact form control has a label and an error slot", () => {
    ["name", "email", "topic", "message"].forEach((id) => {
      expect($(`label[for="${id}"]`)).not.toBeNull();
      expect(doc.getElementById(`${id}-error`)).not.toBeNull();
    });
  });

  test("theme and menu toggles are labelled buttons", () => {
    expect($(".theme-toggle").tagName).toBe("BUTTON");
    expect($(".theme-toggle").getAttribute("aria-label")).toBeTruthy();
    expect($(".mobile-nav-toggle").getAttribute("aria-label")).toBeTruthy();
  });
});

describe("SEO metadata (llms.txt rules)", () => {
  test("title is under 60 characters", () => {
    expect(doc.title.length).toBeGreaterThan(0);
    expect(doc.title.length).toBeLessThan(60);
  });

  test("meta description is 150–160 characters", () => {
    const len = $('meta[name="description"]').getAttribute("content").length;
    expect(len).toBeGreaterThanOrEqual(150);
    expect(len).toBeLessThanOrEqual(160);
  });

  test("canonical and og:url point at the live site", () => {
    const site = "https://mitesh411.github.io/MyResume/";
    expect($('link[rel="canonical"]').getAttribute("href")).toBe(site);
    expect($('meta[property="og:url"]').getAttribute("content")).toBe(site);
  });

  test("social preview image is set for Open Graph and Twitter, and exists locally", () => {
    const og = $('meta[property="og:image"]').getAttribute("content");
    expect($('meta[name="twitter:image"]').getAttribute("content")).toBe(og);
    expect($('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
    expect(og).toMatch(/^https:\/\/mitesh411\.github\.io\/MyResume\//);
    const local = og.replace("https://mitesh411.github.io/MyResume/", "");
    expect(fs.existsSync(path.join(ROOT, local))).toBe(true);
    expect($('meta[property="og:image:alt"]').getAttribute("content")).toBeTruthy();
  });

  test("Person JSON-LD is valid and matches the profile", () => {
    const data = JSON.parse($('script[type="application/ld+json"]').textContent);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Mitesh Dandade",
    });
    expect(data.sameAs).toEqual(
      expect.arrayContaining(["https://github.com/Mitesh411"])
    );
  });
});

describe("Person JSON-LD (rich results)", () => {
  const data = () => JSON.parse($('script[type="application/ld+json"]').textContent);
  const llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");

  test("names the current employer and university from llms.txt", () => {
    expect(data().worksFor).toMatchObject({ "@type": "Organization", name: "CREST InfoSystems Pvt. Ltd." });
    expect(data().alumniOf).toMatchObject({ "@type": "CollegeOrUniversity", name: "UKA Tarsadia University" });
    expect(llms).toContain("CREST InfoSystems Pvt. Ltd.");
    expect(llms).toContain("UKA Tarsadia University");
  });

  test("lists all three certifications, with Credly links matching the page", () => {
    const creds = data().hasCredential;
    expect(creds).toHaveLength(3);
    creds.forEach((c) => {
      expect(c["@type"]).toBe("EducationalOccupationalCredential");
      expect(c.credentialCategory).toBe("certification");
      expect($(`a[href="${c.url}"]`)).not.toBeNull();
    });
  });

  test("knowsAbout covers every skill listed in llms.txt", () => {
    const skills = llms.match(/^- Skills: (.+)$/m)[1].split(", ").flatMap((s) => s.split("/"));
    expect(data().knowsAbout).toEqual(expect.arrayContaining(skills));
  });

  test("has email, url and an image that exists locally", () => {
    const d = data();
    expect(d.email).toBe("mailto:dandademitesh@gmail.com");
    expect(d.url).toBe("https://mitesh411.github.io/MyResume/");
    expect(fs.existsSync(path.join(ROOT, d.image.replace(d.url, "")))).toBe(true);
  });
});

describe("print résumé", () => {
  test("has a print-only header with name and contact details, hidden from screen readers", () => {
    const header = $(".print-header");
    expect(header.getAttribute("aria-hidden")).toBe("true");
    expect(header.textContent).toContain("Mitesh Dandade");
    expect(header.textContent).toContain("dandademitesh@gmail.com");
  });

  test("styles.css has a print stylesheet that shows the header", () => {
    const css = fs.readFileSync(path.join(ROOT, "assets/css/styles.css"), "utf8");
    const print = css.slice(css.indexOf("@media print"));
    expect(print).toMatch(/@page\s*\{/);
    expect(print).toMatch(/\.print-header\s*\{\s*display:\s*block/);
  });
});

describe("hero (from the original template)", () => {
  test("typed name list includes the English and Devanagari spellings", () => {
    const items = $(".typed").getAttribute("data-typed-items").split(",");
    expect(items[0]).toBe("MITESH DANDADE");
    expect(items.some((s) => s.includes("मितेश"))).toBe(true);
  });

  test("h1 holds the name as real text, with the typed animation hidden from screen readers", () => {
    expect($("h1 .visually-hidden").textContent).toBe("Mitesh Dandade");
    expect($("h1 .typed").getAttribute("aria-hidden")).toBe("true");
  });

  test("typed items have no stray whitespace", () => {
    $(".typed")
      .getAttribute("data-typed-items")
      .split(",")
      .forEach((s) => expect(s).toBe(s.trim().replace(/\s+/g, " ")));
  });

  test("social links are labelled and point only at approved profiles", () => {
    const links = $$("#hero .social-links a");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "https://www.linkedin.com/in/mitesh-dandade-1a62085b",
      "https://github.com/Mitesh411",
      "mailto:dandademitesh@gmail.com",
    ]);
    links.forEach((a) => expect(a.getAttribute("aria-label")).toBeTruthy());
  });

  test("hero container keeps the AOS zoom-in animation", () => {
    const container = $("#hero .container");
    expect(container.getAttribute("data-aos")).toBe("zoom-in");
  });
});

describe("portfolio and contact content", () => {
  test("every filter button matches at least one case study", () => {
    const tags = new Set($$(".case").flatMap((c) => c.dataset.tags.split(" ")));
    $$(".filter")
      .map((b) => b.dataset.filter)
      .filter((f) => f !== "all")
      .forEach((f) => expect({ filter: f, used: tags.has(f) }).toEqual({ filter: f, used: true }));
  });

  test("contact form sends to the résumé email", () => {
    expect($("#contact-form").dataset.to).toBe("dandademitesh@gmail.com");
  });

  test("Credly verification links point at credly.com badge pages", () => {
    const credly = $$('a[href*="credly.com"]');
    expect(credly.length).toBeGreaterThanOrEqual(2);
    credly.forEach((a) => expect(a.getAttribute("href")).toMatch(/^https:\/\/www\.credly\.com\/badges\/[\w-]+\/public_url$/));
  });
});

describe("assets", () => {
  const localRefs = () =>
    $$("[src], link[href]")
      .map((el) => el.getAttribute("src") || el.getAttribute("href"))
      .filter((u) => u && !/^(https?:|data:|mailto:|#)/.test(u));

  test("every local file referenced by the page exists", () => {
    const refs = localRefs();
    expect(refs.length).toBeGreaterThan(5);
    refs.forEach((ref) => {
      const file = path.join(ROOT, ref.split(/[?#]/)[0]);
      expect({ ref, exists: fs.existsSync(file) }).toEqual({ ref, exists: true });
    });
  });

  test("site CSS and JS share one cache-busting version", () => {
    const versioned = localRefs().filter((r) => /assets\/(css\/(styles|hero)\.css|js\/main\.js)/.test(r));
    expect(versioned).toHaveLength(3);
    const versions = new Set(versioned.map((r) => (r.match(/\?v=(\d{8})$/) || [])[1]));
    expect(versions.size).toBe(1);
    expect([...versions][0]).toMatch(/^\d{8}$/);
  });

  test("hero.css loads after styles.css", () => {
    const sheets = $$('link[rel="stylesheet"]').map((l) => l.getAttribute("href"));
    const styles = sheets.findIndex((h) => h.startsWith("assets/css/styles.css"));
    const hero = sheets.findIndex((h) => h.startsWith("assets/css/hero.css"));
    expect(styles).toBeGreaterThanOrEqual(0);
    expect(hero).toBeGreaterThan(styles);
  });

  test("full Bootstrap is not loaded", () => {
    expect($$('link[href*="bootstrap.min.css"], script[src*="bootstrap"]')).toHaveLength(0);
  });
});
