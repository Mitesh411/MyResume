/**
 * Checks for the files around index.html: the 404 page, robots.txt and
 * sitemap.xml. They must agree with each other and with the live URL.
 */
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./helpers");

const SITE = "https://mitesh411.github.io/MyResume/";
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

describe("404.html", () => {
  const doc = new DOMParser().parseFromString(read("404.html"), "text/html");

  test("has exactly one h1 and a title", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.title).toMatch(/not found/i);
  });

  test("is kept out of search results", () => {
    expect(doc.querySelector('meta[name="robots"]').getAttribute("content")).toBe("noindex");
  });

  test("uses no relative asset paths, so it renders at any URL depth", () => {
    const refs = [...doc.querySelectorAll("link[href], script[src], img[src]")].map(
      (el) => el.getAttribute("href") || el.getAttribute("src")
    );
    refs.forEach((ref) => expect(ref).toMatch(/^(https:|data:)/));
  });

  test("links back to the home page and real sections", () => {
    const hrefs = [...doc.querySelectorAll("a[data-home]")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/MyResume/", "/MyResume/#portfolio", "/MyResume/#contact"]);
    const index = new DOMParser().parseFromString(read("index.html"), "text/html");
    ["portfolio", "contact"].forEach((id) => expect(index.getElementById(id)).not.toBeNull());
  });
});

test("old template pages are gone", () => {
  ["Landing Page.html", "testindex.html"].forEach((f) =>
    expect(fs.existsSync(path.join(ROOT, f))).toBe(false)
  );
});

describe("robots.txt", () => {
  const robots = read("robots.txt");

  test("allows crawling and points at the sitemap", () => {
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toContain(`Sitemap: ${SITE}sitemap.xml`);
  });
});

describe("sitemap.xml", () => {
  const xml = new DOMParser().parseFromString(read("sitemap.xml"), "application/xml");

  test("is well-formed and lists the home page", () => {
    expect(xml.querySelector("parsererror")).toBeNull();
    const locs = [...xml.getElementsByTagName("loc")].map((n) => n.textContent);
    expect(locs).toContain(SITE);
  });

  test("every image it lists exists locally", () => {
    [...xml.getElementsByTagNameNS("http://www.google.com/schemas/sitemap-image/1.1", "loc")].forEach((n) => {
      const local = n.textContent.replace(SITE, "");
      expect({ local, exists: fs.existsSync(path.join(ROOT, local)) }).toEqual({ local, exists: true });
    });
  });

  test("lastmod dates are valid ISO dates", () => {
    [...xml.getElementsByTagName("lastmod")].forEach((n) =>
      expect(n.textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    );
  });
});

describe("manifest.webmanifest", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const pngSize = (file) => {
    const buf = fs.readFileSync(path.join(ROOT, file));
    return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  };

  test("is installable: name, start URL and scope relative to the site, standalone display", () => {
    expect(manifest.name).toMatch(/Mitesh Dandade/);
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.display).toBe("standalone");
  });

  test("has 192px and 512px icons plus a maskable one, all at their stated sizes", () => {
    const pngs = manifest.icons.filter((i) => i.type === "image/png");
    pngs.forEach((i) => expect({ src: i.src, size: pngSize(i.src) }).toEqual({ src: i.src, size: i.sizes }));
    expect(pngs.map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(pngs.some((i) => i.purpose === "maskable")).toBe(true);
    manifest.icons.forEach((i) => expect(fs.existsSync(path.join(ROOT, i.src))).toBe(true));
  });

  test("Apple touch icon is 180×180", () => {
    expect(pngSize("assets/img/icons/apple-touch-icon.png")).toBe("180x180");
  });
});

describe("sw.js", () => {
  const sw = read("sw.js");
  const version = sw.match(/const VERSION = "(\d{8})";/)[1];
  const precache = [...sw.match(/const PRECACHE = \[([\s\S]*?)\];/)[1].matchAll(/["`]([^"`]+)["`]/g)].map((m) =>
    m[1].replace("${VERSION}", version)
  );

  test("cache version matches the ?v= version in index.html", () => {
    expect(read("index.html")).toContain(`?v=${version}`);
  });

  test("precaches the page, its versioned CSS and JS, and files that exist", () => {
    const index = read("index.html");
    expect(precache).toEqual(expect.arrayContaining(["./", "index.html", "manifest.webmanifest"]));
    index.match(/assets\/(css|js)\/[\w.]+\?v=\d{8}/g).forEach((ref) => expect(precache).toContain(ref));
    precache
      .filter((f) => f !== "./")
      .forEach((f) => {
        const file = f.split("?")[0];
        expect({ file, exists: fs.existsSync(path.join(ROOT, file)) }).toEqual({ file, exists: true });
      });
  });
});

