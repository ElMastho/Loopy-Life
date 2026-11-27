/* Loopy Life · Version and updates
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Version and updates                                                */
/* ------------------------------------------------------------------ */
// The version on the server, read past every cache; null when offline.
async function latestVersion() {
  try {
    const res = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const v = String((await res.json()).version || "");
    return /^\d+\.\d+\.\d+$/.test(v) ? v : null;
  } catch (e) { return null; }
}

// Compares two versions like "1.2.0" part by part: > 0 when a is newer than b.
function compareVersions(a, b) {
  const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
}

// Drops the service worker and its caches, then reloads from the network. Stories (IndexedDB) and the current game stay.
async function forceUpdate() {
  try { if (state) save(); } catch (e) { /* ignore */ }
  try {
    if ("serviceWorker" in navigator) await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister()));
    if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  } catch (e) { /* ignore */ }
  location.replace(`${location.pathname}?u=${Date.now()}`);
}

// Updates through the service worker: it downloads the whole new version first (so the game keeps
// working offline), then the page reloads on it. Falls back to forceUpdate if that takes too long.
async function applyUpdate() {
  try { if (state) save(); } catch (e) { /* ignore */ }
  const sw = "serviceWorker" in navigator && location.protocol !== "file:" ? navigator.serviceWorker : null;
  const reg = sw && (await sw.getRegistration().catch(() => null));
  if (!reg) return forceUpdate();
  $("#update-now").disabled = true;
  toast(t("updDownloading"), 4000);
  const switched = new Promise((resolve) => sw.addEventListener("controllerchange", () => resolve(true), { once: true }));
  try { await reg.update(); } catch (e) { return forceUpdate(); }
  if (!reg.installing && !reg.waiting) return forceUpdate(); // nothing new found by the service worker
  const done = await Promise.race([switched, new Promise((r) => setTimeout(() => r(false), 30000))]);
  if (done) location.reload(); else forceUpdate();
}

/* ------------------------------------------------------------------ */
/* Offline                                                            */
/* ------------------------------------------------------------------ */
const OFFLINE_TOAST_KEY = "loopy-offline-told";
let offline = null; // last answer of the service worker: { cache, saved, total }, or null

// Asks the service worker how many of the game's files are saved on this device (it saves the missing ones).
async function offlineStatus() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return null;
  try {
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 30000))]);
    if (!reg || !reg.active) return null;
    return await new Promise((resolve) => {
      const ch = new MessageChannel();
      const timer = setTimeout(() => resolve(null), 60000);
      ch.port1.onmessage = (e) => { clearTimeout(timer); resolve(e.data || null); };
      reg.active.postMessage({ type: "offline-status" }, [ch.port2]);
    });
  } catch (e) { return null; }
}

function offlineReady() {
  return !!offline && offline.total > 0 && offline.saved === offline.total && offline.cache === `loopy-life-v${APP_VERSION}`;
}

function offlineText() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return t("offNone");
  if (offlineReady()) return t("offReady", { n: offline.total });
  if (offline && offline.cache === `loopy-life-v${APP_VERSION}`) return t("offSaving", { n: offline.saved, total: offline.total });
  return t("offWaiting");
}

// Shows ✈️ in the footer once every file is saved, and says it once per device.
async function checkOffline() {
  offline = await offlineStatus();
  const ready = offlineReady();
  $("#offline-badge").hidden = !ready;
  if (!$("#update-overlay").classList.contains("hidden")) $("#upd-offline").textContent = offlineText();
  if (!ready) return;
  // asks the browser not to clear the saved files when the device runs short of space
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* ignore */ }
  let told = false;
  try { told = !!localStorage.getItem(OFFLINE_TOAST_KEY); localStorage.setItem(OFFLINE_TOAST_KEY, "1"); } catch (e) { /* ignore */ }
  if (!told) toast(t("offToast"), 4200);
}

function initOffline() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.addEventListener("controllerchange", () => setTimeout(checkOffline, 500));
  window.addEventListener("load", () => setTimeout(checkOffline, 1200));
  window.addEventListener("online", () => { if (!offlineReady()) checkOffline(); });
}

async function openUpdate() {
  $("#upd-installed").textContent = t("updInstalled", { v: APP_VERSION });
  $("#upd-status").textContent = t("updChecking");
  $("#upd-offline").textContent = offlineText();
  $("#update-overlay").classList.remove("hidden");
  checkOffline();
  const v = await latestVersion();
  $("#upd-status").textContent = v == null ? t("updOffline") : compareVersions(v, APP_VERSION) > 0 ? t("updNew", { v }) : t("updLatest");
}

async function checkForUpdate() {
  const v = await latestVersion();
  if (v && compareVersions(v, APP_VERSION) > 0) $("#update-banner").hidden = false;
}
