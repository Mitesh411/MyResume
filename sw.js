/* Mitesh Dandade — Portfolio: service worker for offline viewing.
   - Pages: network first, so visitors online always get the latest copy;
     offline, the cached page (or the home page) is served instead.
   - Same-origin files and Google Fonts: served from the cache straight away
     and refreshed in the background (stale-while-revalidate).
   VERSION must match the ?v= query in index.html; bumping it installs a
   fresh cache and deletes the old one. */
const VERSION = "20261031";
const CACHE = `md-${VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  "404.html",
  "manifest.webmanifest",
  `assets/css/styles.css?v=${VERSION}`,
  `assets/css/hero.css?v=${VERSION}`,
  `assets/js/main.js?v=${VERSION}`,
  "assets/vendor/aos/aos.css",
  "assets/vendor/aos/aos.js",
  "assets/vendor/typed.js/typed.min.js",
  "assets/img/hero-bg.jpg",
  "assets/img/favicon.svg",
  "assets/img/icons/icon-192.png",
  "assets/img/badges/istqb-ctfl.avif",
  "assets/img/badges/aws-certified-cloud-practitioner.png",
  "assets/img/badges/microsoft-azure-fundamentals.png",
];

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith("md-") && k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./")))
    );
    return;
  }

  if (url.origin !== self.location.origin && !FONT_HOSTS.includes(url.hostname)) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            // Font files are cross-origin, so their responses can be opaque.
            if (response.ok || response.type === "opaque") cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
