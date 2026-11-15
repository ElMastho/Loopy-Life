/* Loopy Life · The setup screen: players, game, settings
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Setup screen                                                       */
/* ------------------------------------------------------------------ */
let setupDepth = "mixed";
let setupTimer = 15;
let setupGame = null;
let setupTeamTimer = 0;

function goStep(n) {
  if (n === 3 && setupGame && !gameAllowed(setupGame, $$("#players-list input").length)) setupGame = null;
  if (n === 3 && !setupGame) n = 2;
  $$(".step").forEach((el) => (el.hidden = Number(el.dataset.step) !== n));
  $$("#steps li").forEach((li) => {
    const k = Number(li.dataset.step);
    li.classList.toggle("on", k === n);
    li.classList.toggle("done", k < n);
  });
  if (n === 2) renderGameChoice();
  if (n === 3) renderChosenGame();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Which games fit how many players: min/max allowed, and the range where a game shines.
const GAME_FIT = {
  wheel: { min: 2, best: [7, 99] },
  tree: { min: 2, best: [0, 0] },
  date: { min: 2, max: 2, best: [2, 2], why: "onlyTwo" },
  couple: { min: 2, max: 2, best: [2, 2], why: "onlyTwo" },
  bluff: { min: 2, best: [3, 6] },
  duel: { min: 3, best: [3, 8], why: "minThree" },
  bet: { min: 2, best: [3, 6] },
  car: { min: 2, max: 7, best: [0, 0], why: "carMax" },
  speed: { min: 2, best: [3, 8] },
  coffee: { min: 2, max: 8, best: [2, 6], why: "coffeeMax" },
  team: { min: 3, best: [6, 99], why: "teamMin" },
  honor: { min: 3, best: [4, 12], why: "minThree" },
};
const gameAllowed = (g, n) => n >= GAME_FIT[g].min && n <= (GAME_FIT[g].max || 99);
const gameBest = (g, n) => n >= GAME_FIT[g].best[0] && n <= GAME_FIT[g].best[1];
// Section order on step 2: what suits the group comes first, what doesn't apply goes last.
const GROUP_ORDER = (n) => (n === 2 ? ["two", "discover", "fun", "road", "work"] : n <= 7 ? ["fun", "discover", "road", "work", "two"] : ["discover", "fun", "work", "road", "two"]);

function renderGameChoice() {
  const n = $$("#players-list input").length;
  if (setupGame && !gameAllowed(setupGame, n)) setupGame = null;
  GROUP_ORDER(n).forEach((g, i) => { const el = $(`.game-group[data-group="${g}"]`); if (el) el.style.order = i; });
  $$(".game-card").forEach((card) => {
    const g = card.dataset.game;
    const ok = gameAllowed(g, n);
    const best = ok && gameBest(g, n);
    card.classList.toggle("on", g === setupGame);
    card.classList.toggle("off", !ok);
    card.classList.toggle("best", best);
    card.setAttribute("aria-disabled", String(!ok));
    card.querySelector(".g-players").textContent = !ok ? `🚫 ${t(GAME_FIT[g].why)}` : best ? t("bestFor", { n }) : t(`g_${g}Players`);
  });
  $$(".game-group").forEach((grp) => {
    const cards = grp.querySelectorAll(".game-card");
    const allOff = [...cards].every((c) => c.classList.contains("off"));
    grp.classList.toggle("group-off", allOff);
    const note = grp.querySelector(".group-note");
    note.hidden = !allOff;
    if (allOff) note.textContent = grp.dataset.group === "two" ? t("groupTwoOff") : "";
    note.hidden = !allOff || !note.textContent;
  });
}

function renderChosenGame() {
  if (!setupGame) return;
  const nP = $$("#players-list input").length;
  const fun = FUN_GAMES.includes(setupGame);
  $("#chosen-game").innerHTML = `<span class="mode-emoji">${GAME_EMOJI[setupGame]}</span><span><strong>${esc(t("g_" + setupGame))}</strong><small>${esc(t("g_" + setupGame + "Desc"))}</small>${fun && nP < 3 ? `<small class="warn">${esc(t("needThree"))}</small>` : ""}</span>`;
  const duo = DUO_GAMES.includes(setupGame), car = setupGame === "car";
  if (duo && nP !== 2) $("#chosen-game").querySelector("span:last-child").insertAdjacentHTML("beforeend", `<small class="warn">${esc(t("needTwo"))}</small>`);
  const speed = setupGame === "speed", work = isWorkGame(setupGame), team = setupGame === "team";
  // between colleagues, only the subjects that stay comfortable at work
  const family = $("#family-mode").checked && !FAMILY_GAMES_OFF.includes(setupGame);
  $$("#subject-grid .subject").forEach((b) => (b.hidden = (work && !WORK_SUBJECTS.includes(b.dataset.id)) || (family && FAMILY_OFF_SUBJECTS.includes(b.dataset.id))));
  $("#family-option").hidden = FAMILY_GAMES_OFF.includes(setupGame);
  updateSubjectsSummary();
  $("#team-timer-panel").hidden = !team;
  $("#guess-option").hidden = fun || speed || team; // fun games guess their own way, no time to guess in the speed game; on by default in the couple game
  $("#timer-panel").hidden = !speed;
  $("#who-option").hidden = duo || car || speed || team || nP < 3; // nobody points while driving; at 2 a vote just points at the other
  if ($("#who-option").hidden) $("#who-mode").checked = false;
  $("#dare-option").hidden = car || speed || work; // no challenges in a car, no time in the speed game, not at work
  $("#random-option").hidden = duo || nP < 3; // at 2, the next player is always the other one
  if ($("#random-option").hidden) $("#random-turn").checked = false;
  $("#adult-option").hidden = !duo;
  $("#car-panel").hidden = !car;
  $("#voice-option").hidden = !("speechSynthesis" in window);
  const pace = { date: "paceDate", tree: "paceTree", car: "paceCar", coffee: "paceWork", team: "paceWork" }[setupGame];
  $("#depth-hint").hidden = !pace;
  if (pace) $("#depth-hint").textContent = t(pace);
  $("#depth-choice").hidden = setupGame === "date" || setupGame === "tree"; // these two set their own pace
  $("#depth-panel").hidden = speed; // speed questions are short and light
  $('#depth-choice [data-depth="deep"]').hidden = car || work || family;
  if ((car || work || family) && setupDepth === "deep") $('#depth-choice [data-depth="mixed"]').click();
  if (car) renderDriverChoice();
  $("#honor-panel").hidden = setupGame !== "honor";
  if (setupGame === "honor") renderStarChoice();
  $$(".game-card").forEach((c) => c.classList.toggle("on", c.dataset.game === setupGame));
}
let setupGuessMode = false;
let guessBeforeCouple = false;
function setGuessMode(on) {
  setupGuessMode = on;
  $("#guess-mode").checked = on;
}
let setupDriver = -1;

function renderDriverChoice() {
  const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
  if (setupDriver >= names.length) setupDriver = -1;
  const box = $("#driver-choice");
  box.innerHTML = "";
  [[-1, t("noDriver")], ...names.map((n, i) => [i, n])].forEach(([i, n]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "driver" + (i === setupDriver ? " on" : "");
    b.textContent = i < 0 ? n : `🚗 ${n}`;
    b.addEventListener("click", () => { setupDriver = i; renderDriverChoice(); });
    box.appendChild(b);
  });
}
// 🎂 who is in the spotlight: a birthday, a farewell, a newcomer…
let setupStar = 0;
function renderStarChoice() {
  const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
  if (setupStar >= names.length) setupStar = 0;
  const box = $("#star-choice");
  box.innerHTML = "";
  names.forEach((n, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "driver" + (i === setupStar ? " on" : "");
    b.textContent = `🎂 ${n}`;
    b.addEventListener("click", () => { setupStar = i; renderStarChoice(); });
    box.appendChild(b);
  });
}
let optionsTouched = false;
let nameAsked = false;
const OPTION_IDS = ["family-mode", "guess-mode", "who-mode", "dare-mode", "random-turn", "voice-mode"];

// The option rows that apply to the chosen game, as toggles mirroring the real switches.
function openSuggest() {
  const list = $("#suggest-list");
  list.innerHTML = "";
  OPTION_IDS.forEach((id) => {
    const input = $("#" + id);
    const row = input.closest(".option-row");
    if (row.hidden) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "suggest-opt" + (input.checked ? " on" : "");
    b.innerHTML = `<span class="tick" aria-hidden="true"></span><span><strong>${row.querySelector("strong").innerHTML}</strong><small>${row.querySelector("small").innerHTML}</small></span>`;
    b.addEventListener("click", () => {
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change"));
      b.classList.toggle("on", input.checked);
      if (input.checked) FX.sparkleEl(b);
    });
    list.appendChild(b);
  });
  $("#suggest-name-box").hidden = !!storyName();
  $("#suggest-name").value = "";
  $("#suggest-opts-box").hidden = !list.children.length;
  $("#suggest-overlay").classList.remove("hidden");
}
// The names typed on step 1 are remembered as typed (empty ones too), so what was erased stays erased.
const NAMES_KEY = "loopy-setup-names";
let setupNames = (() => {
  try { const v = JSON.parse(localStorage.getItem(NAMES_KEY)); if (Array.isArray(v) && v.length >= 2) return v.map(String); } catch (e) { /* ignore */ }
  return ["", ""];
})();

function readPlayerInputs() {
  const inputs = $$("#players-list input");
  if (inputs.length) setupNames = inputs.map((el) => el.value);
  try { localStorage.setItem(NAMES_KEY, JSON.stringify(setupNames)); } catch (e) { /* ignore */ }
}

function renderPlayersList() {
  const list = $("#players-list");
  list.innerHTML = "";
  setupNames.forEach((name, i) => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.style.setProperty("--pc", pHex(i));
    const label = t("playerN", { n: i + 1 });
    row.innerHTML = `<span class="dot" aria-hidden="true"></span>
      <input id="player-${i}" type="text" maxlength="20" autocomplete="off" aria-label="${esc(label)}"
        placeholder="${esc(i === 0 ? t("firstNamePh") : t("otherNamePh"))}" value="${esc(name)}">
      ${i >= 2 ? `<button type="button" class="remove" aria-label="${esc(t("remove"))}" title="${esc(t("remove"))}">✕</button>` : ""}`;
    const rm = row.querySelector(".remove");
    if (rm) rm.addEventListener("click", () => { readPlayerInputs(); setupNames.splice(i, 1); renderPlayersList(); readPlayerInputs(); });
    list.appendChild(row);
  });
}