describe("404.html security headers", () => {
  const crypto = require("crypto");
  const html = read("404.html").replace(/\r\n?/g, "\n");
  const hash = (text) => `'sha256-${crypto.createHash("sha256").update(text).digest("base64")}'`;
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];

  test("CSP hashes match the inline scripts and style block", () => {
    [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m) => expect(csp).toContain(hash(m[1])));
    [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].forEach((m) => expect(csp).toContain(hash(m[1])));
    expect(csp).toContain("object-src 'none'");
  });

  test("sets a referrer policy", () => {
    expect(html).toContain('<meta name="referrer" content="strict-origin-when-cross-origin">');
  });
});

describe("Docker image (nginx)", () => {
  const dockerfile = read("Dockerfile");
  const conf = read("docker/nginx.conf");

  test("installs the site config and doesn't serve the build files", () => {
    expect(dockerfile).toContain("COPY docker/nginx.conf /etc/nginx/conf.d/default.conf");
    expect(dockerfile).toMatch(/rm -rf \/usr\/share\/nginx\/html\/docker \/usr\/share\/nginx\/html\/Dockerfile/);
  });

  test("serves 404.html for missing URLs, like GitHub Pages", () => {
    expect(conf).toMatch(/error_page 404 \/404\.html;/);
    expect(conf).toMatch(/try_files \$uri \$uri\/ =404;/);
  });

  test("404.html stays directly reachable, because sw.js precaches it", () => {
    expect(read("sw.js")).toContain('"404.html"');
    expect(conf).not.toMatch(/location = \/404\.html\s*\{[^}]*internal/);
  });

  test("sw.js is never cached and the manifest has its media type", () => {
    expect(conf).toMatch(/location = \/sw\.js\s*\{[^}]*Cache-Control "no-cache"/);
    expect(conf).toContain("application/manifest+json");
  });
});

/* Colour tokens are defined in three blocks: light (:root), forced dark
   ([data-theme="dark"]) and OS dark (prefers-color-scheme, :not([data-theme="light"])). */
const tokenBlock = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block for ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const SCHEMES = {
  light: ":root",
  dark: ':root[data-theme="dark"]',
  "OS dark": ':root:not([data-theme="light"])',
};

describe("404.html colour tokens match styles.css", () => {
  const site = read("assets/css/styles.css");
  const page = read("404.html");

  test.each(Object.entries(SCHEMES))("%s tokens", (scheme, selector) => {
    const ours = tokenBlock(page, selector);
    const theirs = tokenBlock(site, selector);
    expect(Object.keys(ours).length).toBeGreaterThan(5);
    Object.entries(ours).forEach(([name, value]) =>
      expect({ scheme, name, value }).toEqual({ scheme, name, value: theirs[name] })
    );
  });

  test("the light block also matches the shared font and layout tokens", () => {
    const ours = tokenBlock(page, ":root");
    ["--serif", "--sans", "--mono", "--gutter", "--ease"].forEach((name) => expect(ours[name]).toBeDefined());
  });
});

describe("hero.css dark theme uses the palette", () => {
  const css = read("assets/css/hero.css");
  const dark = css
    .slice(css.indexOf("/* ---------- Dark theme for the hero"), css.indexOf("/* ---------- Fit the rest"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = (text, root) =>
    [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .map((m) => `${m[1].replace(/\s+/g, " ").split(root).join("ROOT").trim()} {${m[2].replace(/\s+/g, " ").trim()}}`)
      .filter((r) => r.includes("ROOT"));

  test("has no hard-coded colours, only tokens from styles.css", () => {
    expect(dark).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    const site = read("assets/css/styles.css");
    [...dark.matchAll(/var\((--[\w-]+)\)/g)].forEach((m) => expect(site).toContain(`${m[1]}:`));
  });

  test("forced dark and OS dark apply the same rules", () => {
    const media = dark.indexOf("@media (prefers-color-scheme: dark)");
    const forced = rules(dark.slice(0, media), ':root[data-theme="dark"]');
    const os = rules(dark.slice(media), ':root:not([data-theme="light"])');
    expect(forced.length).toBeGreaterThan(8);
    expect(os).toEqual(forced);
  });
});
