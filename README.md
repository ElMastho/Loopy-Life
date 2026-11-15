# Loopy Life · Know Each Other

A small game to get to know your friends better (2 players by default, add as many as you want), beyond work and small talk. Available in English and French (switch on the home screen or during the game).
It is the first seed of **Loopy Life**, the life-organization extension of Loopy Lines.

## How to play

Starting a game takes three steps: **1. Players** (or continue a saved story), **2. Game**, **3. Settings** (subjects, depth and the options that fit that game).

1. Enter the players' names (tap **+ Add a player** for groups).
2. Pick a game:
   - To get to know each other: **🎡 The wheel** (random subject, random question) or **🌳 The tree** (every subject is a branch, from "roots" questions to "leaves" and "blooms"; every answer makes the tree grow).
   - Just for fun (best with 3 to 6): **🎭 Truth or bluff** (the app secretly tells the player to answer honestly or to bluff; +15 for each friend who saw through it, +10 to the player per friend fooled), **⚔️ Duel** (two players answer the same question, the others pick the best answer: +20, or +10 each for a tie), **🎲 The bet** (friends bet 1 to 3 on guessing the answer: +10 per point if right, -5 per point if wrong).
3. Players take turns answering. Before answering, the others can try to guess. The **?** button explains the rules and every bonus.
4. Tap the bonuses that happened, then **Answered!**
   - Answer: +10 (light), +20 (deeper), +30 (deep)
   - 🎯 A friend guessed right before the answer was given: +15 for them
   - 😮 "Didn't know that!": +5 each
   - 🔁 The others answered the same question too: same points for them
5. Each player has 3 passes. Every 50 points per player together raises your **connection level** (with fireworks).
6. Option **🔮 Guess for each other** (on the home screen): before each answer, the others guess out loud what the player will say. A right guess earns +25, and the player gets +10 when nobody guessed.
7. Option **🗳️ Who of us?** (off by default; the game suggests the options if you start without looking at them): some wheel segments, and a button under the tree, give a vote instead of a question. On 3, everyone points at a player: +5 each for voting, +10 for the player(s) with the most votes, +5 each if it was unanimous.
8. Option **🎭 Challenges** (off by default): sometimes a small challenge instead of a question. +20 when done, +5 each if everyone laughed. "Another one" is free.
9. Option **🎲 Random next player**: nobody knows who answers next. From 5 players the card shows a single "Who guessed it?" row of names and the scoreboard scrolls sideways.
10. **🏅 Badges**: 19 badges to unlock together during a story (saved in the `.loopy` file).
11. **Our story** keeps every question you answered and your notes. **Finish** shows a summary, a **🖼️ Share a picture** image (tree, level, best moment) and a text version.

The site can be installed as an app (📲 button on Android and computers, Share > Add to Home Screen on iPhone) and then works offline.

The game saves itself in the browser, so you can close the page and resume later.

Each group of friends can keep its own story: **💾 Save the story** downloads a `.loopy` file (the game state, encoded so it isn't meant to be read by hand), and **📂 Continue a saved story** on the home screen loads it back with names, scores, tree and questions already asked. Questions already asked on a device, in any story, are drawn last, so a new story starts with fresh questions.

## The question bank

All questions live in [`data/questions.json`](data/questions.json): 15 subjects (including Imagination & Scenarios), 700+ questions in English and French, each with a depth from 1 (light) to 3 (deep). The same file holds the `who` votes and the `challenges` (`{ "id", "text": { "en", "fr" } }`).

```json
{ "id": "family-001", "subject": "family", "depth": 1,
  "text": { "en": "How many people are in your family, and who are they?",
            "fr": "Combien de personnes compte ta famille, et qui sont-elles ?" } }
```

To add questions, add entries with a unique `id`, an existing `subject` id, a `depth` of 1, 2 or 3, and the text in both languages. Interface texts are in the `STR` table at the top of `app.js`.

## Run locally

The page loads the JSON with `fetch`, so open it through a small web server rather than as a file:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Hosting

Plain HTML, CSS and JavaScript with no build step, served by GitHub Pages from the `main` branch root.

When you change `app.js`, `style.css` or `data/questions.json`, bump the `?v=` number in `index.html` and in the `fetch` call in `app.js`, so browsers load the new files instead of a cached copy. Also update the same version in `CACHE` and `CORE` in `sw.js` (the offline copy).
