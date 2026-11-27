// Offline support: every file the game needs (page, styles, scripts, fonts, icons and every
// question file, even the ones behind an option) is downloaded once, when this service worker
// installs, into a cache named after the version. After that the game opens without internet.
// - The page: network first, but never more than NET_WAIT ms, then the saved copy
//   (so a weak signal does not leave a blank screen, and a new version still shows up at once).
// - Everything else: the saved copy first (each file has ?v=<version>, so a new version means new
//   addresses), the network only for a file that is not saved.
// - version.json: always the network (it is how the game learns that a new version exists).
// tools/release.py sets CACHE and CORE.
const CACHE = "loopy-life-v1.8.0";
const CORE = [
  "./",
  "index.html",
  "style.css?v=1.8.0",
  "js/config.js?v=1.8.0",
  "js/i18n.js?v=1.8.0",
  "js/i18n/en.js?v=1.8.0",
  "js/i18n/fr.js?v=1.8.0",
  "js/state.js?v=1.8.0",
  "js/helpers.js?v=1.8.0",
  "js/storage.js?v=1.8.0",
  "js/fx.js?v=1.8.0",
  "js/setup.js?v=1.8.0",
  "js/game.js?v=1.8.0",
  "js/card.js?v=1.8.0",
  "js/turns.js?v=1.8.0",
  "js/speed.js?v=1.8.0",
  "js/team.js?v=1.8.0",
  "js/wheel.js?v=1.8.0",
  "js/tree.js?v=1.8.0",
  "js/journal.js?v=1.8.0",
  "js/stories.js?v=1.8.0",
  "js/badges.js?v=1.8.0",
  "js/share.js?v=1.8.0",
  "js/install.js?v=1.8.0",
  "js/rules.js?v=1.8.0",
  "js/update.js?v=1.8.0",
  "js/devices.js?v=1.8.0",
  "js/main.js?v=1.8.0",
  "data/subjects.json?v=1.8.0",
  "data/questions/family.json?v=1.8.0",
  "data/questions/childhood.json?v=1.8.0",
  "data/questions/youth.json?v=1.8.0",
  "data/questions/love.json?v=1.8.0",
  "data/questions/friendship.json?v=1.8.0",
  "data/questions/work.json?v=1.8.0",
  "data/questions/dreams.json?v=1.8.0",
  "data/questions/values.json?v=1.8.0",
  "data/questions/personality.json?v=1.8.0",
  "data/questions/passions.json?v=1.8.0",
  "data/questions/tastes.json?v=1.8.0",
  "data/questions/travel.json?v=1.8.0",
  "data/questions/daily.json?v=1.8.0",
  "data/questions/whatif.json?v=1.8.0",
  "data/questions/imagination.json?v=1.8.0",
  "data/questions/fantasy.json?v=1.8.0",
  "data/questions/nature.json?v=1.8.0",
  "data/questions/humor.json?v=1.8.0",
  "data/questions/future.json?v=1.8.0",
  "data/questions/popculture.json?v=1.8.0",
  "data/questions/sport.json?v=1.8.0",
  "data/questions/money.json?v=1.8.0",
  "data/questions/senses.json?v=1.8.0",
  "data/questions/meaning.json?v=1.8.0",
  "data/pools/who.json?v=1.8.0",
  "data/pools/challenges.json?v=1.8.0",
  "data/pools/date.json?v=1.8.0",
  "data/pools/couple.json?v=1.8.0",
  "data/pools/spicy.json?v=1.8.0",
  "data/pools/speed.json?v=1.8.0",
  "data/pools/work.json?v=1.8.0",
  "data/pools/honor.json?v=1.8.0",
  "data/pools/debate.json?v=1.8.0",
  "data/pools/society.json?v=1.8.0",
  "data/pools/politics.json?v=1.8.0",
  "data/pools/parents.json?v=1.8.0",
  "fonts/fredoka-latin-ext.woff2",
  "fonts/fredoka-latin.woff2",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

const NET_WAIT = 3500;
const PAGE = "./"; // the page is saved under this one key, whatever its address (?u=, #...)

// Downloads one file past the browser's own cache, so the saved copy is the one on the server.
async function download(cache, path) {
  const res = await fetch(new Request(path, { cache: "reload", credentials: "same-origin" }));
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  await cache.put(path, res);
}

// Saves every file that is not saved yet; returns how many are saved.
async function fill() {
  const cache = await caches.open(CACHE);
  const missing = [];
  for (const path of CORE) if (!(await cache.match(path))) missing.push(path);
  await Promise.all(missing.map((p) => download(cache, p).catch(() => {})));
  let saved = 0;
  for (const path of CORE) if (await cache.match(path)) saved++;
  return saved;
}

self.addEventListener("install", (e) => {
  // all or nothing: if one file fails, this version is not installed and the previous one keeps working offline
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((p) => download(c, p)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("loopy-life-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks whether the game is ready offline: { type: "offline-status" } -> { version, saved, total }.
self.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "offline-status" || !e.ports[0]) return;
  e.waitUntil(fill().then(
    (saved) => e.ports[0].postMessage({ cache: CACHE, saved, total: CORE.length }),
    () => e.ports[0].postMessage({ cache: CACHE, saved: 0, total: CORE.length })
  ));
});

// The network, but giving up after ms (a weak signal can keep a request hanging for a minute).
function netWithin(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(req).then((res) => { clearTimeout(timer); resolve(res); }, (err) => { clearTimeout(timer); reject(err); });
  });
}

async function fromCache(req, ignoreSearch) {
  const cache = await caches.open(CACHE);
  return (await cache.match(req, { ignoreSearch })) || (ignoreSearch ? caches.match(req, { ignoreSearch: true }) : undefined);
}

async function page(req) {
  try {
    const res = await netWithin(new Request(req.url, { cache: "no-cache", credentials: "same-origin" }), NET_WAIT); // a navigate request cannot take options
    if (res.ok) return res;
  } catch (e) { /* offline or too slow */ }
  return (await fromCache(PAGE)) || (await fromCache("index.html")) || Response.error();
}

async function asset(req) {
  const hit = await fromCache(req, false);
  if (hit) return hit;
  try {
    const res = await netWithin(req, 15000);
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  } catch (e) {
    // offline and not saved under this exact address: any saved copy of the file is better than nothing
    return (await fromCache(req, true)) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/version.json")) return; // always the network
  const isPage = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  e.respondWith(isPage ? page(req) : asset(req));
});
