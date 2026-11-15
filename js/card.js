/* Loopy Life · The question card
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Question card                                                      */
/* ------------------------------------------------------------------ */
// Writes the current question into the card, in the current language.
function fillCard() {
  if (!current) return;
  const g0 = gameOf(state);
  const { q, player: p, kind } = current;
  const s = SUBJ[q.subject];
  const who = `<b style="color:${pDark(p)}">${esc(state.players[p])}</b>`;
  $("#q-subject").textContent = `${s.emoji} ${sName(s)}`;
  $("#q-text").textContent = qText(q);
  $("#passes-wrap").hidden = !!kind;
  $("#bonus-help").hidden = !!kind;
  if (kind === "who") {
    $("#q-depth").textContent = t("whoPts");
    $("#q-for").textContent = t("whoFor");
  } else if (kind === "dare") {
    $("#q-depth").textContent = t("darePts");
    $("#q-for").innerHTML = esc(t("dareFor", { name: "\u0000" })).replace("\u0000", who);
  } else {
    $("#q-depth").textContent = g0 === "speed" ? t("speedPts") : `${t("depth" + q.depth)} · +${POINTS[q.depth]}`;
    const key = { bluff: "bluffFor", bet: "betFor" }[current.game] || (g0 === "speed" ? "speedFor" : "forWho");
    $("#q-for").innerHTML = esc(t(key, { name: "\u0000" })).replace("\u0000", who);
    if (current.game === "duel") {
      const r = current.rival;
      $("#q-for").innerHTML = esc(t("duelFor", { a: "\u0001", b: "\u0002" }))
        .replace("\u0001", who).replace("\u0002", `<b style="color:${pDark(r)}">${esc(state.players[r])}</b>`);
    }
  }
  const g = gameOf(state);
  const joker = !kind && (g === "date" || q.subject === "__spicy");
  if (g === "car" && p === state.driver) $("#q-for").innerHTML = esc(t("driverFor", { name: "\u0000" })).replace("\u0000", who);
  $("#bonus-help").hidden = !!kind || !!current.game || g === "car";
  $("#q-note").hidden = g === "car" || g === "speed";
  $("#pause-btn").hidden = g !== "speed";
  $("#timer").hidden = g !== "speed";
  if (g === "speed") $("#bonus-help").hidden = true;
  $("#speak-btn").hidden = !("speechSynthesis" in window); // read on demand in every game; the option reads each question on its own
  $("#done-btn").disabled = false;
  renderBonuses();
  if (!kind && g === "date" && !state.guessMode) { const step = $("#guess-step"); step.hidden = false; step.textContent = t("dateStep"); }
  $("#pass-label").textContent = kind ? t("another") : joker ? t("joker") : t("pass");
  $("#passes-wrap").hidden = true; // passing is free in every game
  $("#done-btn").textContent = kind ? t("next") : t("answered");
  $("#passes").textContent = state.passes[p];
  $("#skip-btn").disabled = false;
}

// A chip with a player's colour dot and name, for compact rows.
const nameChip = (o) => `<span class="pdot" style="background:${pHex(o)}"></span><span>${esc(state.players[o])}</span>`;

