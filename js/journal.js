/* Loopy Life · Our story (journal), the summary and .loopy files
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Journal & summary                                                  */
/* ------------------------------------------------------------------ */
// Who played a journal entry, in words.
function journalBy(j) {
  return j.kind === "who" ? t("allVoted") : j.kind === "dare" ? t("dareBy", { name: state.players[j.player] })
    : j.game === "duel" ? t("duelBy", { a: state.players[j.player], b: state.players[j.rival] })
    : j.game === "bluff" ? t("bluffBy", { name: t("answeredBy", { name: state.players[j.player] }), x: t(j.bluff ? "bluffLieShort" : "bluffTruthShort") })
    : t("answeredBy", { name: state.players[j.player] });
}

function journalHTML() {
  return state.journal
    .map((j) => {
      const s = SUBJ[j.subject] || { emoji: "•", name: j.subject };
      const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
      const pts = j.gained.reduce((a, b) => a + Math.max(0, b), 0);
      const note = j.note ? `<span class="j-note">“${esc(j.note)}”</span>` : "";
      const by = journalBy(j);
      return `<li><b>${esc(text)}</b><br><span class="j-meta">${s.emoji} ${esc(sName(s))} · ${esc(by)} · +${pts}</span>${note}</li>`;
    })
    .join("");
}

function openJournal() {
  renderTree();
  $("#journal-list").innerHTML = journalHTML();
  $("#journal-overlay").classList.remove("hidden");
}

// What the group learned: answers marked "didn't know!" or with a note, up to 3 per player, latest first.
function discoveriesHTML() {
  const found = state.journal.filter((e) => !e.kind && (e.note || e.bonuses.includes("wow")));
  if (!found.length) return `<p class="panel-hint">${esc(t("noDiscoveries"))}</p>`;
  return state.players.map((name, i) => {
    const mine = found.filter((e) => e.player === i).slice(-3).reverse();
    if (!mine.length) return "";
    const items = mine.map((e) => {
      const text = QBYID[e.qid] ? qText(QBYID[e.qid]) : tr(e.text);
      return `<li>${e.bonuses.includes("wow") ? "😮 " : ""}${esc(text)}${e.note ? `<span class="j-note">“${esc(e.note)}”</span>` : ""}</li>`;
    }).join("");
    return `<div class="disc" style="--pc:${pHex(i)}"><h3>${esc(t("aboutName", { name }))}</h3><ul>${items}</ul></div>`;
  }).join("");
}

function showSummary() {
  const all = state.journal;
  const j = all.filter((e) => !e.kind);
  const votes = all.filter((e) => e.kind === "who").length;
  const dares = all.filter((e) => e.kind === "dare" && e.bonuses.includes("dare")).length;
  const bySubject = {};
  j.forEach((e) => (bySubject[e.subject] = (bySubject[e.subject] || 0) + 1));
  const fav = Object.entries(bySubject).filter(([id]) => !POOLS[id]).sort((a, b) => b[1] - a[1])[0];
  const deep = j.filter((e) => e.depth === 3).length;
  const guesses = j.filter((e) => e.bonuses.some((b) => b === "guess" || b.startsWith("guess:"))).length;
  const wows = j.filter((e) => e.bonuses.includes("wow")).length;
  const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
  const lvl = Math.floor(state.connection / levelSize()) + 1;

  $("#summary-tagline").textContent = (state.name ? `📖 ${state.name} · ` : "") + t("reached", { names: joinNames(state.players), n: lvl });
  renderTree();
  $("#summary-discoveries").innerHTML = discoveriesHTML();
  const stat = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  $("#summary-stats").innerHTML =
    stat(j.length, t("statAnswered")) +
    (competitive() ? state.players.map((name, i) => stat(state.scores[i], esc(name))).join("") : "") +
    stat(deep, t("statDeep")) +
    stat(wows, t("statWow")) +
    stat(guesses, t("statGuess")) +
    (votes ? stat(votes, t("statWho")) : "") +
    (dares ? stat(dares, t("statDares")) : "") +
    stat(`🏅 ${(state.badges || []).length}`, esc(t("badgesBtn").replace("🏅 ", ""))) +
    stat(fav ? SUBJ[fav[0]].emoji : "–", fav ? esc(t("statFav", { s: sName(SUBJ[fav[0]]) })) : t("statFavNone")) +
    stat(`${mins}′`, t("statTogether"));
  $("#summary-journal").innerHTML = journalHTML();
  showScreen("screen-summary");
  setTimeout(() => FX.fireworks(10), 300);
}

