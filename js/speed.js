/* Loopy Life · The speed game: countdown and streaks
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Speed: short questions in a row, a countdown on each               */
/* ------------------------------------------------------------------ */
let timerEnd = 0, timerTick = null, speedPaused = true, speedNext = null;

// Half from the speed pack, half the shortest light questions of the chosen subjects.
function drawSpeed(excludeId) {
  if (randInt(2)) {
    const subj = pick(state.subjects);
    const used = new Set(state.used);
    const short = DB.questions.filter((q) => q.subject === subj && q.depth === 1 && allowedQ(q) && !used.has(q.id) && q.id !== excludeId && qText(q).length <= 60);
    if (short.length) {
      const seen = seenSet();
      const fresh = short.filter((q) => !seen.has(q.id));
      return pick(fresh.length ? fresh : short);
    }
  }
  return drawPool("__speed", [1], excludeId);
}

function openSpeedCard(excludeId) {
  if (current) return;
  speedPaused = false;
  clearTimeout(speedNext);
  openCard(drawSpeed(excludeId));
  startTimer();
}

// After an answer (or a late one), the next player's question comes on its own.
// After an answer (or a late one), the next player taps GO to discover their question.
function speedNextSoon() {
  clearTimeout(speedNext);
  speedPaused = true;
  renderSpeedView();
}

const timeLeft = () => Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));

function startTimer() {
  stopTimer();
  const total = (state.timer || 15) * 1000;
  timerEnd = Date.now() + total;
  let lastSec = -1;
  const tick = () => {
    const ms = Math.max(0, timerEnd - Date.now());
    const sec = Math.ceil(ms / 1000);
    $("#timer-fill").style.width = `${(ms / total) * 100}%`;
    $("#timer-num").textContent = sec;
    $("#timer").classList.toggle("hurry", sec <= 3);
    if (sec !== lastSec && sec <= 3 && sec > 0 && navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* ignore */ } }
    lastSec = sec;
    if (ms <= 0) timeUp();
  };
  tick();
  timerTick = setInterval(tick, 100);
}

function stopTimer() {
  clearInterval(timerTick);
  timerTick = null;
}

// Too late: no points, the streak breaks, and the next player gets a question.
function timeUp() {
  stopTimer();
  if (!current) return;
  const { q, player } = current;
  state.used.push(q.id);
  markSeen([q.id]);
  state.streak = 0;
  state.turn = nextTurn(player);
  save();
  $("#card").classList.add("late");
  $("#done-btn").disabled = true;
  $("#skip-btn").disabled = true;
  $("#q-for").textContent = t("tooLate");
  if (navigator.vibrate) { try { navigator.vibrate([80, 60, 80]); } catch (e) { /* ignore */ } }
  setTimeout(() => {
    $("#card").classList.remove("late");
    closeCard();
    updateScores(false);
    renderSpeedView();
    speedNextSoon();
  }, 1100);
}

function pauseSpeed() {
  speedPaused = true;
  clearTimeout(speedNext);
  closeCard();
  renderSpeedView();
}

function renderSpeedView() {
  if (!state || state.mode !== "speed") return;
  $("#speed-go").textContent = t("speedGo");
  $("#speed-go").hidden = !speedPaused;
  $("#speed-streak").textContent = `${t("speedStreak", { n: state.streak || 0 })} · ${t("speedBest", { n: state.bestStreak || 0 })}`;
  $("#speed-time").textContent = `⏱️ ${state.timer || 15} s`;
}
