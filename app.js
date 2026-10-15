/* Loopy Life · Know Each Other
 * A two-player get-to-know-each-other game.
 * Plain JS, no build step. Questions live in data/questions.json.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "loopy-know-each-other-v1";
  const POINTS = { 1: 10, 2: 20, 3: 30 };
  const LEVEL_UP = 100; // connection points per level
  const PASSES = 3;


  /* ------------------------------------------------------------------ */
  /* Languages                                                          */
  /* ------------------------------------------------------------------ */
  const LANG_KEY = "loopy-lang";
  const STR = {
    en: {
      title: "Know Each Other",
      tagline: "A game for two, to go beyond the usual small talk.",
      who: "1. Who's playing?",
      player1: "Player 1",
      player2: "Player 2",
      yourName: "Your name",
      friendName: "Your friend's name",
      pickSubjects: "2. Pick your subjects",
      all: "All",
      none: "None",
      howDeep: "3. How deep?",
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
      bonusHelp: "Tip: let the other person guess the answer first. Tap the bonuses that happened.",
      notePh: "Something to remember? (optional)",
      pass: "Pass",
      answered: "Answered! ✨",
      close: "Close",
      langToggle: "🇫🇷 Français",
      nQuestions: "{n} questions",
      pickOne: "Pick at least one subject 🙂",
      resume: "↩︎ Resume {a} & {b} ({n} answered)",
      starts: "🎲 {name} starts!",
      turn: "{name}'s turn to answer",
      recycle: "♻️ You've seen every {s} question! Reshuffling.",
      depth1: "🌤️ Light",
      depth2: "🌗 Deeper",
      depth3: "🌊 Deep",
      forWho: "For {name} to answer",
      guessed: "{name} guessed it (+15)",
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
      reached: "{a} & {b} reached connection level {n}.",
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
      tagline: "Un jeu à deux pour aller plus loin que les conversations habituelles.",
      who: "1. Qui joue ?",
      player1: "Joueur 1",
      player2: "Joueur 2",
      yourName: "Ton prénom",
      friendName: "Le prénom de ton ami",
      pickSubjects: "2. Choisissez vos thèmes",
      all: "Tous",
      none: "Aucun",
      howDeep: "3. Jusqu'où aller ?",
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
      bonusHelp: "Astuce : laisse l'autre deviner la réponse d'abord. Touche les bonus qui se sont produits.",
      notePh: "Quelque chose à retenir ? (facultatif)",
      pass: "Passer",
      answered: "Répondu ! ✨",
      close: "Fermer",
      langToggle: "🇬🇧 English",
      nQuestions: "{n} questions",
      pickOne: "Choisissez au moins un thème 🙂",
      resume: "↩︎ Reprendre {a} & {b} ({n} réponses)",
      starts: "🎲 {name} commence !",
      turn: "Au tour de {name} de répondre",
      recycle: "♻️ Vous avez vu toutes les questions « {s} » ! On remélange.",
      depth1: "🌤️ Léger",
      depth2: "🌗 Plus profond",
      depth3: "🌊 Profond",
      forWho: "À {name} de répondre",
      guessed: "{name} a deviné (+15)",
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
      reached: "{a} & {b} ont atteint le niveau de connexion {n}.",
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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const other = (p) => 1 - p;
  const pColor = (p) => (p === 0 ? "var(--p1)" : "var(--p2)");
  const pHex = (p) => (p === 0 ? "#ff7eb6" : "#6ee7ff");

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
      b.addEventListener("click", () => b.classList.toggle("on"));
      grid.appendChild(b);
    });
  }

  function selectedSubjects() {
    return $$("#subject-grid .subject.on").map((b) => b.dataset.id);
  }

  function initSetup() {
    renderSubjectGrid(DB.subjects.map((s) => s.id));

    $("#sel-all").addEventListener("click", () => $$("#subject-grid .subject").forEach((b) => b.classList.add("on")));
    $("#sel-none").addEventListener("click", () => $$("#subject-grid .subject").forEach((b) => b.classList.remove("on")));

    $$("#depth-choice button").forEach((b) =>
      b.addEventListener("click", () => {
        setupDepth = b.dataset.depth;
        $$("#depth-choice button").forEach((x) => x.classList.toggle("on", x === b));
      })
    );

    $$(".mode-card").forEach((card) =>
      card.addEventListener("click", () => {
        const subjects = selectedSubjects();
        if (!subjects.length) {
          $("#setup-error").textContent = t("pickOne");
          return;
        }
        $("#setup-error").textContent = "";
        const n1 = $("#name1").value.trim() || t("player1");
        const n2 = $("#name2").value.trim() || t("player2");
        newGame([n1, n2], subjects, setupDepth, card.dataset.mode);
      })
    );

    const saved = loadSaved();
    if (saved && saved.version === 1 && (saved.journal?.length || 0) > 0) {
      $("#resume-row").classList.remove("hidden");
      $("#resume-btn").textContent = t("resume", { a: saved.players[0], b: saved.players[1], n: saved.journal.length });
      $("#resume-btn").addEventListener("click", () => {
        state = saved;
        state.subjects = state.subjects.filter((id) => SUBJ[id]);
        if (!state.subjects.length) state.subjects = DB.subjects.map((s) => s.id);
        startGame();
      });
      $("#name1").value = saved.players[0];
      $("#name2").value = saved.players[1];
    }
  }

  /* ------------------------------------------------------------------ */
  /* Game state                                                         */
  /* ------------------------------------------------------------------ */
  function newGame(players, subjects, depth, mode) {
    state = {
      version: 1,
      players,
      scores: [0, 0],
      passes: [PASSES, PASSES],
      turn: Math.random() < 0.5 ? 0 : 1,
      subjects,
      depth,
      mode,
      used: [],
      journal: [],
      tree: {},
      connection: 0,
      startedAt: Date.now(),
    };
    lastTreeCounts = {};
    save();
    startGame();
    setTimeout(() => toast(t("starts", { name: state.players[state.turn] })), 500);
  }

  function startGame() {
    $("#label-p1").textContent = state.players[0];
    $("#label-p2").textContent = state.players[1];
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
    if (mode === "wheel") drawWheel();
    else renderTree();
  }

  function updateScores(animate = true) {
    $("#pts-p1").textContent = state.scores[0];
    $("#pts-p2").textContent = state.scores[1];
    $("#score-p1").classList.toggle("active", state.turn === 0);
    $("#score-p2").classList.toggle("active", state.turn === 1);
    const lvl = Math.floor(state.connection / LEVEL_UP) + 1;
    $("#conn-level").textContent = t("lv", { n: lvl });
    $("#conn-fill").style.width = `${((state.connection % LEVEL_UP) / LEVEL_UP) * 100}%`;
    const name = state.players[state.turn];
    $("#turn-banner").innerHTML = esc(t("turn", { name: "\u0000" })).replace("\u0000", `<b style="background:${pColor(state.turn)}">${esc(name)}</b>`);
    if (animate) {
      ["#pts-p1", "#pts-p2"].forEach((s) => {
        const el = $(s);
        el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
      });
    }
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

  function drawQuestion(subjectId, depths, excludeId) {
    let pool = unusedIn(subjectId).filter((q) => q.id !== excludeId);
    if (!pool.length) { recycle(subjectId); pool = unusedIn(subjectId).filter((q) => q.id !== excludeId); }
    let filtered = pool.filter((q) => depths.includes(q.depth));
    if (!filtered.length) {
      // closest depth available
      const target = depths[0];
      const sorted = [...pool].sort((a, b) => Math.abs(a.depth - target) - Math.abs(b.depth - target));
      filtered = sorted.filter((q) => q.depth === sorted[0].depth);
    }
    return pick(filtered);
  }

  /* ------------------------------------------------------------------ */
  /* Question card                                                      */
  /* ------------------------------------------------------------------ */
  // Writes the current question into the card, in the current language.
  function fillCard() {
    if (!current) return;
    const { q, player: p } = current;
    const s = SUBJ[q.subject];
    const o = other(p);
    $("#q-subject").textContent = `${s.emoji} ${sName(s)}`;
    $("#q-depth").textContent = `${t("depth" + q.depth)} · +${POINTS[q.depth]}`;
    $("#q-for").innerHTML = esc(t("forWho", { name: "\u0000" })).replace("\u0000", `<b style="color:${p === 0 ? "#d63384" : "#0b8bb0"}">${esc(state.players[p])}</b>`);
    $("#q-text").textContent = qText(q);
    $("#b-guess span").textContent = t("guessed", { name: state.players[o] });
    $("#b-both span").textContent = t("answeredToo", { name: state.players[o], n: POINTS[q.depth] });
    $("#pass-label").textContent = t("pass");
    $("#passes").textContent = state.passes[p];
    $("#skip-btn").disabled = state.passes[p] <= 0;
  }

  function openCard(q) {
    current = { q, player: state.turn, bonuses: new Set() };
    fillCard();

    const card = $("#card");
    const s = SUBJ[q.subject];
    $$(".bonus").forEach((b) => b.classList.remove("on"));
    $("#q-note").value = "";
    card.style.setProperty("--c", s.color);
    $("#card-overlay").style.setProperty("--c", s.color);

    $("#card-overlay").classList.remove("hidden");
    // restart the flip animation
    card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
    setTimeout(() => FX.sparkleEl($("#q-text"), [s.color, "#ffd166", "#ffffff"]), 250);
  }

  function closeCard() {
    $("#card-overlay").classList.add("hidden");
    current = null;
  }

  function finishQuestion() {
    if (!current) return;
    const { q, player, bonuses } = current;
    const o = other(player);
    const base = POINTS[q.depth];
    const gained = [0, 0];
    gained[player] += base;
    if (bonuses.has("guess")) gained[o] += 15;
    if (bonuses.has("wow")) { gained[0] += 5; gained[1] += 5; }
    if (bonuses.has("both")) gained[o] += base;

    const beforeLvl = Math.floor(state.connection / LEVEL_UP);
    state.scores[0] += gained[0];
    state.scores[1] += gained[1];
    state.connection += gained[0] + gained[1];
    const afterLvl = Math.floor(state.connection / LEVEL_UP);

    state.used.push(q.id);
    counts(q.subject)[q.depth] += 1;
    state.journal.push({
      qid: q.id, text: q.text, subject: q.subject, depth: q.depth,
      player, bonuses: [...bonuses], note: $("#q-note").value.trim(),
      gained, t: Date.now(),
    });
    state.turn = o;
    save();

    FX.sparkleEl($("#done-btn"));
    closeCard();
    updateScores(true);

    const s = SUBJ[q.subject];
    if (afterLvl > beforeLvl) {
      FX.fireworks(8);
      toast(t("levelUp", { n: afterLvl + 1 }), 3200);
    } else if (q.depth === 3) {
      FX.fireworks(4, [s.color, "#ffd166", "#ffffff"]);
      toast(t("deepToast"));
    } else if (bonuses.has("guess")) {
      FX.sparkleEl($(other(player) === 0 ? "#score-p1" : "#score-p2"), ["#ffd166", "#7ef0a8", "#ffffff"]);
      toast(t("knowsYou", { name: state.players[o] }));
    } else if (bonuses.has("wow")) {
      toast(t("wowToast"));
    }
    FX.sparkleEl($(player === 0 ? "#score-p1" : "#score-p2"), [pHex(player), "#ffd166", "#ffffff"]);

    if (state.mode === "tree") {
      renderTree();
      const c = counts(q.subject);
      if ((q.depth === 1 && c[1] === 2) || (q.depth === 2 && c[2] === 2)) {
        setTimeout(() => toast(t(q.depth === 1 ? "unlockLeaves" : "unlockBlooms", { s: `${s.emoji} ${sName(s)}` })), 900);
      }
    } else {
      drawWheel();
    }
  }

  function passQuestion() {
    if (!current) return;
    const p = current.player;
    if (state.passes[p] <= 0) return;
    state.passes[p] -= 1;
    state.used.push(current.q.id);
    save();
    const q = drawQuestion(current.q.subject, [current.q.depth], current.q.id);
    openCard(q);
  }

  function initCard() {
    $$(".bonus").forEach((b) =>
      b.addEventListener("click", () => {
        b.classList.toggle("on");
        const key = b.dataset.bonus;
        if (b.classList.contains("on")) { current.bonuses.add(key); FX.sparkleEl(b); }
        else current.bonuses.delete(key);
      })
    );
    $("#done-btn").addEventListener("click", finishQuestion);
    $("#skip-btn").addEventListener("click", passQuestion);
  }

  /* ------------------------------------------------------------------ */
  /* Wheel                                                              */
  /* ------------------------------------------------------------------ */
  function drawWheel() {
    const canvas = $("#wheel");
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, R = size / 2 - 6;
    const subs = state.subjects.map((id) => SUBJ[id]);
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
      if (n <= 16) {
        const fs = Math.max(15, Math.min(26, 300 / n));
        ctx.font = `600 ${fs}px Fredoka, system-ui, sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,.45)";
        ctx.shadowBlur = 4;
        ctx.fillText(sShort(s), R - 26 - emojiSize, 1);
      }
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
    const n = state.subjects.length;
    const seg = (Math.PI * 2) / n;
    const idx = Math.floor(Math.random() * n);
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
        const subjectId = state.subjects[idx];
        const s = SUBJ[subjectId];
        const r = $(".pointer").getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height, { count: 50, speed: 5, colors: [s.color, "#ffd166", "#ffffff"], stars: true, gravity: 0.05 });
        toast(`${s.emoji} ${sName(s)}!`, 1200);
        setTimeout(() => openCard(drawQuestion(subjectId, depthsFor(state.depth))), 650);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* Tree                                                               */
  /* ------------------------------------------------------------------ */
  function renderTree() {
    const svg = $("#tree");
    const subs = state.subjects.map((id) => SUBJ[id]);
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

      const rnd = seeded(1000 + state.subjects.indexOf(s.id) * 97);
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
  }

  function growBranch(subjectId, el) {
    if (current) return;
    if (el) FX.sparkleEl(el, [SUBJ[subjectId].color, "#ffffff"]);
    const lvl = treeLevel(subjectId);
    setTimeout(() => openCard(drawQuestion(subjectId, [lvl])), 200);
  }

  /* ------------------------------------------------------------------ */
  /* Journal & summary                                                  */
  /* ------------------------------------------------------------------ */
  function journalHTML() {
    return state.journal
      .map((j) => {
        const s = SUBJ[j.subject] || { emoji: "•", name: j.subject };
        const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
        const pts = j.gained[0] + j.gained[1];
        const note = j.note ? `<span class="j-note">“${esc(j.note)}”</span>` : "";
        return `<li><b>${esc(text)}</b><br><span class="j-meta">${s.emoji} ${esc(sName(s))} · ${esc(t("answeredBy", { name: state.players[j.player] }))} · +${pts}</span>${note}</li>`;
      })
      .join("");
  }

  function openJournal() {
    $("#journal-list").innerHTML = journalHTML();
    $("#journal-overlay").classList.remove("hidden");
  }

  function showSummary() {
    const j = state.journal;
    const bySubject = {};
    j.forEach((e) => (bySubject[e.subject] = (bySubject[e.subject] || 0) + 1));
    const fav = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0];
    const deep = j.filter((e) => e.depth === 3).length;
    const guesses = j.filter((e) => e.bonuses.includes("guess")).length;
    const wows = j.filter((e) => e.bonuses.includes("wow")).length;
    const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
    const lvl = Math.floor(state.connection / LEVEL_UP) + 1;

    $("#summary-tagline").textContent = t("reached", { a: state.players[0], b: state.players[1], n: lvl });
    const stat = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
    $("#summary-stats").innerHTML =
      stat(j.length, t("statAnswered")) +
      stat(`${state.scores[0]} · ${state.scores[1]}`, `${esc(state.players[0])} · ${esc(state.players[1])}`) +
      stat(deep, t("statDeep")) +
      stat(wows, t("statWow")) +
      stat(guesses, t("statGuess")) +
      stat(fav ? SUBJ[fav[0]].emoji : "–", fav ? esc(t("statFav", { s: sName(SUBJ[fav[0]]) })) : t("statFavNone")) +
      stat(`${mins}′`, t("statTogether"));
    $("#summary-journal").innerHTML = journalHTML();
    showScreen("screen-summary");
    setTimeout(() => FX.fireworks(10), 300);
  }

  function downloadStory() {
    const lines = [
      `Loopy Life · ${t("title")}`,
      `${state.players[0]} & ${state.players[1]} · ${new Date(state.startedAt).toLocaleString()}`,
      `Scores: ${state.players[0]} ${state.scores[0]} · ${state.players[1]} ${state.scores[1]} · ${t("connection")} ${state.connection}`,
      "",
    ];
    state.journal.forEach((j, i) => {
      const s = SUBJ[j.subject] || { name: j.subject };
      const text = QBYID[j.qid] ? qText(QBYID[j.qid]) : tr(j.text);
      lines.push(`${i + 1}. [${sName(s)}] ${text}`);
      lines.push(`   ${t("answeredBy", { name: state.players[j.player] })}${j.note ? ` · ${t("note")}: ${j.note}` : ""}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${t("storyFile")}-${state.players[0]}-${state.players[1]}.txt`.replace(/\s+/g, "-");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                             */
  /* ------------------------------------------------------------------ */
  function initGame() {
    $("#spin-btn").addEventListener("click", spin);
    $("#wheel").addEventListener("click", spin);
    $$("[data-switch]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.switch)));
    $("#tree-surprise").addEventListener("click", (e) => growBranch(pick(state.subjects), e.currentTarget));
    $("#journal-btn").addEventListener("click", openJournal);
    $("#journal-close").addEventListener("click", () => $("#journal-overlay").classList.add("hidden"));
    $("#journal-overlay").addEventListener("click", (e) => { if (e.target.id === "journal-overlay") $("#journal-overlay").classList.add("hidden"); });
    $("#finish-btn").addEventListener("click", showSummary);
    $("#continue-btn").addEventListener("click", () => { showScreen("screen-game"); setMode(state.mode); });
    $("#restart-btn").addEventListener("click", () => {
      $("#resume-row").classList.add("hidden");
      showScreen("screen-setup");
    });
    $("#download-btn").addEventListener("click", downloadStory);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $("#journal-overlay").classList.add("hidden");
      if ((e.key === " " || e.key === "Enter") && $("#screen-game").classList.contains("active") && !current && state.mode === "wheel" && document.activeElement === document.body) {
        e.preventDefault();
        spin();
      }
    });
  }

  function applyLanguage() {
    document.documentElement.lang = LANG;
    document.title = `Loopy Life · ${t("title")}`;
    $$("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === LANG));
    $("#lang-btn").textContent = t("langToggle");
    if (!DB.questions.length) return;
    $("#q-count").textContent = t("qCount", { n: DB.questions.length });
    const selected = $$("#subject-grid .subject").length ? selectedSubjects() : DB.subjects.map((s) => s.id);
    renderSubjectGrid(selected);
    if (state && $("#screen-game").classList.contains("active")) {
      updateScores(false);
      if (state.mode === "wheel") drawWheel(); else renderTree();
    }
    if (state && $("#screen-summary").classList.contains("active")) showSummary();
    fillCard();
  }

  function setLanguage(lang) {
    LANG = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    applyLanguage();
  }

  async function boot() {
    applyLanguage();
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
    $("#lang-btn").addEventListener("click", () => setLanguage(LANG === "fr" ? "en" : "fr"));
    try {
      const res = await fetch("data/questions.json?v=2", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      DB = await res.json();
    } catch (e) {
      $("#setup-error").textContent = t("loadError");
      return;
    }
    DB.subjects.forEach((s) => (SUBJ[s.id] = s));
    DB.questions.forEach((q) => (QBYID[q.id] = q));
    initSetup();
    initCard();
    initGame();
    applyLanguage();
    setTimeout(() => FX.sparkleEl($(".hero h1")), 400);
  }

  boot();
})();
