/* Loopy Life · Badges
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

/* ------------------------------------------------------------------ */
/* Badges                                                             */
/* ------------------------------------------------------------------ */
const qs = (st) => st.journal.filter((e) => !e.kind);
const countBonus = (st, test) => st.journal.reduce((n, e) => n + e.bonuses.filter(test).length, 0);
const BADGES = [
  { id: "first", emoji: "🌱", name: { en: "First step", fr: "Premier pas" }, desc: { en: "Answer a first question", fr: "Répondre à une première question" }, test: (st) => qs(st).length >= 1 },
  { id: "ten", emoji: "🔥", name: { en: "Warming up", fr: "Ça chauffe" }, desc: { en: "Answer 10 questions", fr: "Répondre à 10 questions" }, test: (st) => qs(st).length >= 10 },
  { id: "everyone", emoji: "👥", name: { en: "Everyone's in", fr: "Tout le monde y passe" }, desc: { en: "Every player has answered a question", fr: "Chaque joueur a répondu à une question" }, test: (st) => st.players.every((_, i) => qs(st).some((e) => e.player === i || e.rival === i)) },
  { id: "explorer", emoji: "🧭", name: { en: "Explorers", fr: "Explorateurs" }, desc: { en: "Questions in 5 different subjects", fr: "Des questions dans 5 thèmes différents" }, test: (st) => new Set(qs(st).map((e) => e.subject)).size >= 5 },
  { id: "deep", emoji: "🌊", name: { en: "Deep divers", fr: "Plongeurs" }, desc: { en: "5 deep questions", fr: "5 questions profondes" }, test: (st) => qs(st).filter((e) => e.depth === 3).length >= 5 },
  { id: "telepath", emoji: "🎯", name: { en: "Telepaths", fr: "Télépathes" }, desc: { en: "10 right guesses", fr: "10 bonnes devinettes" }, test: (st) => countBonus(st, (b) => b === "guess" || b.startsWith("guess:")) >= 10 },
  { id: "surprise", emoji: "😏", name: { en: "Unpredictable", fr: "Imprévisibles" }, desc: { en: "Nobody guessed, 3 times", fr: "Personne n'a deviné, 3 fois" }, test: (st) => countBonus(st, (b) => b === "nobody") >= 3 },
  { id: "wow", emoji: "😮", name: { en: "Mind blown", fr: "Bouche bée" }, desc: { en: "5 “didn't know that!”", fr: "5 « je ne savais pas ! »" }, test: (st) => countBonus(st, (b) => b === "wow") >= 5 },
  { id: "memory", emoji: "🐘", name: { en: "Elephant memory", fr: "Mémoire d'éléphant" }, desc: { en: "Write 5 notes", fr: "Écrire 5 notes" }, test: (st) => st.journal.filter((e) => e.note).length >= 5 },
  { id: "bloom", emoji: "🌸", name: { en: "First bloom", fr: "Première fleur" }, desc: { en: "A branch of the tree blooms", fr: "Une branche de l'arbre fleurit" }, test: (st) => Object.values(st.tree || {}).some((c) => c[1] >= 2 && c[2] >= 2) },
  { id: "fulltree", emoji: "🌳", name: { en: "Full bloom", fr: "Arbre en fleurs" }, desc: { en: "Every branch of the tree blooms", fr: "Toutes les branches de l'arbre fleurissent" }, test: (st) => st.subjects.length > 0 && st.subjects.every((id) => { const c = (st.tree || {})[id]; return c && c[1] >= 2 && c[2] >= 2 && c[3] >= 1; }) },
  { id: "vote", emoji: "🗳️", name: { en: "Democracy", fr: "Démocratie" }, desc: { en: "5 “Who of us?” votes", fr: "5 votes « Qui de nous ? »" }, test: (st) => st.journal.filter((e) => e.kind === "who").length >= 5 },
  { id: "unanimous", emoji: "🤝", name: { en: "Unanimous", fr: "Unanimité" }, desc: { en: "Everyone pointed at the same person", fr: "Tout le monde a pointé la même personne" }, test: (st) => countBonus(st, (b) => b === "unanimous") >= 1 },
  { id: "daredevil", emoji: "🎭", name: { en: "Daredevils", fr: "Casse-cou" }, desc: { en: "5 challenges done", fr: "5 défis réussis" }, test: (st) => st.journal.filter((e) => e.kind === "dare" && e.bonuses.includes("dare")).length >= 5 },
  { id: "level5", emoji: "🎆", name: { en: "Inseparable", fr: "Inséparables" }, desc: { en: "Reach connection level 5", fr: "Atteindre le niveau de connexion 5" }, test: (st) => Math.floor(st.connection / levelSize()) + 1 >= 5 },
  { id: "bluffer", emoji: "🃏", name: { en: "Poker face", fr: "Bluffeur" }, desc: { en: "Fool everyone with a bluff", fr: "Berner tout le monde avec un bluff" }, test: (st) => st.journal.some((e) => e.game === "bluff" && e.bluff && st.players.length > 1 && !e.bonuses.some((b) => b.startsWith("guess:"))) },
  { id: "champion", emoji: "🏆", name: { en: "Champion", fr: "Champion" }, desc: { en: "One player wins 3 duels", fr: "Un joueur gagne 3 duels" }, test: (st) => st.players.some((_, i) => st.journal.filter((e) => e.game === "duel" && e.bonuses.includes("win:" + i)).length >= 3) },
  { id: "jackpot", emoji: "💰", name: { en: "Jackpot", fr: "Jackpot" }, desc: { en: "Win a 3-point bet", fr: "Gagner un pari à 3 points" }, test: (st) => st.journal.some((e) => e.game === "bet" && Object.entries(e.bets || {}).some(([o, v]) => v === 3 && e.bonuses.includes("guess:" + o))) },
  { id: "lightning", emoji: "⚡", name: { en: "Lightning", fr: "Éclair" }, desc: { en: "10 answers in a row in time", fr: "10 réponses d'affilée dans les temps" }, test: (st) => (st.bestStreak || 0) >= 10 },
  { id: "fifty", emoji: "🏔️", name: { en: "Marathon", fr: "Marathon" }, desc: { en: "Play 50 cards", fr: "Jouer 50 cartes" }, test: (st) => st.journal.length >= 50 },
];

