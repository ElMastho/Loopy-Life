// Offline support: always try the network first (so updates show up at once),
// and fall back to the last copy saved here when there is no connection.
const CACHE = "loopy-life-v25";
const CORE = [
  "./",
  "index.html",
  "style.css?v=25",
  "js/config.js?v=25",
  "js/i18n.js?v=25",
  "js/i18n/en.js?v=25",
  "js/i18n/fr.js?v=25",
  "js/state.js?v=25",
  "js/helpers.js?v=25",
  "js/storage.js?v=25",
  "js/fx.js?v=25",
  "js/setup.js?v=25",
  "js/game.js?v=25",
  "js/card.js?v=25",
  "js/turns.js?v=25",
  "js/speed.js?v=25",
  "js/wheel.js?v=25",
  "js/tree.js?v=25",
  "js/journal.js?v=25",
  "js/stories.js?v=25",
  "js/badges.js?v=25",
  "js/share.js?v=25",
  "js/install.js?v=25",
  "js/rules.js?v=25",
  "js/update.js?v=25",
  "js/main.js?v=25",
  "data/subjects.json?v=25",
  "data/questions/family.json?v=25",
  "data/questions/childhood.json?v=25",
  "data/questions/youth.json?v=25",
  "data/questions/love.json?v=25",
  "data/questions/friendship.json?v=25",
  "data/questions/work.json?v=25",
  "data/questions/dreams.json?v=25",
  "data/questions/values.json?v=25",
  "data/questions/personality.json?v=25",
  "data/questions/passions.json?v=25",
  "data/questions/tastes.json?v=25",
  "data/questions/travel.json?v=25",
  "data/questions/daily.json?v=25",
  "data/questions/whatif.json?v=25",
  "data/questions/imagination.json?v=25",
  "data/pools/who.json?v=25",
  "data/pools/challenges.json?v=25",
  "data/pools/date.json?v=25",
  "data/pools/couple.json?v=25",
  "data/pools/spicy.json?v=25",
  "data/pools/speed.json?v=25",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

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
