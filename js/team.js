/* Loopy Life · The icebreaker: one question for the whole team, on a shared screen
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Icebreaker (game "team"): one person leads and shares the screen.  */
/* Everyone answers the same question in turn (a round of the table). */
/* ------------------------------------------------------------------ */
// state.teamQ = { qid, order: [player…], at: index in order, done: [player…], skipped: [player…] }
let teamTimerEnd = 0, teamTimerTick = null;

// Mostly questions written for colleagues, sometimes a light question from the chosen subjects.
function drawTeam(excludeId) {
  if (randInt(10) < 4 && state.subjects.length) return drawQuestion(pick(state.subjects), [1], excludeId);
  return drawPool("__work", gameDepths(), excludeId) || drawQuestion(pick(state.subjects), [1], excludeId);
}

// The order of the round: from the player whose turn it is, or shuffled.
function teamOrder() {
  const n = nPlayers();
  const order = Array.from({ length: n }, (_, i) => (state.turn + i) % n);
  if (state.randomTurn) {
    for (let i = order.length - 1; i > 0; i--) { const j = randInt(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  }
  return order;
}

function teamNewQuestion(excludeId) {
  const q = drawTeam(excludeId);
  if (!q) return;
  state.teamQ = { qid: q.id, order: teamOrder(), at: 0, done: [], skipped: [] };
  save();
  renderTeam(true);
  if (state.voice) setTimeout(teamSpeak, 400);
}

const teamQuestion = () => (state.teamQ ? QBYID[state.teamQ.qid] : null);
const teamCurrent = () => (state.teamQ && state.teamQ.at < state.teamQ.order.length ? state.teamQ.order[state.teamQ.at] : -1);

// The current person answered (or passed): points for an answer, then the next person.
function teamAdvance(answered) {
  const tq = state.teamQ;
  const q = teamQuestion();
  const p = teamCurrent();
  if (!tq || !q || p < 0) return;
  if (answered) {
    const size = levelSize();
    const before = Math.floor(state.connection / size);
    tq.done.push(p);
    state.scores[p] += POINTS[q.depth] || 10;
    state.connection += POINTS[q.depth] || 10;
    const after = Math.floor(state.connection / size);
    updateScores(false);
    if (after > before) { FX.fireworks(8); toast(t("levelUp", { n: after + 1 }), 3200); }
    else FX.sparkleEl($("#team-for"), [pHex(p), "#ffd166", "#ffffff"]);
  } else {
    tq.skipped.push(p);
  }
  tq.at += 1;
  save();
  renderTeam();
  if (tq.at >= tq.order.length) { FX.fireworks(4); toast(t("teamAllDone")); }
}

// Back to the previous person, undoing their answer or pass.
function teamBack() {
  const tq = state.teamQ;
  if (!tq || tq.at === 0) return;
  tq.at -= 1;
  const p = tq.order[tq.at];
  const q = teamQuestion();
  if (tq.done.includes(p)) {
    tq.done = tq.done.filter((x) => x !== p);
    state.scores[p] -= POINTS[q.depth] || 10;
    state.connection = Math.max(0, state.connection - (POINTS[q.depth] || 10));
    updateScores(false);
  }
  tq.skipped = tq.skipped.filter((x) => x !== p);
  save();
  renderTeam();
}

// Closes the question (kept in Our story when someone answered), then the next one.
function teamNext() {
  const tq = state.teamQ;
  const q = teamQuestion();
  if (tq && q) {
    state.used.push(q.id);
    markSeen([q.id]);
    if (tq.done.length) {
      counts(q.subject)[q.depth] += 1;
      const gained = state.players.map((_, i) => (tq.done.includes(i) ? POINTS[q.depth] || 10 : 0));
      state.journal.push({
        qid: q.id, text: q.text, subject: q.subject, depth: q.depth,
        player: tq.order[0], bonuses: [], note: "", gained, t: Date.now(),
        game: "team", answered: tq.done.slice(),
      });
      state.turn = nextTurn(tq.order[0]); // the next round starts with someone else
    }
  }
  state.teamQ = null;
  save();
  if (q) checkBadges();
  teamNewQuestion(q ? q.id : undefined);
}

function teamSpeak() {
  const q = teamQuestion();
  if (!q || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(qText(q).replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "").trim());
    u.lang = LANG === "fr" ? "fr-FR" : "en-US";
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

/* The optional countdown for each person: it only shows the time, it never cuts anyone off. */
function teamStartTimer() {
  clearInterval(teamTimerTick);
  const secs = state.timer || 0;
  $("#team-timer").hidden = !secs || teamCurrent() < 0;
  if (!secs || teamCurrent() < 0) return;
  teamTimerEnd = Date.now() + secs * 1000;
  const tick = () => {
    const ms = Math.max(0, teamTimerEnd - Date.now());
    $("#team-timer-fill").style.width = `${(ms / (secs * 1000)) * 100}%`;
    $("#team-timer-num").textContent = ms > 0 ? Math.ceil(ms / 1000) : t("teamTimeUp");
    $("#team-timer").classList.toggle("hurry", ms <= 5000);
    if (ms <= 0) clearInterval(teamTimerTick);
  };
  tick();
  teamTimerTick = setInterval(tick, 200);
}

function teamStopTimer() {
  clearInterval(teamTimerTick);
  teamTimerTick = null;
}

function renderTeam(fresh) {
  if (!state || gameOf(state) !== "team") return;
  const tq = state.teamQ;
  const q = teamQuestion();
  $("#team-start").hidden = !!q;
  $("#team-stage").hidden = !q;
  if (!q) { teamStopTimer(); return; }
  const s = SUBJ[q.subject] || { emoji: "💬", color: "#9b7bff", name: q.subject };
  $("#team-stage").style.setProperty("--c", s.color);
  $("#team-subject").textContent = `${s.emoji} ${sName(s)}`;
  $("#team-q").textContent = qText(q);
  const p = teamCurrent();
  const finished = p < 0;
  $("#team-for").innerHTML = finished
    ? esc(t("teamAllDone"))
    : esc(t("forWho", { name: "\u0000" })).replace("\u0000", `<b style="background:${pHex(p)}">${esc(state.players[p])}</b>`);
  $("#team-progress").textContent = t("teamProgress", { n: tq.done.length, total: tq.order.length });
  const names = $("#team-names");
  names.innerHTML = "";
  tq.order.forEach((i, k) => {
    const chip = document.createElement("span");
    const st = tq.done.includes(i) ? "done" : tq.skipped.includes(i) ? "skipped" : k === tq.at ? "now" : "";
    chip.className = `team-name ${st}`;
    chip.style.setProperty("--pc", pHex(i));
    chip.textContent = `${st === "done" ? "✓ " : st === "skipped" ? "· " : ""}${state.players[i]}`;
    names.appendChild(chip);
  });
  $("#team-answered").hidden = finished;
  $("#team-skip").hidden = finished;
  $("#team-prev").disabled = tq.at === 0;
  $("#team-new").classList.toggle("primary", finished);
  $("#team-new").classList.toggle("ghost", !finished);
  $("#team-new").textContent = finished ? t("teamNextQ") : t("teamNew");
  $("#team-full").hidden = !document.documentElement.requestFullscreen;
  $("#team-speak").hidden = !("speechSynthesis" in window);
  if (fresh) { const card = $("#team-card"); card.style.animation = "none"; void card.offsetWidth; card.style.animation = ""; }
  teamStartTimer();
}

function teamFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } catch (e) { /* ignore */ }
}

// The person who leads drives everything from the keyboard while sharing the screen.
function teamKeys(e) {
  if (!state || gameOf(state) !== "team" || !$("#screen-game").classList.contains("active")) return;
  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  if ($$(".overlay:not(.hidden)").length || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const finished = teamCurrent() < 0;
  if (!state.teamQ) { if (k === " " || k === "enter") { e.preventDefault(); teamNewQuestion(); } return; }
  if (k === " " || k === "enter" || k === "arrowright") { e.preventDefault(); if (finished) teamNext(); else teamAdvance(true); }
  else if (k === "arrowleft") { e.preventDefault(); teamBack(); }
  else if (k === "s" && !finished) teamAdvance(false);
  else if (k === "n") teamNext();
  else if (k === "f") teamFullscreen();
  else if (k === "t") teamStartTimer();
  else if (k === "r") teamSpeak();
}

function initTeam() {
  $("#team-go").addEventListener("click", () => teamNewQuestion());
  $("#team-answered").addEventListener("click", () => teamAdvance(true));
  $("#team-skip").addEventListener("click", () => teamAdvance(false));
  $("#team-prev").addEventListener("click", teamBack);
  $("#team-new").addEventListener("click", teamNext);
  $("#team-speak").addEventListener("click", teamSpeak);
  $("#team-full").addEventListener("click", teamFullscreen);
  document.addEventListener("keydown", teamKeys);
}
