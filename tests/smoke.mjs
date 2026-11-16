// Browser test of the whole game: node tests/smoke.mjs
// Serves the folder, plays a few turns of every game on a phone, checks the wheel, the icebreaker,
// the panels and the language switch, and fails on any page error.
// Needs Playwright with Chromium (npm install --no-save playwright && npx playwright install chromium).
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); }
catch { playwright = createRequire(process.env.PLAYWRIGHT_MODULES || "/opt/node22/lib/node_modules/")("playwright"); }

// A tiny static server for the folder.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new globalThis.URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html";
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const errs = [];
const fails = [];
const check = (ok, what) => { console.log(`${ok ? "ok  " : "FAIL"} ${what}`); if (!ok) fails.push(what); };
const browser = await playwright.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function newPage(viewport, extra = {}) {
  const ctx = await browser.newContext({ locale: "fr-FR", viewport, ...extra });
  // Google Fonts may be out of reach in CI: never wait for it.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => { if (m.type() === "error" && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(() => { if (window.speechSynthesis) window.speechSynthesis.speak = () => {}; });
  return p;
}

async function setup(p, game, names) {
  await p.goto(BASE); await p.evaluate(() => localStorage.clear());
  await p.goto(BASE); await p.waitForSelector(".subject", { state: "attached" });
  while ((await p.$$("#players-list input")).length < names.length) await p.click("#add-player");
  while ((await p.$$("#players-list input")).length > names.length) await p.click("#players-list .player-row:last-child .remove");
  const ins = await p.$$("#players-list input");
  for (let i = 0; i < names.length; i++) await ins[i].fill(names[i]);
  await p.click(".next-step"); await p.click(`.game-card[data-game="${game}"]`); await p.waitForTimeout(150);
  await p.click("#start-btn"); await p.waitForTimeout(250);
  if (await p.isVisible("#suggest-overlay")) await p.click("#suggest-go");
  await p.waitForTimeout(300);
}

// Players and game chosen, stopped on the settings step.
async function setupOnly(p, game, names) {
  await p.goto(BASE); await p.evaluate(() => localStorage.clear());
  await p.goto(BASE); await p.waitForSelector(".subject", { state: "attached" });
  while ((await p.$$("#players-list input")).length < names.length) await p.click("#add-player");
  while ((await p.$$("#players-list input")).length > names.length) await p.click("#players-list .player-row:last-child .remove");
  const ins = await p.$$("#players-list input");
  for (let i = 0; i < names.length; i++) await ins[i].fill(names[i]);
  await p.click(".next-step"); await p.click(`.game-card[data-game="${game}"]`); await p.waitForTimeout(150);
}

async function play(p, game, names) {
  await setup(p, game, names);
  let answered = 0;
  for (let turn = 0; turn < 3; turn++) {
    if (game === "speed") await p.click("#speed-go");
    else if (game === "tree") await p.click("#branch-list .branch:not(.extra)");
    else await p.click("#spin-btn");
    await p.waitForSelector("#card-overlay:not(.hidden)", { timeout: 10000 });
    await p.waitForTimeout(150);
    const reveal = await p.$(".reveal-btn"); if (reveal) await reveal.click();
    const bet = await p.$(".bet-seg button"); if (bet) await bet.click();
    if (await p.isEnabled("#done-btn")) { await p.click("#done-btn"); answered++; }
    await p.waitForTimeout(500);
    for (const id of ["#levelup-overlay", "#badge-overlay"]) if (await p.isVisible(id).catch(() => false)) await p.click(`${id} button`).catch(() => {});
    await p.waitForSelector("#card-overlay.hidden", { state: "attached", timeout: 5000 }).catch(() => {});
  }
  check(answered === 3, `${game}: 3 questions answered (${answered})`);
}

const phone = await newPage({ width: 390, height: 844 });
for (const [game, names] of [
  ["wheel", ["Thomas", "Maya"]], ["tree", ["Thomas", "Maya"]], ["bluff", ["A", "B", "C"]],
  ["duel", ["A", "B", "C"]], ["bet", ["A", "B", "C"]], ["date", ["Thomas", "Maya"]],
  ["couple", ["Thomas", "Maya"]], ["car", ["A", "B", "C"]], ["speed", ["A", "B"]], ["coffee", ["A", "B", "C", "D"]],
  ["debate", ["A", "B", "C", "D", "E"]], ["honor", ["Lou", "Sam", "Noa"]],
]) await play(phone, game, names);

// In the spotlight: the others get questions about that person, who gets their own.
const spot = await phone.evaluate(() => {
  const out = { others: true, own: true, named: true };
  for (let k = 0; k < 60; k++) {
    state.turn = k % state.players.length;
    const q = drawQuestion("__honor", [1, 2, 3]);
    if (state.turn === state.star ? !q.star : q.star) (state.turn === state.star ? (out.own = false) : (out.others = false));
    if (!q.star && !qText(q).includes(state.players[state.star])) out.named = false;
  }
  return out;
});
check(spot.others && spot.own, "spotlight: the others talk about them, they get their own questions");
check(spot.named, "spotlight: questions name the person in the spotlight");