// Bonus chips: one "guessed it" per other player, plus "didn't know" and "answered too".
function renderBonuses() {
  const { q, player: p, bonuses, kind } = current;
  const os = others(p);
  const step = $("#guess-step");
  step.hidden = !state.guessMode || !!kind;
  if (state.guessMode && !kind) {
    const names = os.length >= COMPACT_FROM - 1 ? t("everyoneElse") : joinNames(os.map((o) => state.players[o]));
    step.textContent = t("guessStep", { names, name: state.players[p] });
  }
  const groups = []; // [{ label, chips }]
  if (current.game) return renderFunGame();
  if (kind === "who") {
    groups.push({ label: t("whoChosenLabel"), chips: state.players.map((_, o) => ({ key: `chosen:${o}`, html: nameChip(o), small: true })) });
    groups.push({ chips: [{ key: "unanimous", html: `<span>${esc(t("whoUnanimous"))}</span>` }] });
    return paintBonuses(groups);
  }
  if (kind === "dare") {
    groups.push({ chips: [
      { key: "dare", html: `<span>${esc(t("dareDone", { name: state.players[p] }))}</span>` },
      { key: "laugh", html: `<span>${esc(t("dareLaugh"))}</span>` },
    ] });
    return paintBonuses(groups);
  }
  if (gameOf(state) === "speed") {
    // no time for guesses: only "didn't know!"
    groups.push({ chips: [{ key: "wow", html: `😮 <span>${esc(t("wow"))}</span>` }] });
    return paintBonuses(groups);
  }
  const compact = nPlayers() >= COMPACT_FROM;
  const guessPts = state.guessMode ? GUESS_MODE_POINTS : GUESS_POINTS;
  const chips = [];
  if (compact) {
    groups.push({ label: t("guessWhoLabel", { n: guessPts }), chips: os.map((o) => ({ key: `guess:${o}`, html: nameChip(o), small: true })) });
  } else {
    os.forEach((o) => chips.push({
      key: `guess:${o}`,
      html: `🎯 <span>${esc(state.guessMode
        ? t("guessedRight", { name: state.players[o], n: GUESS_MODE_POINTS })
        : t("guessed", { name: state.players[o] }))}</span>`,
    }));
  }
  if (state.guessMode) {
    chips.push({ key: "nobody", html: `<span>${esc(t("nobodyGuessed", { n: SURPRISE_POINTS, name: state.players[p] }))}</span>` });
  }
  chips.push({ key: "wow", html: `😮 <span>${esc(t("wow"))}</span>` });
  const tooLabel = os.length === 1
    ? t("answeredToo", { name: state.players[os[0]], n: POINTS[q.depth] })
    : t("everyoneToo", { n: POINTS[q.depth] });
  chips.push({ key: "both", html: `🔁 <span>${esc(tooLabel)}</span>` });
  groups.push({ chips });
  paintBonuses(groups);
}

function paintBonuses(groups) {
  const { bonuses } = current;
  const row = $("#bonus-row");
  row.innerHTML = "";
  groups.forEach(({ label, chips }, gi) => {
    if (!label && gi > 0) {
      const br = document.createElement("span");
      br.className = "bonus-break";
      row.appendChild(br);
    }
    if (label) {
      const l = document.createElement("p");
      l.className = "bonus-label";
      l.textContent = label;
      row.appendChild(l);
    }
    chips.forEach(({ key, html, small }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bonus" + (small ? " name" : "") + (bonuses.has(key) ? " on" : "");
      b.innerHTML = html;
      b.addEventListener("click", () => {
        b.classList.toggle("on");
        if (b.classList.contains("on")) { bonuses.add(key); FX.sparkleEl(b); }
        else bonuses.delete(key);
      });
      row.appendChild(b);
    });
  });
}

function openCard(q, kind) {
  current = { q, player: state.turn, bonuses: new Set(kind === "dare" ? ["dare"] : []), kind };
  const g = gameOf(state);
  if (!kind && FUN_GAMES.includes(g) && nPlayers() >= 2) {
    current.game = g;
    if (g === "bluff") { current.bluff = randInt(2) === 1; current.peek = false; current.revealed = false; }
    if (g === "duel") { const os = others(state.turn); current.rival = os[randInt(os.length)]; }
    if (g === "bet") current.bets = {};
  }
  fillCard();

  const card = $("#card");
  const s = SUBJ[q.subject];
  $("#q-note").value = "";
  card.style.setProperty("--c", s.color);
  $("#card-overlay").style.setProperty("--c", s.color);

  card.classList.remove("flipped");
  $("#card-overlay").classList.remove("hidden");
  // restart the flip animation
  card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
  setTimeout(() => FX.sparkleEl($("#q-text"), [s.color, "#ffd166", "#ffffff"]), 250);
  if (state.voice) setTimeout(speakCurrent, 500);
}

// Reads the question aloud (the "read aloud" option), with the name of who answers.
function speakCurrent() {
  if (!current || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const text = `${$("#q-for").textContent}. ${qText(current.q)}`.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "").trim();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG === "fr" ? "fr-FR" : "en-US";
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

function closeCard() {
  stopTimer();
  try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  $("#card-overlay").classList.add("hidden");
  current = null;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // the keyboard drives the game again
}
