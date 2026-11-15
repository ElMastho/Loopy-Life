/* Loopy Life · A story: new game, scores, drawing questions
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Game state                                                         */
/* ------------------------------------------------------------------ */
function newGame(players, subjects, depth, game) {
  const mode = game === "tree" ? "tree" : game === "speed" ? "speed" : "wheel";
  state = {
    version: 1,
    id: newId(),
    name: storyName(),
    players,
    scores: players.map(() => 0),
    passes: players.map(() => PASSES),
    turn: Math.floor(Math.random() * players.length),
    subjects,
    depth,
    mode,
    game,
    guessMode: setupGuessMode && !FUN_GAMES.includes(game) && game !== "speed",
    timer: game === "speed" ? setupTimer : 0,
    streak: 0,
    bestStreak: 0,
    whoMode: !DUO_GAMES.includes(game) && game !== "car" && game !== "speed" && players.length > 2 && $("#who-mode").checked,
    dareMode: game !== "car" && game !== "speed" && $("#dare-mode").checked,
    randomTurn: !DUO_GAMES.includes(game) && $("#random-turn").checked,
    adult: DUO_GAMES.includes(game) && $("#adult-mode").checked,
    driver: game === "car" ? setupDriver : -1,
    voice: $("#voice-mode").checked && "speechSynthesis" in window,
    badges: [],
    used: [],
    journal: [],
    tree: {},
    connection: 0,
    startedAt: Date.now(),
  };
  lastTreeCounts = {};
  $("#story-name").value = ""; // the next game starts a new story
  save();
  startGame();
  setTimeout(() => toast(t("starts", { name: state.players[state.turn] })), 500);
}

// "“Our first summer” · 🥂 First date · 🔥 +18": the story's name, then the game when it has its own name.
function gameTitle() {
  const g = gameOf(state);
  const parts = [];
  if (state.name) parts.push(`📖 ${state.name}`);
  if (g !== "wheel" && g !== "tree") parts.push(`${GAME_EMOJI[g]} ${t("g_" + g)}${state.adult ? " · 🔥 +18" : ""}`);
  return parts.join(" · ");
}

function startGame() {
  state.active = true; // reopening or reloading the page comes back to this game
  save();
  const g = gameOf(state);
  const named = g !== "wheel" && g !== "tree";
  $("#mode-switch").hidden = named;
  $("#game-name").textContent = gameTitle();
  renderScoreboard();
  showScreen("screen-game");
  updateScores(false);
  setMode(state.mode);
}

function setMode(mode) {
  state.mode = mode;
  save();
  $$("[data-switch]").forEach((b) => b.classList.toggle("on", b.dataset.switch === mode));
  $("#view-wheel").classList.toggle("active", mode === "wheel");
  $("#view-tree").classList.toggle("active", mode === "tree");
  $("#view-speed").classList.toggle("active", mode === "speed");
  if (mode === "speed") renderSpeedView();
  renderTree();
  if (mode === "wheel") drawWheel();
}

function renderScoreboard() {
  const board = $("#scoreboard");
  board.innerHTML = "";
  board.classList.toggle("compact", nPlayers() >= COMPACT_FROM);
  board.classList.toggle("no-pts", !competitive());
  state.players.forEach((name, i) => {
    const el = document.createElement("div");
    el.className = "score";
    el.id = `score-${i}`;
    el.style.setProperty("--pc", pHex(i));
    el.innerHTML = `<span class="who">${esc(name)}</span><span class="pts">0</span>`;
    board.appendChild(el);
  });
}