// Debate: everyday debates only, until the whole group agrees to society or politics.
await setup(phone, "debate", ["A", "B", "C"]);
const calm = await phone.evaluate(() => [...new Set(wheelIds())].filter((id) => id !== "__who").sort().join(","));
check(calm === "__debate", `debate: everyday debates only by default (${calm})`);
await setupOnly(phone, "debate", ["A", "B", "C"]);
await phone.click('label[for="politics-mode"]'); await phone.waitForTimeout(150);
check(await phone.isVisible("#debate-overlay"), "debate: politics asks everyone to agree first");
check(!(await phone.isChecked("#politics-mode")), "debate: politics stays off until confirmed");
await phone.click("#debate-ok"); await phone.waitForTimeout(150);
check(await phone.isChecked("#politics-mode"), "debate: politics on once confirmed");
await phone.click("#start-btn"); await phone.waitForTimeout(250);
if (await phone.isVisible("#suggest-overlay")) await phone.click("#suggest-go");
await phone.waitForTimeout(300);
const ids = await phone.evaluate(() => [...new Set(wheelIds())].filter((id) => id !== "__who").sort().join(","));
check(ids === "__debate,__politics", `debate: politics segments on the wheel (${ids})`);

// The wheel stops on the subject of the card it opens.
await setup(phone, "wheel", ["Thomas", "Maya"]);
await phone.click("#spin-btn");
await phone.waitForSelector("#card-overlay:not(.hidden)", { timeout: 10000 });
const landed = await phone.evaluate(() => {
  const ids = wheelIds(), TAU = Math.PI * 2, seg = TAU / ids.length;
  const under = Math.floor(((((-Math.PI / 2 - wheelAngle) % TAU) + TAU) % TAU) / seg);
  return { under: SUBJ[ids[under]].emoji, card: document.querySelector("#q-subject").textContent };
});
check(landed.card.includes(landed.under), `wheel lands on the subject of its card (${landed.under} / ${landed.card})`);

// The icebreaker, driven from the keyboard on a computer.
const desk = await newPage({ width: 1280, height: 800 });
await setup(desk, "team", ["Julie", "Marc", "Sofia", "Karim", "Léa", "Tom"]);
await desk.keyboard.press("Space"); await desk.waitForTimeout(300);
for (let i = 0; i < 3; i++) { await desk.keyboard.press("Space"); await desk.waitForTimeout(80); }
await desk.keyboard.press("s");
check((await desk.textContent("#team-progress")).includes("3"), "icebreaker: 3 answers counted");
await desk.keyboard.press("ArrowLeft"); await desk.keyboard.press("Space"); await desk.waitForTimeout(100);
check((await desk.textContent("#team-progress")).includes("4"), "icebreaker: going back then answering");

// Quick start from step 1, then the keyboard on a computer: Space spins, Enter answers.
await desk.goto(BASE); await desk.evaluate(() => localStorage.clear());
await desk.goto(BASE); await desk.waitForSelector(".subject", { state: "attached" });
check(await desk.isVisible("#quick-hint"), "first visit: the quick start is suggested");
await desk.click("#quick-btn"); await desk.waitForTimeout(400);
check(await desk.isVisible("#view-wheel"), "quick start opens the wheel");
await desk.keyboard.press("Space");
await desk.waitForSelector("#card-overlay:not(.hidden)", { timeout: 10000 });
check(true, "Space spins the wheel");
await desk.keyboard.press("Enter"); await desk.waitForTimeout(600);
check((await desk.evaluate(() => state.journal.length)) === 1, "Enter means answered");
await desk.click(".game-actions .text-size-btn"); await desk.waitForTimeout(350);
check(await desk.isVisible("#size-bar.open"), "text size: the bar slides up");
await desk.click('#size-presets [data-size="150"]');
check((await desk.evaluate(() => document.documentElement.style.fontSize)) === "150%", "text size: 150 %");
await desk.fill("#size-range", "180");
check((await desk.evaluate(() => document.documentElement.style.fontSize)) === "180%", "text size: the slider");
await desk.click('#size-presets [data-size="100"]');
check((await desk.evaluate(() => document.documentElement.style.fontSize)) === "", "text size: back to 100 % in one tap");
await desk.keyboard.press("Escape"); await desk.waitForTimeout(350);
check(!(await desk.isVisible("#size-bar")), "text size: the bar closes");
await desk.goto(BASE); await desk.waitForSelector(".subject", { state: "attached" });
check(!(await desk.isVisible("#quick-hint")), "the quick start hint goes away once played");

// A tablet: the card turns around for the person across.
const tablet = await newPage({ width: 820, height: 1180 }, { hasTouch: true, isMobile: true });
await setup(tablet, "wheel", ["Thomas", "Maya"]);
await tablet.click("#spin-btn"); await tablet.waitForSelector("#card-overlay:not(.hidden)", { timeout: 10000 });
await tablet.click("#flip-btn");
check(await tablet.evaluate(() => document.querySelector("#card").classList.contains("flipped")), "tablet: the card turns around");

