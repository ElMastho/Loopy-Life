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

async function newPage(viewport) {
  const ctx = await browser.newContext({ locale: "fr-FR", viewport });
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
  const ins = await p.$$("#players-list input");
  for (let i = 0; i < names.length; i++) await ins[i].fill(names[i]);
  await p.click(".next-step"); await p.click(`.game-card[data-game="${game}"]`); await p.waitForTimeout(150);
  await p.click("#start-btn"); await p.waitForTimeout(250);
  if (await p.isVisible("#suggest-overlay")) await p.click("#suggest-go");
  await p.waitForTimeout(300);
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
]) await play(phone, game, names);

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
