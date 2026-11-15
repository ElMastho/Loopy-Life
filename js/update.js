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

async function openUpdate() {
  $("#upd-installed").textContent = t("updInstalled", { v: APP_VERSION });
  $("#upd-status").textContent = t("updChecking");
  $("#ratings-count").textContent = ratingsSummary();
  $("#ratings-export").hidden = !Object.keys(ratings()).length;
  $("#update-overlay").classList.remove("hidden");
  const v = await latestVersion();
  $("#upd-status").textContent = v == null ? t("updOffline") : compareVersions(v, APP_VERSION) > 0 ? t("updNew", { v }) : t("updLatest");
}

async function checkForUpdate() {
  const v = await latestVersion();
  if (v && compareVersions(v, APP_VERSION) > 0) $("#update-banner").hidden = false;
}
