/* Loopy Life · The shareable picture of a story
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Shareable picture of the story                                     */
/* ------------------------------------------------------------------ */
function wrapText(ctx, text, x, y, maxW, lineH, maxLines = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const tryLine = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryLine).width > maxW && line) { lines.push(line); line = w; } else line = tryLine;
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return y + lines.length * lineH;
}

function treeImage() {
  renderTree();
  const svg = $("#tree").cloneNode(true);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "400");
  svg.setAttribute("height", "420");
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function makeStoryImage() {
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  try { await document.fonts.load("700 40px Fredoka"); } catch (e) { /* ignore */ }
  const F = (w, px) => `${w} ${px}px Fredoka, "Segoe UI", system-ui, sans-serif`;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1b1440"); bg.addColorStop(1, "#43206e");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const rnd = seeded(42);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.5})`;
    ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, 1 + rnd() * 2.2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166"; ctx.font = F(600, 38);
  ctx.fillText("∞ Loopy Life", W / 2, 90);
  ctx.fillStyle = "#ffffff"; ctx.font = F(700, 64);
  ctx.fillText(t("title"), W / 2, 170);
  ctx.fillStyle = "#c9bfe0"; ctx.font = F(500, 34);
  const day = new Date(state.startedAt || Date.now()).toLocaleDateString(LANG === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  wrapText(ctx, `${state.name ? state.name + " · " : ""}${joinNames(state.players)} · ${day}`, W / 2, 230, W - 160, 42, 2);

  const img = await treeImage();
  if (img) ctx.drawImage(img, (W - 480) / 2, 282, 480, 504);

  const lvl = Math.floor(state.connection / levelSize()) + 1;
  ctx.fillStyle = "#ffd166"; ctx.font = F(700, 52);
  ctx.fillText(`🎆 ${t("imgLevel", { n: lvl })}`, W / 2, 836);

  const j = state.journal.filter((e) => !e.kind);
  const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
  const stats = [[j.length, t("imgQuestions")], [(state.badges || []).length, t("imgBadges")], [mins, t("imgMinutes")]];
  const bw = 280, gap = 30, x0 = (W - (bw * 3 + gap * 2)) / 2;
  stats.forEach(([v, l], i) => {
    const x = x0 + i * (bw + gap);
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, 860, bw, 100, 24); else ctx.rect(x, 860, bw, 100);
    ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = F(700, 46);
    ctx.fillText(String(v), x + bw / 2, 911);
    ctx.fillStyle = "#c9bfe0"; ctx.font = F(500, 26);
    ctx.fillText(l, x + bw / 2, 945);
  });

  // up to three moments: what surprised us (😮), the notes, then the deepest answers
  const marked = [...j].reverse().filter((e) => e.bonuses.includes("wow") || e.note);
  const deepest = [...j].reverse().filter((e) => e.depth === 3 && !marked.includes(e));
  const moments = [...marked, ...deepest].slice(0, 3);
  if (!moments.length && state.journal.length) moments.push(state.journal[state.journal.length - 1]);
  if (moments.length) {
    ctx.fillStyle = "#ffd166"; ctx.font = F(600, 30);
    ctx.fillText(`✨ ${t(moments.length > 1 ? "imgMoments" : "imgBest")}`, W / 2, 1012);
    let y = 1058;
    ctx.textAlign = "left";
    moments.forEach((e) => {
      const text = QBYID[e.qid] ? qText(QBYID[e.qid]) : tr(e.text);
      const who = state.players[e.player] || "";
      ctx.fillStyle = pHex(e.player || 0); ctx.font = F(600, 28);
      ctx.fillText(`${e.bonuses.includes("wow") ? "😮" : e.note ? "📝" : "🌊"} ${who}`, 90, y);
      ctx.fillStyle = "#ffffff"; ctx.font = F(500, 28);
      y = wrapText(ctx, e.note ? `“${e.note}”` : text, 90, y + 36, W - 180, 34, 1) + 18;
    });
    ctx.textAlign = "center";
  }
  ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = F(500, 26);
  ctx.fillText("elmastho.github.io/Loopy-Life", W / 2, H - 28);
  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}

async function shareStoryImage() {
  const blob = await makeStoryImage();
  if (!blob) return;
  const name = `${fileBase()}.png`;
  try {
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Loopy Life · ${t("title")}` });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  downloadFile(blob, name, "image/png");
}
