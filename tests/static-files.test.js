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

  test("lastmod dates are valid ISO dates", () => {
    [...xml.getElementsByTagName("lastmod")].forEach((n) =>
      expect(n.textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    );
  });
});
