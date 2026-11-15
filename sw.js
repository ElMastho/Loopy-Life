// Offline support: always try the network first (so updates show up at once),
// and fall back to the last copy saved here when there is no connection.
const CACHE = "loopy-life-v1.1.2";
const CORE = [
  "./",
  "index.html",
  "style.css?v=1.1.2",
  "js/config.js?v=1.1.2",
  "js/i18n.js?v=1.1.2",
  "js/i18n/en.js?v=1.1.2",
  "js/i18n/fr.js?v=1.1.2",
  "js/state.js?v=1.1.2",
  "js/helpers.js?v=1.1.2",
  "js/storage.js?v=1.1.2",
  "js/fx.js?v=1.1.2",
  "js/setup.js?v=1.1.2",
  "js/game.js?v=1.1.2",
  "js/card.js?v=1.1.2",
  "js/turns.js?v=1.1.2",
  "js/speed.js?v=1.1.2",
  "js/team.js?v=1.1.2",
  "js/wheel.js?v=1.1.2",
  "js/tree.js?v=1.1.2",
  "js/journal.js?v=1.1.2",
  "js/stories.js?v=1.1.2",
  "js/badges.js?v=1.1.2",
  "js/share.js?v=1.1.2",
  "js/install.js?v=1.1.2",
  "js/rules.js?v=1.1.2",
  "js/update.js?v=1.1.2",
  "js/main.js?v=1.1.2",
  "data/subjects.json?v=1.1.2",
  "data/questions/family.json?v=1.1.2",
  "data/questions/childhood.json?v=1.1.2",
  "data/questions/youth.json?v=1.1.2",
  "data/questions/love.json?v=1.1.2",
  "data/questions/friendship.json?v=1.1.2",
  "data/questions/work.json?v=1.1.2",
  "data/questions/dreams.json?v=1.1.2",
  "data/questions/values.json?v=1.1.2",
  "data/questions/personality.json?v=1.1.2",
  "data/questions/passions.json?v=1.1.2",
  "data/questions/tastes.json?v=1.1.2",
  "data/questions/travel.json?v=1.1.2",
  "data/questions/daily.json?v=1.1.2",
  "data/questions/whatif.json?v=1.1.2",
  "data/questions/imagination.json?v=1.1.2",
  "data/questions/fantasy.json?v=1.1.2",
  "data/questions/nature.json?v=1.1.2",
  "data/questions/humor.json?v=1.1.2",
  "data/questions/future.json?v=1.1.2",
  "data/pools/who.json?v=1.1.2",
  "data/pools/challenges.json?v=1.1.2",
  "data/pools/date.json?v=1.1.2",
  "data/pools/couple.json?v=1.1.2",
  "data/pools/spicy.json?v=1.1.2",
  "data/pools/speed.json?v=1.1.2",
  "data/pools/work.json?v=1.1.2",
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
