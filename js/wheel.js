/* Loopy Life · The wheel
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Wheel                                                              */
/* ------------------------------------------------------------------ */
// Wheel segments: the chosen subjects, with votes and challenges spread between them.
function wheelIds() {
  const extras = [];
  if (state.whoMode) extras.push("__who");
  if (state.dareMode) extras.push("__dare");
  const g = gameOf(state);
  const own = { date: "__date", couple: "__couple", coffee: "__work" }[g];
  if (!extras.length && !own) return state.subjects.slice();
  const nS = state.subjects.length;
  const reps = Math.max(1, Math.ceil(nS / 6)); // about 1 extra per 3 subjects
  const slots = [];
  for (let r = 0; r < reps; r++) slots.push(...extras);
  if (own) {
    // a first date or a couple: about a third of the wheel is their own questions, plus a few +18 segments;
    // a coffee break: about half the wheel is work-life questions
    const nOwn = g === "coffee" ? Math.max(3, nS) : Math.max(2, Math.ceil(nS / 2));
    const nSpicy = state.adult ? Math.max(1, Math.ceil(nS / 6)) : 0;
    const pool = [];
    for (let i = 0; i < nOwn + nSpicy; i++) pool.push(nSpicy && i % Math.ceil((nOwn + nSpicy) / nSpicy) === 1 ? "__spicy" : own);
    slots.push(...pool);
  }
  const ids = [];
  const every = state.subjects.length / slots.length;
  let k = 0;
  state.subjects.forEach((id, i) => {
    ids.push(id);
    while (k < slots.length && i + 1 >= Math.round(every * (k + 1))) ids.push(slots[k++]);
  });
  while (k < slots.length) ids.push(slots[k++]);
  return ids;
}

// The wheel face is drawn once (at angle 0) and turned with a CSS transform, so a spin only
// moves an image on the GPU instead of repainting gradients and text on every frame.
function setWheelRotation() {
  $("#wheel").style.transform = `rotate(${wheelAngle}rad)`;
}

function drawWheel() {
  drawWheelFace();
  setWheelRotation();
}

function drawWheelFace() {
  const canvas = $("#wheel");
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cx = size / 2, cy = size / 2, R = size / 2 - 6;
  const subs = wheelIds().map((id) => SUBJ[id]);
  const n = subs.length;
  const seg = (Math.PI * 2) / n;

  ctx.clearRect(0, 0, size, size);
  subs.forEach((s, i) => {
    const a0 = i * seg, a1 = a0 + seg;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a0, a1);
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
    g.addColorStop(0, shade(s.color, 0.35));
    g.addColorStop(1, s.color);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a0 + seg / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const emojiSize = Math.max(20, Math.min(46, 260 / n));
    ctx.font = `${emojiSize}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.fillText(s.emoji, R - 16, 0);
    // name, between the centre button and the emoji: shrink it, then shorten it, to fit
    const end = R - 26 - emojiSize;
    const room = end - R * 0.36;
    const maxH = 2 * Math.sin(seg / 2) * (end - room * 0.5) * 0.8; // segment height where the text sits
    let fs = Math.max(13, Math.min(26, 380 / n, maxH));
    let label = sShort(s);
    ctx.font = `600 ${fs}px Fredoka, system-ui, sans-serif`;
    while (ctx.measureText(label).width > room && fs > 13) {
      fs -= 1;
      ctx.font = `600 ${fs}px Fredoka, system-ui, sans-serif`;
    }
    while (ctx.measureText(label).width > room && label.length > 3) label = label.slice(0, -2).trimEnd() + "…";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 4;
    ctx.fillText(label, end, 1);
    ctx.restore();
  });

  // rim dots
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * (R - 3), cy + Math.sin(a) * (R - 3), 3.2, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? "#ffd166" : "#ffffff";
    ctx.fill();
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * amt);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function spin() {
  if (spinning || current) return;
  spinning = true;
  $("#spin-btn").disabled = true;
  const ids = wheelIds();
  const n = ids.length;
  const seg = (Math.PI * 2) / n;
  const idx = randInt(n);
  const jitter = (Math.random() - 0.5) * seg * 0.7;
  const target = -Math.PI / 2 - (idx + 0.5) * seg + jitter;
  const TAU = Math.PI * 2;
  const delta = (((target - wheelAngle) % TAU) + TAU) % TAU;
  const from = wheelAngle;
  const to = wheelAngle + TAU * (5 + Math.floor(Math.random() * 3)) + delta;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = reduced ? 1200 : 4200 + Math.random() * 900;
  const t0 = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4);

  let lastSeg = -1;
  function frame(now) {
    const t = Math.min(1, (now - t0) / dur);
    wheelAngle = from + (to - from) * ease(t);
    setWheelRotation();
    // little haptic tick when a new segment passes the pointer
    const under = Math.floor(((((-Math.PI / 2 - wheelAngle) % TAU) + TAU) % TAU) / seg);
    if (under !== lastSeg) { lastSeg = under; if (navigator.vibrate && t < 0.9) try { navigator.vibrate(4); } catch (e) {} }
    if (t < 1) requestAnimationFrame(frame);
    else {
      wheelAngle = to % TAU;
      spinning = false;
      $("#spin-btn").disabled = false;
      const subjectId = ids[idx];
      const s = SUBJ[subjectId];
      const r = $(".pointer").getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height, { count: 50, speed: 5, colors: [s.color, "#ffd166", "#ffffff"], stars: true, gravity: 0.05 });
      toast(`${s.emoji} ${sName(s)}!`, 1200);
      setTimeout(() => (isExtra(subjectId) ? openExtra(subjectId) : openCard(drawForGame(subjectId, gameDepths()))), 650);
    }
  }
  requestAnimationFrame(frame);
}
