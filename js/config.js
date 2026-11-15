/* Loopy Life · Settings and game constants
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

const STORAGE_KEY = "loopy-know-each-other-v1";
const APP_VERSION = "1.3.1"; // semantic version (major.minor.patch); set by tools/release.py with version.json
const POINTS = { 1: 10, 2: 20, 3: 30 };
const LEVEL_UP = 100; // connection points per level
const PASSES = 3;
const GUESS_POINTS = 20; // a right guess, in every game
const GUESS_MODE_POINTS = GUESS_POINTS;
const SURPRISE_POINTS = 10; // the player's bonus when nobody guessed, in that mode
const VOTE_POINTS = 5; // everyone, for each "who of us?" vote
const CHOSEN_POINTS = 10; // the player(s) the group voted for
const DARE_POINTS = 20; // a challenge done
const COMPACT_FROM = 5;
const BLUFF_SEEN = GUESS_POINTS; // a friend who saw through the truth or the bluff
const BLUFF_FOOLED = 10; // the player, for each friend fooled
const DUEL_WIN = 20;
const DUEL_TIE = 10;
const BET_WIN = 10; // per point bet
const BET_LOSS = 5; // per point bet
const FUN_GAMES = ["bluff", "duel", "bet"];
const GAME_EMOJI = { speed: "⚡", wheel: "🎡", tree: "🌳", bluff: "🎭", duel: "⚔️", bet: "🎲", date: "🥂", couple: "💑", car: "🚗", coffee: "☕", team: "🎤" };
const DUO_GAMES = ["date", "couple"];
const competitive = () => FUN_GAMES.includes(gameOf(state)); // only the fun games keep a per-player score
const ALL_GAMES = ["wheel", "tree", "bluff", "duel", "bet", "date", "couple", "car", "speed", "coffee", "team"];
// Between colleagues: light and medium questions only, from the work pack and a few safe subjects.
// With children (the all-ages option): love stays out, and so do the date, couple and +18 pools.
const FAMILY_OFF_SUBJECTS = ["love", "__date", "__couple", "__spicy"];
const FAMILY_GAMES_OFF = ["date", "couple", "coffee", "team"];
const WORK_GAMES = ["coffee", "team"];
const isWorkGame = (g) => WORK_GAMES.includes(g);
const WORK_SUBJECTS = ["passions", "tastes", "travel", "daily", "personality", "humor", "future", "fantasy", "nature", "imagination", "whatif", "popculture", "sport", "senses"];
const WHO_NOT_AT_WORK = ["who-016", "who-018", "who-024", "who-049", "who-053"]; // votes that are too personal between colleagues
const TEAM_TIMES = [0, 30, 60]; // seconds per person in the icebreaker (0: no countdown)
const SPEED_TIMES = [10, 15, 20]; // seconds to answer in the speed game
// Question pools of their own, shown with a subject chip but never on the wheel.
const POOLS = {
  __date: { id: "__date", emoji: "🥂", color: "#ff8fab", name: { en: "First date", fr: "Premier rendez-vous" }, short: { en: "Date", fr: "Rendez-vous" } },
  __couple: { id: "__couple", emoji: "💑", color: "#e07a9f", name: { en: "Us two", fr: "Nous deux" }, short: { en: "Us two", fr: "Nous deux" } },
  __speed: { id: "__speed", emoji: "⚡", color: "#ffb703", name: { en: "Speed", fr: "Rapidité" }, short: { en: "Speed", fr: "Rapidité" } },
  __work: { id: "__work", emoji: "☕", color: "#c08552", name: { en: "Work life", fr: "Vie de bureau" }, short: { en: "Work life", fr: "Vie de bureau" } },
  __spicy: { id: "__spicy", emoji: "🔥", color: "#e8505b", name: { en: "+18", fr: "+18" }, short: { en: "+18", fr: "+18" } },
};
const POOL_KEY = { __date: "date", __couple: "couple", __spicy: "spicy", __speed: "speed", __work: "work" };
const gameOf = (st) => st.game || st.mode || "wheel"; // from this many players, the card and scoreboard switch to a compact layout
// "Who of us?" votes and challenges behave like extra subjects on the wheel and under the tree.
const EXTRAS = {
  __who: { id: "__who", kind: "who", emoji: "🗳️", color: "#9b7bff", name: { en: "Who of us?", fr: "Qui de nous ?" }, short: { en: "Who of us?", fr: "Qui de nous ?" } },
  __dare: { id: "__dare", kind: "dare", emoji: "🎭", color: "#ff6b6b", name: { en: "Challenge", fr: "Défi" }, short: { en: "Challenge", fr: "Défi" } },
};
const isExtra = (id) => !!EXTRAS[id];
