/* Loopy Life · Playing on any device: quick start, text size, full screen, keyboard, tablet
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Quick start: the wheel with every subject, straight from step 1     */
/* ------------------------------------------------------------------ */
const PLAYED_KEY = "loopy-played";

function quickStart() {
  readPlayerInputs();
  setupGame = "wheel";
  renderChosenGame();
  const subjects = selectedSubjects();
  const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
  newGame(names, subjects.length ? subjects : DB.subjects.map((s) => s.id), setupDepth, "wheel");
}

// The first time, the quick start is the one to try.
function markPlayed() {
  try { localStorage.setItem(PLAYED_KEY, "1"); } catch (e) { /* ignore */ }
  $("#quick-hint").hidden = true;
  $("#quick-btn").classList.remove("first");
}

function initQuickStart() {
  let played = false;
  try { played = !!localStorage.getItem(PLAYED_KEY); } catch (e) { /* ignore */ }
  $("#quick-hint").hidden = played;
  $("#quick-btn").classList.toggle("first", !played);
  $("#quick-btn").addEventListener("click", quickStart);
}

/* ------------------------------------------------------------------ */
/* Text size, for a tablet in the middle of the table or a shared screen */
/* ------------------------------------------------------------------ */
const TEXT_MIN = 80, TEXT_MAX = 200;
const TEXT_KEY = "loopy-text-size";
let textSize = 100;

function applyTextSize() {
  document.documentElement.style.fontSize = textSize === 100 ? "" : `${textSize}%`;
  $$(".text-size-val").forEach((el) => (el.textContent = `${textSize} %`));
  $("#size-val").textContent = `${textSize} %`;
  $("#size-range").value = textSize;
  $$("#size-presets button").forEach((b) => b.classList.toggle("on", Number(b.dataset.size) === textSize));
}

function setTextSize(n) {
  textSize = Math.min(TEXT_MAX, Math.max(TEXT_MIN, Math.round(n)));
  try { localStorage.setItem(TEXT_KEY, String(textSize)); } catch (e) { /* ignore */ }
  applyTextSize();
}

// 🔠 opens a bar at the bottom: a slider and a few sizes, 100 % always one tap away.
function openSizeBar() {
  const bar = $("#size-bar");
  bar.hidden = false;
  void bar.offsetWidth;
  bar.classList.add("open");
}

function closeSizeBar() {
  const bar = $("#size-bar");
  bar.classList.remove("open");
  setTimeout(() => { if (!bar.classList.contains("open")) bar.hidden = true; }, 260);
}

/* ------------------------------------------------------------------ */
/* Full screen, and turning the card for the person across the table   */
/* ------------------------------------------------------------------ */
function toggleFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } catch (e) { /* ignore */ }
}

function flipCard() {
  $("#card").classList.toggle("flipped");
}

/* ------------------------------------------------------------------ */
/* Keyboard, for a computer (screen shared on Discord or in a video call) */
/* ------------------------------------------------------------------ */
const isVisible = (el) => !!el && !el.hidden && !el.disabled && el.offsetParent !== null;
const press = (sel) => { const el = $(sel); if (isVisible(el)) { el.click(); return true; } return false; };

function gameKeys(e) {
  if (!state || !$("#screen-game").classList.contains("active") || gameOf(state) === "team") return; // the icebreaker has its own keys
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target.closest && e.target.closest("input, textarea, select");
  const k = e.key.toLowerCase();
  const others = $$(".overlay:not(.hidden)").filter((o) => o.id !== "card-overlay");
  if (others.length) return;
  // a focused button that is still on screen keeps its usual Space and Enter
  const onButton = e.target.closest && e.target.closest("button") && isVisible(e.target.closest("button"));
  if (current) {
    if (k === "enter" && !e.shiftKey && (!onButton || typing)) { e.preventDefault(); press("#done-btn"); return; }
    if (typing) return;
    if (k === "p") press("#skip-btn");
    else if (k === "r") press("#speak-btn");
    else if (k === "v") flipCard();
    else if (k === "f") toggleFullscreen();
    return;
  }
  if (typing) return;
  if ((k === " " || k === "enter") && !onButton) {
    e.preventDefault();
    if (state.mode === "wheel") press("#spin-btn");
    else if (state.mode === "tree") press("#tree-surprise");
    else if (state.mode === "speed") press("#speed-go");
  } else if (k === "f") toggleFullscreen();
  else if (k === "j") press("#journal-btn");
}

function initDevices() {
  initQuickStart();
  try { const v = Number(localStorage.getItem(TEXT_KEY)); if (v >= TEXT_MIN && v <= TEXT_MAX) textSize = v; } catch (e) { /* ignore */ }
  applyTextSize();
  $$(".text-size-btn").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); $("#size-bar").classList.contains("open") ? closeSizeBar() : openSizeBar(); }));
  $("#size-range").addEventListener("input", (e) => setTextSize(Number(e.target.value)));
  $$("#size-presets button").forEach((b) => b.addEventListener("click", () => setTextSize(Number(b.dataset.size))));
  $("#size-close").addEventListener("click", closeSizeBar);
  document.addEventListener("click", (e) => { if ($("#size-bar").classList.contains("open") && !e.target.closest("#size-bar")) closeSizeBar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#size-bar").classList.contains("open")) closeSizeBar(); });
  $("#full-btn").hidden = !document.documentElement.requestFullscreen;
  $("#full-btn").addEventListener("click", toggleFullscreen);
  $("#flip-btn").addEventListener("click", flipCard);
  document.addEventListener("keydown", gameKeys);
}
