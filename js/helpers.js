/* Loopy Life · Small helpers shared by every part
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
// Uniform random index; uses the crypto generator when available.
function randInt(n) {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % n;
  } catch (e) {
    return Math.floor(Math.random() * n);
  }
}
const pick = (arr) => arr[randInt(arr.length)];

// Questions already asked on this device, in any story. New draws prefer the others.
const SEEN_KEY = "loopy-seen-v1";
function seenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch (e) { return new Set(); }
}
function markSeen(ids) {
  const seen = seenSet();
  ids.forEach((id) => seen.add(id));
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch (e) { /* ignore */ }
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const others = (p) => state.players.map((_, i) => i).filter((i) => i !== p);
// one colour per player (bright for the night background, dark for the light question card)
const PLAYER_COLORS = ["#ff7eb6", "#6ee7ff", "#ffd166", "#7ef0a8", "#b388ff", "#ff9f68", "#c4f135", "#ff6b6b", "#93a5ff", "#e7c6a1"];
const PLAYER_DARK = ["#d63384", "#0b8bb0", "#b7791f", "#2f855a", "#6b46c1", "#c05621", "#5f7a0a", "#c53030", "#3b4fd1", "#8a5a2b"];
const pHex = (p) => PLAYER_COLORS[p % PLAYER_COLORS.length];
const pDark = (p) => PLAYER_DARK[p % PLAYER_DARK.length];
const nPlayers = () => state.players.length;
const levelSize = () => (LEVEL_UP / 2) * Math.max(2, nPlayers()); // bigger groups score faster, so levels are bigger
const joinNames = (names) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`);

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toast(msg, ms = 2400) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), ms);
}

function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function counts(subjectId) {
  if (!state.tree[subjectId]) state.tree[subjectId] = { 1: 0, 2: 0, 3: 0 };
  return state.tree[subjectId];
}

function treeLevel(subjectId) {
  const c = counts(subjectId);
  if (c[1] < 2) return 1;
  if (c[2] < 2) return 2;
  return 3;
}
