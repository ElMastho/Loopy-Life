/* Loopy Life · The shared state: question bank, current story, current card
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

let DB = { subjects: [], questions: [] };
let SUBJ = {}; // id -> subject
let QBYID = {}; // id -> question
let state = null;
let current = null; // { q, player, bonuses:Set }
let spinning = false;
let wheelAngle = 0;
let lastTreeCounts = {};

// The question bank lives in data/: subjects.json lists the subjects and the pools,
// data/questions/<subject>.json holds each subject's questions, data/pools/<pool>.json each pool.
async function loadQuestionBank() {
  const get = async (path) => {
    const res = await fetch(`data/${path}?v=${APP_VERSION}`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  };
  const index = await get("subjects.json");
  const [questions, pools] = await Promise.all([
    Promise.all(index.subjects.map((s) => get(`questions/${s.id}.json`))),
    Promise.all(index.pools.map((name) => get(`pools/${name}.json`))),
  ]);
  const bank = { version: index.version, languages: index.languages, subjects: index.subjects, questions: questions.flat() };
  index.pools.forEach((name, i) => (bank[name] = pools[i]));
  return bank;
}
