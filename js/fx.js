/* Loopy Life · Visual effects: sparkles, fireworks
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

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
