/* Loopy Life · Languages: the current language and the translation helpers
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Languages                                                          */
/* ------------------------------------------------------------------ */
const LANG_KEY = "loopy-lang";
const STR = {}; // filled by js/i18n/en.js and js/i18n/fr.js

let LANG = (() => {
  try { const v = localStorage.getItem(LANG_KEY); if (v === "en" || v === "fr") return v; } catch (e) { /* ignore */ }
  return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
})();

function t(key, vars = {}) {
  const str = STR[LANG][key] ?? STR.en[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
const tr = (v) => (v && typeof v === "object" ? v[LANG] ?? v.en : v); // bilingual field -> current language
const sName = (s) => tr(s.name);
const sShort = (s) => tr(s.short) || sName(s);
// "{name}" in a question is the person in the spotlight (the 🎂 game).
const qText = (q) => {
  const s = tr(q.text);
  if (!s.includes("{name}")) return s;
  const star = state && gameOf(state) === "honor" ? state.players[state.star] : "";
  return s.split("{name}").join(star || t("theStar"));
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