function checkBadges() {
  if (!Array.isArray(state.badges)) state.badges = [];
  const got = BADGES.filter((b) => !state.badges.includes(b.id) && b.test(state));
  if (!got.length) return;
  got.forEach((b) => state.badges.push(b.id));
  save();
  got.forEach((b, i) => setTimeout(() => {
    toast(t("badgeToast", { name: `${b.emoji} ${tr(b.name)}` }), 2800);
    FX.fireworks(3, ["#ffd166", "#ffffff", "#9b7bff"]);
  }, 1300 + i * 2900));
}

// Badges that need a given game or option; the others can be won in any game.
const BADGE_NEEDS = {
  bloom: (st) => st.mode === "tree", fulltree: (st) => st.mode === "tree",
  vote: (st) => st.whoMode, unanimous: (st) => st.whoMode, daredevil: (st) => st.dareMode,
  surprise: (st) => st.guessMode, bluffer: (st) => gameOf(st) === "bluff",
  champion: (st) => gameOf(st) === "duel", lightning: (st) => gameOf(st) === "speed", jackpot: (st) => gameOf(st) === "bet",
};

function openBadges() {
  const have = new Set(state.badges || []);
  $("#badges-count").textContent = t("badgesCount", { n: have.size, total: BADGES.length });
  const here = (b) => have.has(b.id) || !BADGE_NEEDS[b.id] || BADGE_NEEDS[b.id](state);
  const li = (b) => `<li class="badge${have.has(b.id) ? " on" : ""}${here(b) ? "" : " elsewhere"}"><span class="b-emo">${b.emoji}</span><span><b>${esc(tr(b.name))}</b><small>${esc(tr(b.desc))}</small></span></li>`;
  const other = BADGES.filter((b) => !here(b));
  $("#badges-list").innerHTML = BADGES.filter(here).map(li).join("")
    + (other.length ? `<li class="badges-sep">${esc(t("badgesOther"))}</li>` + other.map(li).join("") : "");
  $("#badges-overlay").classList.remove("hidden");
}
