/* Loopy Life · Settings and game constants
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

const STORAGE_KEY = "loopy-know-each-other-v1";
const APP_VERSION = "1.8.0"; // semantic version (major.minor.patch); set by tools/release.py with version.json
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
const GAME_EMOJI = { speed: "⚡", wheel: "🎡", tree: "🌳", bluff: "🎭", duel: "⚔️", bet: "🎲", date: "🥂", couple: "💑", car: "🚗", coffee: "☕", team: "🎤", honor: "🎂", debate: "🗣️", parents: "👪" };
const DUO_GAMES = ["date", "couple"];
const competitive = () => FUN_GAMES.includes(gameOf(state)); // only the fun games keep a per-player score
const ALL_GAMES = ["wheel", "tree", "bluff", "duel", "bet", "date", "couple", "car", "speed", "coffee", "team", "honor", "debate", "parents"];
// Between colleagues: light and medium questions only, from the work pack and a few safe subjects.
// With children (the all-ages option): love stays out, and so do the date, couple and +18 pools.
const FAMILY_OFF_SUBJECTS = ["love", "__date", "__couple", "__spicy", "__society", "__politics"];
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
  __honor: { id: "__honor", emoji: "🎂", color: "#f4a261", name: { en: "In the spotlight", fr: "À l'honneur" }, short: { en: "Spotlight", fr: "À l'honneur" } },
  __debate: { id: "__debate", emoji: "🗣️", color: "#4dabf7", name: { en: "Debate", fr: "Débat" }, short: { en: "Debate", fr: "Débat" } },
  __society: { id: "__society", emoji: "🏛️", color: "#7950f2", name: { en: "Society", fr: "Société" }, short: { en: "Society", fr: "Société" } },
  __politics: { id: "__politics", emoji: "🗳️", color: "#e8590c", name: { en: "Politics", fr: "Politique" }, short: { en: "Politics", fr: "Politique" } },
  // Parents & kids: the chapters of a parent's life, and our family
  __kid: { id: "__kid", emoji: "🧸", color: "#ffa94d", name: { en: "Your childhood", fr: "Ton enfance" }, short: { en: "Childhood", fr: "Enfance" } },
  __teen: { id: "__teen", emoji: "🎸", color: "#f06595", name: { en: "Your teenage years", fr: "Ta jeunesse" }, short: { en: "Teen years", fr: "Jeunesse" } },
  __meet: { id: "__meet", emoji: "💞", color: "#e64980", name: { en: "How you met", fr: "Votre rencontre" }, short: { en: "Meeting", fr: "Rencontre" } },
  __before: { id: "__before", emoji: "🌍", color: "#20c997", name: { en: "Before us", fr: "Avant nous" }, short: { en: "Before us", fr: "Avant nous" } },
  __parent: { id: "__parent", emoji: "👶", color: "#748ffc", name: { en: "Becoming a parent", fr: "Devenir parent" }, short: { en: "Parenthood", fr: "Devenir parent" } },
  __home: { id: "__home", emoji: "🏡", color: "#94d82d", name: { en: "Our family", fr: "Notre famille" }, short: { en: "Our family", fr: "Notre famille" } },
  __spicy: { id: "__spicy", emoji: "🔥", color: "#e8505b", name: { en: "+18", fr: "+18" }, short: { en: "+18", fr: "+18" } },
};
const POOL_KEY = { __date: "date", __couple: "couple", __spicy: "spicy", __speed: "speed", __work: "work", __honor: "honor", __debate: "debate", __society: "society", __politics: "politics", __kid: "parents", __teen: "parents", __meet: "parents", __before: "parents", __parent: "parents", __home: "parents" };
const PARENT_CHAPTERS = ["__kid", "__teen", "__meet", "__before", "__parent"]; // asked to a parent; __home is for everyone
const gameOf = (st) => st.game || st.mode || "wheel"; // from this many players, the card and scoreboard switch to a compact layout
// "Who of us?" votes and challenges behave like extra subjects on the wheel and under the tree.
const EXTRAS = {
  __who: { id: "__who", kind: "who", emoji: "🗳️", color: "#9b7bff", name: { en: "Who of us?", fr: "Qui de nous ?" }, short: { en: "Who of us?", fr: "Qui de nous ?" } },
  __dare: { id: "__dare", kind: "dare", emoji: "🎭", color: "#ff6b6b", name: { en: "Challenge", fr: "Défi" }, short: { en: "Challenge", fr: "Défi" } },
};
const isExtra = (id) => !!EXTRAS[id];
