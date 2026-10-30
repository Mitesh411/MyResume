const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX_HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/** Parse index.html into a standalone Document (scripts are not executed). */
function parseIndex() {
  return new DOMParser().parseFromString(INDEX_HTML, "text/html");
}

/* main.js adds listeners to window and document, which outlive a test's DOM.
   Record them so each loadPage() starts as clean as a real page load. */
const registered = [];
for (const target of [window, document]) {
  const add = target.addEventListener.bind(target);
  target.addEventListener = (type, fn, options) => {
    registered.push([target, type, fn, options]);
    add(type, fn, options);
  };
}

function removePageListeners() {
  while (registered.length) {
    const [target, type, fn, options] = registered.pop();
    target.removeEventListener(type, fn, options);
  }
}

/**
 * Load index.html into the test document, apply optional DOM changes, set up
 * browser APIs jsdom lacks, then run assets/js/main.js fresh.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.reduceMotion=false]  value of prefers-reduced-motion
 * @param {boolean} [opts.intersectionObserver=false]  install a mock IntersectionObserver
 * @param {boolean} [opts.typed=true]  provide a window.Typed mock
 * @param {boolean} [opts.aos=true]  provide a window.AOS mock
 * @param {(doc: Document) => void} [opts.mutate]  edit the DOM before main.js runs
 * @returns {{ Typed?: jest.Mock, AOS?: {init: jest.Mock}, observers: object[] }}
 */
function loadPage(opts = {}) {
  const {
    reduceMotion = false,
    intersectionObserver = false,
    typed = true,
    aos = true,
    mutate,
  } = opts;

  removePageListeners();
  const parsed = parseIndex();
  document.documentElement.innerHTML = parsed.documentElement.innerHTML;
  for (const { name, value } of parsed.documentElement.attributes) {
    document.documentElement.setAttribute(name, value);
  }
  document.body.className = "";
  if (mutate) mutate(document);

  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
  }));
  window.scrollTo = jest.fn();

  const observers = [];
  if (intersectionObserver) {
    window.IntersectionObserver = class {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observe = jest.fn();
        this.unobserve = jest.fn();
        observers.push(this);
      }
    };
  } else {
    delete window.IntersectionObserver;
  }

  const mocks = { observers };
  if (typed) {
    mocks.Typed = jest.fn();
    window.Typed = mocks.Typed;
  } else {
    delete window.Typed;
  }
  if (aos) {
    mocks.AOS = { init: jest.fn() };
    window.AOS = mocks.AOS;
  } else {
    delete window.AOS;
  }

  jest.isolateModules(() => {
    require("../assets/js/main.js");
  });
  return mocks;
}

/** Give an element layout values jsdom does not compute. */
function setBox(el, top, height) {
  Object.defineProperty(el, "offsetTop", { configurable: true, value: top });
  Object.defineProperty(el, "offsetHeight", { configurable: true, value: height });
}

function setScrollY(y) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
}

module.exports = { ROOT, INDEX_HTML, parseIndex, loadPage, setBox, setScrollY };
