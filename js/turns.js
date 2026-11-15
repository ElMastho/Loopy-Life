/* Loopy Life · The fun games and the flow of a turn: scoring, passing, next player
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Fun games: truth or bluff, duel, bet                               */
/* ------------------------------------------------------------------ */
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function toggleChip(key, html, exclusive) {
  const { bonuses } = current;
  const b = el("button", "bonus name" + (bonuses.has(key) ? " on" : ""), html);
  b.type = "button";
  b.addEventListener("click", () => {
    const on = !bonuses.has(key);
    if (exclusive) exclusive.forEach((k) => bonuses.delete(k));
    if (on) { bonuses.add(key); FX.sparkleEl(b); } else bonuses.delete(key);
    renderBonuses();
  });
  return b;
}

// "1. Do this. 2. Then that." -> a numbered list
function setSteps(el, text) {
  const parts = text.split(/(?:^|\s)\d\.\s/).map((x) => x.trim()).filter(Boolean);
  el.innerHTML = parts.length > 1 ? `<ol>${parts.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : esc(text);
}

function renderFunGame() {
  const { player: p, game } = current;
  const os = others(p);
  const name = state.players[p];
  const step = $("#guess-step");
  step.hidden = false;
  const row = $("#bonus-row");
  row.innerHTML = "";

  if (game === "bluff") {
    $("#done-btn").disabled = !current.revealed; // no points before the reveal
    setSteps(step, t("bluffStep", { name }));
    const secret = el("div", "secret" + (current.peek ? " open" : ""));
    if (current.peek) {
      secret.appendChild(el("p", "secret-text " + (current.bluff ? "lie" : "truth"), esc(t(current.bluff ? "bluffLie" : "bluffTruth"))));
      const hide = el("button", "btn ghost small", esc(t("bluffHide")));
      hide.type = "button";
      hide.addEventListener("click", () => { current.peek = false; renderBonuses(); });
      secret.appendChild(hide);
    } else {
      const look = el("button", "btn secret-btn", esc(t("bluffLook", { name })));
      look.type = "button";
      look.addEventListener("click", () => { current.peek = true; renderBonuses(); });
      secret.appendChild(look);
    }
    row.appendChild(secret);
    if (!current.revealed) {
      const rv = el("button", "btn ghost small reveal-btn", esc(t("bluffReveal")));
      rv.type = "button";
      rv.addEventListener("click", () => { current.revealed = true; current.peek = false; renderBonuses(); FX.sparkleEl($("#q-text")); });
      row.appendChild(rv);
    } else {
      row.appendChild(el("p", "reveal " + (current.bluff ? "lie" : "truth"), `${esc(t("bluffWas"))} <b>${esc(t(current.bluff ? "bluffLieShort" : "bluffTruthShort"))}</b>`));
      row.appendChild(el("p", "bonus-label", esc(t("bluffWho", { name }))));
      os.forEach((o) => row.appendChild(toggleChip(`guess:${o}`, nameChip(o))));
    }
    return;
  }

  if (game === "duel") {
    const r = current.rival;
    step.textContent = t("duelStep", { a: name, b: state.players[r] });
    row.appendChild(el("p", "bonus-label", esc(t("duelWho"))));
    const keys = ["win:" + p, "win:" + r, "tie"];
    row.appendChild(toggleChip(keys[0], nameChip(p), keys));
    row.appendChild(toggleChip(keys[1], nameChip(r), keys));
    row.appendChild(toggleChip(keys[2], `<span>${esc(t("duelTie"))}</span>`, keys));
    return;
  }

  // bet
  setSteps(step, t("betStep", { name }));
  const list = el("div", "bets");
  os.forEach((o) => {
    const bet = current.bets[o] || 1;
    const line = el("div", "bet-row");
    line.appendChild(el("span", "bet-name", nameChip(o)));
    const seg = el("div", "bet-seg");
    [1, 2, 3].forEach((v) => {
      const b = el("button", v === bet ? "on" : "", String(v));
      b.type = "button";
      b.addEventListener("click", () => { current.bets[o] = v; renderBonuses(); });
      seg.appendChild(b);
    });
    line.appendChild(seg);
    line.appendChild(toggleChip(`guess:${o}`, `<span>${esc(t("betRight"))}</span>`));
    list.appendChild(line);
  });
  row.appendChild(list);
  row.appendChild(el("p", "bonus-help", esc(t("betLegend"))));
}

// Points for a fun-game question; returns a toast message.
function scoreFunGame(gained, base) {
  const { player: p, bonuses, game } = current;
  const os = others(p);
  if (game === "bluff") {
    const seen = os.filter((o) => bonuses.has(`guess:${o}`));
    const fooled = os.length - seen.length;
    gained[p] += base + fooled * BLUFF_FOOLED;
    seen.forEach((o) => (gained[o] += BLUFF_SEEN));
    if (!current.revealed) return null;
    return fooled ? t("bluffToast", { name: state.players[p], n: fooled }) : t("bluffCaught");
  }
  if (game === "duel") {
    const r = current.rival;
    gained[p] += base;
    gained[r] += base;
    if (bonuses.has("tie")) { gained[p] += DUEL_TIE; gained[r] += DUEL_TIE; return t("duelTieToast"); }
    const w = bonuses.has("win:" + p) ? p : bonuses.has("win:" + r) ? r : -1;
    if (w >= 0) { gained[w] += DUEL_WIN; return t("duelToast", { name: state.players[w] }); }
    return null;
  }
  // bet
  gained[p] += base;
  let best = -1, bestN = 0;
  os.forEach((o) => {
    const bet = current.bets[o] || 1;
    if (bonuses.has(`guess:${o}`)) {
      gained[o] += bet * BET_WIN;
      if (bet * BET_WIN > bestN) { bestN = bet * BET_WIN; best = o; }
    } else {
      gained[o] -= Math.min(bet * BET_LOSS, state.scores[o]); // never below zero
    }
  });
  return best >= 0 ? t("betToast", { name: state.players[best], n: bestN }) : t("betLostToast", { name: state.players[p] });
}

// Whose turn after `player`: the next one, or anyone else at random with that option.
function nextTurn(player) {
  const n = nPlayers();
  if (state.randomTurn && n > 2) {
    const os = others(player);
    return os[randInt(os.length)];
  }
  return (player + 1) % n;
}

// Picks a vote or a challenge not used in this story, preferring ones never seen on this device.
function drawExtra(kind, excludeId) {
  const list = kind === "who" ? DB.who || [] : DB.challenges || [];
  const used = new Set(state.used);
  let pool = list.filter((x) => !used.has(x.id) && x.id !== excludeId);
  if (!pool.length) {
    const ids = new Set(list.map((x) => x.id));
    state.used = state.used.filter((id) => !ids.has(id));
    pool = list.filter((x) => x.id !== excludeId);
  }
  const seen = seenSet();
  const fresh = pool.filter((x) => !seen.has(x.id));
  const x = pick(fresh.length ? fresh : pool);
  return QBYID[x.id] || x;
}

function openExtra(id) {
  const kind = EXTRAS[id].kind;
  openCard(drawExtra(kind), kind);
}

function finishExtra() {
  const { q, player, bonuses, kind } = current;
  const gained = state.players.map(() => 0);
  let chosen = [];
  if (kind === "who") {
    chosen = state.players.map((_, i) => i).filter((i) => bonuses.has(`chosen:${i}`));
    gained.forEach((_, i) => (gained[i] += VOTE_POINTS));
    chosen.forEach((i) => (gained[i] += CHOSEN_POINTS));
    if (bonuses.has("unanimous")) gained.forEach((_, i) => (gained[i] += 5));
  } else {
    if (bonuses.has("dare")) gained[player] += DARE_POINTS;
    if (bonuses.has("laugh")) gained.forEach((_, i) => (gained[i] += 5));
  }
  const size = levelSize();
  const beforeLvl = Math.floor(state.connection / size);
  gained.forEach((g, i) => (state.scores[i] += g));
  state.connection += gained.reduce((a, b) => a + b, 0);
  const afterLvl = Math.floor(state.connection / size);

  state.used.push(q.id);
  markSeen([q.id]);
  state.journal.push({
    qid: q.id, text: q.text, subject: kind === "who" ? "__who" : "__dare", depth: 0, kind,
    player, bonuses: [...bonuses], note: $("#q-note").value.trim(),
    gained, t: Date.now(),
  });
  state.turn = nextTurn(player);
  save();

  FX.sparkleEl($("#done-btn"));
  closeCard();
  updateScores(true, gained.map((g, i) => (g ? i : -1)).filter((i) => i >= 0));
  if (afterLvl > beforeLvl) {
    FX.fireworks(8);
    toast(t("levelUp", { n: afterLvl + 1 }), 3200);
  } else if (kind === "who" && bonuses.has("unanimous")) {
    FX.fireworks(4);
    toast(t("unanimousToast"));
  } else if (kind === "who" && chosen.length) {
    chosen.forEach((o) => FX.sparkleEl($(`#score-${o}`), [pHex(o), "#ffd166", "#ffffff"]));
    toast(t("whoToast", { name: joinNames(chosen.map((o) => state.players[o])) }));
  } else if (kind === "dare" && bonuses.has("dare")) {
    FX.sparkleEl($(`#score-${player}`), [pHex(player), "#ffd166", "#ffffff"]);
    toast(t("dareToast", { name: state.players[player] }));
  }
  afterTurn();
}