// All ages: no love subject, no deep, sensitive or grown-up question can come up.
await phone.goto(BASE); await phone.evaluate(() => localStorage.clear());
await phone.goto(BASE); await phone.waitForSelector(".subject", { state: "attached" });
await phone.click(".next-step"); await phone.click('.game-card[data-game="wheel"]'); await phone.waitForTimeout(150);
await phone.click("#more-options summary"); await phone.click('label[for="family-mode"]');
check(await phone.isHidden('#subject-grid .subject[data-id="love"]'), "all ages: the love subject is left out");
await phone.click("#start-btn"); await phone.waitForTimeout(250);
if (await phone.isVisible("#suggest-overlay")) await phone.click("#suggest-go");
await phone.waitForTimeout(300);
const familyOk = await phone.evaluate(() => {
  const all = [...DB.questions, ...(DB.who || []), ...(DB.challenges || [])];
  const bad = all.filter((q) => allowedQ(q) && (q.sensitive || q.mature || q.depth === 3 || q.subject === "love"));
  const drawn = Array.from({ length: 200 }, () => drawQuestion(pick(state.subjects), depthsFor("mixed")));
  return state.family && !bad.length && drawn.every((q) => q && !q.sensitive && !q.mature && q.depth < 3 && q.subject !== "love");
});
check(familyOk, "all ages: 200 draws stay suitable for children");

// The card: a follow-up, and 👎 replaces the question for good.
await phone.click("#spin-btn"); await phone.waitForSelector("#card-overlay:not(.hidden)", { timeout: 10000 });
await phone.click("#follow-btn");
check((await phone.textContent("#follow-text")).length > 2, "follow-up shown on the card");
const before = await phone.evaluate(() => current.q.id);
await phone.click("#dislike-btn"); await phone.waitForTimeout(300);
const after = await phone.evaluate((id) => ({ id: current.q.id, allowed: allowedQ(QBYID[id]) }), before);
check(after.id !== before && !after.allowed, "👎 replaces the question and keeps it away");

// Backups: the summary suggests saving a story; all the stories go in one file and come back from it.
await play(phone, "wheel", ["Thomas", "Maya"]);
await phone.click("#finish-btn"); await phone.waitForTimeout(500);
check(await phone.isVisible("#backup-nudge"), "summary: suggests saving the story to a file");
await phone.click("#restart-btn").catch(() => {}); await phone.waitForTimeout(300);
if (await phone.isVisible("#home-btn")) await phone.click("#home-btn");
await phone.goto(BASE); await phone.waitForSelector(".subject", { state: "attached" }); await phone.waitForTimeout(300);
if (await phone.isVisible("#home-btn")) { await phone.click("#home-btn"); await phone.waitForTimeout(300); }
await phone.click("#stories-btn"); await phone.waitForTimeout(400);
const nBefore = await phone.$$eval("#stories-list > .story", (e) => e.length);
const [dl] = await Promise.all([phone.waitForEvent("download"), phone.click("#backup-all")]);
const backupPath = await dl.path();
await phone.evaluate(() => new Promise((r) => { const q = indexedDB.open("loopy-life"); q.onsuccess = () => { const tx = q.result.transaction("stories", "readwrite"); tx.objectStore("stories").clear(); tx.oncomplete = r; }; }));
await phone.click("#stories-close");
await phone.setInputFiles("#story-file", backupPath); await phone.waitForTimeout(800);
const nAfter = await phone.$$eval("#stories-list > .story", (e) => e.length);
check(nBefore > 0 && nAfter === nBefore, `all stories saved and loaded back (${nBefore} → ${nAfter})`);
await phone.click("#stories-close");

// Panels and language.
const home = async () => { await phone.goto(BASE); await phone.waitForSelector(".subject", { state: "attached" }); await phone.waitForTimeout(300); if (await phone.isVisible("#home-btn")) { await phone.click("#home-btn"); await phone.waitForTimeout(300); } };
await home();
await phone.click("#stories-btn"); await phone.waitForTimeout(400);
check((await phone.$$eval("#stories-list > *", (e) => e.length)) > 0, "stories panel lists the games played");
await home();
await phone.click(".rules-open"); await phone.waitForTimeout(200);
check((await phone.$$eval("#rules-body h3", (e) => e.length)) > 5, "rules panel");
await home();
await phone.click('[data-lang="en"]:visible'); await phone.waitForTimeout(200);
check((await phone.textContent("h1")).includes("Know Each Other"), "language switch to English");

check(errs.length === 0, `no page errors${errs.length ? ": " + errs.join(" | ") : ""}`);
await browser.close();
server.close();
console.log(fails.length ? `\n${fails.length} check(s) failed` : "\nAll checks passed");
process.exit(fails.length ? 1 : 0);
