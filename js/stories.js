/* Loopy Life · Our stories: every story kept on this device
 * Part of the game, loaded as a plain script by index.html (see js/README.md). */
"use strict";

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
