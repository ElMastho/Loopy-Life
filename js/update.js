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
    return Number((await res.json()).version) || null;
  } catch (e) { return null; }
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
  $("#update-overlay").classList.remove("hidden");
  const v = await latestVersion();
  $("#upd-status").textContent = v == null ? t("updOffline") : v > APP_VERSION ? t("updNew", { v }) : t("updLatest");
}

async function checkForUpdate() {
  const v = await latestVersion();
  if (v && v > APP_VERSION) $("#update-banner").hidden = false;
}
