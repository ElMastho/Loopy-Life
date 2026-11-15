/* Loopy Life · The tree
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Tree                                                               */
/* ------------------------------------------------------------------ */
function renderTree() {
  const svg = $("#tree");
  const poolsGrown = Object.keys(POOLS).filter((id) => state.tree[id] && state.tree[id][1] + state.tree[id][2] + state.tree[id][3] > 0);
  const subs = [...state.subjects, ...poolsGrown].map((id) => SUBJ[id]);
  const GROUND = 330;
  const CX = 200;
  let total = 0, rootsN = 0;
  subs.forEach((s) => { const c = counts(s.id); total += c[1] + c[2] + c[3]; rootsN += c[1]; });
  const prevTotal = lastTreeCounts.__total ?? total;

  const trunkH = 70 + Math.min(170, total * 5);
  const topY = GROUND - trunkH;
  const parts = [];

  // sky glow + ground
  parts.push(`<defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#ffd166" stop-opacity=".22"/><stop offset="100%" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
    <linearGradient id="bark" x1="0" x2="1"><stop offset="0" stop-color="#6b4226"/><stop offset=".5" stop-color="#9c6b43"/><stop offset="1" stop-color="#5a361f"/></linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1a"/><stop offset="1" stop-color="#1e140c" stop-opacity="0"/></linearGradient>
  </defs>`);
  parts.push(`<circle cx="${CX}" cy="${topY + 40}" r="${120 + total * 2}" fill="url(#glow)"/>`);
  parts.push(`<rect x="10" y="${GROUND}" width="380" height="90" rx="20" fill="url(#soil)"/>`);
  parts.push(`<ellipse cx="${CX}" cy="${GROUND}" rx="170" ry="12" fill="#3f7d4b"/>`);

  // roots: one per "light" answer (max 14)
  const rr = seeded(7);
  const rootCount = Math.min(14, rootsN);
  for (let i = 0; i < Math.max(rootCount, 3); i++) {
    const side = i % 2 ? 1 : -1;
    const spread = 20 + rr() * 110;
    const depth = 30 + rr() * 50;
    const x1 = CX + side * (6 + rr() * 8);
    const x2 = CX + side * spread;
    const y2 = GROUND + depth;
    const len = Math.round(spread + depth);
    const isNew = i >= (lastTreeCounts.__roots ?? rootCount) && i < rootCount;
    const real = i < rootCount;
    parts.push(`<path d="M${x1},${GROUND} Q${CX + side * spread * 0.4},${GROUND + depth * 0.9} ${x2},${y2}" stroke="${real ? "#8a5a36" : "#5a3d26"}" stroke-width="${real ? 4 : 2}" fill="none" stroke-linecap="round" opacity="${real ? 1 : 0.5}" class="${isNew ? "grow-line" : ""}" style="--len:${len * 1.3}"/>`);
  }

  const sway = [];
  // trunk
  sway.push(`<path d="M${CX - 16},${GROUND} C${CX - 12},${GROUND - trunkH * 0.5} ${CX - 7},${topY + 20} ${CX - 4},${topY} L${CX + 4},${topY} C${CX + 7},${topY + 20} ${CX + 12},${GROUND - trunkH * 0.5} ${CX + 16},${GROUND} Z" fill="url(#bark)"/>`);

  // branches: only subjects that have started growing get a branch, spread along the trunk
  const grown = subs.filter((s) => { const c = counts(s.id); return c[1] + c[2] + c[3] > 0; });
  const n = grown.length;
  grown.forEach((s, i) => {
    const c = counts(s.id);
    const answered = c[1] + c[2] + c[3];
    const prev = lastTreeCounts[s.id] || { 1: c[1], 2: c[2], 3: c[3] };
    const side = i % 2 === 0 ? -1 : 1;
    const frac = n === 1 ? 0.75 : 0.3 + 0.68 * (i / (n - 1)); // first grown branch is lowest
    const ay = GROUND - trunkH * frac;
    const ax = CX + side * (3 + 10 * (1 - frac));
    const L = Math.min(150, 40 + answered * 13) * (1.05 - frac * 0.35);
    const ang = -(Math.PI / 2) + side * (1.25 - frac * 0.75) * (0.92 + 0.16 * seeded(i + 1)());
    const ex = ax + Math.cos(ang) * L;
    const ey = ay + Math.sin(ang) * L;
    const mx = ax + Math.cos(ang) * L * 0.5 - side * 8;
    const my = ay + Math.sin(ang) * L * 0.5 + 10;
    const w = Math.min(9, 3 + answered * 0.5);
    const newBranch = (prev[1] + prev[2] + prev[3]) === 0 || !lastTreeCounts[s.id];
    sway.push(`<path d="M${ax},${ay} Q${mx},${my} ${ex},${ey}" stroke="#7a4e2d" stroke-width="${w}" fill="none" stroke-linecap="round" class="${newBranch ? "grow-line" : ""}" style="--len:${L * 1.3}"/>`);

    const rnd = seeded(1000 + subs.indexOf(s) * 97);
    const at = (t) => {
      // point along the quadratic curve
      const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * ex;
      const y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * ey;
      return [x, y];
    };
    const spot = () => {
      const t = 0.35 + rnd() * 0.7;
      const [x, y] = at(Math.min(1, t));
      const r = 6 + rnd() * 16;
      const a = rnd() * Math.PI * 2;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, rnd() * 360];
    };

    // depth 1 → small light-green leaves
    for (let k = 0; k < c[1]; k++) {
      const [x, y, rot] = spot();
      sway.push(`<g class="${k >= prev[1] ? "grow" : ""}"><ellipse cx="${x}" cy="${y}" rx="6" ry="3.4" fill="#9be38f" transform="rotate(${rot} ${x} ${y})"/></g>`);
    }
    // depth 2 → bigger leaves in the subject color
    for (let k = 0; k < c[2]; k++) {
      const [x, y, rot] = spot();
      sway.push(`<g class="${k >= prev[2] ? "grow" : ""}"><ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="${s.color}" opacity=".92" transform="rotate(${rot} ${x} ${y})"/><line x1="${x - 7}" y1="${y}" x2="${x + 7}" y2="${y}" stroke="rgba(255,255,255,.5)" stroke-width="1" transform="rotate(${rot} ${x} ${y})"/></g>`);
    }
    // depth 3 → blossoms
    for (let k = 0; k < c[3]; k++) {
      const [x, y] = spot();
      let petals = "";
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        petals += `<circle cx="${x + Math.cos(a) * 5}" cy="${y + Math.sin(a) * 5}" r="4.4" fill="${shade(s.color, 0.45)}"/>`;
      }
      sway.push(`<g class="${k >= prev[3] ? "grow" : ""}">${petals}<circle cx="${x}" cy="${y}" r="3" fill="#ffd166"/></g>`);
    }
    // subject marker at the tip
    sway.push(`<text x="${ex + Math.cos(ang) * 10}" y="${ey + Math.sin(ang) * 10 + 5}" font-size="16" text-anchor="middle">${s.emoji}</text>`);
  });

  parts.push(`<g class="sway">${sway.join("")}</g>`);

  if (total === 0) {
    parts.push(`<text x="${CX}" y="${GROUND + 60}" text-anchor="middle" fill="#c9bfe0" font-size="14" font-family="Fredoka, sans-serif">${esc(t("seed"))}</text>`);
  } else {
    parts.push(`<text x="${CX}" y="${GROUND + 70}" text-anchor="middle" fill="#c9bfe0" font-size="13" font-family="Fredoka, sans-serif">${esc(t("treeStats", { total, roots: rootsN, leaves: total - rootsN }))}</text>`);
  }

  svg.innerHTML = parts.join("");

  // remember what we drew, so only new parts animate next time
  lastTreeCounts = { __total: total, __roots: rootCount };
  subs.forEach((s) => { const c = counts(s.id); lastTreeCounts[s.id] = { 1: c[1], 2: c[2], 3: c[3] }; });
  if (total > prevTotal) { /* new growth already animated via classes */ }

  renderBranchList();
  syncTreeCopies();
}