function renderSubjectGrid(selected) {
  const grid = $("#subject-grid");
  grid.innerHTML = "";
  DB.subjects.forEach((s) => {
    const n = DB.questions.filter((q) => q.subject === s.id).length;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "subject" + (selected.includes(s.id) ? " on" : "");
    b.dataset.id = s.id;
    b.style.setProperty("--c", s.color);
    b.innerHTML = `<span class="emo">${s.emoji}</span><span>${esc(sName(s))}<small>${t("nQuestions", { n })}</small></span>`;
    b.addEventListener("click", () => { b.classList.toggle("on"); updateSubjectsSummary(); });
    grid.appendChild(b);
  });
}

function updateSubjectsSummary() {
  const n = $$("#subject-grid .subject:not([hidden])").length, k = selectedSubjects().length;
  $("#subjects-summary").textContent = k === n ? t("subjectsAll", { n }) : t("subjectsSome", { k, n });
}

function selectedSubjects() {
  return $$("#subject-grid .subject.on:not([hidden])").map((b) => b.dataset.id);
}

const storyName = () => ($("#story-name").value || "").trim().slice(0, 40);

function initSetup() {
  renderSubjectGrid(DB.subjects.map((s) => s.id));
  renderPlayersList();
  $("#players-list").addEventListener("input", readPlayerInputs);
  $("#add-player").addEventListener("click", () => {
    readPlayerInputs();
    setupNames.push("");
    renderPlayersList();
    const inputs = $$("#players-list input");
    inputs[inputs.length - 1].focus();
  });

  $("#sel-all").addEventListener("click", () => { $$("#subject-grid .subject").forEach((b) => b.classList.add("on")); updateSubjectsSummary(); });
  $("#sel-none").addEventListener("click", () => { $$("#subject-grid .subject").forEach((b) => b.classList.remove("on")); updateSubjectsSummary(); });
  $("#edit-subjects").addEventListener("click", () => {
    $("#subject-grid").hidden = false;
    $("#subject-actions").hidden = false;
    $("#edit-subjects").hidden = true;
  });

  $("#guess-mode").addEventListener("change", (e) => (setupGuessMode = e.target.checked));
  $$("#team-timer-choice button").forEach((b) =>
    b.addEventListener("click", () => {
      setupTeamTimer = Number(b.dataset.time);
      $$("#team-timer-choice button").forEach((x) => x.classList.toggle("on", x === b));
    })
  );
  $$("#timer-choice button").forEach((b) =>
    b.addEventListener("click", () => {
      setupTimer = Number(b.dataset.time);
      $$("#timer-choice button").forEach((x) => x.classList.toggle("on", x === b));
    })
  );
  $$("#depth-choice button").forEach((b) =>
    b.addEventListener("click", () => {
      setupDepth = b.dataset.depth;
      $$("#depth-choice button").forEach((x) => x.classList.toggle("on", x === b));
    })
  );

  $$("[data-go]").forEach((b) => b.addEventListener("click", () => goStep(Number(b.dataset.go))));
  $$(".game-card").forEach((card) =>
    card.addEventListener("click", () => {
      if (card.classList.contains("off")) { FX.sparkleEl(card.querySelector(".g-players"), ["#ff9aa2", "#ffffff"]); return; }
      const was = setupGame;
      setupGame = card.dataset.game;
      // The couple game starts with "guess for each other" on; it can be turned off.
      if (setupGame === "couple" && was !== "couple") { guessBeforeCouple = setupGuessMode; setGuessMode(true); }
      else if (setupGame !== "couple" && was === "couple") setGuessMode(guessBeforeCouple);
      FX.sparkleEl(card);
      goStep(3);
    })
  );
  OPTION_IDS.forEach((id) => $("#" + id).addEventListener("change", () => (optionsTouched = true)));
  $("#family-mode").addEventListener("change", (e) => { renderChosenGame(); if (e.target.checked) toast(t("familyOn"), 2600); });
  $("#adult-mode").addEventListener("change", (e) => {
    optionsTouched = true;
    if (e.target.checked) { e.target.checked = false; $("#adult-overlay").classList.remove("hidden"); }
  });
  $("#adult-cancel").addEventListener("click", () => { $("#adult-mode").checked = false; $("#adult-overlay").classList.add("hidden"); });
  $("#adult-ok").addEventListener("click", () => {
    $("#adult-mode").checked = true;
    $("#adult-overlay").classList.add("hidden");
    toast(t("adultOn"), 3200);
  });
  $("#suggest-back").addEventListener("click", () => $("#suggest-overlay").classList.add("hidden"));
  $("#suggest-go").addEventListener("click", () => {
    $("#story-name").value = $("#suggest-name").value;
    $("#suggest-overlay").classList.add("hidden");
    $("#start-btn").click();
  });
  $("#start-btn").addEventListener("click", () => {
    if (!optionsTouched || (!storyName() && !nameAsked)) {
      optionsTouched = true; // suggest once, then start as chosen
      nameAsked = true;
      openSuggest();
      return;
    }
    const subjects = selectedSubjects();
    if (!subjects.length) {
      $("#setup-error").textContent = t("pickOne");
      $("#subject-grid").hidden = false;
      $("#subject-actions").hidden = false;
      return;
    }
    $("#setup-error").textContent = "";
    const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
    newGame(names, subjects, setupDepth, setupGame);
  });
  goStep(1);

  const saved = loadSaved();
  if (saved && saved.version === 1 && ((saved.journal?.length || 0) > 0 || saved.active)) showResume(saved);
}

// Back on the home screen: step 1 keeps the names as they were typed (the game itself is in "Our stories").
function showResume() {
  renderPlayersList();
}

function resumeSaved(saved) {
  state = saved;
  state.subjects = state.subjects.filter((id) => SUBJ[id]);
  if (!state.subjects.length) state.subjects = DB.subjects.map((s) => s.id);
  if (!Array.isArray(state.badges)) state.badges = [];
  startGame();
}
