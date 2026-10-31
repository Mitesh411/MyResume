/**
 * Unit tests for assets/js/main.js, run against the real index.html markup.
 */
const { loadPage, setBox, setScrollY } = require("./helpers");

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  localStorage.clear();
  setScrollY(0);
  window.history.replaceState(null, "", "/");
});

describe("theme toggle", () => {
  test("defaults to light and labels the button for switching to dark", () => {
    loadPage({ mutate: (doc) => doc.documentElement.removeAttribute("data-theme") });
    const btn = $(".theme-toggle");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(btn.getAttribute("aria-label")).toBe("Switch to dark theme");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  test("keeps a theme already set by the inline head script", () => {
    loadPage({ mutate: (doc) => doc.documentElement.setAttribute("data-theme", "dark") });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect($(".theme-toggle").getAttribute("aria-label")).toBe("Switch to light theme");
  });

  test("clicking toggles dark ↔ light and remembers the choice", () => {
    loadPage({ mutate: (doc) => doc.documentElement.setAttribute("data-theme", "light") });
    const btn = $(".theme-toggle");

    click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem("md-theme")).toBe("dark");

    click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("md-theme")).toBe("light");
  });

  test("still switches theme when localStorage is unavailable", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    loadPage({ mutate: (doc) => doc.documentElement.setAttribute("data-theme", "light") });
    expect(() => click($(".theme-toggle"))).not.toThrow();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

describe("left floating side menu", () => {
  test("mobile toggle opens and closes the drawer and reports its state", () => {
    loadPage();
    const toggle = $(".mobile-nav-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    click(toggle);
    expect(document.body.classList.contains("mobile-nav-active")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    click(toggle);
    expect(document.body.classList.contains("mobile-nav-active")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  test("toggle has both icons; CSS shows one per state", () => {
    loadPage();
    expect($(".mobile-nav-toggle .icon-open use").getAttribute("href")).toBe("#i-list");
    expect($(".mobile-nav-toggle .icon-close use").getAttribute("href")).toBe("#i-x");
  });

  test("a menu link still closes an open drawer when the page has no toggle", () => {
    loadPage({ mutate: (doc) => doc.querySelector(".mobile-nav-toggle").remove() });
    document.body.classList.add("mobile-nav-active");
    click($('#navbar a[href="#about"]'));
    expect(document.body.classList.contains("mobile-nav-active")).toBe(false);
  });

  test("page without a mobile toggle loads without errors", () => {
    expect(() => loadPage({ mutate: (doc) => doc.querySelector(".mobile-nav-toggle").remove() })).not.toThrow();
  });

  test("menu link smooth-scrolls to its section", () => {
    loadPage();
    setBox($("#services"), 4200, 900);
    const link = $('#navbar a[href="#services"]');
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 4200, behavior: "smooth" });
  });

  test("uses instant scrolling when the user prefers reduced motion", () => {
    loadPage({ reduceMotion: true });
    setBox($("#contact"), 9000, 600);
    click($('#navbar a[href="#contact"]'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 9000, behavior: "auto" });
  });

  test("clicking a menu link closes the open mobile drawer", () => {
    loadPage();
    click($(".mobile-nav-toggle"));
    click($('#navbar a[href="#about"]'));
    expect(document.body.classList.contains("mobile-nav-active")).toBe(false);
  });

  test("link whose section is missing is left to the browser", () => {
    loadPage({ mutate: (doc) => doc.getElementById("services").remove() });
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true });
    $('#navbar a[href="#services"]').dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test("highlights the menu item for the section in view while scrolling", () => {
    loadPage();
    const ids = ["hero", "about", "resume", "portfolio", "services", "contact"];
    ids.forEach((id, i) => setBox(document.getElementById(id), i * 1000, 1000));

    setScrollY(2300); // 2300 + 200 = 2500 → inside #resume (2000–3000)
    document.dispatchEvent(new Event("scroll"));

    const active = $$("#navbar .scrollto.active").map((a) => a.getAttribute("href"));
    expect(active).toEqual(["#resume"]);
  });

  test("ignores menu links without a hash when highlighting", () => {
    loadPage({
      mutate: (doc) => {
        const li = doc.createElement("li");
        li.innerHTML = '<a href="other.html" class="nav-link scrollto">Other</a>';
        doc.querySelector("#navbar ul").appendChild(li);
      },
    });
    expect(() => window.dispatchEvent(new Event("load"))).not.toThrow();
    expect($('#navbar a[href="other.html"]').classList.contains("active")).toBe(false);
  });

  test("on load, scrolls to the section named in the URL hash", () => {
    window.history.replaceState(null, "", "/#portfolio");
    loadPage();
    setBox($("#portfolio"), 6000, 2000);
    window.dispatchEvent(new Event("load"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 6000, behavior: "smooth" });
  });

  test("on load, ignores a URL hash that matches no section", () => {
    window.history.replaceState(null, "", "/#does-not-exist");
    loadPage();
    window.dispatchEvent(new Event("load"));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe("hero: Typed.js and AOS", () => {
  test("starts Typed with the names from data-typed-items", () => {
    const { Typed } = loadPage();
    expect(Typed).toHaveBeenCalledTimes(1);
    const [selector, options] = Typed.mock.calls[0];
    expect(selector).toBe(".typed");
    expect(options.strings[0]).toBe("MITESH DANDADE");
    expect(options.strings.length).toBe(4);
    expect(options).toMatchObject({ loop: true, typeSpeed: 100, backSpeed: 50, backDelay: 2000 });
  });

  test("initialises AOS on window load with the template settings", () => {
    const { AOS } = loadPage();
    expect(AOS.init).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    expect(AOS.init).toHaveBeenCalledWith({ duration: 1000, easing: "ease-in-out", once: true, mirror: false });
  });

  test("works when Typed.js and AOS failed to load", () => {
    expect(() => loadPage({ typed: false, aos: false })).not.toThrow();
    expect(() => window.dispatchEvent(new Event("load"))).not.toThrow();
  });
});

describe("reveal on scroll", () => {
  test("without IntersectionObserver, everything is shown immediately", () => {
    loadPage();
    const revealables = $$("[data-reveal], .fig, .case");
    expect(revealables.length).toBeGreaterThan(0);
    expect(revealables.every((el) => el.classList.contains("is-visible"))).toBe(true);
  });

  test("with reduced motion, everything is shown even if IntersectionObserver exists", () => {
    const { observers } = loadPage({ reduceMotion: true, intersectionObserver: true });
    expect(observers).toHaveLength(0);
    expect($$("[data-reveal]").every((el) => el.classList.contains("is-visible"))).toBe(true);
  });

  test("with IntersectionObserver, elements are revealed as they enter the viewport", () => {
    const { observers } = loadPage({ intersectionObserver: true });
    expect(observers).toHaveLength(1);
    const io = observers[0];
    const [first, second] = $$("[data-reveal]");

    expect(io.observe).toHaveBeenCalledWith(first);
    expect(first.classList.contains("is-visible")).toBe(false);

    io.callback([
      { isIntersecting: true, target: first },
      { isIntersecting: false, target: second },
    ]);
    expect(first.classList.contains("is-visible")).toBe(true);
    expect(io.unobserve).toHaveBeenCalledWith(first);
    expect(second.classList.contains("is-visible")).toBe(false);
  });
});

describe("clock and footer year", () => {
  test("shows Surat local time and refreshes every 30 seconds", () => {
    jest.useFakeTimers({ now: new Date("2026-10-30T06:00:00Z") });
    loadPage();
    const clocks = $$("[data-clock]");
    expect(clocks.length).toBeGreaterThan(0);
    expect(clocks.every((c) => c.textContent === "11:30 IST")).toBe(true);

    jest.advanceTimersByTime(60_000);
    expect(clocks[0].textContent).toBe("11:31 IST");
  });

  test("page without clocks loads without errors", () => {
    expect(() =>
      loadPage({ mutate: (doc) => doc.querySelectorAll("[data-clock]").forEach((c) => c.remove()) })
    ).not.toThrow();
  });

  test("footer shows the current year", () => {
    jest.useFakeTimers({ now: new Date("2031-03-01T00:00:00Z") });
    loadPage();
    expect($("[data-year]").textContent).toBe("2031");
  });
});

describe("portfolio filters", () => {
  const visibleCases = () => $$(".case").filter((c) => !c.hidden).map((c) => c.id);

  test("filtering by a tag shows only matching case studies", () => {
    loadPage();
    const btn = $('.filter[data-filter="security"]');
    click(btn);
    const expected = $$(".case").filter((c) => c.dataset.tags.split(" ").includes("security")).map((c) => c.id);
    expect(visibleCases()).toEqual(expected);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect($('.filter[data-filter="all"]').getAttribute("aria-pressed")).toBe("false");
    expect($("#filter-status").textContent).toBe(`Showing ${expected.length} projects`);
  });

  test("uses singular wording when one project matches", () => {
    loadPage();
    click($('.filter[data-filter="community"]'));
    expect(visibleCases()).toEqual(["istqb-prep"]);
    expect($("#filter-status").textContent).toBe("Showing 1 project");
  });

  test('"All" shows every case study again', () => {
    loadPage();
    click($('.filter[data-filter="ai"]'));
    click($('.filter[data-filter="all"]'));
    expect(visibleCases()).toHaveLength($$(".case").length);
  });

  test("treats a case without data-tags as untagged", () => {
    loadPage({ mutate: (doc) => doc.querySelector(".case").removeAttribute("data-tags") });
    click($('.filter[data-filter="automation"]'));
    expect($$(".case")[0].hidden).toBe(true);
  });

  test("works without the screen-reader status element", () => {
    loadPage({ mutate: (doc) => doc.getElementById("filter-status").remove() });
    expect(() => click($('.filter[data-filter="ai"]'))).not.toThrow();
  });
});

describe("contact form", () => {
  const fill = (values) => {
    for (const [id, v] of Object.entries(values)) document.getElementById(id).value = v;
  };
  const submit = () => $("#contact-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

  test("blur shows Required on an empty field and clears it once filled", () => {
    loadPage();
    const name = $("#name");
    name.dispatchEvent(new Event("blur"));
    expect($("#name-error").textContent).toBe("Required");
    expect(name.getAttribute("aria-invalid")).toBe("true");

    name.value = "Ada";
    name.dispatchEvent(new Event("blur"));
    expect($("#name-error").textContent).toBe("");
    expect(name.getAttribute("aria-invalid")).toBe("false");
  });

  test("rejects an invalid email address", () => {
    loadPage();
    const email = $("#email");
    email.value = "not-an-email";
    email.dispatchEvent(new Event("blur"));
    expect($("#email-error").textContent).toBe("Please enter a valid email address");
  });

  test("submitting an incomplete form focuses the first invalid field and sends nothing", () => {
    loadPage();
    const enc = jest.spyOn(window, "encodeURIComponent");
    fill({ name: "Ada", email: "", message: "" });
    submit();
    expect(document.activeElement).toBe($("#email"));
    expect(enc).not.toHaveBeenCalled();
    expect($("#form-status").textContent).toBe("");
  });

  test("valid submission composes a pre-filled email to the site owner", () => {
    loadPage();
    // jsdom cannot follow mailto: links; it reports "Not implemented: navigation".
    jest.spyOn(console, "error").mockImplementation(() => {});
    const enc = jest.spyOn(window, "encodeURIComponent");

    fill({ name: "  Ada Lovelace ", email: "ada@example.com", message: "Let's talk about Playwright." });
    $("#topic").value = "Playwright migration";
    submit();

    expect($("#contact-form").dataset.to).toBe("dandademitesh@gmail.com");
    expect(enc).toHaveBeenNthCalledWith(1, "Playwright migration — from Ada Lovelace");
    expect(enc).toHaveBeenNthCalledWith(2, "Let's talk about Playwright.\n\n—\nAda Lovelace\nada@example.com");
    expect($("#form-status").textContent).toBe("Opening your email app with the message ready to send…");
  });

  test("works without status and error elements", () => {
    loadPage({
      mutate: (doc) => {
        doc.getElementById("form-status").remove();
        doc.getElementById("name-error").remove();
      },
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
    fill({ name: "Ada", email: "ada@example.com", message: "Hi" });
    expect(() => submit()).not.toThrow();
    $("#name").value = "";
    expect(() => $("#name").dispatchEvent(new Event("blur"))).not.toThrow();
  });

  test("tolerates a missing optional field when wiring blur handlers", () => {
    expect(() => loadPage({ mutate: (doc) => doc.getElementById("topic").remove() })).not.toThrow();
  });

  test("page without the contact form loads without errors", () => {
    expect(() => loadPage({ mutate: (doc) => doc.getElementById("contact-form").remove() })).not.toThrow();
  });
});

describe("copy email", () => {
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };
  const setClipboard = (value) =>
    Object.defineProperty(navigator, "clipboard", { configurable: true, value });

  afterEach(() => {
    setClipboard(undefined);
    delete document.execCommand;
  });

  test("every copy button is next to a matching email link", () => {
    loadPage();
    const btns = $$("[data-copy]");
    expect(btns.length).toBe($$('a[href^="mailto:"]').length);
    btns.forEach((b) =>
      expect(b.parentElement.querySelector(`a[href="mailto:${b.dataset.copy}"]`)).not.toBeNull()
    );
  });

  test("copies with the Clipboard API and shows a toast that fades after 2 seconds", async () => {
    jest.useFakeTimers();
    const writeText = jest.fn().mockResolvedValue();
    setClipboard({ writeText });
    loadPage();

    click($(".contact-info [data-copy]"));
    await flush();
    expect(writeText).toHaveBeenCalledWith("dandademitesh@gmail.com");
    expect($("#toast").textContent).toBe("Copied");
    expect($("#toast").classList.contains("is-shown")).toBe(true);

    jest.advanceTimersByTime(2000);
    expect($("#toast").classList.contains("is-shown")).toBe(false);
    expect($("#toast").textContent).toBe("");
  });

  test("falls back to the copy command when the Clipboard API is missing", async () => {
    document.execCommand = jest.fn(() => true);
    loadPage();
    click($(".site-footer [data-copy]"));
    await flush();
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect($("textarea[readonly]")).toBeNull();
    expect($("#toast").textContent).toBe("Copied");
  });

  test("tells the visitor when copying fails", async () => {
    loadPage();
    click($("#hero [data-copy]"));
    await flush();
    expect($("#toast").textContent).toMatch(/Couldn’t copy/);
  });

  test("works without the toast element", async () => {
    setClipboard({ writeText: jest.fn().mockResolvedValue() });
    loadPage({ mutate: (doc) => doc.getElementById("toast").remove() });
    click($("#hero [data-copy]"));
    await expect(flush()).resolves.toBeUndefined();
  });
});

describe("tool cloud", () => {
  const tool = (name) => $$(".tool").find((b) => b.firstChild.textContent === name);

  test("has one button per case-study tag, most-used first", () => {
    loadPage();
    const names = $$(".tool").map((b) => b.firstChild.textContent);
    const tags = new Set($$(".case .tags .tag").map((t) => t.textContent.trim()));
    expect(new Set(names)).toEqual(tags);
    expect(names[0]).toBe("MySQL");
    expect(tool("MySQL").dataset.weight).toBe("3");
    expect(tool("Selenium").dataset.weight).toBe("2");
    expect(tool("Playwright").dataset.weight).toBe("1");
  });

  test("choosing a tool lists the case studies that used it, as links", () => {
    loadPage();
    click(tool("Selenium"));
    expect(tool("Selenium").getAttribute("aria-pressed")).toBe("true");
    expect($("#tool-result .label").textContent).toBe("Selenium · used in 2 case studies");
    expect($$("#tool-result a").map((a) => a.getAttribute("href"))).toEqual([
      "#playwright-migration",
      "#hybrid-framework",
    ]);
    expect($("#tool-result a").textContent).toBe("01Selenium → Playwright, with an AI pair");
  });

  test("uses singular wording for a tool in one case study", () => {
    loadPage();
    click(tool("Playwright"));
    expect($("#tool-result .label").textContent).toBe("Playwright · used in 1 case study");
    expect(tool("Playwright").querySelector(".tool__count").getAttribute("aria-label")).toBe("1 project");
  });

  test("choosing another tool switches, and choosing the same tool again clears", () => {
    loadPage();
    click(tool("Selenium"));
    click(tool("MySQL"));
    expect(tool("Selenium").getAttribute("aria-pressed")).toBe("false");
    expect($$("#tool-result a")).toHaveLength(3);

    click(tool("MySQL"));
    expect(tool("MySQL").getAttribute("aria-pressed")).toBe("false");
    expect($("#tool-result").textContent).toBe("");
  });

  test("following a link to a case hidden by a portfolio filter shows all projects first", () => {
    loadPage();
    click($('.filter[data-filter="community"]'));
    expect($("#playwright-migration").hidden).toBe(true);
    click(tool("Playwright"));
    click($('#tool-result a[href="#playwright-migration"]'));
    expect($("#playwright-migration").hidden).toBe(false);
    expect($('.filter[data-filter="all"]').getAttribute("aria-pressed")).toBe("true");
  });

  test("following a link to a visible case leaves the filters alone", () => {
    loadPage();
    click($('.filter[data-filter="automation"]'));
    click(tool("Playwright"));
    click($('#tool-result a[href="#playwright-migration"]'));
    expect($('.filter[data-filter="automation"]').getAttribute("aria-pressed")).toBe("true");
  });

  test("page without the tool cloud loads without errors", () => {
    expect(() => loadPage({ mutate: (doc) => doc.getElementById("tool-cloud").remove() })).not.toThrow();
  });
});

describe("service worker", () => {
  afterEach(() => {
    delete navigator.serviceWorker;
  });

  const setServiceWorker = (register) =>
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { register } });

  test("registers sw.js once the page has loaded", () => {
    const register = jest.fn().mockResolvedValue({});
    setServiceWorker(register);
    loadPage();
    expect(register).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    expect(register).toHaveBeenCalledWith("sw.js");
  });

  test("a failed registration is ignored", async () => {
    setServiceWorker(jest.fn().mockRejectedValue(new Error("blocked")));
    loadPage();
    window.dispatchEvent(new Event("load"));
    await expect(Promise.resolve()).resolves.toBeUndefined();
  });

  test("browsers without service workers load normally", () => {
    expect(() => loadPage()).not.toThrow();
  });
});
