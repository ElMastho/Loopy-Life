/* Loopy Life · The rules and the language switch
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Rules: the whole set on the home screen, only what applies in game */
/* ------------------------------------------------------------------ */
// Sections of rulesBody, in order: 0 goal, 1 players, 2 starting, 3 discovery games, 4 fun games,
// 5 points, 6 bonuses, 7 connection, 8 guess option, 9 who of us, 10 challenges, 11 big groups,
// 12 badges, 13 share, 14 install, 15 saving.
const R = { goal: 0, discover: 3, fun: 4, points: 5, bonuses: 6, connection: 7, guess: 8, who: 9, dare: 10, big: 11, badges: 12, saving: 15, date: 16, couple: 17, car: 18, adult: 19, speed: 20, voice: 21, coffee: 22, team: 23, devices: 24, card: 25, family: 26, honor: 27, debate: 28, parents: 29 };
let rulesFull = true;

function ruleSections() {
  return t("rulesBody").split("<h3>").slice(1).map((x) => "<h3>" + x);
}

// One game's paragraph, taken from the list of games in the rules.
function gameRule(sections, game) {
  if (R[game] != null) return sections[R[game]];
  const [sec, i] = { wheel: [R.discover, 0], tree: [R.discover, 1], bluff: [R.fun, 0], duel: [R.fun, 1], bet: [R.fun, 2] }[game];
  const items = sections[sec].split("<li>").slice(1).map((x) => x.split("</li>")[0]);
  const text = (items[i] || "").replace(/^<b>[^<]*<\/b>\s*:?\s*/, "");
  return `<h3>${GAME_EMOJI[game]} ${esc(t("g_" + game))}</h3><p>${text.charAt(0).toUpperCase()}${text.slice(1)}</p>`;
}

function contextRules() {
  const sec = ruleSections();
  const g = gameOf(state);
  if (g === "speed") return [sec[R.speed], sec[R.voice], sec[R.devices], sec[R.connection], sec[R.badges], sec[R.saving]].join("");
  if (g === "team") return [sec[R.team], sec[R.voice], sec[R.connection], sec[R.badges], sec[R.saving]].join("");
  const fun = FUN_GAMES.includes(g);
  const parts = [gameRule(sec, g), sec[R.points]];
  if (fun) parts.push(t("rulesPass"));
  else {
    parts.push(sec[R.bonuses]);
    if (state.guessMode) parts.push(sec[R.guess]);
  }
  if (state.adult) parts.push(sec[R.adult]);
  if (state.whoMode) parts.push(sec[R.who]);
  if (state.dareMode) parts.push(sec[R.dare]);
  if (g !== "car") parts.push(sec[R.voice]); // the 🔊 button is on every card
  if (nPlayers() >= COMPACT_FROM || state.randomTurn) parts.push(sec[R.big]);
  if (state.family) parts.push(sec[R.family]);
  parts.push(sec[R.card], sec[R.devices], sec[R.connection], sec[R.badges], sec[R.saving]);
  return parts.join("");
}

function renderRules() {
  const inGame = state && !$("#screen-setup").classList.contains("active");
  const full = rulesFull || !inGame;
  $("#rules-title").textContent = full ? t("rulesTitle") : t("rulesFor", { game: `${GAME_EMOJI[gameOf(state)]} ${t("g_" + gameOf(state))}` });
  $("#rules-body").innerHTML = full ? t("rulesBody") : contextRules();
  $("#rules-all").hidden = full;
}

function openRules() {
  rulesFull = false;
  renderRules();
  $("#rules-body").scrollTop = 0;
  $("#rules-overlay .card").scrollTop = 0;
  $("#rules-overlay").classList.remove("hidden");
}

function applyLanguage() {
  document.documentElement.lang = LANG;
  document.title = `Loopy Life · ${t("title")}`;
  $$("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
  $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $$("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === LANG));
  $("#lang-btn").textContent = t("langToggle");
  if (!DB.questions.length) return;
  $("#q-count").textContent = t("qCount", { n: DB.questions.length });
  const selected = $$("#subject-grid .subject").length ? selectedSubjects() : DB.subjects.map((s) => s.id);
  renderSubjectGrid(selected);
  updateSubjectsSummary();
  readPlayerInputs();
  renderPlayersList();
  if (state && $("#screen-game").classList.contains("active")) {
    updateScores(false);
    if (state.mode === "wheel") drawWheel(); else renderTree();
  }
  if (state && $("#screen-summary").classList.contains("active")) showSummary();
  if (state) renderSpeedView();
  renderChosenGame();
  if (!$(".step[data-step=\"2\"]").hidden) renderGameChoice();
  if (!$("#rules-overlay").classList.contains("hidden")) renderRules();
  if (state) $("#game-name").textContent = gameTitle();
  fillCard();
}

function setLanguage(lang) {
  LANG = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  applyLanguage();
}
