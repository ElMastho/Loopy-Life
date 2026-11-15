# The game's scripts

No build step: `index.html` loads these files as plain scripts, in this order. They share the page's global scope, so a function or variable declared in one file can be used by the others (a file only needs, while it loads, what the files above it declare; everything else runs later, once `main.js` calls `boot()`). Each file starts with `"use strict"`.

| File | What it does |
| --- | --- |
| `config.js` | Points, game lists, pools, `APP_VERSION` |
| `i18n.js` | Current language, `t()` and the translation helpers |
| `i18n/en.js`, `i18n/fr.js` | Every interface text (and the rules) |
| `state.js` | Shared state (question bank, current story and card) and the question bank loader |
| `helpers.js` | Small helpers: random, colours, toast, screens, tree levels |
| `storage.js` | Saving the current game (localStorage) and every story (IndexedDB) |
| `fx.js` | Sparkles and fireworks |
| `setup.js` | Setup screen: players, game choice, settings and options |
| `game.js` | A new story, scores, drawing questions |
| `card.js` | The question card, bonuses, reading aloud |
| `turns.js` | Fun games (bluff, duel, bet), votes, challenges, scoring a turn, passing |
| `speed.js` | Speed game: countdown, pause, streaks |
| `wheel.js` | The wheel |
| `tree.js` | The tree |
| `journal.js` | Our story, the summary, `.loopy` and text files |
| `stories.js` | Our stories panel |
| `badges.js` | Badges |
| `share.js` | The shareable picture |
| `install.js` | Install as an app |
| `rules.js` | Rules (full or for the current game) and language switch |
| `update.js` | Version panel and update banner |
| `main.js` | Wiring of the buttons and start-up (`boot()`) |

A new file goes in `index.html` at the right place; `tools/release.py` then adds it to the offline list in `sw.js`.
