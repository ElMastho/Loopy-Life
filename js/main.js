/* Loopy Life · Wiring and start-up
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Wiring                                                             */
/* ------------------------------------------------------------------ */
function initGame() {
  $("#spin-btn").addEventListener("click", spin);
  $("#speed-go").addEventListener("click", () => openSpeedCard());
  initTeam();
  $("#pause-btn").addEventListener("click", pauseSpeed);
  $("#wheel").addEventListener("click", spin);
  $$("[data-switch]").forEach((b) => b.addEventListener("click", () => {
    if (["wheel", "tree"].includes(gameOf(state))) state.game = b.dataset.switch;
    setMode(b.dataset.switch);
  }));
  $("#tree-surprise").addEventListener("click", (e) => growBranch(pick(state.subjects), e.currentTarget));
  $("#journal-btn").addEventListener("click", openJournal);
  $("#mini-tree").addEventListener("click", openJournal);
  $("#journal-close").addEventListener("click", () => $("#journal-overlay").classList.add("hidden"));
  $("#journal-overlay").addEventListener("click", (e) => { if (e.target.id === "journal-overlay") $("#journal-overlay").classList.add("hidden"); });
  $("#finish-btn").addEventListener("click", () => { speedPaused = true; clearTimeout(speedNext); teamStopTimer(); showSummary(); });
  $("#home-btn").addEventListener("click", () => {
    speedPaused = true; clearTimeout(speedNext); teamStopTimer();
    state.active = false; // reopening the app now lands on the home screen; the game stays in "Our stories"
    save();
    showResume();
    showScreen("screen-setup");
    goStep(1);
  });
  $("#continue-btn").addEventListener("click", () => startGame());
  $("#restart-btn").addEventListener("click", () => {
    if (state) { state.active = false; save(); }
    showScreen("screen-setup");
    goStep(1);
  });
  $("#download-btn").addEventListener("click", downloadStory);
  $("#share-img-btn").addEventListener("click", shareStoryImage);
  $$(".badges-open").forEach((b) => b.addEventListener("click", openBadges));
  $("#badges-close").addEventListener("click", () => $("#badges-overlay").classList.add("hidden"));
  $("#badges-overlay").addEventListener("click", (e) => { if (e.target.id === "badges-overlay") $("#badges-overlay").classList.add("hidden"); });
  $$(".save-story").forEach((b) => b.addEventListener("click", () => saveStoryFile()));
  $("#load-story").addEventListener("click", () => $("#story-file").click());
  $("#stories-btn").addEventListener("click", openStories);
  $("#stories-close").addEventListener("click", () => $("#stories-overlay").classList.add("hidden"));
  $("#stories-overlay").addEventListener("click", (e) => { if (e.target.id === "stories-overlay") $("#stories-overlay").classList.add("hidden"); });
  $("#stories-search").addEventListener("input", renderStories);
  $("#backup-all").addEventListener("click", saveAllStories);
  $("#story-file").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) loadStoryFile(f);
    e.target.value = "";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { $("#journal-overlay").classList.add("hidden"); $("#badges-overlay").classList.add("hidden"); }
  });
}

async function boot() {
  applyLanguage();
  initInstall();
  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
  $("#lang-btn").addEventListener("click", () => setLanguage(LANG === "fr" ? "en" : "fr"));
  $$(".rules-open").forEach((b) => b.addEventListener("click", openRules));
  $("#rules-all").addEventListener("click", () => { rulesFull = true; renderRules(); $("#rules-overlay .card").scrollTop = 0; });
  $("#rules-close").addEventListener("click", () => $("#rules-overlay").classList.add("hidden"));
  $("#rules-overlay").addEventListener("click", (e) => { if (e.target.id === "rules-overlay") $("#rules-overlay").classList.add("hidden"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#rules-overlay").classList.add("hidden"); });
  try {
    DB = await loadQuestionBank();
  } catch (e) {
    $("#setup-error").textContent = t("loadError");
    return;
  }
  DB.subjects.forEach((s) => (SUBJ[s.id] = s));
  DB.questions.forEach((q) => (QBYID[q.id] = q));
  Object.values(EXTRAS).forEach((x) => (SUBJ[x.id] = x));
  Object.values(POOLS).forEach((x) => (SUBJ[x.id] = x));
  ["date", "couple", "spicy", "speed", "work", "honor", "debate", "society", "politics", "parents"].forEach((k) => (DB[k] || []).forEach((q) => (QBYID[q.id] = q)));
  (DB.who || []).forEach((q) => (QBYID[q.id] = { ...q, subject: "__who" }));
  (DB.challenges || []).forEach((q) => (QBYID[q.id] = { ...q, subject: "__dare" }));
  initSetup();
  initCard();
  initGame();
  initDevices();
  applyLanguage();
  // a game that was still going when the page closed or reloaded comes straight back
  const saved = loadSaved();
  if (saved && saved.version === 1 && Array.isArray(saved.players) && (saved.journal || []).length) {
    if (!saved.id) { saved.id = newId(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ } }
    keepStory(saved);
  }
  if (saved && saved.version === 1 && saved.active && Array.isArray(saved.players)) resumeSaved(saved);
  setTimeout(() => FX.sparkleEl($(".hero h1")), 400);
  $("#version-btn").textContent = `v${APP_VERSION}`; // e.g. v1.2.0
  $("#version-btn").addEventListener("click", openUpdate);
  $("#upd-close").addEventListener("click", () => $("#update-overlay").classList.add("hidden"));
  $("#update-overlay").addEventListener("click", (e) => { if (e.target.id === "update-overlay") $("#update-overlay").classList.add("hidden"); });
  $("#upd-force").addEventListener("click", forceUpdate);
  $("#update-now").addEventListener("click", forceUpdate);
  $("#update-later").addEventListener("click", () => ($("#update-banner").hidden = true));
  setTimeout(checkForUpdate, 1500);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkForUpdate(); });
}

boot();
// The wheel face is drawn once: draw it again when the Fredoka font has arrived.
if (document.fonts) document.fonts.ready.then(() => { if (state && state.mode === "wheel" && $("#wheel")) drawWheel(); });
