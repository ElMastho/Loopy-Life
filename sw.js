// Offline support: always try the network first (so updates show up at once),
// and fall back to the last copy saved here when there is no connection.
const CACHE = "loopy-life-v27";
const CORE = [
  "./",
  "index.html",
  "style.css?v=27",
  "js/config.js?v=27",
  "js/i18n.js?v=27",
  "js/i18n/en.js?v=27",
  "js/i18n/fr.js?v=27",
  "js/state.js?v=27",
  "js/helpers.js?v=27",
  "js/storage.js?v=27",
  "js/fx.js?v=27",
  "js/setup.js?v=27",
  "js/game.js?v=27",
  "js/card.js?v=27",
  "js/turns.js?v=27",
  "js/speed.js?v=27",
  "js/wheel.js?v=27",
  "js/tree.js?v=27",
  "js/journal.js?v=27",
  "js/stories.js?v=27",
  "js/badges.js?v=27",
  "js/share.js?v=27",
  "js/install.js?v=27",
  "js/rules.js?v=27",
  "js/update.js?v=27",
  "js/main.js?v=27",
  "data/subjects.json?v=27",
  "data/questions/family.json?v=27",
  "data/questions/childhood.json?v=27",
  "data/questions/youth.json?v=27",
  "data/questions/love.json?v=27",
  "data/questions/friendship.json?v=27",
  "data/questions/work.json?v=27",
  "data/questions/dreams.json?v=27",
  "data/questions/values.json?v=27",
  "data/questions/personality.json?v=27",
  "data/questions/passions.json?v=27",
  "data/questions/tastes.json?v=27",
  "data/questions/travel.json?v=27",
  "data/questions/daily.json?v=27",
  "data/questions/whatif.json?v=27",
  "data/questions/imagination.json?v=27",
  "data/questions/fantasy.json?v=27",
  "data/questions/nature.json?v=27",
  "data/questions/humor.json?v=27",
  "data/questions/future.json?v=27",
  "data/pools/who.json?v=27",
  "data/pools/challenges.json?v=27",
  "data/pools/date.json?v=27",
  "data/pools/couple.json?v=27",
  "data/pools/spicy.json?v=27",
  "data/pools/speed.json?v=27",
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