// Redraws the current view and checks badges, after any card.
function afterTurn() {
  renderTree();
  if (state.mode !== "tree") drawWheel();
  checkBadges();
}

function finishQuestion() {
  if (!current) return;
  if (current.kind) return finishExtra();
  const { q, player, bonuses } = current;
  const os = others(player);
  const base = POINTS[q.depth];
  const gained = state.players.map(() => 0);
  const funMsg = current.game ? scoreFunGame(gained, base) : null;
  if (!current.game) gained[player] += base;
  const guessers = current.game ? [] : os.filter((o) => bonuses.has(`guess:${o}`));
  guessers.forEach((o) => (gained[o] += state.guessMode ? GUESS_MODE_POINTS : GUESS_POINTS));
  const surprised = state.guessMode && bonuses.has("nobody") && !guessers.length;
  if (surprised) gained[player] += SURPRISE_POINTS;
  if (bonuses.has("wow")) gained.forEach((_, i) => (gained[i] += 5));
  if (bonuses.has("both") && !current.game) os.forEach((o) => (gained[o] += base));
  let speedLeft = null;
  if (gameOf(state) === "speed") {
    speedLeft = timeLeft();
    gained[player] += speedLeft;
    state.streak = (state.streak || 0) + 1;
    state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
  }

  const size = levelSize();
  const beforeLvl = Math.floor(state.connection / size);
  gained.forEach((g, i) => (state.scores[i] += g));
  state.connection += gained.reduce((a, b) => a + Math.max(0, b), 0);
  const afterLvl = Math.floor(state.connection / size);

  state.used.push(q.id);
  markSeen([q.id]);
  counts(q.subject)[q.depth] += 1;
  state.journal.push({
    qid: q.id, text: q.text, subject: q.subject, depth: q.depth,
    player, bonuses: [...bonuses], note: $("#q-note").value.trim(),
    gained, t: Date.now(),
    ...(current.game ? { game: current.game } : {}),
    ...(speedLeft != null ? { left: speedLeft } : {}),
    ...(current.game === "bluff" ? { bluff: current.bluff } : {}),
    ...(current.game === "duel" ? { rival: current.rival } : {}),
    ...(current.game === "bet" ? { bets: current.bets } : {}),
  });
  state.turn = nextTurn(player);
  save();

  FX.sparkleEl($("#done-btn"));
  closeCard();
  updateScores(true, gained.map((g, i) => (g ? i : -1)).filter((i) => i >= 0));

  const s = SUBJ[q.subject];
  if (afterLvl > beforeLvl) {
    FX.fireworks(8);
    toast(t("levelUp", { n: afterLvl + 1 }), 3200);
  } else if (speedLeft != null && state.streak % 5 === 0) {
    FX.fireworks(4, ["#ffb703", "#ffd166", "#ffffff"]);
    toast(t("streakToast", { n: state.streak }));
  } else if (q.depth === 3) {
    FX.fireworks(4, [s.color, "#ffd166", "#ffffff"]);
    toast(t("deepToast"));
  } else if (funMsg) {
    FX.fireworks(3, [pHex(player), "#ffd166", "#ffffff"]);
    toast(funMsg, 2800);
  } else if (guessers.length) {
    guessers.forEach((o) => FX.sparkleEl($(`#score-${o}`), ["#ffd166", "#7ef0a8", "#ffffff"]));
    toast(t("knowsYou", { name: joinNames(guessers.map((o) => state.players[o])) }));
  } else if (surprised) {
    toast(t("surprised", { name: state.players[player] }));
  } else if (bonuses.has("wow")) {
    toast(t("wowToast"));
  }
  FX.sparkleEl($(`#score-${player}`), [pHex(player), "#ffd166", "#ffffff"]);

  if (state.mode === "speed") {
    renderTree();
    renderSpeedView();
    speedNextSoon();
  } else if (state.mode === "tree") {
    renderTree();
    const c = counts(q.subject);
    if ((q.depth === 1 && c[1] === 2) || (q.depth === 2 && c[2] === 2)) {
      setTimeout(() => toast(t(q.depth === 1 ? "unlockLeaves" : "unlockBlooms", { s: `${s.emoji} ${sName(s)}` })), 900);
    }
  } else {
    renderTree();
    drawWheel();
  }
  checkBadges();
}

function passQuestion() {
  if (!current) return;
  if (current.kind) {
    // another vote or challenge: free, same player
    const { kind, q: old } = current;
    state.used.push(old.id);
    markSeen([old.id]);
    save();
    openCard(drawExtra(kind, old.id), kind);
    return;
  }
  const p = current.player;
  state.used.push(current.q.id);
  markSeen([current.q.id]);
  save();
  if (gameOf(state) === "speed") { const old = current.q.id; closeCard(); openSpeedCard(old); return; }
  const q = drawQuestion(current.q.subject, [current.q.depth], current.q.id);
  openCard(q);
}

function initCard() {
  $("#speak-btn").addEventListener("click", speakCurrent);
  $("#done-btn").addEventListener("click", finishQuestion);
  $("#skip-btn").addEventListener("click", passQuestion);
}
