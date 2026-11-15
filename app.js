/* Loopy Life · Know Each Other
 * A two-player get-to-know-each-other game.
 * Plain JS, no build step. Questions live in data/questions.json.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "loopy-know-each-other-v1";
  const APP_VERSION = 21; // bump with version.json and the ?v= of the files on every release
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
  const GAME_EMOJI = { speed: "⚡", wheel: "🎡", tree: "🌳", bluff: "🎭", duel: "⚔️", bet: "🎲", date: "🥂", couple: "💑", car: "🚗" };
  const DUO_GAMES = ["date", "couple"];
  const competitive = () => FUN_GAMES.includes(gameOf(state)); // only the fun games keep a per-player score
  const ALL_GAMES = ["wheel", "tree", "bluff", "duel", "bet", "date", "couple", "car", "speed"];
  const SPEED_TIMES = [10, 15, 20]; // seconds to answer in the speed game
  // Question pools of their own, shown with a subject chip but never on the wheel.
  const POOLS = {
    __date: { id: "__date", emoji: "🥂", color: "#ff8fab", name: { en: "First date", fr: "Premier rendez-vous" }, short: { en: "Date", fr: "Rendez-vous" } },
    __couple: { id: "__couple", emoji: "💑", color: "#e07a9f", name: { en: "Us two", fr: "Nous deux" }, short: { en: "Us two", fr: "Nous deux" } },
    __speed: { id: "__speed", emoji: "⚡", color: "#ffb703", name: { en: "Speed", fr: "Rapidité" }, short: { en: "Speed", fr: "Rapidité" } },
    __spicy: { id: "__spicy", emoji: "🔥", color: "#e8505b", name: { en: "+18", fr: "+18" }, short: { en: "+18", fr: "+18" } },
  };
  const POOL_KEY = { __date: "date", __couple: "couple", __spicy: "spicy", __speed: "speed" };
  const gameOf = (st) => st.game || st.mode || "wheel"; // from this many players, the card and scoreboard switch to a compact layout
  // "Who of us?" votes and challenges behave like extra subjects on the wheel and under the tree.
  const EXTRAS = {
    __who: { id: "__who", kind: "who", emoji: "🗳️", color: "#9b7bff", name: { en: "Who of us?", fr: "Qui de nous ?" }, short: { en: "Who of us?", fr: "Qui de nous ?" } },
    __dare: { id: "__dare", kind: "dare", emoji: "🎭", color: "#ff6b6b", name: { en: "Challenge", fr: "Défi" }, short: { en: "Challenge", fr: "Défi" } },
  };
  const isExtra = (id) => !!EXTRAS[id];


  /* ------------------------------------------------------------------ */
  /* Languages                                                          */
  /* ------------------------------------------------------------------ */
  const LANG_KEY = "loopy-lang";
  const STR = {
    en: {
      title: "Know Each Other",
      tagline: "A game for friends, to go beyond the usual small talk.",
      who: "Who's playing?",
      player1: "Player 1",
      player2: "Player 2",
            pickSubjects: "Subjects",
      all: "All",
      none: "None",
      howDeep: "How deep?",
      light: "🌤️ Light",
      mixed: "🌗 Mixed",
      deep: "🌊 Deep",
      howPlay: "4. Choose how to play",
      wheelTitle: "Spin the Wheel",
      wheelDesc: "Random subject, random question. Pure surprise.",
      treeTitle: "Grow Our Tree",
      treeDesc: "Start from the roots (family, origins) and unlock deeper questions branch by branch.",
      footer: "First seed of <strong>Loopy Life</strong>",
      qCount: "{n} questions inside",
      connection: "Connection",
      lv: "Lv {n}",
      wheel: "🎡 Wheel",
      tree: "🌳 Tree",
      wheelHint: "Tap SPIN (or the wheel) to pick a subject.",
      spin: "SPIN",
      treeHint: "Choose a branch to grow. Each branch starts at its <b>roots</b> 🌱, then grows <b>leaves</b> 🌿, then <b>blooms</b> 🌸 with deeper questions.",
      surprise: "🎲 Surprise us: grow any branch",
      ourStory: "📖 Our story",
      finish: "🏁 Finish",
      summaryTitle: "What a conversation! 🎉",
      storySoFar: "Our story so far",
      save: "⬇️ Save our story",
      keepPlaying: "↩︎ Keep playing",
      newGame: "✨ New game",
      wow: "Didn't know that!",
      bonusHelp: "Tip: let the others guess the answer first. Tap the bonuses that happened.",
      notePh: "Something to remember? (optional)",
      pass: "Pass",
      answered: "Answered! ✨",
      close: "Close",
      langToggle: "🇫🇷 Français",
      gamesTwo: "🥂 For two",
      updTitle: "🔄 App version",
      updInstalled: "Installed version: {v}",
      updChecking: "Checking for a new version…",
      updLatest: "✅ You have the latest version.",
      updNew: "✨ Version {v} is available.",
      updOffline: "Can't check right now (no connection?).",
      updForce: "🔄 Force the update",
      updKeep: "Your stories and your current game are kept.",
      updBanner: "✨ A new version is available",
      updNow: "Update",
      storyName: "📖 Name your story (optional)",
      storyNamePh: "e.g. Our first summer",
      storiesBtn: "📚 Our stories",
      storiesTitle: "📚 Our stories",
      storiesInfo: "ℹ️ Your stories are kept in this browser only, on this device. If you clear your browsing data or uninstall the app, they disappear. For the stories that matter, also tap 💾 Save to keep a .loopy file somewhere safe.",
      storiesSearch: "Search a name, a player, a question, a note…",
      storiesEmpty: "No story yet: play a first game!",
      storiesNone: "Nothing found.",
      stResume: "▶️ Resume",
      stReview: "📖 Look back",
      stRename: "✏️ Rename",
      stSave: "💾 Save",
      stDelete: "🗑️ Delete",
      stDeleteSure: "🗑️ Sure? Tap again",
      stAnswers: "{n} answers",
      stDeleted: "🗑️ Story deleted.",
      suggestName: "Give your story a name?",
      suggestNameHint: "To find it easily in 📚 Our stories. You can leave it empty.",
      g_speed: "Speed",
      g_speedDesc: "A short question, a few seconds to answer. No time to think: just be spontaneous!",
      g_speedPlayers: "👥 From 2",
      timerTitle: "⏱️ Time to answer",
      timerHint: "The question appears, the countdown starts right away.",
      speedFor: "⚡ {name}, answer fast!",
      speedReady: "Tap GO to discover your question: the countdown starts right away.",
      speedGo: "⚡ GO!",
      speedFor2: "⚡ {name}, your turn!",
      speedResume: "▶️ Resume",
      speedStreak: "🔥 Streak: {n}",
      speedBest: "best: {n}",
      tooLate: "⏰ Too late!",
      streakToast: "🔥 {n} answers in a row in time!",
      pause: "Pause",
      speedPts: "⚡ +10 · +1/s left",
      paceDate: "A first date sets its own pace: light questions first, a little deeper as you go.",
      paceTree: "The tree sets the pace, branch by branch: light roots first, then leaves, then deeper blooms.",
      paceCar: "In the car, questions stay light or medium.",
      home: "🏠 Home",
      badgesOther: "In other games",
      ourTree: "🌳 Our tree",
      treeTap: "Every answer grows your tree. Tap it to see your story.",
      discoveries: "✨ What we learned about each other",
      aboutName: "About {name}",
      noDiscoveries: "Next time, tap 😮 I didn't know! or write a note: your discoveries will show up here.",
      bestFor: "⭐ Ideal for {n}",
      onlyTwo: "Only for 2 players",
      minThree: "From 3 players: two duelists and a judge",
      carMax: "More than 7 in one car? 😉",
      groupTwoOff: "Only when you are 2.",
      gamesRoad: "🚗 On the road",
      g_date: "First date",
      g_dateDesc: "Just met? Questions that start light and slowly go deeper, with a discreet joker.",
      g_datePlayers: "👥 For two",
      g_couple: "Couple",
      g_coupleDesc: "Memories, the two of you, the future. Guess what the other will answer.",
      g_couplePlayers: "👥 For two",
      g_car: "Car",
      g_carDesc: "Everything by voice: a passenger holds the phone, the driver just answers.",
      g_carPlayers: "👥 2 and more",
      needTwo: "This game is made for two players.",
      driverTitle: "🚗 Who's driving?",
      driverHint: "The driver answers out loud and never touches the phone.",
      noDriver: "Nobody",
      voiceTitle: "🔊 Read the questions aloud",
      voiceDesc: "The phone reads each question, so nobody has to read the screen.",
      readAloud: "Read aloud",
      driverFor: "🚗 {name}, eyes on the road: answer out loud",
      adultTitle: "🔥 +18 questions",
      adultDesc: "Suggestive questions about attraction and intimacy, never explicit. Adults only.",
      adultWarnTitle: "⚠️ Adults only",
      adultWarnText: "<p>These questions are about attraction, seduction and intimacy. They stay suggestive and never explicit, but they can be intense.</p><p><b>Are you sure?</b> By turning them on, you confirm that:</p><ul><li>every player is an adult (18+);</li><li>every player agrees to play with these questions;</li><li>anyone can skip a question at any time, no questions asked.</li></ul><p class=\"disclaimer\">You use this option at your own responsibility. The author of the game accepts no liability for how these questions are used or for what they lead to.</p>",
      adultCancel: "Cancel",
      adultOk: "We're adults and we agree",
      adultOn: "🔥 +18 questions on. Have fun, and remember: anyone can skip.",
      joker: "🙈 Joker",
      dateStep: "Take your time: there are no wrong answers. 🙈 Joker swaps the question, no explanation needed.",
      stepPlayers: "Players",
      stepGame: "Game",
      stepSettings: "Settings",
      nextStep: "Next →",
      backStep: "← Back",
      continueTitle: "Or continue a story",
      gamesDiscover: "🌱 Get to know each other",
      gamesFun: "🎉 Just for fun",
      changeGame: "Change",
      suggestTitle: "One last thing?",
      suggestText: "These options can spice up the game. Tap the ones you want, or start without them.",
      rulesFor: "How to play: {game}",
      rulesAll: "📜 All the rules",
      rulesPass: "<h3>🔄 Passing</h3><p>Don't like the question? <b>🔄 Pass</b> swaps it for another one on the same subject. You can pass as often as you like: nobody has to answer what makes them uncomfortable.</p>",
      editSubjects: "Choose",
      subjectsAll: "All {n} subjects",
      subjectsSome: "{k} of {n} subjects",
      startGame: "🚀 Let's go!",
      needThree: "This game is best with 3 players or more, but you can play it with 2.",
      g_wheel: "The wheel",
      g_wheelDesc: "Random subject, random question. Pure surprise.",
      g_wheelPlayers: "👥 2 and more",
      g_tree: "The tree",
      g_treeDesc: "From the roots to the blooms: deeper and deeper, subject by subject.",
      g_treePlayers: "👥 2 and more",
      g_bluff: "Truth or bluff",
      g_bluffDesc: "The app secretly tells the player to answer honestly or to bluff. Can you tell?",
      g_bluffPlayers: "👥 Best with 3 to 6",
      g_duel: "Duel",
      g_duelDesc: "Two players answer the same question, the others pick the best answer.",
      g_duelPlayers: "👥 Best with 3 to 6",
      g_bet: "The bet",
      g_betDesc: "Bet 1 to 3 on guessing the answer. Win big or lose your bet.",
      g_betPlayers: "👥 Best with 3 to 6",
      bluffFor: "{name} answers… truthfully or not?",
      bluffStep: "1. {name} looks alone at the secret. 2. {name} answers. 3. The others vote out loud “truth” or “bluff”. 4. Reveal and tap who saw through it.",
      bluffLook: "🤫 {name}: look alone",
      bluffHide: "🙈 Hide",
      bluffTruth: "✅ TRUTH: answer honestly",
      bluffLie: "🎭 BLUFF: invent a believable answer",
      bluffReveal: "👀 Reveal",
      bluffWas: "It was…",
      bluffTruthShort: "✅ the truth!",
      bluffLieShort: "🎭 a bluff!",
      bluffWho: "🎯 Who saw through it? (+20 each, +10 for {name} per friend fooled)",
      bluffToast: "🎭 {name} fooled {n}!",
      bluffCaught: "🎯 Nobody fooled this time!",
      duelFor: "⚔️ Duel: {a} vs {b}",
      duelStep: "{a} and {b} both answer. Then the others pick the best answer.",
      duelWho: "🏆 Who wins the duel? (+20)",
      duelTie: "🤝 Tie (+10 each)",
      duelToast: "🏆 {name} wins the duel!",
      duelTieToast: "🤝 Tie! +10 each",
      betFor: "Bet on {name}'s answer",
      betStep: "1. Each friend bets 1 to 3 and says their guess. 2. {name} answers. 3. Tap who guessed right.",
      betRight: "🎯 right",
      betLegend: "Right: +10 per point. Wrong: −5 per point.",
      betToast: "🎲 {name} won {n} points!",
      betLostToast: "🎲 Bets lost… {name} is a mystery!",
      bluffBy: "{name} ({x})",
      duelBy: "duel {a} vs {b}",
      everyoneElse: "everyone else",
      whoModeTitle: "🗳️ Who of us? cards",
      whoModeDesc: "Sometimes the wheel lands on a vote: on 3, everyone points at a player. Everyone plays, great for big groups.",
      dareModeTitle: "🎭 Challenges",
      dareModeDesc: "Sometimes a small challenge to do instead of a question.",
      randomTurnTitle: "🎲 Random next player",
      randomTurnDesc: "Nobody knows who's next, so everyone stays alert. Handy for big groups.",
      whoName: "Who of us?",
      dareName: "Challenge",
      whoFor: "Everyone votes: on 3, point at a player!",
      whoPts: "+5 each",
      dareFor: "Challenge for {name}",
      darePts: "+20",
      another: "Another one",
      next: "Next ✨",
      whoChosenLabel: "🏆 Who got the most votes? (+10)",
      whoUnanimous: "🤝 Unanimous (+5 each)",
      dareDone: "✅ Challenge done (+20 for {name})",
      dareLaugh: "😂 Everyone laughed (+5 each)",
      guessWhoLabel: "🎯 Who guessed it? (+{n} each)",
      whoToast: "🗳️ The group has spoken: {name}!",
      unanimousToast: "🤝 Unanimous! +5 each",
      dareToast: "🎭 Challenge done, bravo {name}!",
      allVoted: "everyone voted",
      dareBy: "challenge for {name}",
      statWho: "votes 🗳️",
      statDares: "challenges done 🎭",
      badgesBtn: "🏅 Badges",
      badgesTitle: "🏅 Badges",
      badgesCount: "{n} of {total} badges unlocked",
      badgeToast: "🏅 Badge unlocked: {name}",
      shareImage: "🖼️ Share a picture",
      imgLevel: "Connection level {n}",
      imgQuestions: "questions",
      imgBadges: "badges",
      imgMinutes: "minutes",
      imgBest: "Best moment",
      installApp: "📲 Install the app",
      installed: "📲 Installed! Open Loopy Life from your home screen.",
      optionsTitle: "Options",
      guessModeTitle: "🔮 Guess for each other",
      guessModeDesc: "Before each answer, the others say out loud what they think the player will answer. The player gets a bonus when nobody guessed.",
      guessStep: "🔮 First, {names}: guess what {name} will answer. Then {name} gives the real answer.",
      guessedRight: "{name} guessed right (+{n})",
      nobodyGuessed: "😏 Nobody guessed (+{n} for {name})",
      surprised: "😏 {name} surprised everyone!",
      saveStory: "💾 Save the story",
      saveText: "📄 Text version",
      loadStory: "📂 Open a saved file (.loopy)",
      loaded: "📂 Welcome back {names}! Picking up where you left off.",
      loadBad: "This file isn't a Loopy Life story (.loopy).",
      savedToast: "💾 Story saved. Open this file next time to continue.",
      addPlayer: "+ Add a player",
      playerN: "Player {n}",
      remove: "Remove",
      firstNamePh: "Your name",
      otherNamePh: "A friend's name",
      everyoneToo: "Everyone else answered too (+{n} each)",
      rules: "Rules",
      rulesBtn: "❓ Rules",
      rulesTitle: "How to play",
      rulesBody: "<h3>🎯 The goal</h3><p>Get to know each other better by answering questions you would never ask in everyday conversation. There are no wrong answers.</p><h3>👥 Players</h3><p>Two players by default. Add as many friends as you like with <b>+ Add a player</b>. Everyone takes turns answering, one after the other.</p><h3>🧭 Starting a game</h3><p>Three steps: <b>1. Players</b> (or continue a saved story), <b>2. Game</b>, <b>3. Settings</b> (subjects, depth and the options that fit that game), then <b>🚀 Let's go!</b></p><h3>🌱 Games to get to know each other</h3><ul><li><b>🎡 The wheel</b>: the wheel picks a subject, then a random question.</li><li><b>🌳 The tree</b>: pick a subject (a branch). It starts with simple <b>roots</b> 🌱 questions, then unlocks deeper <b>leaves</b> 🌿 and <b>blooms</b> 🌸 after two answers at each level.</li></ul><h3>🎉 Games just for fun (best with 3 to 6)</h3><ul><li><b>🎭 Truth or bluff</b>: the player taps <b>🤫 Look alone</b> and secretly sees whether to answer honestly or invent a believable answer. The others vote out loud “truth” or “bluff”, then tap <b>Reveal</b>. Each friend who saw through it gets <b>+20</b>, and the player gets <b>+10</b> for each friend fooled.</li><li><b>⚔️ Duel</b>: two players answer the same question. The others pick the best answer (most sincere, funniest… you decide): the winner gets <b>+20</b>, or <b>+10</b> each for a tie. Both duelists get the question's points.</li><li><b>🎲 The bet</b>: before the player answers, each friend bets <b>1, 2 or 3</b> on guessing the answer and says their guess. Right guess: <b>+10 per point bet</b>. Wrong: <b>−5 per point bet</b>.</li></ul><h3>⭐ Points</h3><p>The player whose turn it is answers out loud and gets <b>+10</b> (🌤️ light), <b>+20</b> (🌗 deeper) or <b>+30</b> (🌊 deep) when you tap <b>Answered!</b></p><h3>🎁 Bonuses: when to tap them</h3><p>Before tapping <b>Answered!</b>, tap every bonus that happened (several can be on at once):</p><ul><li><b>🎯 [name] guessed it</b>: tap it when that friend said what the answer would be <i>before</i> it was given, and was right. They get <b>+20</b>. Best way to play: the others guess first, then the player answers.</li><li><b>😮 Didn't know that!</b>: tap it when the answer taught the listeners something they really didn't know about the player. Everyone gets <b>+5</b>.</li><li><b>🔁 [name] answered too</b> (with 3+ players: <b>everyone else answered too</b>): tap it when the others also answered the same question for themselves. They get the same points as the player.</li></ul><p>Don't like the question? <b>🔄 Pass</b> swaps it for another one on the same subject. You can pass as often as you like.</p><h3>🎆 Connection level</h3><p>All your points add up to a shared connection level. Level up for fireworks. <b>📖 Our story</b> keeps every question and note, and <b>🏁 Finish</b> shows your summary.</p><h3>🔮 Guess for each other (option)</h3><p>Turn it on at the start of a story. Before the player answers, everyone else says out loud what they think the answer will be. Then the player answers. Tap <b>🎯 [name] guessed right</b> for each friend who got it (<b>+20</b> each). If nobody got it, tap <b>😏 Nobody guessed</b>: the player gets <b>+10</b> for surprising everyone.</p><h3>🗳️ Who of us? (option)</h3><p>Sometimes the wheel (or the 🗳️ button under the tree) gives a vote instead of a question. Count to 3 and everyone points at the player who fits best. Everyone gets <b>+5</b> for voting. Tap the player(s) with the most votes (<b>+10</b> each), and <b>🤝 Unanimous</b> if everyone pointed at the same person (<b>+5</b> each).</p><h3>🎭 Challenges (option)</h3><p>Sometimes the player gets a small challenge instead of a question. Tap <b>✅ Challenge done</b> if they did it (<b>+20</b>), and <b>😂 Everyone laughed</b> if it was a hit (<b>+5</b> each). Don't like it? <b>🔄 Another one</b> is free.</p><h3>👥 Big groups</h3><p>From 5 players, the card shows one <b>🎯 Who guessed it?</b> row with everyone's names. With <b>🎲 Random next player</b>, nobody knows who answers next. Votes and challenges keep everyone in the game.</p><h3>🏅 Badges</h3><p>Unlock badges together as you play: deep moments, good guesses, votes, challenges, a tree in full bloom… See them with <b>🏅 Badges</b>.</p><h3>🖼️ Share a picture</h3><p>At the end, <b>🖼️ Share a picture</b> makes an image of your tree, your level and your best moment to send to the group.</p><h3>📲 Install the app</h3><p>On Android or a computer, tap <b>📲 Install the app</b> on the home screen. On iPhone, tap Share, then <b>Add to Home Screen</b>. It then works without a connection.</p><h3>💾 Saving a story</h3><p>Each group of friends has its own story, and every story is kept in the app: <b>📚 Our stories</b> on the home screen lists them all, with a search (names, players, questions, notes), and lets you resume, look back, rename or delete one. You can name a story on the first step. They are kept in this browser only: clearing your browsing data erases them, so for the stories that matter, also save a file. Tap <b>💾 Save the story</b> (in the game or at the end) to download a <b>.loopy</b> file. Next time, tap <b>📂 Open a saved file (.loopy)</b> on the home screen and pick that file: names, scores, your tree and the questions already asked all come back. Questions already asked on this device, in any story, come last, so a new story starts with fresh questions.</p><h3>🥂 First date</h3><p>For two people meeting for the first time. Questions start light and get a little deeper as you go, mixing date questions with the regular ones. The <b>🙈 Joker</b> swaps a question without a word, as often as you like. No bluff, no pressure.</p><h3>💑 Couple</h3><p>For two people already together: memories, the two of you, the future. Before each answer, your partner guesses out loud what you'll say: <b>🎯 guessed right</b> gives them <b>+20</b>, and if they missed, <b>😏 Nobody guessed</b> gives you <b>+10</b>.</p><h3>🚗 Car</h3><p>A passenger holds the phone and taps; the driver plays by voice only and never touches the screen. Pick the driver in the settings. With <b>🔊 Read the questions aloud</b>, the phone reads each question (tap 🔊 on the card to hear it again). Light and medium questions, quick rounds; no challenges or votes in the car.</p><h3>🔥 +18 questions (option)</h3><p>Only in First date and Couple, off by default. They are about attraction and intimacy, suggestive but never explicit, and they have their own 🔥 segments on the wheel. Turning them on asks every player to confirm they are adults and agree. Anyone can skip a question at any time. You use them at your own responsibility: the author of the game accepts no liability for how they are used.</p><h3>⚡ Speed</h3><p>Short questions, one player after the other. The player taps <b>⚡ GO</b> to discover their question: as soon as it appears, a countdown starts (10, 15 or 20 seconds, set in the settings): answer out loud, whatever comes to mind first, then tap <b>Answered!</b> An answer in time is worth <b>+10</b>, plus one point per second left. When time runs out, it is <b>too late</b>: no points, and it is the next player's turn. Answers in a row in time make a <b>🔥 streak</b>. <b>⏸</b> pauses the game, and <b>🔄 Pass</b> is free.</p>",
      nQuestions: "{n} questions",
      pickOne: "Pick at least one subject 🙂",
      resume: "↩︎ Resume {names} ({n} answered)",
      starts: "🎲 {name} starts!",
      turn: "{name}'s turn to answer",
      recycle: "♻️ You've seen every {s} question! Reshuffling.",
      depth1: "🌤️ Light",
      depth2: "🌗 Deeper",
      depth3: "🌊 Deep",
      forWho: "For {name} to answer",
      guessed: "{name} guessed it (+20)",
      answeredToo: "{name} answered too (+{n})",
      levelUp: "🎆 Connection level {n}! You two are getting closer.",
      deepToast: "🌊 That was a deep one. Thank you for sharing.",
      knowsYou: "🎯 {name} knows you well!",
      wowToast: "😮 Something new learned! +5 each",
      unlockLeaves: "{s} unlocked leaves 🌿!",
      unlockBlooms: "{s} unlocked blooms 🌸!",
      seed: "Your tree is a seed. Answer to make it grow 🌱",
      treeStats: "{total} answers · {roots} roots · {leaves} leaves & blooms",
      lvl1: "Roots",
      lvl2: "Leaves",
      lvl3: "Bloom",
      nAnswered: "{n} answered",
      answeredBy: "answered by {name}",
      reached: "{names} reached connection level {n}.",
      statAnswered: "questions answered",
      statDeep: "deep moments 🌊",
      statWow: "“didn't know that!” 😮",
      statGuess: "good guesses 🎯",
      statFav: "favourite: {s}",
      statFavNone: "favourite subject",
      statTogether: "together",
      storyFile: "our-story",
      note: "note",
      loadError: "Couldn't load the questions. Open this page through GitHub Pages or a local web server (not as a file).",
    },
    fr: {
      title: "Apprendre à se connaître",
      tagline: "Un jeu entre amis pour aller plus loin que les conversations habituelles.",
      who: "Qui joue ?",
      player1: "Joueur 1",
      player2: "Joueur 2",
            pickSubjects: "Thèmes",
      all: "Tous",
      none: "Aucun",
      howDeep: "Jusqu'où aller ?",
      light: "🌤️ Léger",
      mixed: "🌗 Mélangé",
      deep: "🌊 Profond",
      howPlay: "4. Choisissez comment jouer",
      wheelTitle: "Faire tourner la roue",
      wheelDesc: "Thème au hasard, question au hasard. Surprise totale.",
      treeTitle: "Faire pousser notre arbre",
      treeDesc: "Commencez par les racines (famille, origines) et débloquez des questions plus profondes, branche par branche.",
      footer: "Première graine de <strong>Loopy Life</strong>",
      qCount: "{n} questions à découvrir",
      connection: "Connexion",
      lv: "Niv. {n}",
      wheel: "🎡 Roue",
      tree: "🌳 Arbre",
      wheelHint: "Appuie sur TOURNER (ou sur la roue) pour tirer un thème.",
      spin: "TOURNER",
      treeHint: "Choisis une branche à faire pousser. Chaque branche commence par ses <b>racines</b> 🌱, puis fait des <b>feuilles</b> 🌿, puis des <b>fleurs</b> 🌸 avec des questions plus profondes.",
      surprise: "🎲 Surprends-nous : une branche au hasard",
      ourStory: "📖 Notre histoire",
      finish: "🏁 Terminer",
      summaryTitle: "Quelle conversation ! 🎉",
      storySoFar: "Notre histoire jusqu'ici",
      save: "⬇️ Enregistrer notre histoire",
      keepPlaying: "↩︎ Continuer à jouer",
      newGame: "✨ Nouvelle partie",
      wow: "Je ne savais pas !",
      bonusHelp: "Astuce : laisse les autres deviner la réponse d'abord. Touche les bonus qui se sont produits.",
      notePh: "Quelque chose à retenir ? (facultatif)",
      pass: "Passer",
      answered: "Répondu ! ✨",
      close: "Fermer",
      langToggle: "🇬🇧 English",
      gamesTwo: "🥂 À deux",
      updTitle: "🔄 Version de l'appli",
      updInstalled: "Version installée : {v}",
      updChecking: "Recherche d'une nouvelle version…",
      updLatest: "✅ Vous avez la dernière version.",
      updNew: "✨ La version {v} est disponible.",
      updOffline: "Impossible de vérifier pour l'instant (pas de connexion ?).",
      updForce: "🔄 Forcer la mise à jour",
      updKeep: "Vos histoires et votre partie en cours sont conservées.",
      updBanner: "✨ Une nouvelle version est disponible",
      updNow: "Mettre à jour",
      storyName: "📖 Donnez un nom à votre histoire (facultatif)",
      storyNamePh: "ex. Notre premier été",
      storiesBtn: "📚 Nos histoires",
      storiesTitle: "📚 Nos histoires",
      storiesInfo: "ℹ️ Vos histoires sont gardées uniquement dans ce navigateur, sur cet appareil. Si vous effacez les données de navigation ou désinstallez l'appli, elles disparaissent. Pour les histoires qui comptent, touchez aussi 💾 Sauvegarder pour garder un fichier .loopy en lieu sûr.",
      storiesSearch: "Chercher un nom, un joueur, une question, une note…",
      storiesEmpty: "Pas encore d'histoire : lancez une première partie !",
      storiesNone: "Rien trouvé.",
      stResume: "▶️ Reprendre",
      stReview: "📖 Revoir",
      stRename: "✏️ Renommer",
      stSave: "💾 Sauvegarder",
      stDelete: "🗑️ Supprimer",
      stDeleteSure: "🗑️ Sûr ? Touche encore",
      stAnswers: "{n} réponses",
      stDeleted: "🗑️ Histoire supprimée.",
      suggestName: "Donner un nom à votre histoire ?",
      suggestNameHint: "Pour la retrouver facilement dans 📚 Nos histoires. Vous pouvez laisser vide.",
      g_speed: "Rapidité",
      g_speedDesc: "Une question courte, quelques secondes pour répondre. Pas le temps de réfléchir : place à la spontanéité !",
      g_speedPlayers: "👥 Dès 2",
      timerTitle: "⏱️ Temps pour répondre",
      timerHint: "La question s'affiche, le compte à rebours démarre aussitôt.",
      speedFor: "⚡ {name}, réponds vite !",
      speedReady: "Touche GO pour découvrir ta question : le compte à rebours démarre aussitôt.",
      speedGo: "⚡ GO !",
      speedFor2: "⚡ {name}, à toi !",
      speedResume: "▶️ Reprendre",
      speedStreak: "🔥 Série : {n}",
      speedBest: "record : {n}",
      tooLate: "⏰ Trop tard !",
      streakToast: "🔥 {n} réponses d'affilée dans les temps !",
      pause: "Pause",
      speedPts: "⚡ +10 · +1/s restante",
      paceDate: "Le rendez-vous a son propre rythme : des questions légères d'abord, un peu plus profondes au fil de la partie.",
      paceTree: "L'arbre donne le rythme, branche par branche : des racines légères, puis des feuilles, puis des fleurs plus profondes.",
      paceCar: "En voiture, les questions restent légères ou moyennes.",
      home: "🏠 Accueil",
      badgesOther: "Dans les autres jeux",
      ourTree: "🌳 Notre arbre",
      treeTap: "Chaque réponse fait pousser votre arbre. Touchez-le pour revoir votre histoire.",
      discoveries: "✨ Ce qu'on a appris les uns sur les autres",
      aboutName: "Sur {name}",
      noDiscoveries: "La prochaine fois, touchez 😮 Je ne savais pas ! ou écrivez une note : vos découvertes apparaîtront ici.",
      bestFor: "⭐ Idéal à {n}",
      onlyTwo: "Uniquement à 2",
      minThree: "Dès 3 joueurs : deux duellistes et un juge",
      carMax: "Plus de 7 dans une voiture ? 😉",
      groupTwoOff: "Seulement quand vous êtes 2.",
      gamesRoad: "🚗 En route",
      g_date: "Premier rendez-vous",
      g_dateDesc: "Vous venez de vous rencontrer ? Des questions légères qui montent doucement, avec un joker discret.",
      g_datePlayers: "👥 À deux",
      g_couple: "Couple",
      g_coupleDesc: "Souvenirs, vous deux, l'avenir. Devinez ce que l'autre va répondre.",
      g_couplePlayers: "👥 À deux",
      g_car: "Voiture",
      g_carDesc: "Tout à la voix : un passager tient le téléphone, le conducteur répond.",
      g_carPlayers: "👥 Dès 2",
      needTwo: "Ce jeu est pensé pour deux joueurs.",
      driverTitle: "🚗 Qui conduit ?",
      driverHint: "Le conducteur répond à voix haute et ne touche jamais le téléphone.",
      noDriver: "Personne",
      voiceTitle: "🔊 Lire les questions à voix haute",
      voiceDesc: "Le téléphone lit chaque question, personne n'a besoin de regarder l'écran.",
      readAloud: "Lire à voix haute",
      driverFor: "🚗 {name}, les yeux sur la route : réponds à voix haute",
      adultTitle: "🔥 Questions +18",
      adultDesc: "Des questions suggestives sur la séduction et l'intimité, jamais explicites. Réservé aux adultes.",
      adultWarnTitle: "⚠️ Réservé aux adultes",
      adultWarnText: "<p>Ces questions parlent de séduction, d'attirance et d'intimité. Elles restent suggestives et jamais explicites, mais elles peuvent être intenses.</p><p><b>Êtes-vous sûrs ?</b> En les activant, vous confirmez que :</p><ul><li>tous les joueurs sont majeurs (18 ans ou plus) ;</li><li>tous les joueurs sont d'accord pour jouer avec ces questions ;</li><li>chacun peut passer une question à tout moment, sans se justifier.</li></ul><p class=\"disclaimer\">Vous utilisez cette option sous votre propre responsabilité. L'auteur du jeu décline toute responsabilité quant à l'usage de ces questions et à ce qui peut en découler.</p>",
      adultCancel: "Annuler",
      adultOk: "Nous sommes majeurs et d'accord",
      adultOn: "🔥 Questions +18 activées. Amusez-vous, et chacun peut passer.",
      joker: "🙈 Joker",
      dateStep: "Prenez votre temps : il n'y a pas de mauvaise réponse. 🙈 Joker change la question, sans explication.",
      stepPlayers: "Joueurs",
      stepGame: "Jeu",
      stepSettings: "Réglages",
      nextStep: "Suivant →",
      backStep: "← Retour",
      continueTitle: "Ou reprendre une histoire",
      gamesDiscover: "🌱 Pour se découvrir",
      gamesFun: "🎉 Pour rigoler",
      changeGame: "Changer",
      suggestTitle: "Une dernière chose ?",
      suggestText: "Ces options peuvent pimenter la partie. Touche celles que tu veux, ou lance sans.",
      rulesFor: "Règles : {game}",
      rulesAll: "📜 Toutes les règles",
      rulesPass: "<h3>🔄 Passer</h3><p>La question ne plaît pas ? <b>🔄 Passer</b> la remplace par une autre sur le même thème. Passez autant de fois que vous voulez : personne n'est obligé de répondre à ce qui le met mal à l'aise.</p>",
      editSubjects: "Choisir",
      subjectsAll: "Les {n} thèmes",
      subjectsSome: "{k} thèmes sur {n}",
      startGame: "🚀 C'est parti !",
      needThree: "Ce jeu est plus drôle à 3 joueurs ou plus, mais vous pouvez y jouer à 2.",
      g_wheel: "La roue",
      g_wheelDesc: "Un thème au hasard, une question au hasard. Surprise totale.",
      g_wheelPlayers: "👥 Dès 2",
      g_tree: "L'arbre",
      g_treeDesc: "Des racines aux fleurs : de plus en plus profond, thème par thème.",
      g_treePlayers: "👥 Dès 2",
      g_bluff: "Vrai ou bluff",
      g_bluffDesc: "L'appli dit en secret au joueur de répondre sincèrement ou de bluffer. Saurez-vous deviner ?",
      g_bluffPlayers: "👥 Idéal de 3 à 6",
      g_duel: "Duel",
      g_duelDesc: "Deux joueurs répondent à la même question, les autres choisissent la meilleure réponse.",
      g_duelPlayers: "👥 Idéal de 3 à 6",
      g_bet: "Le pari",
      g_betDesc: "Pariez de 1 à 3 sur la réponse. Gagnez gros ou perdez votre mise.",
      g_betPlayers: "👥 Idéal de 3 à 6",
      bluffFor: "{name} répond… sincèrement ou pas ?",
      bluffStep: "1. {name} regarde seul le secret. 2. {name} répond. 3. Les autres votent à voix haute « vrai » ou « bluff ». 4. Révélez et touchez ceux qui ont vu juste.",
      bluffLook: "🤫 {name} : regarde seul",
      bluffHide: "🙈 Cacher",
      bluffTruth: "✅ VÉRITÉ : réponds sincèrement",
      bluffLie: "🎭 BLUFF : invente une réponse crédible",
      bluffReveal: "👀 Révéler",
      bluffWas: "C'était…",
      bluffTruthShort: "✅ la vérité !",
      bluffLieShort: "🎭 un bluff !",
      bluffWho: "🎯 Qui a vu juste ? (+20 chacun, +10 pour {name} par ami berné)",
      bluffToast: "🎭 {name} a berné {n} personne(s) !",
      bluffCaught: "🎯 Personne ne s'est fait avoir cette fois !",
      duelFor: "⚔️ Duel : {a} contre {b}",
      duelStep: "{a} et {b} répondent tous les deux. Ensuite, les autres choisissent la meilleure réponse.",
      duelWho: "🏆 Qui gagne le duel ? (+20)",
      duelTie: "🤝 Égalité (+10 chacun)",
      duelToast: "🏆 {name} gagne le duel !",
      duelTieToast: "🤝 Égalité ! +10 chacun",
      betFor: "Pariez sur la réponse de {name}",
      betStep: "1. Chaque ami parie de 1 à 3 et dit sa proposition. 2. {name} répond. 3. Touchez ceux qui ont deviné.",
      betRight: "🎯 deviné",
      betLegend: "Deviné : +10 par point. Raté : −5 par point.",
      betToast: "🎲 {name} remporte {n} points !",
      betLostToast: "🎲 Paris perdus… {name} est un mystère !",
      bluffBy: "{name} ({x})",
      duelBy: "duel {a} contre {b}",
      everyoneElse: "tous les autres",
      whoModeTitle: "🗳️ Cartes « Qui de nous ? »",
      whoModeDesc: "Parfois la roue tombe sur un vote : à 3, tout le monde pointe un joueur. Tout le monde joue, idéal en grand groupe.",
      dareModeTitle: "🎭 Défis",
      dareModeDesc: "Parfois un petit défi à faire à la place d'une question.",
      randomTurnTitle: "🎲 Joueur suivant au hasard",
      randomTurnDesc: "Personne ne sait qui sera le prochain, donc tout le monde reste attentif. Pratique en grand groupe.",
      whoName: "Qui de nous ?",
      dareName: "Défi",
      whoFor: "Tout le monde vote : à 3, pointez un joueur !",
      whoPts: "+5 chacun",
      dareFor: "Défi pour {name}",
      darePts: "+20",
      another: "Une autre",
      next: "Suivant ✨",
      whoChosenLabel: "🏆 Qui a eu le plus de votes ? (+10)",
      whoUnanimous: "🤝 Unanimité (+5 chacun)",
      dareDone: "✅ Défi réussi (+20 pour {name})",
      dareLaugh: "😂 Tout le monde a ri (+5 chacun)",
      guessWhoLabel: "🎯 Qui a deviné ? (+{n} chacun)",
      whoToast: "🗳️ Le groupe a parlé : {name} !",
      unanimousToast: "🤝 Unanimité ! +5 chacun",
      dareToast: "🎭 Défi réussi, bravo {name} !",
      allVoted: "tout le monde a voté",
      dareBy: "défi pour {name}",
      statWho: "votes 🗳️",
      statDares: "défis réussis 🎭",
      badgesBtn: "🏅 Badges",
      badgesTitle: "🏅 Badges",
      badgesCount: "{n} badges débloqués sur {total}",
      badgeToast: "🏅 Badge débloqué : {name}",
      shareImage: "🖼️ Partager une image",
      imgLevel: "Niveau de connexion {n}",
      imgQuestions: "questions",
      imgBadges: "badges",
      imgMinutes: "minutes",
      imgBest: "Meilleur moment",
      installApp: "📲 Installer l'appli",
      installed: "📲 Installée ! Ouvre Loopy Life depuis ton écran d'accueil.",
      optionsTitle: "Options",
      guessModeTitle: "🔮 Devine pour l'autre",
      guessModeDesc: "Avant chaque réponse, les autres disent à voix haute ce que le joueur va répondre selon eux. Le joueur gagne un bonus si personne n'a deviné.",
      guessStep: "🔮 D'abord, {names} : devinez ce que {name} va répondre. Ensuite, {name} donne sa vraie réponse.",
      guessedRight: "{name} a bien deviné (+{n})",
      nobodyGuessed: "😏 Personne n'a deviné (+{n} pour {name})",
      surprised: "😏 {name} a surpris tout le monde !",
      saveStory: "💾 Sauvegarder l'histoire",
      saveText: "📄 Version texte",
      loadStory: "📂 Ouvrir un fichier sauvegardé (.loopy)",
      loaded: "📂 Re-bonjour {names} ! On reprend là où vous en étiez.",
      loadBad: "Ce fichier n'est pas une histoire Loopy Life (.loopy).",
      savedToast: "💾 Histoire sauvegardée. Ouvrez ce fichier la prochaine fois pour continuer.",
      addPlayer: "+ Ajouter un joueur",
      playerN: "Joueur {n}",
      remove: "Retirer",
      firstNamePh: "Ton prénom",
      otherNamePh: "Le prénom d'un ami",
      everyoneToo: "Tous les autres ont répondu aussi (+{n} chacun)",
      rules: "Règles",
      rulesBtn: "❓ Règles",
      rulesTitle: "Comment jouer",
      rulesBody: "<h3>🎯 Le but</h3><p>Mieux se connaître en répondant à des questions qu'on ne se pose jamais au quotidien. Il n'y a pas de mauvaise réponse.</p><h3>👥 Joueurs</h3><p>Deux joueurs par défaut. Ajoutez autant d'amis que vous voulez avec <b>+ Ajouter un joueur</b>. Chacun répond à son tour, l'un après l'autre.</p><h3>🧭 Lancer une partie</h3><p>Trois étapes : <b>1. Joueurs</b> (ou reprendre une histoire sauvegardée), <b>2. Jeu</b>, <b>3. Réglages</b> (thèmes, profondeur et options utiles pour ce jeu), puis <b>🚀 C'est parti !</b></p><h3>🌱 Jeux pour se découvrir</h3><ul><li><b>🎡 La roue</b> : la roue choisit un thème, puis une question au hasard.</li><li><b>🌳 L'arbre</b> : choisissez un thème (une branche). On commence par des questions simples, les <b>racines</b> 🌱, puis on débloque des <b>feuilles</b> 🌿 et des <b>fleurs</b> 🌸 plus profondes après deux réponses à chaque niveau.</li></ul><h3>🎉 Jeux pour rigoler (idéal de 3 à 6)</h3><ul><li><b>🎭 Vrai ou bluff</b> : le joueur touche <b>🤫 Regarde seul</b> et découvre en secret s'il doit répondre sincèrement ou inventer une réponse crédible. Les autres votent à voix haute « vrai » ou « bluff », puis touchez <b>Révéler</b>. Chaque ami qui a vu juste gagne <b>+20</b>, et le joueur gagne <b>+10</b> par ami berné.</li><li><b>⚔️ Duel</b> : deux joueurs répondent à la même question. Les autres choisissent la meilleure réponse (la plus sincère, la plus drôle… à vous de voir) : le gagnant remporte <b>+20</b>, ou <b>+10</b> chacun en cas d'égalité. Les deux duellistes gagnent les points de la question.</li><li><b>🎲 Le pari</b> : avant que le joueur réponde, chaque ami parie <b>1, 2 ou 3</b> sur sa capacité à deviner la réponse et dit sa proposition. Bonne réponse : <b>+10 par point misé</b>. Mauvaise : <b>−5 par point misé</b>.</li></ul><h3>⭐ Points</h3><p>Le joueur dont c'est le tour répond à voix haute et gagne <b>+10</b> (🌤️ léger), <b>+20</b> (🌗 plus profond) ou <b>+30</b> (🌊 profond) quand vous touchez <b>Répondu !</b></p><h3>🎁 Les bonus : quand les toucher</h3><p>Avant de toucher <b>Répondu !</b>, touchez chaque bonus qui s'est produit (plusieurs peuvent être activés) :</p><ul><li><b>🎯 [prénom] a deviné</b> : touchez-le quand cet ami a dit quelle serait la réponse <i>avant</i> qu'elle soit donnée, et avait raison. Il gagne <b>+20</b>. Le mieux : les autres devinent d'abord, puis le joueur répond.</li><li><b>😮 Je ne savais pas !</b> : touchez-le quand la réponse a appris aux autres quelque chose qu'ils ne savaient vraiment pas sur le joueur. Tout le monde gagne <b>+5</b>.</li><li><b>🔁 [prénom] a répondu aussi</b> (à 3 joueurs ou plus : <b>tous les autres ont répondu aussi</b>) : touchez-le quand les autres ont aussi répondu à la même question pour eux-mêmes. Ils gagnent les mêmes points que le joueur.</li></ul><p>La question ne vous plaît pas ? <b>🔄 Passer</b> la remplace par une autre du même thème. Passez autant de fois que vous voulez.</p><h3>🎆 Niveau de connexion</h3><p>Tous vos points s'additionnent dans un niveau de connexion commun. Chaque niveau gagné déclenche un feu d'artifice. <b>📖 Notre histoire</b> garde chaque question et note, et <b>🏁 Terminer</b> affiche votre bilan.</p><h3>🔮 Devine pour l'autre (option)</h3><p>À activer au début d'une histoire. Avant que le joueur réponde, tous les autres disent à voix haute ce qu'il va répondre selon eux. Ensuite, le joueur répond. Touchez <b>🎯 [prénom] a bien deviné</b> pour chaque ami qui avait raison (<b>+20</b> chacun). Si personne n'a trouvé, touchez <b>😏 Personne n'a deviné</b> : le joueur gagne <b>+10</b> pour avoir surpris tout le monde.</p><h3>🗳️ Qui de nous ? (option)</h3><p>Parfois la roue (ou le bouton 🗳️ sous l'arbre) donne un vote à la place d'une question. Comptez jusqu'à 3 et tout le monde pointe le joueur qui correspond le mieux. Tout le monde gagne <b>+5</b> pour avoir voté. Touchez le ou les joueurs qui ont eu le plus de votes (<b>+10</b> chacun), et <b>🤝 Unanimité</b> si tout le monde a pointé la même personne (<b>+5</b> chacun).</p><h3>🎭 Défis (option)</h3><p>Parfois le joueur reçoit un petit défi à la place d'une question. Touchez <b>✅ Défi réussi</b> s'il l'a fait (<b>+20</b>), et <b>😂 Tout le monde a ri</b> si ça a marché (<b>+5</b> chacun). Le défi ne plaît pas ? <b>🔄 Une autre</b> est gratuit.</p><h3>👥 Grands groupes</h3><p>À partir de 5 joueurs, la carte affiche une seule ligne <b>🎯 Qui a deviné ?</b> avec les prénoms de tout le monde. Avec <b>🎲 Joueur suivant au hasard</b>, personne ne sait qui répond ensuite. Les votes et les défis font participer tout le monde.</p><h3>🏅 Badges</h3><p>Débloquez des badges ensemble en jouant : moments profonds, bonnes devinettes, votes, défis, arbre en fleurs… Retrouvez-les avec <b>🏅 Badges</b>.</p><h3>🖼️ Partager une image</h3><p>À la fin, <b>🖼️ Partager une image</b> crée une image de votre arbre, de votre niveau et de votre meilleur moment à envoyer au groupe.</p><h3>📲 Installer l'appli</h3><p>Sur Android ou un ordinateur, touchez <b>📲 Installer l'appli</b> sur l'écran d'accueil. Sur iPhone, touchez Partager, puis <b>Sur l'écran d'accueil</b>. Elle marche ensuite sans connexion.</p><h3>💾 Sauvegarder une histoire</h3><p>Chaque groupe d'amis a sa propre histoire, et chaque histoire est gardée dans l'appli : <b>📚 Nos histoires</b> sur l'écran d'accueil les liste toutes, avec une recherche (noms, joueurs, questions, notes), et permet de reprendre, revoir, renommer ou supprimer une histoire. Vous pouvez nommer une histoire dès la première étape. Elles sont gardées uniquement dans ce navigateur : effacer les données de navigation les supprime, donc pour les histoires qui comptent, sauvegardez aussi un fichier. Touchez <b>💾 Sauvegarder l'histoire</b> (pendant la partie ou à la fin) pour télécharger un fichier <b>.loopy</b>. La prochaine fois, touchez <b>📂 Ouvrir un fichier sauvegardé (.loopy)</b> sur l'écran d'accueil et choisissez ce fichier : prénoms, scores, votre arbre et les questions déjà posées reviennent. Les questions déjà posées sur cet appareil, dans n'importe quelle histoire, passent en dernier : une nouvelle histoire commence avec des questions inédites.</p><h3>🥂 Premier rendez-vous</h3><p>Pour deux personnes qui se rencontrent. Les questions commencent légères et deviennent un peu plus profondes au fil de la partie, en mélangeant questions de rendez-vous et questions habituelles. Le <b>🙈 Joker</b> change la question sans rien dire, autant de fois que vous voulez. Pas de bluff, pas de pression.</p><h3>💑 Couple</h3><p>Pour deux personnes déjà ensemble : souvenirs, vous deux, l'avenir. Avant chaque réponse, l'autre devine à voix haute ce que vous allez dire : <b>🎯 a bien deviné</b> lui rapporte <b>+20</b>, et s'il s'est trompé, <b>😏 Personne n'a deviné</b> vous rapporte <b>+10</b>.</p><h3>🚗 Voiture</h3><p>Un passager tient le téléphone et touche l'écran ; le conducteur joue uniquement à la voix et ne touche jamais l'écran. Choisissez le conducteur dans les réglages. Avec <b>🔊 Lire les questions à voix haute</b>, le téléphone lit chaque question (touchez 🔊 sur la carte pour la réécouter). Questions légères et moyennes, manches rapides ; pas de défis ni de votes en voiture.</p><h3>🔥 Questions +18 (option)</h3><p>Uniquement en Premier rendez-vous et en Couple, désactivées par défaut. Elles parlent de séduction et d'intimité, de façon suggestive mais jamais explicite, et ont leurs propres cases 🔥 sur la roue. Les activer demande à tous les joueurs de confirmer qu'ils sont majeurs et d'accord. Chacun peut passer une question à tout moment. Vous les utilisez sous votre propre responsabilité : l'auteur du jeu décline toute responsabilité quant à leur usage.</p><h3>⚡ Rapidité</h3><p>Des questions courtes, un joueur après l'autre. Le joueur touche <b>⚡ GO</b> pour découvrir sa question : dès qu'elle s'affiche, un compte à rebours démarre (10, 15 ou 20 secondes, au choix dans les réglages) : réponds à voix haute ce qui te vient en premier, puis touche <b>Répondu !</b> Une réponse dans les temps rapporte <b>+10</b>, plus un point par seconde restante. Quand le temps est écoulé, c'est <b>trop tard</b> : pas de points, et c'est au joueur suivant. Les réponses à la suite dans les temps font une <b>🔥 série</b>. <b>⏸</b> met le jeu en pause, et <b>🔄 Passer</b> est gratuit.</p>",
      nQuestions: "{n} questions",
      pickOne: "Choisissez au moins un thème 🙂",
      resume: "↩︎ Reprendre {names} ({n} réponses)",
      starts: "🎲 {name} commence !",
      turn: "Au tour de {name} de répondre",
      recycle: "♻️ Vous avez vu toutes les questions « {s} » ! On remélange.",
      depth1: "🌤️ Léger",
      depth2: "🌗 Plus profond",
      depth3: "🌊 Profond",
      forWho: "À {name} de répondre",
      guessed: "{name} a deviné (+20)",
      answeredToo: "{name} a répondu aussi (+{n})",
      levelUp: "🎆 Niveau de connexion {n} ! Vous vous connaissez de mieux en mieux.",
      deepToast: "🌊 C'était une question profonde. Merci d'avoir partagé.",
      knowsYou: "🎯 {name} te connaît bien !",
      wowToast: "😮 Une nouvelle découverte ! +5 chacun",
      unlockLeaves: "{s} : feuilles débloquées 🌿 !",
      unlockBlooms: "{s} : fleurs débloquées 🌸 !",
      seed: "Votre arbre est une graine. Répondez pour le faire pousser 🌱",
      treeStats: "{total} réponses · {roots} racines · {leaves} feuilles & fleurs",
      lvl1: "Racines",
      lvl2: "Feuilles",
      lvl3: "Fleurs",
      nAnswered: "{n} réponses",
      answeredBy: "réponse de {name}",
      reached: "{names} ont atteint le niveau de connexion {n}.",
      statAnswered: "questions répondues",
      statDeep: "moments profonds 🌊",
      statWow: "« je ne savais pas ! » 😮",
      statGuess: "bonnes devinettes 🎯",
      statFav: "thème préféré : {s}",
      statFavNone: "thème préféré",
      statTogether: "ensemble",
      storyFile: "notre-histoire",
      note: "note",
      loadError: "Impossible de charger les questions. Ouvre cette page via GitHub Pages ou un serveur web local (pas en double-cliquant sur le fichier).",
    },
  };

  let LANG = (() => {
    try { const v = localStorage.getItem(LANG_KEY); if (v === "en" || v === "fr") return v; } catch (e) { /* ignore */ }
    return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
  })();

  function t(key, vars = {}) {
    const str = STR[LANG][key] ?? STR.en[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }
  const tr = (v) => (v && typeof v === "object" ? v[LANG] ?? v.en : v); // bilingual field -> current language
  const sName = (s) => tr(s.name);
  const sShort = (s) => tr(s.short) || sName(s);
  const qText = (q) => tr(q.text);

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  let DB = { subjects: [], questions: [] };
  let SUBJ = {}; // id -> subject
  let QBYID = {}; // id -> question
  let state = null;
  let current = null; // { q, player, bonuses:Set }
  let spinning = false;
  let wheelAngle = 0;
  let lastTreeCounts = {};

  /* ------------------------------------------------------------------ */
  /* Storage (best effort)                                              */
  /* ------------------------------------------------------------------ */
  function save() {
    if (!state) return;
    if (!state.id) state.id = newId();
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    clearTimeout(save.timer);
    const snap = state;
    save.timer = setTimeout(() => keepStory(snap), 300);
  }
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  // Every story with at least one answer (or a name) is kept in IndexedDB, in this browser.
  const IDB_NAME = "loopy-life", IDB_STORE = "stories";
  let idbP = null;
  function idb() {
    if (!idbP) {
      idbP = new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) return reject(new Error("no indexedDB"));
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: "id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      idbP.catch(() => {});
    }
    return idbP;
  }
  function idbDo(mode, fn) {
    return idb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, mode);
      const out = fn(tx.objectStore(IDB_STORE));
      tx.oncomplete = () => resolve(out && "result" in out ? out.result : undefined);
      tx.onerror = () => reject(tx.error);
    }));
  }
  let persistAsked = false;
  function keepStory(st) {
    if (!st || !st.id || (!(st.journal || []).length && !st.name)) return Promise.resolve();
    if (!persistAsked && navigator.storage && navigator.storage.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
    return idbDo("readwrite", (os) => os.put(JSON.parse(JSON.stringify(st)))).catch(() => {});
  }
  const allStories = () => idbDo("readonly", (os) => os.getAll()).then((l) => l || []).catch(() => null);
  const dropStory = (id) => idbDo("readwrite", (os) => os.delete(id)).catch(() => {});
  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  // Uniform random index; uses the crypto generator when available.
  function randInt(n) {
    try {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % n;
    } catch (e) {
      return Math.floor(Math.random() * n);
    }
  }
  const pick = (arr) => arr[randInt(arr.length)];

  // Questions already asked on this device, in any story. New draws prefer the others.
  const SEEN_KEY = "loopy-seen-v1";
  function seenSet() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch (e) { return new Set(); }
  }
  function markSeen(ids) {
    const seen = seenSet();
    ids.forEach((id) => seen.add(id));
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch (e) { /* ignore */ }
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const others = (p) => state.players.map((_, i) => i).filter((i) => i !== p);
  // one colour per player (bright for the night background, dark for the light question card)
  const PLAYER_COLORS = ["#ff7eb6", "#6ee7ff", "#ffd166", "#7ef0a8", "#b388ff", "#ff9f68", "#c4f135", "#ff6b6b", "#93a5ff", "#e7c6a1"];
  const PLAYER_DARK = ["#d63384", "#0b8bb0", "#b7791f", "#2f855a", "#6b46c1", "#c05621", "#5f7a0a", "#c53030", "#3b4fd1", "#8a5a2b"];
  const pHex = (p) => PLAYER_COLORS[p % PLAYER_COLORS.length];
  const pDark = (p) => PLAYER_DARK[p % PLAYER_DARK.length];
  const nPlayers = () => state.players.length;
  const levelSize = () => (LEVEL_UP / 2) * Math.max(2, nPlayers()); // bigger groups score faster, so levels are bigger
  const joinNames = (names) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`);

  function seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function toast(msg, ms = 2400) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), ms);
  }

  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function counts(subjectId) {
    if (!state.tree[subjectId]) state.tree[subjectId] = { 1: 0, 2: 0, 3: 0 };
    return state.tree[subjectId];
  }

  function treeLevel(subjectId) {
    const c = counts(subjectId);
    if (c[1] < 2) return 1;
    if (c[2] < 2) return 2;
    return 3;
  }

  /* ------------------------------------------------------------------ */
  /* Effects: sparkles & fireworks on a full-screen canvas              */
  /* ------------------------------------------------------------------ */
  const FX = (() => {
    const canvas = $("#fx");
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const parts = [];
    const rockets = [];
    let running = false;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    const PALETTE = ["#ff7eb6", "#ffd166", "#6ee7ff", "#b388ff", "#7ef0a8", "#ff9f68", "#ffffff"];

    function start() {
      if (!running) { running = true; requestAnimationFrame(loop); }
    }

    function burst(x, y, opts = {}) {
      if (reduced) return;
      const n = opts.count || 60;
      const colors = opts.colors || PALETTE;
      const speed = opts.speed || 6;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.35 + Math.random() * 0.75);
        parts.push({
          x, y, px: x, py: y,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, decay: 0.008 + Math.random() * 0.018,
          color: pick(colors),
          size: opts.size || 1.5 + Math.random() * 2.2,
          g: opts.gravity ?? 0.08,
          star: opts.stars && Math.random() < 0.5,
          spin: Math.random() * Math.PI,
        });
      }
      start();
    }

    function sparkle(x, y, colors) {
      burst(x, y, { count: 28, speed: 4, colors: colors || ["#ffd166", "#ffffff", "#ff7eb6"], gravity: 0.03, stars: true, size: 2.5 });
    }

    function sparkleEl(el, colors) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      sparkle(r.left + r.width / 2, r.top + r.height / 2, colors);
    }

    function fireworks(nRockets = 6, colors) {
      if (reduced) return;
      for (let i = 0; i < nRockets; i++) {
        setTimeout(() => {
          rockets.push({
            x: W * (0.15 + Math.random() * 0.7), y: H + 10,
            vx: (Math.random() - 0.5) * 2, vy: -(H / 55) * (0.75 + Math.random() * 0.35),
            color: pick(colors || PALETTE), colors,
          });
          start();
        }, i * 260 + Math.random() * 150);
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx; r.y += r.vy; r.vy += 0.18;
        ctx.fillStyle = r.color;
        ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2); ctx.fill();
        // tiny trail
        if (Math.random() < 0.6) parts.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: (Math.random() - 0.5), vy: Math.random() * 1.2, life: 0.6, decay: 0.04, color: "#ffd166", size: 1.2, g: 0.02 });
        if (r.vy >= -1) {
          rockets.splice(i, 1);
          const cols = r.colors || [r.color, pick(PALETTE), "#ffffff"];
          burst(r.x, r.y, { count: 90, speed: 7, colors: cols, gravity: 0.07 });
        }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.px = p.x; p.py = p.y;
        p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g;
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        if (p.star) {
          drawStar(p.x, p.y, p.size * 1.6, p.color, (p.spin += 0.1));
        } else {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (parts.length || rockets.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, W, H); }
    }

    function drawStar(x, y, r, color, rot) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(0, -r); ctx.lineTo(r * 0.25, -r * 0.25);
        ctx.rotate(Math.PI / 2);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    return { burst, sparkle, sparkleEl, fireworks };
  })();

  /* ------------------------------------------------------------------ */
  /* Setup screen                                                       */
  /* ------------------------------------------------------------------ */
  let setupDepth = "mixed";
  let setupTimer = 15;
  let setupGame = null;

  function goStep(n) {
    if (n === 3 && setupGame && !gameAllowed(setupGame, $$("#players-list input").length)) setupGame = null;
    if (n === 3 && !setupGame) n = 2;
    $$(".step").forEach((el) => (el.hidden = Number(el.dataset.step) !== n));
    $$("#steps li").forEach((li) => {
      const k = Number(li.dataset.step);
      li.classList.toggle("on", k === n);
      li.classList.toggle("done", k < n);
    });
    if (n === 2) renderGameChoice();
    if (n === 3) renderChosenGame();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Which games fit how many players: min/max allowed, and the range where a game shines.
  const GAME_FIT = {
    wheel: { min: 2, best: [7, 99] },
    tree: { min: 2, best: [0, 0] },
    date: { min: 2, max: 2, best: [2, 2], why: "onlyTwo" },
    couple: { min: 2, max: 2, best: [2, 2], why: "onlyTwo" },
    bluff: { min: 2, best: [3, 6] },
    duel: { min: 3, best: [3, 8], why: "minThree" },
    bet: { min: 2, best: [3, 6] },
    car: { min: 2, max: 7, best: [0, 0], why: "carMax" },
    speed: { min: 2, best: [3, 8] },
  };
  const gameAllowed = (g, n) => n >= GAME_FIT[g].min && n <= (GAME_FIT[g].max || 99);
  const gameBest = (g, n) => n >= GAME_FIT[g].best[0] && n <= GAME_FIT[g].best[1];
  // Section order on step 2: what suits the group comes first, what doesn't apply goes last.
  const GROUP_ORDER = (n) => (n === 2 ? ["two", "discover", "fun", "road"] : n <= 7 ? ["fun", "discover", "road", "two"] : ["discover", "fun", "road", "two"]);

  function renderGameChoice() {
    const n = $$("#players-list input").length;
    if (setupGame && !gameAllowed(setupGame, n)) setupGame = null;
    GROUP_ORDER(n).forEach((g, i) => { const el = $(`.game-group[data-group="${g}"]`); if (el) el.style.order = i; });
    $$(".game-card").forEach((card) => {
      const g = card.dataset.game;
      const ok = gameAllowed(g, n);
      const best = ok && gameBest(g, n);
      card.classList.toggle("on", g === setupGame);
      card.classList.toggle("off", !ok);
      card.classList.toggle("best", best);
      card.setAttribute("aria-disabled", String(!ok));
      card.querySelector(".g-players").textContent = !ok ? `🚫 ${t(GAME_FIT[g].why)}` : best ? t("bestFor", { n }) : t(`g_${g}Players`);
    });
    $$(".game-group").forEach((grp) => {
      const cards = grp.querySelectorAll(".game-card");
      const allOff = [...cards].every((c) => c.classList.contains("off"));
      grp.classList.toggle("group-off", allOff);
      const note = grp.querySelector(".group-note");
      note.hidden = !allOff;
      if (allOff) note.textContent = grp.dataset.group === "two" ? t("groupTwoOff") : "";
      note.hidden = !allOff || !note.textContent;
    });
  }

  function renderChosenGame() {
    if (!setupGame) return;
    const nP = $$("#players-list input").length;
    const fun = FUN_GAMES.includes(setupGame);
    $("#chosen-game").innerHTML = `<span class="mode-emoji">${GAME_EMOJI[setupGame]}</span><span><strong>${esc(t("g_" + setupGame))}</strong><small>${esc(t("g_" + setupGame + "Desc"))}</small>${fun && nP < 3 ? `<small class="warn">${esc(t("needThree"))}</small>` : ""}</span>`;
    const duo = DUO_GAMES.includes(setupGame), car = setupGame === "car";
    if (duo && nP !== 2) $("#chosen-game").querySelector("span:last-child").insertAdjacentHTML("beforeend", `<small class="warn">${esc(t("needTwo"))}</small>`);
    const speed = setupGame === "speed";
    $("#guess-option").hidden = fun || duo || speed; // fun games guess their own way; the couple game always guesses
    $("#timer-panel").hidden = !speed;
    $("#who-option").hidden = duo || car || speed || nP < 3; // nobody points while driving; at 2 a vote just points at the other
    if ($("#who-option").hidden) $("#who-mode").checked = false;
    $("#dare-option").hidden = duo || car || speed; // no challenges in a car, no time for them in the speed game
    $("#random-option").hidden = duo || nP < 3; // at 2, the next player is always the other one
    if ($("#random-option").hidden) $("#random-turn").checked = false;
    $("#adult-option").hidden = !duo;
    $("#car-panel").hidden = !car;
    const pace = { date: "paceDate", tree: "paceTree", car: "paceCar" }[setupGame];
    $("#depth-hint").hidden = !pace;
    if (pace) $("#depth-hint").textContent = t(pace);
    $("#depth-choice").hidden = setupGame === "date" || setupGame === "tree"; // these two set their own pace
    $("#depth-panel").hidden = speed; // speed questions are short and light
    $('#depth-choice [data-depth="deep"]').hidden = car;
    if (car && setupDepth === "deep") $('#depth-choice [data-depth="mixed"]').click();
    if (car) renderDriverChoice();
    $$(".game-card").forEach((c) => c.classList.toggle("on", c.dataset.game === setupGame));
  }
  let setupGuessMode = false;
  let setupDriver = -1;

  function renderDriverChoice() {
    const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
    if (setupDriver >= names.length) setupDriver = -1;
    const box = $("#driver-choice");
    box.innerHTML = "";
    [[-1, t("noDriver")], ...names.map((n, i) => [i, n])].forEach(([i, n]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "driver" + (i === setupDriver ? " on" : "");
      b.textContent = i < 0 ? n : `🚗 ${n}`;
      b.addEventListener("click", () => { setupDriver = i; renderDriverChoice(); });
      box.appendChild(b);
    });
  }
  let optionsTouched = false;
  let nameAsked = false;
  const OPTION_IDS = ["guess-mode", "who-mode", "dare-mode", "random-turn"];

  // The option rows that apply to the chosen game, as toggles mirroring the real switches.
  function openSuggest() {
    const list = $("#suggest-list");
    list.innerHTML = "";
    OPTION_IDS.forEach((id) => {
      const input = $("#" + id);
      const row = input.closest(".option-row");
      if (row.hidden) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "suggest-opt" + (input.checked ? " on" : "");
      b.innerHTML = `<span class="tick" aria-hidden="true"></span><span><strong>${row.querySelector("strong").innerHTML}</strong><small>${row.querySelector("small").innerHTML}</small></span>`;
      b.addEventListener("click", () => {
        input.checked = !input.checked;
        input.dispatchEvent(new Event("change"));
        b.classList.toggle("on", input.checked);
        if (input.checked) FX.sparkleEl(b);
      });
      list.appendChild(b);
    });
    $("#suggest-name-box").hidden = !!storyName();
    $("#suggest-name").value = "";
    $("#suggest-opts-box").hidden = !list.children.length;
    $("#suggest-overlay").classList.remove("hidden");
  }
  // The names typed on step 1 are remembered as typed (empty ones too), so what was erased stays erased.
  const NAMES_KEY = "loopy-setup-names";
  let setupNames = (() => {
    try { const v = JSON.parse(localStorage.getItem(NAMES_KEY)); if (Array.isArray(v) && v.length >= 2) return v.map(String); } catch (e) { /* ignore */ }
    return ["", ""];
  })();

  function readPlayerInputs() {
    const inputs = $$("#players-list input");
    if (inputs.length) setupNames = inputs.map((el) => el.value);
    try { localStorage.setItem(NAMES_KEY, JSON.stringify(setupNames)); } catch (e) { /* ignore */ }
  }

  function renderPlayersList() {
    const list = $("#players-list");
    list.innerHTML = "";
    setupNames.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.style.setProperty("--pc", pHex(i));
      const label = t("playerN", { n: i + 1 });
      row.innerHTML = `<span class="dot" aria-hidden="true"></span>
        <input id="player-${i}" type="text" maxlength="20" autocomplete="off" aria-label="${esc(label)}"
          placeholder="${esc(i === 0 ? t("firstNamePh") : t("otherNamePh"))}" value="${esc(name)}">
        ${i >= 2 ? `<button type="button" class="remove" aria-label="${esc(t("remove"))}" title="${esc(t("remove"))}">✕</button>` : ""}`;
      const rm = row.querySelector(".remove");
      if (rm) rm.addEventListener("click", () => { readPlayerInputs(); setupNames.splice(i, 1); renderPlayersList(); readPlayerInputs(); });
      list.appendChild(row);
    });
  }

  function renderSubjectGrid(selected) {
    const grid = $("#subject-grid");
    grid.innerHTML = "";
    DB.subjects.forEach((s) => {
      const n = DB.questions.filter((q) => q.subject === s.id).length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "subject" + (selected.includes(s.id) ? " on" : "");
      b.dataset.id = s.id;
      b.style.setProperty("--c", s.color);
      b.innerHTML = `<span class="emo">${s.emoji}</span><span>${esc(sName(s))}<small>${t("nQuestions", { n })}</small></span>`;
      b.addEventListener("click", () => { b.classList.toggle("on"); updateSubjectsSummary(); });
      grid.appendChild(b);
    });
  }

  function updateSubjectsSummary() {
    const n = DB.subjects.length, k = selectedSubjects().length;
    $("#subjects-summary").textContent = k === n ? t("subjectsAll", { n }) : t("subjectsSome", { k, n });
  }

  function selectedSubjects() {
    return $$("#subject-grid .subject.on").map((b) => b.dataset.id);
  }

  const storyName = () => ($("#story-name").value || "").trim().slice(0, 40);

  function initSetup() {
    renderSubjectGrid(DB.subjects.map((s) => s.id));
    renderPlayersList();
    $("#players-list").addEventListener("input", readPlayerInputs);
    $("#add-player").addEventListener("click", () => {
      readPlayerInputs();
      setupNames.push("");
      renderPlayersList();
      const inputs = $$("#players-list input");
      inputs[inputs.length - 1].focus();
    });

    $("#sel-all").addEventListener("click", () => { $$("#subject-grid .subject").forEach((b) => b.classList.add("on")); updateSubjectsSummary(); });
    $("#sel-none").addEventListener("click", () => { $$("#subject-grid .subject").forEach((b) => b.classList.remove("on")); updateSubjectsSummary(); });
    $("#edit-subjects").addEventListener("click", () => {
      $("#subject-grid").hidden = false;
      $("#subject-actions").hidden = false;
      $("#edit-subjects").hidden = true;
    });

    $("#guess-mode").addEventListener("change", (e) => (setupGuessMode = e.target.checked));
    $$("#timer-choice button").forEach((b) =>
      b.addEventListener("click", () => {
        setupTimer = Number(b.dataset.time);
        $$("#timer-choice button").forEach((x) => x.classList.toggle("on", x === b));
      })
    );
    $$("#depth-choice button").forEach((b) =>
      b.addEventListener("click", () => {
        setupDepth = b.dataset.depth;
        $$("#depth-choice button").forEach((x) => x.classList.toggle("on", x === b));
      })
    );

    $$("[data-go]").forEach((b) => b.addEventListener("click", () => goStep(Number(b.dataset.go))));
    $$(".game-card").forEach((card) =>
      card.addEventListener("click", () => {
        if (card.classList.contains("off")) { FX.sparkleEl(card.querySelector(".g-players"), ["#ff9aa2", "#ffffff"]); return; }
        setupGame = card.dataset.game;
        FX.sparkleEl(card);
        goStep(3);
      })
    );
    OPTION_IDS.forEach((id) => $("#" + id).addEventListener("change", () => (optionsTouched = true)));
    $("#adult-mode").addEventListener("change", (e) => {
      optionsTouched = true;
      if (e.target.checked) { e.target.checked = false; $("#adult-overlay").classList.remove("hidden"); }
    });
    $("#adult-cancel").addEventListener("click", () => { $("#adult-mode").checked = false; $("#adult-overlay").classList.add("hidden"); });
    $("#adult-ok").addEventListener("click", () => {
      $("#adult-mode").checked = true;
      $("#adult-overlay").classList.add("hidden");
      toast(t("adultOn"), 3200);
    });
    $("#suggest-back").addEventListener("click", () => $("#suggest-overlay").classList.add("hidden"));
    $("#suggest-go").addEventListener("click", () => {
      $("#story-name").value = $("#suggest-name").value;
      $("#suggest-overlay").classList.add("hidden");
      $("#start-btn").click();
    });
    $("#start-btn").addEventListener("click", () => {
      if (!optionsTouched || (!storyName() && !nameAsked)) {
        optionsTouched = true; // suggest once, then start as chosen
        nameAsked = true;
        openSuggest();
        return;
      }
      const subjects = selectedSubjects();
      if (!subjects.length) {
        $("#setup-error").textContent = t("pickOne");
        $("#subject-grid").hidden = false;
        $("#subject-actions").hidden = false;
        return;
      }
      $("#setup-error").textContent = "";
      const names = $$("#players-list input").map((el, i) => el.value.trim() || t("playerN", { n: i + 1 }));
      newGame(names, subjects, setupDepth, setupGame);
    });
    goStep(1);

    const saved = loadSaved();
    if (saved && saved.version === 1 && ((saved.journal?.length || 0) > 0 || saved.active)) showResume(saved);
  }

  // Back on the home screen: step 1 keeps the names as they were typed (the game itself is in "Our stories").
  function showResume() {
    renderPlayersList();
  }

  function resumeSaved(saved) {
    state = saved;
    state.subjects = state.subjects.filter((id) => SUBJ[id]);
    if (!state.subjects.length) state.subjects = DB.subjects.map((s) => s.id);
    if (!Array.isArray(state.badges)) state.badges = [];
    startGame();
  }

  /* ------------------------------------------------------------------ */
  /* Game state                                                         */
  /* ------------------------------------------------------------------ */
  function newGame(players, subjects, depth, game) {
    const mode = game === "tree" ? "tree" : game === "speed" ? "speed" : "wheel";
    state = {
      version: 1,
      id: newId(),
      name: storyName(),
      players,
      scores: players.map(() => 0),
      passes: players.map(() => PASSES),
      turn: Math.floor(Math.random() * players.length),
      subjects,
      depth,
      mode,
      game,
      guessMode: game === "couple" || (setupGuessMode && !FUN_GAMES.includes(game) && game !== "date" && game !== "speed"),
      timer: game === "speed" ? setupTimer : 0,
      streak: 0,
      bestStreak: 0,
      whoMode: !DUO_GAMES.includes(game) && game !== "car" && game !== "speed" && players.length > 2 && $("#who-mode").checked,
      dareMode: !DUO_GAMES.includes(game) && game !== "car" && game !== "speed" && $("#dare-mode").checked,
      randomTurn: !DUO_GAMES.includes(game) && $("#random-turn").checked,
      adult: DUO_GAMES.includes(game) && $("#adult-mode").checked,
      driver: game === "car" ? setupDriver : -1,
      voice: game === "car" && $("#voice-mode").checked,
      badges: [],
      used: [],
      journal: [],
      tree: {},
      connection: 0,
      startedAt: Date.now(),
    };
    lastTreeCounts = {};
    $("#story-name").value = ""; // the next game starts a new story
    save();
    startGame();
    setTimeout(() => toast(t("starts", { name: state.players[state.turn] })), 500);
  }

  // "“Our first summer” · 🥂 First date · 🔥 +18": the story's name, then the game when it has its own name.
  function gameTitle() {
    const g = gameOf(state);
    const parts = [];
    if (state.name) parts.push(`📖 ${state.name}`);
    if (g !== "wheel" && g !== "tree") parts.push(`${GAME_EMOJI[g]} ${t("g_" + g)}${state.adult ? " · 🔥 +18" : ""}`);
    return parts.join(" · ");
  }

  function startGame() {
    state.active = true; // reopening or reloading the page comes back to this game
    save();
    const g = gameOf(state);
    const named = g !== "wheel" && g !== "tree";
    $("#mode-switch").hidden = named;
    $("#game-name").textContent = gameTitle();
    renderScoreboard();
    showScreen("screen-game");
    updateScores(false);
    setMode(state.mode);
  }

  function setMode(mode) {
    state.mode = mode;
    save();
    $$("[data-switch]").forEach((b) => b.classList.toggle("on", b.dataset.switch === mode));
    $("#view-wheel").classList.toggle("active", mode === "wheel");
    $("#view-tree").classList.toggle("active", mode === "tree");
    $("#view-speed").classList.toggle("active", mode === "speed");
    if (mode === "speed") renderSpeedView();
    renderTree();
    if (mode === "wheel") drawWheel();
  }

  function renderScoreboard() {
    const board = $("#scoreboard");
    board.innerHTML = "";
    board.classList.toggle("compact", nPlayers() >= COMPACT_FROM);
    board.classList.toggle("no-pts", !competitive());
    state.players.forEach((name, i) => {
      const el = document.createElement("div");
      el.className = "score";
      el.id = `score-${i}`;
      el.style.setProperty("--pc", pHex(i));
      el.innerHTML = `<span class="who">${esc(name)}</span><span class="pts">0</span>`;
      board.appendChild(el);
    });
  }

  function updateScores(animate = true, changed = []) {
    state.players.forEach((_, i) => {
      const el = $(`#score-${i}`);
      if (!el) return;
      el.querySelector(".pts").textContent = state.scores[i];
      el.classList.toggle("active", state.turn === i);
      if (state.turn === i && nPlayers() >= COMPACT_FROM && el.scrollIntoView) {
        try { el.scrollIntoView({ block: "nearest", inline: "center", behavior: animate ? "smooth" : "auto" }); } catch (e) { /* ignore */ }
      }
      if (animate && changed.includes(i)) {
        const pts = el.querySelector(".pts");
        pts.classList.remove("bump"); void pts.offsetWidth; pts.classList.add("bump");
      }
    });
    const size = levelSize();
    const lvl = Math.floor(state.connection / size) + 1;
    $("#conn-level").textContent = t("lv", { n: lvl });
    $("#conn-fill").style.width = `${((state.connection % size) / size) * 100}%`;
    const name = state.players[state.turn];
    $("#turn-banner").innerHTML = esc(t("turn", { name: "\u0000" })).replace("\u0000", `<b style="background:${pHex(state.turn)}">${esc(name)}</b>`);
  }

  /* ------------------------------------------------------------------ */
  /* Question picking                                                   */
  /* ------------------------------------------------------------------ */
  function depthsFor(pref) {
    if (pref === "light") return [1];
    if (pref === "deep") return [2, 3];
    // mixed: weighted toward light/deeper
    const r = Math.random();
    return r < 0.4 ? [1] : r < 0.8 ? [2] : [3];
  }

  function unusedIn(subjectId) {
    const used = new Set(state.used);
    return DB.questions.filter((q) => q.subject === subjectId && !used.has(q.id));
  }

  function recycle(subjectId) {
    const ids = new Set(DB.questions.filter((q) => q.subject === subjectId).map((q) => q.id));
    state.used = state.used.filter((id) => !ids.has(id));
    toast(t("recycle", { s: sName(SUBJ[subjectId]) }));
  }

  // A question from one of the date / couple / +18 pools, not used in this story if possible.
  function drawPool(poolId, depths, excludeId) {
    let list = DB[POOL_KEY[poolId]] || [];
    if (poolId === "__spicy") list = list.filter((q) => q.modes.includes(gameOf(state)));
    const used = new Set(state.used);
    let pool = list.filter((q) => !used.has(q.id) && q.id !== excludeId);
    if (!pool.length) {
      const ids = new Set(list.map((q) => q.id));
      state.used = state.used.filter((id) => !ids.has(id));
      pool = list.filter((q) => q.id !== excludeId);
    }
    if (!pool.length) return null;
    const atDepth = pool.filter((q) => depths.includes(q.depth));
    const near = atDepth.length ? atDepth : pool;
    const seen = seenSet();
    const fresh = near.filter((q) => !seen.has(q.id));
    return pick(fresh.length ? fresh : near);
  }

  // Depths for the current game: a first date warms up slowly, the car stays light.
  function gameDepths() {
    const g = gameOf(state);
    const n = state.journal.filter((e) => !e.kind).length;
    if (g === "date") return n < 4 ? [1] : n < 10 ? (randInt(3) ? [2] : [1]) : (randInt(3) ? [2] : [3]);
    if (g === "car") return state.depth === "deep" ? [2] : depthsFor(state.depth === "mixed" ? "mixed" : state.depth).map((d) => Math.min(d, 2));
    return depthsFor(state.depth);
  }

  // What the wheel or a branch gives: exactly the segment it landed on (a subject or a date / couple / +18 pool).
  function drawForGame(subjectId, depths) {
    return drawQuestion(subjectId, depths);
  }

  function drawQuestion(subjectId, depths, excludeId) {
    if (POOLS[subjectId]) return drawPool(subjectId, depths, excludeId) || drawQuestion(pick(state.subjects), depths);
    let pool = unusedIn(subjectId).filter((q) => q.id !== excludeId);
    if (!pool.length) { recycle(subjectId); pool = unusedIn(subjectId).filter((q) => q.id !== excludeId); }
    let filtered = pool.filter((q) => depths.includes(q.depth));
    if (!filtered.length) {
      // closest depth available
      const target = depths[0];
      const sorted = [...pool].sort((a, b) => Math.abs(a.depth - target) - Math.abs(b.depth - target));
      filtered = sorted.filter((q) => q.depth === sorted[0].depth);
    }
    // prefer questions never asked on this device, in any story
    const seen = seenSet();
    const fresh = filtered.filter((q) => !seen.has(q.id));
    return pick(fresh.length ? fresh : filtered);
  }

  /* ------------------------------------------------------------------ */
  /* Question card                                                      */
  /* ------------------------------------------------------------------ */
  // Writes the current question into the card, in the current language.
  function fillCard() {
    if (!current) return;
    const g0 = gameOf(state);
    const { q, player: p, kind } = current;
    const s = SUBJ[q.subject];
    const who = `<b style="color:${pDark(p)}">${esc(state.players[p])}</b>`;
    $("#q-subject").textContent = `${s.emoji} ${sName(s)}`;
    $("#q-text").textContent = qText(q);
    $("#passes-wrap").hidden = !!kind;
    $("#bonus-help").hidden = !!kind;
    if (kind === "who") {
      $("#q-depth").textContent = t("whoPts");
      $("#q-for").textContent = t("whoFor");
    } else if (kind === "dare") {
      $("#q-depth").textContent = t("darePts");
      $("#q-for").innerHTML = esc(t("dareFor", { name: "\u0000" })).replace("\u0000", who);
    } else {
      $("#q-depth").textContent = g0 === "speed" ? t("speedPts") : `${t("depth" + q.depth)} · +${POINTS[q.depth]}`;
      const key = { bluff: "bluffFor", bet: "betFor" }[current.game] || (g0 === "speed" ? "speedFor" : "forWho");
      $("#q-for").innerHTML = esc(t(key, { name: "\u0000" })).replace("\u0000", who);
      if (current.game === "duel") {
        const r = current.rival;
        $("#q-for").innerHTML = esc(t("duelFor", { a: "\u0001", b: "\u0002" }))
          .replace("\u0001", who).replace("\u0002", `<b style="color:${pDark(r)}">${esc(state.players[r])}</b>`);
      }
    }
    const g = gameOf(state);
    const joker = !kind && (g === "date" || q.subject === "__spicy");
    if (g === "car" && p === state.driver) $("#q-for").innerHTML = esc(t("driverFor", { name: "\u0000" })).replace("\u0000", who);
    $("#bonus-help").hidden = !!kind || !!current.game || g === "car";
    $("#q-note").hidden = g === "car" || g === "speed";
    $("#pause-btn").hidden = g !== "speed";
    $("#timer").hidden = g !== "speed";
    if (g === "speed") $("#bonus-help").hidden = true;
    $("#speak-btn").hidden = !("speechSynthesis" in window) || g !== "car";
    $("#done-btn").disabled = false;
    renderBonuses();
    if (!kind && g === "date") { const step = $("#guess-step"); step.hidden = false; step.textContent = t("dateStep"); }
    $("#pass-label").textContent = kind ? t("another") : joker ? t("joker") : t("pass");
    $("#passes-wrap").hidden = true; // passing is free in every game
    $("#done-btn").textContent = kind ? t("next") : t("answered");
    $("#passes").textContent = state.passes[p];
    $("#skip-btn").disabled = false;
  }

  // A chip with a player's colour dot and name, for compact rows.
  const nameChip = (o) => `<span class="pdot" style="background:${pHex(o)}"></span><span>${esc(state.players[o])}</span>`;

  // Bonus chips: one "guessed it" per other player, plus "didn't know" and "answered too".
  function renderBonuses() {
    const { q, player: p, bonuses, kind } = current;
    const os = others(p);
    const step = $("#guess-step");
    step.hidden = !state.guessMode || !!kind;
    if (state.guessMode && !kind) {
      const names = os.length >= COMPACT_FROM - 1 ? t("everyoneElse") : joinNames(os.map((o) => state.players[o]));
      step.textContent = t("guessStep", { names, name: state.players[p] });
    }
    const groups = []; // [{ label, chips }]
    if (current.game) return renderFunGame();
    if (kind === "who") {
      groups.push({ label: t("whoChosenLabel"), chips: state.players.map((_, o) => ({ key: `chosen:${o}`, html: nameChip(o), small: true })) });
      groups.push({ chips: [{ key: "unanimous", html: `<span>${esc(t("whoUnanimous"))}</span>` }] });
      return paintBonuses(groups);
    }
    if (kind === "dare") {
      groups.push({ chips: [
        { key: "dare", html: `<span>${esc(t("dareDone", { name: state.players[p] }))}</span>` },
        { key: "laugh", html: `<span>${esc(t("dareLaugh"))}</span>` },
      ] });
      return paintBonuses(groups);
    }
    if (gameOf(state) === "speed") {
      // no time for guesses: only "didn't know!"
      groups.push({ chips: [{ key: "wow", html: `😮 <span>${esc(t("wow"))}</span>` }] });
      return paintBonuses(groups);
    }
    const compact = nPlayers() >= COMPACT_FROM;
    const guessPts = state.guessMode ? GUESS_MODE_POINTS : GUESS_POINTS;
    const chips = [];
    if (compact) {
      groups.push({ label: t("guessWhoLabel", { n: guessPts }), chips: os.map((o) => ({ key: `guess:${o}`, html: nameChip(o), small: true })) });
    } else {
      os.forEach((o) => chips.push({
        key: `guess:${o}`,
        html: `🎯 <span>${esc(state.guessMode
          ? t("guessedRight", { name: state.players[o], n: GUESS_MODE_POINTS })
          : t("guessed", { name: state.players[o] }))}</span>`,
      }));
    }
    if (state.guessMode) {
      chips.push({ key: "nobody", html: `<span>${esc(t("nobodyGuessed", { n: SURPRISE_POINTS, name: state.players[p] }))}</span>` });
    }
    chips.push({ key: "wow", html: `😮 <span>${esc(t("wow"))}</span>` });
    const tooLabel = os.length === 1
      ? t("answeredToo", { name: state.players[os[0]], n: POINTS[q.depth] })
      : t("everyoneToo", { n: POINTS[q.depth] });
    chips.push({ key: "both", html: `🔁 <span>${esc(tooLabel)}</span>` });
    groups.push({ chips });
    paintBonuses(groups);
  }

  function paintBonuses(groups) {
    const { bonuses } = current;
    const row = $("#bonus-row");
    row.innerHTML = "";
    groups.forEach(({ label, chips }, gi) => {
      if (!label && gi > 0) {
        const br = document.createElement("span");
        br.className = "bonus-break";
        row.appendChild(br);
      }
      if (label) {
        const l = document.createElement("p");
        l.className = "bonus-label";
        l.textContent = label;
        row.appendChild(l);
      }
      chips.forEach(({ key, html, small }) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "bonus" + (small ? " name" : "") + (bonuses.has(key) ? " on" : "");
        b.innerHTML = html;
        b.addEventListener("click", () => {
          b.classList.toggle("on");
          if (b.classList.contains("on")) { bonuses.add(key); FX.sparkleEl(b); }
          else bonuses.delete(key);
        });
        row.appendChild(b);
      });
    });
  }

  function openCard(q, kind) {
    current = { q, player: state.turn, bonuses: new Set(kind === "dare" ? ["dare"] : []), kind };
    const g = gameOf(state);
    if (!kind && FUN_GAMES.includes(g) && nPlayers() >= 2) {
      current.game = g;
      if (g === "bluff") { current.bluff = randInt(2) === 1; current.peek = false; current.revealed = false; }
      if (g === "duel") { const os = others(state.turn); current.rival = os[randInt(os.length)]; }
      if (g === "bet") current.bets = {};
    }
    fillCard();

    const card = $("#card");
    const s = SUBJ[q.subject];
    $("#q-note").value = "";
    card.style.setProperty("--c", s.color);
    $("#card-overlay").style.setProperty("--c", s.color);

    $("#card-overlay").classList.remove("hidden");
    // restart the flip animation
    card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
    setTimeout(() => FX.sparkleEl($("#q-text"), [s.color, "#ffd166", "#ffffff"]), 250);
    if (state.voice) setTimeout(speakCurrent, 500);
  }

  // Reads the question aloud (car game), with the name of who answers.
  function speakCurrent() {
    if (!current || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const text = `${$("#q-for").textContent}. ${qText(current.q)}`.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "").trim();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG === "fr" ? "fr-FR" : "en-US";
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  function closeCard() {
    stopTimer();
    try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    $("#card-overlay").classList.add("hidden");
    current = null;
  }


  /* ------------------------------------------------------------------ */
  /* Fun games: truth or bluff, duel, bet                               */
  /* ------------------------------------------------------------------ */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function toggleChip(key, html, exclusive) {
    const { bonuses } = current;
    const b = el("button", "bonus name" + (bonuses.has(key) ? " on" : ""), html);
    b.type = "button";
    b.addEventListener("click", () => {
      const on = !bonuses.has(key);
      if (exclusive) exclusive.forEach((k) => bonuses.delete(k));
      if (on) { bonuses.add(key); FX.sparkleEl(b); } else bonuses.delete(key);
      renderBonuses();
    });
    return b;
  }

  // "1. Do this. 2. Then that." -> a numbered list
  function setSteps(el, text) {
    const parts = text.split(/(?:^|\s)\d\.\s/).map((x) => x.trim()).filter(Boolean);
    el.innerHTML = parts.length > 1 ? `<ol>${parts.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : esc(text);
  }

  function renderFunGame() {
    const { player: p, game } = current;
    const os = others(p);
    const name = state.players[p];
    const step = $("#guess-step");
    step.hidden = false;
    const row = $("#bonus-row");
    row.innerHTML = "";

    if (game === "bluff") {
      $("#done-btn").disabled = !current.revealed; // no points before the reveal
      setSteps(step, t("bluffStep", { name }));
      const secret = el("div", "secret" + (current.peek ? " open" : ""));
      if (current.peek) {
        secret.appendChild(el("p", "secret-text " + (current.bluff ? "lie" : "truth"), esc(t(current.bluff ? "bluffLie" : "bluffTruth"))));
        const hide = el("button", "btn ghost small", esc(t("bluffHide")));
        hide.type = "button";
        hide.addEventListener("click", () => { current.peek = false; renderBonuses(); });
        secret.appendChild(hide);
      } else {
        const look = el("button", "btn secret-btn", esc(t("bluffLook", { name })));
        look.type = "button";
        look.addEventListener("click", () => { current.peek = true; renderBonuses(); });
        secret.appendChild(look);
      }
      row.appendChild(secret);
      if (!current.revealed) {
        const rv = el("button", "btn ghost small reveal-btn", esc(t("bluffReveal")));
        rv.type = "button";
        rv.addEventListener("click", () => { current.revealed = true; current.peek = false; renderBonuses(); FX.sparkleEl($("#q-text")); });
        row.appendChild(rv);
      } else {
        row.appendChild(el("p", "reveal " + (current.bluff ? "lie" : "truth"), `${esc(t("bluffWas"))} <b>${esc(t(current.bluff ? "bluffLieShort" : "bluffTruthShort"))}</b>`));
        row.appendChild(el("p", "bonus-label", esc(t("bluffWho", { name }))));
        os.forEach((o) => row.appendChild(toggleChip(`guess:${o}`, nameChip(o))));
      }
      return;
    }

    if (game === "duel") {
      const r = current.rival;
      step.textContent = t("duelStep", { a: name, b: state.players[r] });
      row.appendChild(el("p", "bonus-label", esc(t("duelWho"))));
      const keys = ["win:" + p, "win:" + r, "tie"];
      row.appendChild(toggleChip(keys[0], nameChip(p), keys));
      row.appendChild(toggleChip(keys[1], nameChip(r), keys));
      row.appendChild(toggleChip(keys[2], `<span>${esc(t("duelTie"))}</span>`, keys));
      return;
    }

    // bet
    setSteps(step, t("betStep", { name }));
    const list = el("div", "bets");
    os.forEach((o) => {
      const bet = current.bets[o] || 1;
      const line = el("div", "bet-row");
      line.appendChild(el("span", "bet-name", nameChip(o)));
      const seg = el("div", "bet-seg");
      [1, 2, 3].forEach((v) => {
        const b = el("button", v === bet ? "on" : "", String(v));
        b.type = "button";
        b.addEventListener("click", () => { current.bets[o] = v; renderBonuses(); });
        seg.appendChild(b);
      });
      line.appendChild(seg);
      line.appendChild(toggleChip(`guess:${o}`, `<span>${esc(t("betRight"))}</span>`));
      list.appendChild(line);
    });
    row.appendChild(list);
    row.appendChild(el("p", "bonus-help", esc(t("betLegend"))));
  }

  // Points for a fun-game question; returns a toast message.
  function scoreFunGame(gained, base) {
    const { player: p, bonuses, game } = current;
    const os = others(p);
    if (game === "bluff") {
      const seen = os.filter((o) => bonuses.has(`guess:${o}`));
      const fooled = os.length - seen.length;
      gained[p] += base + fooled * BLUFF_FOOLED;
      seen.forEach((o) => (gained[o] += BLUFF_SEEN));
      if (!current.revealed) return null;
      return fooled ? t("bluffToast", { name: state.players[p], n: fooled }) : t("bluffCaught");
    }
    if (game === "duel") {
      const r = current.rival;
      gained[p] += base;
      gained[r] += base;
      if (bonuses.has("tie")) { gained[p] += DUEL_TIE; gained[r] += DUEL_TIE; return t("duelTieToast"); }
      const w = bonuses.has("win:" + p) ? p : bonuses.has("win:" + r) ? r : -1;
      if (w >= 0) { gained[w] += DUEL_WIN; return t("duelToast", { name: state.players[w] }); }
      return null;
    }
    // bet
    gained[p] += base;
    let best = -1, bestN = 0;
    os.forEach((o) => {
      const bet = current.bets[o] || 1;
      if (bonuses.has(`guess:${o}`)) {
        gained[o] += bet * BET_WIN;
        if (bet * BET_WIN > bestN) { bestN = bet * BET_WIN; best = o; }
      } else {
        gained[o] -= Math.min(bet * BET_LOSS, state.scores[o]); // never below zero
      }
    });
    return best >= 0 ? t("betToast", { name: state.players[best], n: bestN }) : t("betLostToast", { name: state.players[p] });
  }

  // Whose turn after `player`: the next one, or anyone else at random with that option.
  function nextTurn(player) {
    const n = nPlayers();
    if (state.randomTurn && n > 2) {
      const os = others(player);
      return os[randInt(os.length)];
    }
    return (player + 1) % n;
  }

  // Picks a vote or a challenge not used in this story, preferring ones never seen on this device.
  function drawExtra(kind, excludeId) {
    const list = kind === "who" ? DB.who || [] : DB.challenges || [];
    const used = new Set(state.used);
    let pool = list.filter((x) => !used.has(x.id) && x.id !== excludeId);
    if (!pool.length) {
      const ids = new Set(list.map((x) => x.id));
      state.used = state.used.filter((id) => !ids.has(id));
      pool = list.filter((x) => x.id !== excludeId);
    }
    const seen = seenSet();
    const fresh = pool.filter((x) => !seen.has(x.id));
    const x = pick(fresh.length ? fresh : pool);
    return QBYID[x.id] || x;
  }

  function openExtra(id) {
    const kind = EXTRAS[id].kind;
    openCard(drawExtra(kind), kind);
  }

  function finishExtra() {
    const { q, player, bonuses, kind } = current;
    const gained = state.players.map(() => 0);
    let chosen = [];
    if (kind === "who") {
      chosen = state.players.map((_, i) => i).filter((i) => bonuses.has(`chosen:${i}`));
      gained.forEach((_, i) => (gained[i] += VOTE_POINTS));
      chosen.forEach((i) => (gained[i] += CHOSEN_POINTS));
      if (bonuses.has("unanimous")) gained.forEach((_, i) => (gained[i] += 5));
    } else {
      if (bonuses.has("dare")) gained[player] += DARE_POINTS;
      if (bonuses.has("laugh")) gained.forEach((_, i) => (gained[i] += 5));
    }
    const size = levelSize();
    const beforeLvl = Math.floor(state.connection / size);
    gained.forEach((g, i) => (state.scores[i] += g));
    state.connection += gained.reduce((a, b) => a + b, 0);
    const afterLvl = Math.floor(state.connection / size);

    state.used.push(q.id);
    markSeen([q.id]);
    state.journal.push({
      qid: q.id, text: q.text, subject: kind === "who" ? "__who" : "__dare", depth: 0, kind,
      player, bonuses: [...bonuses], note: $("#q-note").value.trim(),
      gained, t: Date.now(),
    });
    state.turn = nextTurn(player);
    save();

    FX.sparkleEl($("#done-btn"));
    closeCard();
    updateScores(true, gained.map((g, i) => (g ? i : -1)).filter((i) => i >= 0));
    if (afterLvl > beforeLvl) {
      FX.fireworks(8);
      toast(t("levelUp", { n: afterLvl + 1 }), 3200);
    } else if (kind === "who" && bonuses.has("unanimous")) {
      FX.fireworks(4);
      toast(t("unanimousToast"));
    } else if (kind === "who" && chosen.length) {
      chosen.forEach((o) => FX.sparkleEl($(`#score-${o}`), [pHex(o), "#ffd166", "#ffffff"]));
      toast(t("whoToast", { name: joinNames(chosen.map((o) => state.players[o])) }));
    } else if (kind === "dare" && bonuses.has("dare")) {
      FX.sparkleEl($(`#score-${player}`), [pHex(player), "#ffd166", "#ffffff"]);
      toast(t("dareToast", { name: state.players[player] }));
    }
    afterTurn();
  }

  // Redraws the current view and checks badges, after any card.
  function afterTurn() {
    renderTree();
    if (state.mode !== "tree") drawWheel();
    checkBadges();
  }

  function finishQuestion() {
    if (!current) return;
    if (current.kind) return finishExtra();
    const { q, player, bonuses } = current;
    const os = others(player);
    const base = POINTS[q.depth];
    const gained = state.players.map(() => 0);
    const funMsg = current.game ? scoreFunGame(gained, base) : null;
    if (!current.game) gained[player] += base;
    const guessers = current.game ? [] : os.filter((o) => bonuses.has(`guess:${o}`));
    guessers.forEach((o) => (gained[o] += state.guessMode ? GUESS_MODE_POINTS : GUESS_POINTS));
    const surprised = state.guessMode && bonuses.has("nobody") && !guessers.length;
    if (surprised) gained[player] += SURPRISE_POINTS;
    if (bonuses.has("wow")) gained.forEach((_, i) => (gained[i] += 5));
    if (bonuses.has("both") && !current.game) os.forEach((o) => (gained[o] += base));
    let speedLeft = null;
    if (gameOf(state) === "speed") {
      speedLeft = timeLeft();
      gained[player] += speedLeft;
      state.streak = (state.streak || 0) + 1;
      state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
    }

    const size = levelSize();
    const beforeLvl = Math.floor(state.connection / size);
    gained.forEach((g, i) => (state.scores[i] += g));
    state.connection += gained.reduce((a, b) => a + Math.max(0, b), 0);
    const afterLvl = Math.floor(state.connection / size);

    state.used.push(q.id);
    markSeen([q.id]);
    counts(q.subject)[q.depth] += 1;
    state.journal.push({
      qid: q.id, text: q.text, subject: q.subject, depth: q.depth,
      player, bonuses: [...bonuses], note: $("#q-note").value.trim(),
      gained, t: Date.now(),
      ...(current.game ? { game: current.game } : {}),
      ...(speedLeft != null ? { left: speedLeft } : {}),
      ...(current.game === "bluff" ? { bluff: current.bluff } : {}),
      ...(current.game === "duel" ? { rival: current.rival } : {}),
      ...(current.game === "bet" ? { bets: current.bets } : {}),
    });
    state.turn = nextTurn(player);
    save();

    FX.sparkleEl($("#done-btn"));
    closeCard();
    updateScores(true, gained.map((g, i) => (g ? i : -1)).filter((i) => i >= 0));

    const s = SUBJ[q.subject];
    if (afterLvl > beforeLvl) {
      FX.fireworks(8);
      toast(t("levelUp", { n: afterLvl + 1 }), 3200);
    } else if (speedLeft != null && state.streak % 5 === 0) {
      FX.fireworks(4, ["#ffb703", "#ffd166", "#ffffff"]);
      toast(t("streakToast", { n: state.streak }));
    } else if (q.depth === 3) {
      FX.fireworks(4, [s.color, "#ffd166", "#ffffff"]);
      toast(t("deepToast"));
    } else if (funMsg) {
      FX.fireworks(3, [pHex(player), "#ffd166", "#ffffff"]);
      toast(funMsg, 2800);
    } else if (guessers.length) {
      guessers.forEach((o) => FX.sparkleEl($(`#score-${o}`), ["#ffd166", "#7ef0a8", "#ffffff"]));
      toast(t("knowsYou", { name: joinNames(guessers.map((o) => state.players[o])) }));
    } else if (surprised) {
      toast(t("surprised", { name: state.players[player] }));
    } else if (bonuses.has("wow")) {
      toast(t("wowToast"));
    }
    FX.sparkleEl($(`#score-${player}`), [pHex(player), "#ffd166", "#ffffff"]);

    if (state.mode === "speed") {
      renderTree();
      renderSpeedView();
      speedNextSoon();
    } else if (state.mode === "tree") {
      renderTree();
      const c = counts(q.subject);
      if ((q.depth === 1 && c[1] === 2) || (q.depth === 2 && c[2] === 2)) {
        setTimeout(() => toast(t(q.depth === 1 ? "unlockLeaves" : "unlockBlooms", { s: `${s.emoji} ${sName(s)}` })), 900);
      }
    } else {
      renderTree();
      drawWheel();
    }
    checkBadges();
  }

  function passQuestion() {
    if (!current) return;
    if (current.kind) {
      // another vote or challenge: free, same player
      const { kind, q: old } = current;
      state.used.push(old.id);
      markSeen([old.id]);
      save();
      openCard(drawExtra(kind, old.id), kind);
      return;
    }
    const p = current.player;
    state.used.push(current.q.id);
    markSeen([current.q.id]);
    save();
    if (gameOf(state) === "speed") { const old = current.q.id; closeCard(); openSpeedCard(old); return; }
    const q = drawQuestion(current.q.subject, [current.q.depth], current.q.id);
    openCard(q);
  }

  function initCard() {
    $("#speak-btn").addEventListener("click", speakCurrent);
    $("#done-btn").addEventListener("click", finishQuestion);
    $("#skip-btn").addEventListener("click", passQuestion);
  }

  /* ------------------------------------------------------------------ */
  /* Speed: short questions in a row, a countdown on each               */
  /* ------------------------------------------------------------------ */
  let timerEnd = 0, timerTick = null, speedPaused = true, speedNext = null;

  // Half from the speed pack, half the shortest light questions of the chosen subjects.
  function drawSpeed(excludeId) {
    if (randInt(2)) {
      const subj = pick(state.subjects);
      const used = new Set(state.used);
      const short = DB.questions.filter((q) => q.subject === subj && q.depth === 1 && !used.has(q.id) && q.id !== excludeId && qText(q).length <= 60);
      if (short.length) {
        const seen = seenSet();
        const fresh = short.filter((q) => !seen.has(q.id));
        return pick(fresh.length ? fresh : short);
      }
    }
    return drawPool("__speed", [1], excludeId);
  }

  function openSpeedCard(excludeId) {
    if (current) return;
    speedPaused = false;
    clearTimeout(speedNext);
    openCard(drawSpeed(excludeId));
    startTimer();
  }

  // After an answer (or a late one), the next player's question comes on its own.
  // After an answer (or a late one), the next player taps GO to discover their question.
  function speedNextSoon() {
    clearTimeout(speedNext);
    speedPaused = true;
    renderSpeedView();
  }

  const timeLeft = () => Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));

  function startTimer() {
    stopTimer();
    const total = (state.timer || 15) * 1000;
    timerEnd = Date.now() + total;
    let lastSec = -1;
    const tick = () => {
      const ms = Math.max(0, timerEnd - Date.now());
      const sec = Math.ceil(ms / 1000);
      $("#timer-fill").style.width = `${(ms / total) * 100}%`;
      $("#timer-num").textContent = sec;
      $("#timer").classList.toggle("hurry", sec <= 3);
      if (sec !== lastSec && sec <= 3 && sec > 0 && navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* ignore */ } }
      lastSec = sec;
      if (ms <= 0) timeUp();
    };
    tick();
    timerTick = setInterval(tick, 100);
  }

  function stopTimer() {
    clearInterval(timerTick);
    timerTick = null;
  }

  // Too late: no points, the streak breaks, and the next player gets a question.
  function timeUp() {
    stopTimer();
    if (!current) return;
    const { q, player } = current;
    state.used.push(q.id);
    markSeen([q.id]);
    state.streak = 0;
    state.turn = nextTurn(player);
    save();
    $("#card").classList.add("late");
    $("#done-btn").disabled = true;
    $("#skip-btn").disabled = true;
    $("#q-for").textContent = t("tooLate");
    if (navigator.vibrate) { try { navigator.vibrate([80, 60, 80]); } catch (e) { /* ignore */ } }
    setTimeout(() => {
      $("#card").classList.remove("late");
      closeCard();
      updateScores(false);
      renderSpeedView();
      speedNextSoon();
    }, 1100);
  }

  function pauseSpeed() {
    speedPaused = true;
    clearTimeout(speedNext);
    closeCard();
    renderSpeedView();
  }

  function renderSpeedView() {
    if (!state || state.mode !== "speed") return;
    $("#speed-go").textContent = t("speedGo");
    $("#speed-go").hidden = !speedPaused;
    $("#speed-streak").textContent = `${t("speedStreak", { n: state.streak || 0 })} · ${t("speedBest", { n: state.bestStreak || 0 })}`;
    $("#speed-time").textContent = `⏱️ ${state.timer || 15} s`;
  }

  /* ------------------------------------------------------------------ */
  /* Wheel                                                              */
  /* ------------------------------------------------------------------ */
  // Wheel segments: the chosen subjects, with votes and challenges spread between them.
  function wheelIds() {
    const extras = [];
    if (state.whoMode) extras.push("__who");
    if (state.dareMode) extras.push("__dare");
    const g = gameOf(state);
    const duo = DUO_GAMES.includes(g);
    if (!extras.length && !duo) return state.subjects.slice();
    const nS = state.subjects.length;
    const reps = Math.max(1, Math.ceil(nS / 6)); // about 1 extra per 3 subjects
    const slots = [];
    for (let r = 0; r < reps; r++) slots.push(...extras);
    if (duo) {
      // a first date or a couple: about a third of the wheel is their own questions, plus a few +18 segments
      const own = g === "couple" ? "__couple" : "__date";
      const nOwn = Math.max(2, Math.ceil(nS / 2));
      const nSpicy = state.adult ? Math.max(1, Math.ceil(nS / 6)) : 0;
      const pool = [];
      for (let i = 0; i < nOwn + nSpicy; i++) pool.push(nSpicy && i % Math.ceil((nOwn + nSpicy) / nSpicy) === 1 ? "__spicy" : own);
      slots.push(...pool);
    }
    const ids = [];
    const every = state.subjects.length / slots.length;
    let k = 0;
    state.subjects.forEach((id, i) => {
      ids.push(id);
      while (k < slots.length && i + 1 >= Math.round(every * (k + 1))) ids.push(slots[k++]);
    });
    while (k < slots.length) ids.push(slots[k++]);
    return ids;
  }

  function drawWheel() {
    const canvas = $("#wheel");
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, R = size / 2 - 6;
    const subs = wheelIds().map((id) => SUBJ[id]);
    const n = subs.length;
    const seg = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);
    subs.forEach((s, i) => {
      const a0 = wheelAngle + i * seg, a1 = a0 + seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
      g.addColorStop(0, shade(s.color, 0.35));
      g.addColorStop(1, s.color);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a0 + seg / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const emojiSize = Math.max(20, Math.min(46, 260 / n));
      ctx.font = `${emojiSize}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.fillText(s.emoji, R - 16, 0);
      // name, between the centre button and the emoji: shrink it, then shorten it, to fit
      const end = R - 26 - emojiSize;
      const room = end - R * 0.36;
      const maxH = 2 * Math.sin(seg / 2) * (end - room * 0.5) * 0.8; // segment height where the text sits
      let fs = Math.max(13, Math.min(26, 380 / n, maxH));
      let label = sShort(s);
      ctx.font = `600 ${fs}px Fredoka, system-ui, sans-serif`;
      while (ctx.measureText(label).width > room && fs > 13) {
        fs -= 1;
        ctx.font = `600 ${fs}px Fredoka, system-ui, sans-serif`;
      }
      while (ctx.measureText(label).width > room && label.length > 3) label = label.slice(0, -2).trimEnd() + "…";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 4;
      ctx.fillText(label, end, 1);
      ctx.restore();
    });

    // rim dots
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (R - 3), cy + Math.sin(a) * (R - 3), 3.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? "#ffd166" : "#ffffff";
      ctx.fill();
    }
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const mix = (c) => Math.round(c + (255 - c) * amt);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }

  function spin() {
    if (spinning || current) return;
    spinning = true;
    $("#spin-btn").disabled = true;
    const ids = wheelIds();
    const n = ids.length;
    const seg = (Math.PI * 2) / n;
    const idx = randInt(n);
    const jitter = (Math.random() - 0.5) * seg * 0.7;
    const target = -Math.PI / 2 - (idx + 0.5) * seg + jitter;
    const TAU = Math.PI * 2;
    const delta = (((target - wheelAngle) % TAU) + TAU) % TAU;
    const from = wheelAngle;
    const to = wheelAngle + TAU * (5 + Math.floor(Math.random() * 3)) + delta;
    const dur = 4200 + Math.random() * 900;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    let lastSeg = -1;
    function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      wheelAngle = from + (to - from) * ease(t);
      drawWheel();
      // little haptic tick when a new segment passes the pointer
      const under = Math.floor(((((-Math.PI / 2 - wheelAngle) % TAU) + TAU) % TAU) / seg);
      if (under !== lastSeg) { lastSeg = under; if (navigator.vibrate && t < 0.9) try { navigator.vibrate(4); } catch (e) {} }
      if (t < 1) requestAnimationFrame(frame);
      else {
        wheelAngle = to % TAU;
        spinning = false;
        $("#spin-btn").disabled = false;
        const subjectId = ids[idx];
        const s = SUBJ[subjectId];
        const r = $(".pointer").getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height, { count: 50, speed: 5, colors: [s.color, "#ffd166", "#ffffff"], stars: true, gravity: 0.05 });
        toast(`${s.emoji} ${sName(s)}!`, 1200);
        setTimeout(() => (isExtra(subjectId) ? openExtra(subjectId) : openCard(drawForGame(subjectId, gameDepths()))), 650);
      }
    }
    requestAnimationFrame(frame);
  }

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

  /* ------------------------------------------------------------------ */
  /* Journal & summary                                                  */
  /* ------------------------------------------------------------------ */
  // Who played a journal entry, in words.
  function journalBy(j) {
    return j.kind === "who" ? t("allVoted") : j.kind === "dare" ? t("dareBy", { name: state.players[j.player] })
      : j.game === "duel" ? t("duelBy", { a: state.players[j.player], b: state.players[j.rival] })
      : j.game === "bluff" ? t("bluffBy", { name: t("answeredBy", { name: state.players[j.player] }), x: t(j.bluff ? "bluffLieShort" : "bluffTruthShort") })
      : t("answeredBy", { name: state.players[j.player] });
  }

  function journalHTML() {
    return state.journal
      .map((j) => {
        const s = SUBJ[j.subject] || { emoji: "•", name: j.subject };
        const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
        const pts = j.gained.reduce((a, b) => a + Math.max(0, b), 0);
        const note = j.note ? `<span class="j-note">“${esc(j.note)}”</span>` : "";
        const by = journalBy(j);
        return `<li><b>${esc(text)}</b><br><span class="j-meta">${s.emoji} ${esc(sName(s))} · ${esc(by)} · +${pts}</span>${note}</li>`;
      })
      .join("");
  }

  function openJournal() {
    renderTree();
    $("#journal-list").innerHTML = journalHTML();
    $("#journal-overlay").classList.remove("hidden");
  }

  // What the group learned: answers marked "didn't know!" or with a note, up to 3 per player, latest first.
  function discoveriesHTML() {
    const found = state.journal.filter((e) => !e.kind && (e.note || e.bonuses.includes("wow")));
    if (!found.length) return `<p class="panel-hint">${esc(t("noDiscoveries"))}</p>`;
    return state.players.map((name, i) => {
      const mine = found.filter((e) => e.player === i).slice(-3).reverse();
      if (!mine.length) return "";
      const items = mine.map((e) => {
        const text = QBYID[e.qid] ? qText(QBYID[e.qid]) : tr(e.text);
        return `<li>${e.bonuses.includes("wow") ? "😮 " : ""}${esc(text)}${e.note ? `<span class="j-note">“${esc(e.note)}”</span>` : ""}</li>`;
      }).join("");
      return `<div class="disc" style="--pc:${pHex(i)}"><h3>${esc(t("aboutName", { name }))}</h3><ul>${items}</ul></div>`;
    }).join("");
  }

  function showSummary() {
    const all = state.journal;
    const j = all.filter((e) => !e.kind);
    const votes = all.filter((e) => e.kind === "who").length;
    const dares = all.filter((e) => e.kind === "dare" && e.bonuses.includes("dare")).length;
    const bySubject = {};
    j.forEach((e) => (bySubject[e.subject] = (bySubject[e.subject] || 0) + 1));
    const fav = Object.entries(bySubject).filter(([id]) => !POOLS[id]).sort((a, b) => b[1] - a[1])[0];
    const deep = j.filter((e) => e.depth === 3).length;
    const guesses = j.filter((e) => e.bonuses.some((b) => b === "guess" || b.startsWith("guess:"))).length;
    const wows = j.filter((e) => e.bonuses.includes("wow")).length;
    const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
    const lvl = Math.floor(state.connection / levelSize()) + 1;

    $("#summary-tagline").textContent = (state.name ? `📖 ${state.name} · ` : "") + t("reached", { names: joinNames(state.players), n: lvl });
    renderTree();
    $("#summary-discoveries").innerHTML = discoveriesHTML();
    const stat = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
    $("#summary-stats").innerHTML =
      stat(j.length, t("statAnswered")) +
      (competitive() ? state.players.map((name, i) => stat(state.scores[i], esc(name))).join("") : "") +
      stat(deep, t("statDeep")) +
      stat(wows, t("statWow")) +
      stat(guesses, t("statGuess")) +
      (votes ? stat(votes, t("statWho")) : "") +
      (dares ? stat(dares, t("statDares")) : "") +
      stat(`🏅 ${(state.badges || []).length}`, esc(t("badgesBtn").replace("🏅 ", ""))) +
      stat(fav ? SUBJ[fav[0]].emoji : "–", fav ? esc(t("statFav", { s: sName(SUBJ[fav[0]]) })) : t("statFavNone")) +
      stat(`${mins}′`, t("statTogether"));
    $("#summary-journal").innerHTML = journalHTML();
    showScreen("screen-summary");
    setTimeout(() => FX.fireworks(10), 300);
  }

  // A story file is the game state as JSON, base64-encoded behind a header, saved as .loopy.
  const STORY_HEADER = "LOOPY-LIFE-STORY:1\n";

  function encodeStory(st) {
    const json = JSON.stringify({ app: "loopy-life-know-each-other", savedAt: new Date().toISOString(), state: st });
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return STORY_HEADER + btoa(bin);
  }

  function decodeStory(text) {
    if (!text.startsWith(STORY_HEADER)) throw new Error("not a story");
    const bin = atob(text.slice(STORY_HEADER.length).trim());
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    const st = data && data.state;
    const ok = st && Array.isArray(st.players) && st.players.length >= 2 && Array.isArray(st.scores)
      && Array.isArray(st.journal) && Array.isArray(st.used) && Array.isArray(st.subjects);
    if (!ok) throw new Error("bad story");
    return st;
  }

  function downloadFile(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const fileBase = (st = state) => (st.name ? st.name : `${t("storyFile")}-${st.players.join("-")}`).replace(/[\\/:*?"<>|\s]+/g, "-");

  function saveStoryFile(st = state) {
    downloadFile(encodeStory(st), `${fileBase(st)}.loopy`, "application/octet-stream");
    toast(t("savedToast"), 3200);
  }

  function loadStoryFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let st;
      try { st = decodeStory(String(reader.result)); } catch (e) {
        $("#setup-error").textContent = t("loadBad");
        toast(t("loadBad"), 3200);
        return;
      }
      $("#setup-error").textContent = "";
      const n = st.players.length;
      st.version = 1;
      st.scores = st.players.map((_, i) => Number(st.scores[i]) || 0);
      st.passes = st.players.map((_, i) => (Array.isArray(st.passes) && st.passes[i] != null ? st.passes[i] : PASSES));
      st.turn = Number.isInteger(st.turn) && st.turn >= 0 && st.turn < n ? st.turn : 0;
      st.subjects = st.subjects.filter((id) => SUBJ[id]);
      if (!st.subjects.length) st.subjects = DB.subjects.map((x) => x.id);
      st.tree = st.tree || {};
      st.connection = Number(st.connection) || 0;
      st.mode = ["tree", "speed"].includes(st.mode) ? st.mode : "wheel";
      st.game = ALL_GAMES.includes(st.game) ? st.game : st.mode;
      st.badges = Array.isArray(st.badges) ? st.badges : [];
      st.startedAt = st.startedAt || Date.now();
      st.id = st.id || newId();
      state = st;
      lastTreeCounts = {};
      markSeen(state.used);
      save();
      startGame();
      setTimeout(() => { toast(t("loaded", { names: joinNames(state.players) }), 3200); FX.fireworks(4); }, 400);
    };
    reader.readAsText(file);
  }


  /* ------------------------------------------------------------------ */
  /* Our stories: every game kept in this browser                       */
  /* ------------------------------------------------------------------ */
  let storiesCache = [];
  const fold = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function storyText(st) {
    const bits = [st.name, ...(st.players || [])];
    (st.journal || []).forEach((j) => {
      const q = QBYID[j.qid];
      const txt = q ? q.text : j.text;
      if (txt && typeof txt === "object") bits.push(...Object.values(txt)); else bits.push(txt);
      bits.push(j.note);
    });
    return fold(bits.filter(Boolean).join(" \n "));
  }

  async function openStories() {
    $("#stories-overlay").classList.remove("hidden");
    $("#stories-search").value = "";
    $("#stories-list").innerHTML = "";
    const cur = loadSaved();
    if (cur && cur.version === 1 && (cur.journal || []).length) { if (!cur.id) { cur.id = newId(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ } } await keepStory(cur); }
    const list = await allStories();
    storiesCache = (list || []).sort((a, b) => (b.updatedAt || b.startedAt || 0) - (a.updatedAt || a.startedAt || 0));
    storiesCache.forEach((st) => (st._text = storyText(st)));
    renderStories();
  }

  function renderStories() {
    const q = fold($("#stories-search").value.trim());
    const list = q ? storiesCache.filter((st) => q.split(/\s+/).every((w) => st._text.includes(w))) : storiesCache;
    const box = $("#stories-list");
    box.innerHTML = "";
    if (!list.length) { box.innerHTML = `<li class="stories-empty">${esc(t(storiesCache.length ? "storiesNone" : "storiesEmpty"))}</li>`; return; }
    list.forEach((st) => box.appendChild(storyItem(st)));
  }

  function storyItem(st) {
    const li = el("li", "story");
    const g = gameOf(st);
    const size = (LEVEL_UP / 2) * Math.max(2, st.players.length);
    const lvl = Math.floor((st.connection || 0) / size) + 1;
    const when = new Date(st.updatedAt || st.startedAt || Date.now());
    const date = when.toLocaleDateString(LANG === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
    const title = st.name || joinNames(st.players);
    const meta = [date, st.name ? joinNames(st.players) : "", t("stAnswers", { n: st.journal.length }), t("lv", { n: lvl })].filter(Boolean).join(" · ");
    const head = el("button", "story-head", `<span class="story-emo">${GAME_EMOJI[g] || "🎡"}</span><span><b>${esc(title)}</b><small>${esc(meta)}</small></span>`);
    head.type = "button";
    const acts = el("div", "story-actions");
    acts.hidden = true;
    head.addEventListener("click", () => {
      $$("#stories-list .story-actions").forEach((a) => { if (a !== acts) a.hidden = true; });
      acts.hidden = !acts.hidden;
    });
    const btn = (label, fn, cls = "") => { const b = el("button", "btn ghost small " + cls, esc(label)); b.type = "button"; b.addEventListener("click", fn); acts.appendChild(b); return b; };
    const open = (thenSummary) => {
      $("#stories-overlay").classList.add("hidden");
      const sv = JSON.parse(JSON.stringify(st));
      delete sv._text;
      lastTreeCounts = {};
      resumeSaved(sv);
      if (thenSummary) showSummary();
    };
    btn(t("stResume"), () => open(false), "primary");
    btn(t("stReview"), () => open(true));
    btn(t("stRename"), () => {
      const row = el("div", "story-rename");
      const input = el("input");
      input.type = "text"; input.maxLength = 40; input.value = st.name || ""; input.placeholder = t("storyNamePh");
      const ok = el("button", "btn primary small", "OK");
      ok.type = "button";
      ok.addEventListener("click", async () => {
        st.name = input.value.trim().slice(0, 40);
        const clean = { ...st }; delete clean._text;
        await keepStory(clean);
        const cur = loadSaved();
        if (cur && cur.id === st.id) { cur.name = st.name; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ } }
        if (state && state.id === st.id) state.name = st.name;
        st._text = storyText(st);
        renderStories();
      });
      row.append(input, ok);
      acts.appendChild(row);
      input.focus();
    });
    btn(t("stSave"), () => { const clean = { ...st }; delete clean._text; saveStoryFile(clean); });
    const del = btn(t("stDelete"), async () => {
      if (!del.classList.contains("sure")) { del.classList.add("sure"); del.textContent = t("stDeleteSure"); return; }
      await dropStory(st.id);
      const cur = loadSaved();
      if (cur && cur.id === st.id) { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ } }
      storiesCache = storiesCache.filter((x) => x.id !== st.id);
      toast(t("stDeleted"));
      renderStories();
    }, "danger");
    li.append(head, acts);
    return li;
  }

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

  /* ------------------------------------------------------------------ */
  /* Shareable picture of the story                                     */
  /* ------------------------------------------------------------------ */
  function wrapText(ctx, text, x, y, maxW, lineH, maxLines = 3) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const tryLine = line ? `${line} ${w}` : w;
      if (ctx.measureText(tryLine).width > maxW && line) { lines.push(line); line = w; } else line = tryLine;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return y + lines.length * lineH;
  }

  function treeImage() {
    renderTree();
    const svg = $("#tree").cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "400");
    svg.setAttribute("height", "420");
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function makeStoryImage() {
    const W = 1080, H = 1350;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    try { await document.fonts.load("700 40px Fredoka"); } catch (e) { /* ignore */ }
    const F = (w, px) => `${w} ${px}px Fredoka, "Segoe UI", system-ui, sans-serif`;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1b1440"); bg.addColorStop(1, "#43206e");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const rnd = seeded(42);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.5})`;
      ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, 1 + rnd() * 2.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd166"; ctx.font = F(600, 38);
    ctx.fillText("∞ Loopy Life", W / 2, 90);
    ctx.fillStyle = "#ffffff"; ctx.font = F(700, 64);
    ctx.fillText(t("title"), W / 2, 170);
    ctx.fillStyle = "#c9bfe0"; ctx.font = F(500, 38);
    wrapText(ctx, joinNames(state.players), W / 2, 230, W - 160, 46, 2);

    const img = await treeImage();
    if (img) ctx.drawImage(img, (W - 600) / 2, 300, 600, 630);

    const lvl = Math.floor(state.connection / levelSize()) + 1;
    ctx.fillStyle = "#ffd166"; ctx.font = F(700, 52);
    ctx.fillText(`🎆 ${t("imgLevel", { n: lvl })}`, W / 2, 985);

    const j = state.journal.filter((e) => !e.kind);
    const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
    const stats = [[j.length, t("imgQuestions")], [(state.badges || []).length, t("imgBadges")], [mins, t("imgMinutes")]];
    const bw = 280, gap = 30, x0 = (W - (bw * 3 + gap * 2)) / 2;
    stats.forEach(([v, l], i) => {
      const x = x0 + i * (bw + gap);
      ctx.fillStyle = "rgba(255,255,255,.1)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, 1020, bw, 120, 24); else ctx.rect(x, 1020, bw, 120);
      ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = F(700, 50);
      ctx.fillText(String(v), x + bw / 2, 1080);
      ctx.fillStyle = "#c9bfe0"; ctx.font = F(500, 28);
      ctx.fillText(l, x + bw / 2, 1120);
    });

    const best = [...state.journal].reverse().find((e) => e.bonuses.includes("wow") || e.bonuses.includes("unanimous") || e.note)
      || [...j].reverse().find((e) => e.depth === 3) || state.journal[state.journal.length - 1];
    if (best) {
      const text = QBYID[best.qid] ? qText(QBYID[best.qid]) : tr(best.text);
      ctx.fillStyle = "#ffd166"; ctx.font = F(600, 28);
      ctx.fillText(`✨ ${t("imgBest")}`, W / 2, 1195);
      ctx.fillStyle = "#ffffff"; ctx.font = F(500, 34);
      wrapText(ctx, `“${text}”`, W / 2, 1240, W - 160, 42, 2);
    }
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = F(500, 26);
    ctx.fillText("elmastho.github.io/Loopy-Life", W / 2, H - 28);
    return new Promise((resolve) => c.toBlob(resolve, "image/png"));
  }

  async function shareStoryImage() {
    const blob = await makeStoryImage();
    if (!blob) return;
    const name = `${fileBase()}.png`;
    try {
      const file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Loopy Life · ${t("title")}` });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    downloadFile(blob, name, "image/png");
  }

  /* ------------------------------------------------------------------ */
  /* Install as an app (works offline through sw.js)                    */
  /* ------------------------------------------------------------------ */
  let installEvent = null;
  function initInstall() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      installEvent = e;
      $("#install-btn").hidden = false;
    });
    window.addEventListener("appinstalled", () => { $("#install-btn").hidden = true; toast(t("installed"), 3200); });
    $("#install-btn").addEventListener("click", async () => {
      if (!installEvent) return;
      installEvent.prompt();
      try { await installEvent.userChoice; } catch (e) { /* ignore */ }
      installEvent = null;
      $("#install-btn").hidden = true;
    });
  }

  function downloadStory() {
    const lines = [
      `Loopy Life · ${t("title")}`,
      `${joinNames(state.players)} · ${new Date(state.startedAt).toLocaleString()}`,
      `Scores: ${state.players.map((n, i) => `${n} ${state.scores[i]}`).join(" · ")} · ${t("connection")} ${state.connection}`,
      "",
    ];
    state.journal.forEach((j, i) => {
      const s = SUBJ[j.subject] || { name: j.subject };
      const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
      lines.push(`${i + 1}. [${sName(s)}] ${text}`);
      const by = journalBy(j);
      lines.push(`   ${by}${j.note ? ` · ${t("note")}: ${j.note}` : ""}`);
    });
    downloadFile(lines.join("\n"), `${fileBase()}.txt`, "text/plain");
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                             */
  /* ------------------------------------------------------------------ */
  function initGame() {
    $("#spin-btn").addEventListener("click", spin);
    $("#speed-go").addEventListener("click", () => openSpeedCard());
    $("#pause-btn").addEventListener("click", pauseSpeed);
    $("#wheel").addEventListener("click", spin);
    $$("[data-switch]").forEach((b) => b.addEventListener("click", () => {
      if (["wheel", "tree"].includes(gameOf(state))) state.game = b.dataset.switch;
      setMode(b.dataset.switch);
    }));
    $("#tree-surprise").addEventListener("click", (e) => growBranch(pick(state.subjects), e.currentTarget));
    $("#journal-btn").addEventListener("click", openJournal);
    $("#mini-tree").addEventListener("click", openJournal);
    $("#journal-close").addEventListener("click", () => $("#journal-overlay").classList.add("hidden"));
    $("#journal-overlay").addEventListener("click", (e) => { if (e.target.id === "journal-overlay") $("#journal-overlay").classList.add("hidden"); });
    $("#finish-btn").addEventListener("click", () => { speedPaused = true; clearTimeout(speedNext); showSummary(); });
    $("#home-btn").addEventListener("click", () => {
      speedPaused = true; clearTimeout(speedNext);
      state.active = false; // reopening the app now lands on the home screen; the game stays in "Our stories"
      save();
      showResume();
      showScreen("screen-setup");
      goStep(1);
    });
    $("#continue-btn").addEventListener("click", () => startGame());
    $("#restart-btn").addEventListener("click", () => {
      if (state) { state.active = false; save(); }
      showScreen("screen-setup");
      goStep(1);
    });
    $("#download-btn").addEventListener("click", downloadStory);
    $("#share-img-btn").addEventListener("click", shareStoryImage);
    $$(".badges-open").forEach((b) => b.addEventListener("click", openBadges));
    $("#badges-close").addEventListener("click", () => $("#badges-overlay").classList.add("hidden"));
    $("#badges-overlay").addEventListener("click", (e) => { if (e.target.id === "badges-overlay") $("#badges-overlay").classList.add("hidden"); });
    $$(".save-story").forEach((b) => b.addEventListener("click", () => saveStoryFile()));
    $("#load-story").addEventListener("click", () => $("#story-file").click());
    $("#stories-btn").addEventListener("click", openStories);
    $("#stories-close").addEventListener("click", () => $("#stories-overlay").classList.add("hidden"));
    $("#stories-overlay").addEventListener("click", (e) => { if (e.target.id === "stories-overlay") $("#stories-overlay").classList.add("hidden"); });
    $("#stories-search").addEventListener("input", renderStories);
    $("#story-file").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) loadStoryFile(f);
      e.target.value = "";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { $("#journal-overlay").classList.add("hidden"); $("#badges-overlay").classList.add("hidden"); }
      if ((e.key === " " || e.key === "Enter") && $("#screen-game").classList.contains("active") && !current && state.mode === "wheel" && document.activeElement === document.body) {
        e.preventDefault();
        spin();
      }
    });
  }


  /* ------------------------------------------------------------------ */
  /* Rules: the whole set on the home screen, only what applies in game */
  /* ------------------------------------------------------------------ */
  // Sections of rulesBody, in order: 0 goal, 1 players, 2 starting, 3 discovery games, 4 fun games,
  // 5 points, 6 bonuses, 7 connection, 8 guess option, 9 who of us, 10 challenges, 11 big groups,
  // 12 badges, 13 share, 14 install, 15 saving.
  const R = { goal: 0, discover: 3, fun: 4, points: 5, bonuses: 6, connection: 7, guess: 8, who: 9, dare: 10, big: 11, badges: 12, saving: 15, date: 16, couple: 17, car: 18, adult: 19, speed: 20 };
  let rulesFull = true;

  function ruleSections() {
    return t("rulesBody").split("<h3>").slice(1).map((x) => "<h3>" + x);
  }

  // One game's paragraph, taken from the list of games in the rules.
  function gameRule(sections, game) {
    if (R[game] != null) return sections[R[game]];
    const [sec, i] = { wheel: [R.discover, 0], tree: [R.discover, 1], bluff: [R.fun, 0], duel: [R.fun, 1], bet: [R.fun, 2] }[game];
    const items = sections[sec].split("<li>").slice(1).map((x) => x.split("</li>")[0]);
    const text = (items[i] || "").replace(/^<b>[^<]*<\/b>\s*:?\s*/, "");
    return `<h3>${GAME_EMOJI[game]} ${esc(t("g_" + game))}</h3><p>${text.charAt(0).toUpperCase()}${text.slice(1)}</p>`;
  }

  function contextRules() {
    const sec = ruleSections();
    const g = gameOf(state);
    if (g === "speed") return [sec[R.speed], sec[R.connection], sec[R.badges], sec[R.saving]].join("");
    const fun = FUN_GAMES.includes(g);
    const parts = [gameRule(sec, g), sec[R.points]];
    if (fun) parts.push(t("rulesPass"));
    else {
      parts.push(sec[R.bonuses]);
      if (state.guessMode && gameOf(state) !== "couple") parts.push(sec[R.guess]);
    }
    if (state.adult) parts.push(sec[R.adult]);
    if (state.whoMode) parts.push(sec[R.who]);
    if (state.dareMode) parts.push(sec[R.dare]);
    if (nPlayers() >= COMPACT_FROM || state.randomTurn) parts.push(sec[R.big]);
    parts.push(sec[R.connection], sec[R.badges], sec[R.saving]);
    return parts.join("");
  }

  function renderRules() {
    const inGame = state && !$("#screen-setup").classList.contains("active");
    const full = rulesFull || !inGame;
    $("#rules-title").textContent = full ? t("rulesTitle") : t("rulesFor", { game: `${GAME_EMOJI[gameOf(state)]} ${t("g_" + gameOf(state))}` });
    $("#rules-body").innerHTML = full ? t("rulesBody") : contextRules();
    $("#rules-all").hidden = full;
  }

  function openRules() {
    rulesFull = false;
    renderRules();
    $("#rules-body").scrollTop = 0;
    $("#rules-overlay .card").scrollTop = 0;
    $("#rules-overlay").classList.remove("hidden");
  }

  function applyLanguage() {
    document.documentElement.lang = LANG;
    document.title = `Loopy Life · ${t("title")}`;
    $$("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $$("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === LANG));
    $("#lang-btn").textContent = t("langToggle");
    if (!DB.questions.length) return;
    $("#q-count").textContent = t("qCount", { n: DB.questions.length });
    const selected = $$("#subject-grid .subject").length ? selectedSubjects() : DB.subjects.map((s) => s.id);
    renderSubjectGrid(selected);
    updateSubjectsSummary();
    readPlayerInputs();
    renderPlayersList();
    if (state && $("#screen-game").classList.contains("active")) {
      updateScores(false);
      if (state.mode === "wheel") drawWheel(); else renderTree();
    }
    if (state && $("#screen-summary").classList.contains("active")) showSummary();
    if (state) renderSpeedView();
    renderChosenGame();
    if (!$(".step[data-step=\"2\"]").hidden) renderGameChoice();
    if (!$("#rules-overlay").classList.contains("hidden")) renderRules();
    if (state) $("#game-name").textContent = gameTitle();
    fillCard();
  }

  function setLanguage(lang) {
    LANG = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    applyLanguage();
  }

  /* ------------------------------------------------------------------ */
  /* Version and updates                                                */
  /* ------------------------------------------------------------------ */
  // The version on the server, read past every cache; null when offline.
  async function latestVersion() {
    try {
      const res = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return null;
      return Number((await res.json()).version) || null;
    } catch (e) { return null; }
  }

  // Drops the service worker and its caches, then reloads from the network. Stories (IndexedDB) and the current game stay.
  async function forceUpdate() {
    try { if (state) save(); } catch (e) { /* ignore */ }
    try {
      if ("serviceWorker" in navigator) await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister()));
      if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    } catch (e) { /* ignore */ }
    location.replace(`${location.pathname}?u=${Date.now()}`);
  }

  async function openUpdate() {
    $("#upd-installed").textContent = t("updInstalled", { v: APP_VERSION });
    $("#upd-status").textContent = t("updChecking");
    $("#update-overlay").classList.remove("hidden");
    const v = await latestVersion();
    $("#upd-status").textContent = v == null ? t("updOffline") : v > APP_VERSION ? t("updNew", { v }) : t("updLatest");
  }

  async function checkForUpdate() {
    const v = await latestVersion();
    if (v && v > APP_VERSION) $("#update-banner").hidden = false;
  }

  async function boot() {
    applyLanguage();
    initInstall();
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
    $("#lang-btn").addEventListener("click", () => setLanguage(LANG === "fr" ? "en" : "fr"));
    $$(".rules-open").forEach((b) => b.addEventListener("click", openRules));
    $("#rules-all").addEventListener("click", () => { rulesFull = true; renderRules(); $("#rules-overlay .card").scrollTop = 0; });
    $("#rules-close").addEventListener("click", () => $("#rules-overlay").classList.add("hidden"));
    $("#rules-overlay").addEventListener("click", (e) => { if (e.target.id === "rules-overlay") $("#rules-overlay").classList.add("hidden"); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#rules-overlay").classList.add("hidden"); });
    try {
      const res = await fetch("data/questions.json?v=21", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      DB = await res.json();
    } catch (e) {
      $("#setup-error").textContent = t("loadError");
      return;
    }
    DB.subjects.forEach((s) => (SUBJ[s.id] = s));
    DB.questions.forEach((q) => (QBYID[q.id] = q));
    Object.values(EXTRAS).forEach((x) => (SUBJ[x.id] = x));
    Object.values(POOLS).forEach((x) => (SUBJ[x.id] = x));
    ["date", "couple", "spicy", "speed"].forEach((k) => (DB[k] || []).forEach((q) => (QBYID[q.id] = q)));
    (DB.who || []).forEach((q) => (QBYID[q.id] = { ...q, subject: "__who" }));
    (DB.challenges || []).forEach((q) => (QBYID[q.id] = { ...q, subject: "__dare" }));
    initSetup();
    initCard();
    initGame();
    applyLanguage();
    // a game that was still going when the page closed or reloaded comes straight back
    const saved = loadSaved();
    if (saved && saved.version === 1 && Array.isArray(saved.players) && (saved.journal || []).length) {
      if (!saved.id) { saved.id = newId(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ } }
      keepStory(saved);
    }
    if (saved && saved.version === 1 && saved.active && Array.isArray(saved.players)) resumeSaved(saved);
    setTimeout(() => FX.sparkleEl($(".hero h1")), 400);
    $("#version-btn").textContent = `v${APP_VERSION}`;
    $("#version-btn").addEventListener("click", openUpdate);
    $("#upd-close").addEventListener("click", () => $("#update-overlay").classList.add("hidden"));
    $("#update-overlay").addEventListener("click", (e) => { if (e.target.id === "update-overlay") $("#update-overlay").classList.add("hidden"); });
    $("#upd-force").addEventListener("click", forceUpdate);
    $("#update-now").addEventListener("click", forceUpdate);
    $("#update-later").addEventListener("click", () => ($("#update-banner").hidden = true));
    setTimeout(checkForUpdate, 1500);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkForUpdate(); });
  }

  boot();
})();
