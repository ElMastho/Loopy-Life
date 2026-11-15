// Offline support: always try the network first (so updates show up at once),
// and fall back to the last copy saved here when there is no connection.
const CACHE = "loopy-life-v19";
const CORE = ["./", "index.html", "style.css?v=18", "app.js?v=18", "data/questions.json?v=18", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  // the page itself is always revalidated, so a new version shows up on the next opening
  const fresh = sameOrigin && (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/"));
  e.respondWith(
    (fresh ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" }) : fetch(req)) // a navigate request cannot take options
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