// The same tree, small in the top bar and big in the story and the summary. Gradient ids get a suffix per copy
// (a gradient defined inside a hidden svg doesn't paint).
function syncTreeCopies() {
  const src = $("#tree").innerHTML;
  $$(".tree-copy").forEach((svg, i) => {
    svg.innerHTML = src.replace(/id="(glow|bark|soil)"/g, `id="$1-c${i}"`).replace(/url\(#(glow|bark|soil)\)/g, `url(#$1-c${i})`);
  });
  $("#mini-tree").hidden = state.mode === "tree";
}

function renderBranchList() {
  const list = $("#branch-list");
  list.innerHTML = "";
  const icons = { 1: "🌱", 2: "🌿", 3: "🌸" };
  state.subjects.forEach((id) => {
    const s = SUBJ[id];
    const c = counts(id);
    const lvl = treeLevel(id);
    const answered = c[1] + c[2] + c[3];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "branch";
    b.style.setProperty("--c", s.color);
    b.innerHTML = `<span class="emo">${s.emoji}</span><span>${esc(sName(s))}<small>${t("lvl" + lvl)} · ${t("nAnswered", { n: answered })}</small></span><span class="lvl">${icons[lvl]}</span>`;
    b.addEventListener("click", () => growBranch(id, b));
    list.appendChild(b);
  });
  Object.values(EXTRAS).forEach((x) => {
    if (!(x.kind === "who" ? state.whoMode : state.dareMode)) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "branch extra";
    b.style.setProperty("--c", x.color);
    const n = state.journal.filter((j) => j.subject === x.id).length;
    b.innerHTML = `<span class="emo">${x.emoji}</span><span>${esc(sName(x))}<small>${esc(t("nAnswered", { n }))}</small></span>`;
    b.addEventListener("click", () => { if (current) return; FX.sparkleEl(b, [x.color, "#ffffff"]); setTimeout(() => openExtra(x.id), 200); });
    list.appendChild(b);
  });
}

function growBranch(subjectId, el) {
  if (current) return;
  if (el) FX.sparkleEl(el, [SUBJ[subjectId].color, "#ffffff"]);
  const lvl = treeLevel(subjectId);
  setTimeout(() => openCard(drawForGame(subjectId, [lvl])), 200);
}