function updateScores(animate = true, changed = []) {
  state.players.forEach((_, i) => {
    const el = $(`#score-${i}`);
    if (!el) return;
    el.querySelector(".pts").textContent = state.scores[i];
    el.classList.toggle("active", state.turn === i);
    if (state.turn === i && nPlayers() >= COMPACT_FROM && el.scrollIntoView) {
      try { el.scrollIntoView({ block: "nearest", inline: "center", behavior: animate ? "smooth" : "auto" }); } catch (e) { /* ignore */ }
    }
    if (animate && changed.includes(i)) {
      const pts = el.querySelector(".pts");
      pts.classList.remove("bump"); void pts.offsetWidth; pts.classList.add("bump");
    }
  });
  const size = levelSize();
  const lvl = Math.floor(state.connection / size) + 1;
  $("#conn-level").textContent = t("lv", { n: lvl });
  $("#conn-fill").style.width = `${((state.connection % size) / size) * 100}%`;
  const name = state.players[state.turn];
  $("#turn-banner").innerHTML = esc(t("turn", { name: "\u0000" })).replace("\u0000", `<b style="background:${pHex(state.turn)}">${esc(name)}</b>`);
}

/* ------------------------------------------------------------------ */
/* Question picking                                                   */
/* ------------------------------------------------------------------ */
function depthsFor(pref) {
  if (pref === "light") return [1];
  if (pref === "deep") return [2, 3];
  // mixed: weighted toward light/deeper
  const r = Math.random();
  return r < 0.4 ? [1] : r < 0.8 ? [2] : [3];
}

function unusedIn(subjectId) {
  const used = new Set(state.used);
  return DB.questions.filter((q) => q.subject === subjectId && !used.has(q.id));
}

function recycle(subjectId) {
  const ids = new Set(DB.questions.filter((q) => q.subject === subjectId).map((q) => q.id));
  state.used = state.used.filter((id) => !ids.has(id));
  toast(t("recycle", { s: sName(SUBJ[subjectId]) }));
}

// A question from one of the date / couple / +18 pools, not used in this story if possible.
function drawPool(poolId, depths, excludeId) {
  let list = DB[POOL_KEY[poolId]] || [];
  if (poolId === "__spicy") list = list.filter((q) => q.modes.includes(gameOf(state)));
  const used = new Set(state.used);
  let pool = list.filter((q) => !used.has(q.id) && q.id !== excludeId);
  if (!pool.length) {
    const ids = new Set(list.map((q) => q.id));
    state.used = state.used.filter((id) => !ids.has(id));
    pool = list.filter((q) => q.id !== excludeId);
  }
  if (!pool.length) return null;
  const atDepth = pool.filter((q) => depths.includes(q.depth));
  const near = atDepth.length ? atDepth : pool;
  const seen = seenSet();
  const fresh = near.filter((q) => !seen.has(q.id));
  return pick(fresh.length ? fresh : near);
}

// Depths for the current game: a first date warms up slowly, the car stays light.
function gameDepths() {
  const g = gameOf(state);
  const n = state.journal.filter((e) => !e.kind).length;
  if (g === "date") return n < 4 ? [1] : n < 10 ? (randInt(3) ? [2] : [1]) : (randInt(3) ? [2] : [3]);
  if (g === "car") return state.depth === "deep" ? [2] : depthsFor(state.depth === "mixed" ? "mixed" : state.depth).map((d) => Math.min(d, 2));
  return depthsFor(state.depth);
}

// What the wheel or a branch gives: exactly the segment it landed on (a subject or a date / couple / +18 pool).
function drawForGame(subjectId, depths) {
  return drawQuestion(subjectId, depths);
}

function drawQuestion(subjectId, depths, excludeId) {
  if (POOLS[subjectId]) return drawPool(subjectId, depths, excludeId) || drawQuestion(pick(state.subjects), depths);
  let pool = unusedIn(subjectId).filter((q) => q.id !== excludeId);
  if (!pool.length) { recycle(subjectId); pool = unusedIn(subjectId).filter((q) => q.id !== excludeId); }
  let filtered = pool.filter((q) => depths.includes(q.depth));
  if (!filtered.length) {
    // closest depth available
    const target = depths[0];
    const sorted = [...pool].sort((a, b) => Math.abs(a.depth - target) - Math.abs(b.depth - target));
    filtered = sorted.filter((q) => q.depth === sorted[0].depth);
  }
  // prefer questions never asked on this device, in any story
  const seen = seenSet();
  const fresh = filtered.filter((q) => !seen.has(q.id));
  return pick(fresh.length ? fresh : filtered);
}