// A story file is the game state as JSON, base64-encoded behind a header, saved as .loopy.
const STORY_HEADER = "LOOPY-LIFE-STORY:1\n";

function encodeStory(st) {
  const json = JSON.stringify({ app: "loopy-life-know-each-other", savedAt: new Date().toISOString(), state: st });
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return STORY_HEADER + btoa(bin);
}

function decodeStory(text) {
  if (!text.startsWith(STORY_HEADER)) throw new Error("not a story");
  const bin = atob(text.slice(STORY_HEADER.length).trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const data = JSON.parse(new TextDecoder().decode(bytes));
  const st = data && data.state;
  const ok = st && Array.isArray(st.players) && st.players.length >= 2 && Array.isArray(st.scores)
    && Array.isArray(st.journal) && Array.isArray(st.used) && Array.isArray(st.subjects);
  if (!ok) throw new Error("bad story");
  return st;
}

function downloadFile(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const fileBase = (st = state) => (st.name ? st.name : `${t("storyFile")}-${st.players.join("-")}`).replace(/[\\/:*?"<>|\s]+/g, "-");

function saveStoryFile(st = state) {
  downloadFile(encodeStory(st), `${fileBase(st)}.loopy`, "application/octet-stream");
  toast(t("savedToast"), 3200);
}

function loadStoryFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let st;
    try { st = decodeStory(String(reader.result)); } catch (e) {
      $("#setup-error").textContent = t("loadBad");
      toast(t("loadBad"), 3200);
      return;
    }
    $("#setup-error").textContent = "";
    const n = st.players.length;
    st.version = 1;
    st.scores = st.players.map((_, i) => Number(st.scores[i]) || 0);
    st.passes = st.players.map((_, i) => (Array.isArray(st.passes) && st.passes[i] != null ? st.passes[i] : PASSES));
    st.turn = Number.isInteger(st.turn) && st.turn >= 0 && st.turn < n ? st.turn : 0;
    st.subjects = st.subjects.filter((id) => SUBJ[id]);
    if (!st.subjects.length) st.subjects = DB.subjects.map((x) => x.id);
    st.tree = st.tree || {};
    st.connection = Number(st.connection) || 0;
    st.mode = ["tree", "speed"].includes(st.mode) ? st.mode : "wheel";
    st.game = ALL_GAMES.includes(st.game) ? st.game : st.mode;
    st.badges = Array.isArray(st.badges) ? st.badges : [];
    st.startedAt = st.startedAt || Date.now();
    st.id = st.id || newId();
    state = st;
    lastTreeCounts = {};
    markSeen(state.used);
    save();
    startGame();
    setTimeout(() => { toast(t("loaded", { names: joinNames(state.players) }), 3200); FX.fireworks(4); }, 400);
  };
  reader.readAsText(file);
}

function downloadStory() {
  const lines = [
    `Loopy Life · ${t("title")}`,
    `${joinNames(state.players)} · ${new Date(state.startedAt).toLocaleString()}`,
    `Scores: ${state.players.map((n, i) => `${n} ${state.scores[i]}`).join(" · ")} · ${t("connection")} ${state.connection}`,
    "",
  ];
  state.journal.forEach((j, i) => {
    const s = SUBJ[j.subject] || { name: j.subject };
    const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
    lines.push(`${i + 1}. [${sName(s)}] ${text}`);
    const by = journalBy(j);
    lines.push(`   ${by}${j.note ? ` · ${t("note")}: ${j.note}` : ""}`);
  });
  downloadFile(lines.join("\n"), `${fileBase()}.txt`, "text/plain");
}
