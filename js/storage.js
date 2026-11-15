/* Loopy Life · Saving: the current game (localStorage) and every story (IndexedDB)
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Storage (best effort)                                              */
/* ------------------------------------------------------------------ */
function save() {
  if (!state) return;
  if (!state.id) state.id = newId();
  state.updatedAt = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  clearTimeout(save.timer);
  const snap = state;
  save.timer = setTimeout(() => keepStory(snap), 300);
}
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Every story with at least one answer (or a name) is kept in IndexedDB, in this browser.
const IDB_NAME = "loopy-life", IDB_STORE = "stories";
let idbP = null;
function idb() {
  if (!idbP) {
    idbP = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("no indexedDB"));
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    idbP.catch(() => {});
  }
  return idbP;
}
function idbDo(mode, fn) {
  return idb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, mode);
    const out = fn(tx.objectStore(IDB_STORE));
    tx.oncomplete = () => resolve(out && "result" in out ? out.result : undefined);
    tx.onerror = () => reject(tx.error);
  }));
}
let persistAsked = false;
function keepStory(st) {
  if (!st || !st.id || (!(st.journal || []).length && !st.name)) return Promise.resolve();
  if (!persistAsked && navigator.storage && navigator.storage.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
  return idbDo("readwrite", (os) => os.put(JSON.parse(JSON.stringify(st)))).catch(() => {});
}
const allStories = () => idbDo("readonly", (os) => os.getAll()).then((l) => l || []).catch(() => null);
const dropStory = (id) => idbDo("readwrite", (os) => os.delete(id)).catch(() => {});
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
