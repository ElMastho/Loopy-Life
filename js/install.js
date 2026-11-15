/* Loopy Life · Install as an app
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Install as an app (works offline through sw.js)                    */
/* ------------------------------------------------------------------ */
let installEvent = null;
function initInstall() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    $("#install-btn").hidden = false;
  });
  window.addEventListener("appinstalled", () => { $("#install-btn").hidden = true; toast(t("installed"), 3200); });
  $("#install-btn").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try { await installEvent.userChoice; } catch (e) { /* ignore */ }
    installEvent = null;
    $("#install-btn").hidden = true;
  });
}
