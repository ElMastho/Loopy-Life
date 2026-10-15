# Loopy Life · Know Each Other

A small game to get to know your friends better (2 players by default, add as many as you want), beyond work and small talk. Available in English and French (switch on the home screen or during the game).
It is the first seed of **Loopy Life**, the life-organization extension of Loopy Lines.

## How to play

1. Enter the players' names (tap **+ Add a player** for groups), pick the subjects you want, and choose how deep to go (Light, Mixed, Deep).
2. Pick a mode:
   - **Spin the Wheel**: the wheel picks a subject, then you get a random question.
   - **Grow Our Tree**: every subject is a branch. It starts with fundamental "roots" questions (family, origins...), then unlocks deeper "leaves" and finally "bloom" questions. Every answer makes your tree grow.
3. Players take turns answering. Before answering, the others can try to guess. The **?** button explains the rules and every bonus.
4. Tap the bonuses that happened, then **Answered!**
   - Answer: +10 (light), +20 (deeper), +30 (deep)
   - 🎯 A friend guessed right before the answer was given: +15 for them
   - 😮 "Didn't know that!": +5 each
   - 🔁 The others answered the same question too: same points for them
5. Each player has 3 passes. Every 50 points per player together raises your **connection level** (with fireworks).
6. **Our story** keeps every question you answered and your notes. **Finish** shows a summary you can save as a text file.

The game saves itself in the browser, so you can close the page and resume later.

## The question bank

All questions live in [`data/questions.json`](data/questions.json): 14 subjects, 500+ questions in English and French, each with a depth from 1 (light) to 3 (deep).

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

When you change `app.js`, `style.css` or `data/questions.json`, bump the `?v=` number in `index.html` and in the `fetch` call in `app.js`, so browsers load the new files instead of a cached copy.
