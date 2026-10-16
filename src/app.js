/* app.js — Roomprompt v2 logic. In-memory state; data from SIGNATURE_ITEMS + data2.js. */
"use strict";

const MAX_ITEMS = 12;
const PAGE = 24;

/* ---------- expand data ---------- */
const roomByCode = Object.fromEntries(ROOM_TYPES.map((r) => [r.code, r.id]));
const STYLES = STYLE_ROWS.map(([id, name, group, palette, materials, keywords, description]) => ({
  id, name, group, description,
  typicalPalette: palette,
  typicalMaterials: materials.split(",").map((s) => s.trim()),
  keywords: keywords.split(",").map((s) => s.trim()),
  terms: (materials + ", " + keywords).toLowerCase(),
  hay: (name + " " + description + " " + materials + " " + keywords + " " + group).toLowerCase(),
}));
const COLOR_PALETTES = PALETTE_ROWS.map(([id, name, hex]) => ({ id, name, colors: hex.split(" ") }));

function withArticles(s) {
  return s.replace(/\{a\} (\S)/g, (m, c) => (/[aeiou]/i.test(c) ? "an " : "a ") + c);
}
function buildItems() {
  const out = SIGNATURE_ITEMS.map((it) => ({ ...it, sig: true, terms: [], finish: "" }));
  BASES.forEach(([id, name, category, codes, spec, tpl, baseStyles]) => {
    const [group, ...skip] = spec.split("-");
    const rooms = [...codes].map((c) => roomByCode[c]).filter(Boolean);
    const bs = baseStyles ? baseStyles.split(" ") : [];
    (FINISHES[group] || []).forEach(([key, label, phrase, match, fstyles]) => {
      if (skip.includes(key)) return;
      out.push({
        id: id + "--" + key,
        name, finish: label, category,
        roomTypes: rooms,
        styleTags: Array.from(new Set(bs.concat(fstyles.split(" ")))),
        terms: match.split(" "),
        promptText: withArticles(tpl.replace("{f}", phrase)),
      });
    });
  });
  out.forEach((it) => {
    it.hay = (it.name + " " + it.finish + " " + it.promptText + " " + it.category).toLowerCase();
  });
  return out;
}
const ITEMS = buildItems();
const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));

/* ---------- state ---------- */
const state = {
  room: "living-room",
  size: { w: "", l: "" },
  style: null,
  styleQuery: "",
  styleGroup: "all",
  palette: "warm-neutrals",
  paletteTouched: false,
  paletteQuery: "",
  mood: "daylight",
  cam: { pos: "fl", height: "eye", lens: "24", ratio: "16:9", fmt: "plain" },
  out: "3d",
  plan: "plan",
  selected: [],
  search: "",
  category: "all",
  showAll: false,
  pages: {},
};
let matchSet = new Set();   // item ids that suit the current style

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const byId = (list, id) => list.find((x) => x.id === id) || null;
const styleById = (id) => byId(STYLES, id);
const roomName = (id) => (byId(ROOM_TYPES, id) || {}).name || "";
function make(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}
function joinNaturally(parts) {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] + " and " + parts[1];
  return parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
}
function tokens(q) { return q.trim().toLowerCase().split(/\s+/).filter(Boolean); }
function hit(hay, toks) { return toks.every((t) => hay.includes(t)); }
function sizeOk() {
  const w = parseFloat(state.size.w), l = parseFloat(state.size.l);
  return w > 0 && l > 0 ? { w, l } : null;
}
function fmtNum(n) { return n.toLocaleString("en-US"); }

function computeMatches() {
  matchSet = new Set();
  const s = styleById(state.style);
  if (!s) return;
  ITEMS.forEach((it) => {
    if (it.styleTags.includes(s.id) || it.terms.some((t) => s.terms.includes(t))) matchSet.add(it.id);
  });
}

/* ---------- room ---------- */
function renderRooms() {
  const g = $("roomGrid");
  g.innerHTML = "";
  ROOM_TYPES.forEach((rt) => {
    const b = make("button", "tog", rt.name);
    b.type = "button";
    b.setAttribute("aria-pressed", String(state.room === rt.id));
    b.addEventListener("click", () => setRoom(rt.id));
    g.appendChild(b);
  });
  $("roomHint").textContent = ROOM_TYPES.length + " rooms";
}

/* ---------- styles ---------- */
function renderStyleGroups() {
  const wrap = $("styleGroups");
  wrap.innerHTML = "";
  [{ id: "all", name: "All" }].concat(STYLE_GROUPS).forEach((g) => {
    const b = make("button", "mini-chip", g.name);
    b.type = "button";
    b.setAttribute("aria-pressed", String(state.styleGroup === g.id));
    b.addEventListener("click", () => { state.styleGroup = g.id; renderStyleGroups(); renderStyles(); });
    wrap.appendChild(b);
  });
}
function filteredStyles() {
  const toks = tokens(state.styleQuery);
  return STYLES.filter((s) => (state.styleGroup === "all" || s.group === state.styleGroup) && hit(s.hay, toks));
}
function renderStyles() {
  const list = filteredStyles();
  const grpName = (id) => (byId(STYLE_GROUPS, id) || {}).name || "";
  $("styleHint").textContent = list.length === STYLES.length ? STYLES.length + " styles" : list.length + " of " + STYLES.length;

  const picked = $("stylePicked");
  picked.innerHTML = "";
  const cur = styleById(state.style);
  if (cur) {
    const row = make("div", "picked");
    const t = make("div", "grow");
    t.appendChild(document.createTextNode("Selected: "));
    t.appendChild(make("b", null, cur.name));
    row.appendChild(t);
    const clr = make("button", null, "Clear");
    clr.type = "button";
    clr.addEventListener("click", () => setStyle(null));
    row.appendChild(clr);
    picked.appendChild(row);
  }

  const wrap = $("styleList");
  wrap.innerHTML = "";
  if (!list.length) {
    wrap.appendChild(make("div", "empty-note", "No style matches “" + state.styleQuery.trim() + "”. Try a material or mood, like “velvet” or “calm”."));
    return;
  }
  list.forEach((s) => {
    const card = make("button", "style-card");
    card.type = "button";
    card.dataset.style = s.id;
    card.setAttribute("aria-pressed", String(state.style === s.id));
    const top = make("div", "sc-top");
    top.appendChild(make("span", "sc-name", s.name));
    top.appendChild(make("span", "sc-grp", grpName(s.group)));
    card.appendChild(top);
    card.appendChild(make("div", "sc-desc", s.description));
    wrap.appendChild(card);
  });
}

/* ---------- palettes + moods ---------- */
function renderPalettes() {
  const toks = tokens(state.paletteQuery);
  const style = styleById(state.style);
  const list = COLOR_PALETTES.filter((p) => hit((p.name + " " + p.id).toLowerCase(), toks));
  $("paletteHint").textContent = list.length === COLOR_PALETTES.length ? COLOR_PALETTES.length + " palettes" : list.length + " of " + COLOR_PALETTES.length;
  const wrap = $("paletteList");
  wrap.innerHTML = "";
  if (!list.length) { wrap.appendChild(make("div", "empty-note", "No palette by that name.")); return; }
  list.forEach((p) => {
    const b = make("button", "palette-opt");
    b.type = "button";
    b.dataset.palette = p.id;
    b.setAttribute("aria-pressed", String(state.palette === p.id));
    const row = make("span", "swatch-row");
    p.colors.forEach((c) => { const sw = make("span"); sw.style.background = c; row.appendChild(sw); });
    b.appendChild(row);
    b.appendChild(make("span", "po-name", p.name));
    if (style && style.typicalPalette === p.id) b.appendChild(make("span", "po-tag", "Suits style"));
    wrap.appendChild(b);
  });
}
function renderMoods() {
  const g = $("moodGrid");
  g.innerHTML = "";
  LIGHTING_MOODS.forEach((m) => {
    const b = make("button", "tog", m.label);
    b.type = "button";
    b.setAttribute("aria-pressed", String(state.mood === m.id));
    b.addEventListener("click", () => { state.mood = m.id; renderMoods(); renderOutputs(); });
    g.appendChild(b);
  });
}

/* ---------- library ---------- */
function roomSearchList() {
  const toks = tokens(state.search);
  return ITEMS.filter((i) => (state.showAll || i.roomTypes.includes(state.room)) && hit(i.hay, toks));
}
function renderChips(base) {
  const wrap = $("chips");
  wrap.innerHTML = "";
  const counts = {};
  base.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
  const mk = (id, label, n) => {
    const b = make("button", "chip", label);
    b.type = "button";
    b.dataset.cat = id;
    b.setAttribute("aria-pressed", String(state.category === id));
    b.appendChild(make("span", "n", fmtNum(n)));
    wrap.appendChild(b);
  };
  mk("all", "All", base.length);
  CATEGORIES.forEach((c) => { if (counts[c.id]) mk(c.id, c.name, counts[c.id]); });
}
function renderLibrary() {
  const base = roomSearchList();
  renderChips(base);
  const body = $("libBody");
  body.innerHTML = "";
  let list = state.category === "all" ? base : base.filter((i) => i.category === state.category);

  const matches = state.style ? list.filter((i) => matchSet.has(i.id)).length : 0;
  const meta = $("libMeta");
  meta.innerHTML = "";
  meta.appendChild(make("b", null, fmtNum(list.length)));
  meta.appendChild(document.createTextNode(" pieces " + (state.showAll ? "across all rooms" : "for " + roomName(state.room).toLowerCase())));
  if (state.style) meta.appendChild(document.createTextNode(" · " + fmtNum(matches) + " suit " + styleById(state.style).name + " (ochre edge, listed first)"));

  if (!list.length) {
    const msg = state.search.trim()
      ? "No pieces match “" + state.search.trim() + "”. Try one word, or turn on “Show all rooms”."
      : "No pieces for this room in this category. Turn on “Show all rooms” to browse everything.";
    body.appendChild(make("div", "lib-empty", msg));
    return;
  }
  const sel = new Set(state.selected);
  CATEGORIES.forEach((cat) => {
    const group = list.filter((i) => i.category === cat.id);
    if (!group.length) return;
    group.sort((a, b) =>
      (matchSet.has(b.id) - matchSet.has(a.id)) || (b.sig - a.sig) ||
      a.name.localeCompare(b.name) || a.finish.localeCompare(b.finish));
    const limit = state.pages[cat.id] || PAGE;
    const section = make("div", "cat-section");
    const h = make("h3");
    h.appendChild(make("span", null, cat.name));
    h.appendChild(make("span", "n", fmtNum(group.length)));
    section.appendChild(h);
    const grid = make("div", "item-grid");
    group.slice(0, limit).forEach((item) => {
      const card = make("button", "item");
      card.type = "button";
      card.dataset.id = item.id;
      card.dataset.selected = String(sel.has(item.id));
      card.dataset.suggested = String(matchSet.has(item.id));
      card.appendChild(make("div", "it-name", item.name));
      if (item.finish) card.appendChild(make("div", "it-fin", item.finish));
      card.appendChild(make("div", "it-prompt", item.promptText));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    if (group.length > limit) {
      const more = make("button", "btn more-btn", "Show " + Math.min(PAGE * 2, group.length - limit) + " more " + cat.name.toLowerCase() + " (" + fmtNum(group.length - limit) + " hidden)");
      more.type = "button";
      more.dataset.more = cat.id;
      section.appendChild(more);
    }
    body.appendChild(section);
  });
}
function syncCards() {
  const sel = new Set(state.selected);
  document.querySelectorAll("#libBody .item").forEach((c) => { c.dataset.selected = String(sel.has(c.dataset.id)); });
}

/* ---------- selection ---------- */
function renderSelection() {
  $("selCount").innerHTML = "";
  const c = $("selCount");
  c.appendChild(make("b", null, String(state.selected.length)));
  c.appendChild(document.createTextNode(" / " + MAX_ITEMS));
  const warnSlot = $("warnSlot");
  warnSlot.innerHTML = "";
  if (state.selected.length >= MAX_ITEMS) warnSlot.appendChild(make("div", "warn", "That’s the 12-piece limit. Remove one to add another; tight edits make sharper prompts."));
  const listEl = $("selList");
  listEl.innerHTML = "";
  if (!state.selected.length) {
    listEl.appendChild(make("div", "sel-empty", "Nothing added yet. Click pieces in the library to build your room."));
    return;
  }
  state.selected.forEach((id) => {
    const item = ITEM_MAP.get(id);
    if (!item) return;
    const row = make("div", "sel-item");
    const text = make("div", "si-text");
    text.appendChild(make("div", "si-name", item.name + (item.finish ? " · " + item.finish : "")));
    text.appendChild(make("div", "si-cat", (byId(CATEGORIES, item.category) || {}).name || item.category));
    row.appendChild(text);
    const rm = make("button", "sel-remove", "×");
    rm.type = "button";
    rm.setAttribute("aria-label", "Remove " + item.name);
    rm.addEventListener("click", () => removeItem(id));
    row.appendChild(rm);
    listEl.appendChild(row);
  });
}

/* ---------- camera ---------- */
const CAM_SPOTS = {
  fl: { x: 22, y: 128, kind: "corner", name: "front-left", opp: "back-right" },
  fr: { x: 148, y: 128, kind: "corner", name: "front-right", opp: "back-left" },
  bl: { x: 22, y: 22, kind: "corner", name: "back-left", opp: "front-right" },
  br: { x: 148, y: 22, kind: "corner", name: "back-right", opp: "front-left" },
  f:  { x: 85, y: 128, kind: "wall", name: "entry wall", toward: "the back wall" },
  b:  { x: 85, y: 22, kind: "wall", name: "back wall", toward: "the entry" },
  l:  { x: 22, y: 75, kind: "wall", name: "left wall", toward: "the right wall" },
  r:  { x: 148, y: 75, kind: "wall", name: "right wall", toward: "the left wall" },
  top: { x: 85, y: 75, kind: "top", name: "overhead" },
};
const CAM_HEIGHTS = [
  { id: "low", label: "Low", phrase: "low camera height of about 0.8 m" },
  { id: "eye", label: "Eye level", phrase: "camera at eye level, about 1.5 m, with vertical lines kept straight" },
  { id: "high", label: "High", phrase: "elevated camera at about 2.2 m looking slightly down" },
];
const CAM_LENSES = [
  { id: "16", label: "16 mm", phrase: "16 mm ultra-wide lens" },
  { id: "24", label: "24 mm", phrase: "24 mm wide-angle lens" },
  { id: "35", label: "35 mm", phrase: "35 mm lens with natural proportions" },
  { id: "50", label: "50 mm", phrase: "50 mm lens for a tighter vignette" },
  { id: "85", label: "85 mm", phrase: "85 mm lens for a close detail shot" },
];
const RATIOS = ["16:9", "3:2", "4:5", "1:1", "9:16"];
const FORMATS = [{ id: "plain", label: "Any tool" }, { id: "mj", label: "Midjourney" }];
const PLAN_MODES = [
  { id: "plan", label: "Floor plan" },
  { id: "blueprint", label: "Blueprint" },
  { id: "elevation", label: "Wall elevation" },
  { id: "iso", label: "Isometric" },
  { id: "flat", label: "Flat illustration" },
  { id: "board", label: "Moodboard" },
];

function cameraPhrase() {
  const s = CAM_SPOTS[state.cam.pos];
  if (s.kind === "top") return "overhead view looking straight down from the ceiling, flat-lay composition";
  if (s.kind === "corner") return "photographed from the " + s.name + " corner looking diagonally toward the " + s.opp + " corner, two-point perspective showing two walls";
  if (state.cam.pos === "f") return "photographed from the entry doorway looking straight at the back wall, one-point perspective with a centred, symmetrical composition";
  return "photographed from the " + s.name + " looking toward " + s.toward + ", one-point perspective";
}
function elevationWall() {
  return { f: "back wall", b: "entry wall", l: "right wall", r: "left wall", fl: "back wall", fr: "back wall", bl: "entry wall", br: "entry wall", top: "main wall" }[state.cam.pos];
}
function seg(containerId, options, current, onPick) {
  const wrap = $(containerId);
  wrap.innerHTML = "";
  options.forEach((o) => {
    const id = typeof o === "string" ? o : o.id;
    const label = typeof o === "string" ? o : o.label;
    const b = make("button", "tog", label);
    b.type = "button";
    b.setAttribute("aria-pressed", String(current === id));
    b.addEventListener("click", () => onPick(id));
    wrap.appendChild(b);
  });
}
function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}
function renderCamPlan() {
  const svg = svgEl("svg", { viewBox: "0 0 170 160", class: "cam-svg", role: "group", "aria-label": "Room plan: choose the camera position" });
  const defs = svgEl("defs", {});
  const clip = svgEl("clipPath", { id: "roomClip" });
  clip.appendChild(svgEl("rect", { x: 22, y: 22, width: 126, height: 106 }));
  defs.appendChild(clip);
  svg.appendChild(defs);
  svg.appendChild(svgEl("rect", { x: 22, y: 22, width: 126, height: 106, class: "floor" }));
  svg.appendChild(svgEl("line", { x1: 100, y1: 128, x2: 124, y2: 128, class: "door" }));
  svg.appendChild(svgEl("path", { d: "M100 128 A24 24 0 0 1 124 104", class: "swing" }));
  const lbl = (t, x, y, anchor) => { const e = svgEl("text", { x, y, class: "lbl", "text-anchor": anchor || "middle" }); e.textContent = t; svg.appendChild(e); };
  lbl("BACK", 85, 15);
  lbl("ENTRY", 112, 146);
  if (state.size.w && state.size.l && sizeOk()) lbl(sizeOk().w + " × " + sizeOk().l + " m", 85, 158);

  const s = CAM_SPOTS[state.cam.pos];
  if (s.kind === "top") {
    svg.appendChild(svgEl("rect", { x: 30, y: 30, width: 110, height: 90, class: "top-hatch" }));
  } else {
    const cx = 85, cy = 75;
    const a = Math.atan2(cy - s.y, cx - s.x);
    const half = { "16": 0.85, "24": 0.7, "35": 0.52, "50": 0.38, "85": 0.22 }[state.cam.lens];
    const R = 220;
    const p1 = [s.x + R * Math.cos(a - half), s.y + R * Math.sin(a - half)];
    const p2 = [s.x + R * Math.cos(a + half), s.y + R * Math.sin(a + half)];
    svg.appendChild(svgEl("polygon", { points: s.x + "," + s.y + " " + p1.join(",") + " " + p2.join(","), class: "cone", "clip-path": "url(#roomClip)" }));
  }
  Object.entries(CAM_SPOTS).forEach(([id, p]) => {
    const c = svgEl("circle", { cx: p.x, cy: p.y, r: id === "top" ? 8 : 7, class: "spot" + (state.cam.pos === id ? " on" : ""), tabindex: 0, role: "button",
      "aria-label": p.kind === "top" ? "Overhead view" : "Camera at the " + p.name + (p.kind === "corner" ? " corner" : ""), "aria-pressed": String(state.cam.pos === id) });
    const t = svgEl("title", {}); t.textContent = p.kind === "top" ? "Overhead" : p.name + (p.kind === "corner" ? " corner" : "");
    c.appendChild(t);
    const pick = () => { state.cam.pos = id; renderCamera(); renderOutputs(); };
    c.addEventListener("click", pick);
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    svg.appendChild(c);
  });
  const host = $("camPlan");
  host.innerHTML = "";
  host.appendChild(svg);
}
function renderCamera() {
  renderCamPlan();
  seg("camHeight", CAM_HEIGHTS, state.cam.height, (v) => { state.cam.height = v; renderCamera(); renderOutputs(); });
  seg("camLens", CAM_LENSES, state.cam.lens, (v) => { state.cam.lens = v; renderCamera(); renderOutputs(); });
  seg("camRatio", RATIOS, state.cam.ratio, (v) => { state.cam.ratio = v; renderCamera(); renderOutputs(); });
  seg("fmtSeg", FORMATS, state.cam.fmt, (v) => { state.cam.fmt = v; renderCamera(); renderOutputs(); });
  const s = CAM_SPOTS[state.cam.pos];
  const read = $("camRead");
  read.innerHTML = "";
  read.appendChild(make("b", null, s.kind === "top" ? "Overhead" : s.kind === "corner" ? "From the " + s.name + " corner" : "From the " + s.name));
  read.appendChild(document.createTextNode(s.kind === "top" ? " · straight down" : s.kind === "corner" ? " · diagonal, two walls in frame" : " · straight-on, one-point perspective"));
}

/* ---------- prompts ---------- */
function promptParts() {
  const style = styleById(state.style);
  const palette = byId(COLOR_PALETTES, state.palette);
  const mood = byId(LIGHTING_MOODS, state.mood);
  const sz = sizeOk();
  return {
    style, palette, mood, sz,
    styleName: style ? style.name.toLowerCase() : "",
    room: roomName(state.room).toLowerCase(),
    sizeText: sz ? " of about " + sz.w + " × " + sz.l + " m" : "",
    items: joinNaturally(state.selected.map((id) => (ITEM_MAP.get(id) || {}).promptText).filter(Boolean)),
    materials: style ? joinNaturally(style.typicalMaterials) : "",
    keywords: style ? style.keywords.slice(0, 3).join(", ") : "",
    paletteText: palette ? palette.name.toLowerCase() + " colour palette" : "",
  };
}
function build3D() {
  const p = promptParts();
  if (!p.style || !p.items) return "";
  const h = byId(CAM_HEIGHTS, state.cam.height), l = byId(CAM_LENSES, state.cam.lens);
  const cam = state.cam.pos === "top" ? cameraPhrase() + ", " + l.phrase : cameraPhrase() + ", " + h.phrase + ", " + l.phrase;
  const body = [
    "A " + p.styleName + " " + p.room + p.sizeText + " with " + p.items,
    p.paletteText, p.materials, p.keywords, p.mood.phrase, cam,
    "photorealistic, high detail, interior design photography",
  ].filter(Boolean).join(", ");
  return state.cam.fmt === "mj" ? body + " --ar " + state.cam.ratio + " --style raw" : body + ", " + state.cam.ratio + " aspect ratio.";
}
function build2D() {
  const p = promptParts();
  if (!p.style || !p.items) return "";
  const dims = p.sz ? ", dimension lines in metres" : ", dimension lines";
  const look = p.styleName + " " + p.room;
  let s;
  switch (state.plan) {
    case "blueprint":
      s = "A 2D architectural blueprint of a " + look + p.sizeText + ", technical CAD drawing in fine white lines on a deep blue background, top-down furniture layout showing " + p.items + ", wall thicknesses, door swing on the entry wall, window openings" + dims + ", hand-lettered labels and a title block, orthographic view with no shading";
      break;
    case "elevation":
      s = "A 2D front elevation drawing of the " + elevationWall() + " of a " + look + p.sizeText + ", flat orthographic view with no perspective, showing " + p.items + " drawn to scale against the wall, " + p.paletteText + " as flat fills, " + p.materials + " rendered as flat textures, material callouts" + dims + ", clean architectural linework on a white background";
      break;
    case "iso":
      s = "A 2.5D isometric cutaway illustration of a " + look + p.sizeText + ", ceiling and two walls removed, 30-degree isometric angle, showing " + p.items + ", " + p.paletteText + ", " + p.materials + ", " + p.mood.phrase + ", clean vector style with soft shading on a plain background";
      break;
    case "flat":
      s = "A flat 2D vector illustration of a " + look + ", straight-on front view with no perspective distortion, " + p.items + ", " + p.paletteText + ", simple shapes, minimal outlines, no gradients, editorial illustration style";
      break;
    case "board":
      s = "A 2D interior design moodboard for a " + look + ": cut-out product images of " + p.items + ", " + p.palette.name.toLowerCase() + " colour swatches (" + p.palette.colors.join(", ") + "), material samples of " + p.materials + ", arranged on a neutral background with small labels, flat lay, top-down";
      break;
    default:
      s = "A 2D top-down architectural floor plan of a " + look + p.sizeText + ", orthographic view with no perspective, showing " + p.items + " as clean furniture symbols in sensible positions, " + p.paletteText + " as flat colour fills, " + p.materials + " shown as flat textures, solid walls with a door swing on the entry wall and window openings, room label" + dims + ", scale bar and north arrow, crisp vector linework on a white background";
  }
  const ratio = state.plan === "plan" || state.plan === "blueprint" || state.plan === "board" ? "1:1" : state.cam.ratio;
  return state.cam.fmt === "mj" ? s + " --ar " + ratio : s + ", " + ratio + " aspect ratio.";
}
function currentPrompt() { return state.out === "2d" ? build2D() : build3D(); }

function renderPrompt() {
  const el = $("promptText");
  const hasStyle = state.style != null, hasItems = state.selected.length > 0;
  const text = currentPrompt();
  if (text) {
    el.classList.remove("empty");
    el.textContent = text;
    const words = text.split(/\s+/).length;
    $("promptMeta").textContent = fmtNum(words) + " words · " + fmtNum(text.length) + " characters";
  } else {
    el.classList.add("empty");
    el.textContent = !hasStyle && !hasItems
      ? "Pick a style and add a few pieces. Your " + (state.out === "2d" ? "2D" : "render") + " prompt builds itself here, ready to paste into any AI image tool."
      : !hasStyle ? "Choose a style to name the look, and the full prompt appears here."
      : "Add a few pieces from the library, and the full prompt appears here.";
    $("promptMeta").textContent = "";
  }
  $("tab3d").setAttribute("aria-selected", String(state.out === "3d"));
  $("tab2d").setAttribute("aria-selected", String(state.out === "2d"));
  $("planModes").hidden = state.out !== "2d";
  if (state.out === "2d") seg("planModes", PLAN_MODES, state.plan, (v) => { state.plan = v; renderPrompt(); });
}
function renderPreview() {
  const pv = $("preview");
  pv.innerHTML = "";
  const p = promptParts();
  pv.appendChild(make("div", "pv-kicker", "The look"));
  pv.appendChild(make("div", "pv-style", p.style ? p.style.name : "Choose a style"));
  pv.appendChild(make("div", "pv-room", roomName(state.room) + (p.sz ? " · " + p.sz.w + " × " + p.sz.l + " m" : "")));
  if (p.palette) {
    const sw = make("div", "pv-swatches");
    p.palette.colors.forEach((c) => { const s = make("span"); s.style.background = c; sw.appendChild(s); });
    pv.appendChild(sw);
  }
  if (p.style) {
    pv.appendChild(make("div", "pv-section-label", "Materials"));
    const tags = make("div", "pv-tags");
    p.style.typicalMaterials.forEach((m) => tags.appendChild(make("span", "pv-tag", m)));
    pv.appendChild(tags);
  }
  pv.appendChild(make("div", "pv-section-label", "Pieces (" + state.selected.length + ")"));
  pv.appendChild(make("div", "pv-items", state.selected.length
    ? state.selected.map((id) => { const i = ITEM_MAP.get(id); return i ? i.name + (i.finish ? " (" + i.finish.toLowerCase() + ")" : "") : ""; }).filter(Boolean).join(" · ")
    : "No pieces yet"));
  const line = (label, val) => { const d = make("div", "pv-line"); d.appendChild(document.createTextNode(label + " ")); d.appendChild(make("b", null, val)); pv.appendChild(d); };
  line("Lighting:", p.mood.label);
  const s = CAM_SPOTS[state.cam.pos];
  line("Camera:", (s.kind === "top" ? "overhead" : s.name + (s.kind === "corner" ? " corner" : "")) + ", " + state.cam.lens + " mm, " + state.cam.ratio);
}
function renderOutputs() { renderPrompt(); renderPreview(); }

/* ---------- actions ---------- */
function setRoom(id) {
  state.room = id; state.category = "all"; state.pages = {};
  renderRooms(); renderLibrary(); renderOutputs();
}
function setStyle(id, quiet) {
  state.style = id;
  state.pages = {};
  computeMatches();
  const s = styleById(id);
  if (s && !state.paletteTouched && byId(COLOR_PALETTES, s.typicalPalette)) {
    state.palette = s.typicalPalette;
    if (!quiet) toast("Palette set to " + byId(COLOR_PALETTES, s.typicalPalette).name + " to suit " + s.name);
  }
  renderStyles(); renderPalettes(); renderLibrary(); renderOutputs();
}
function toggleItem(id) {
  const i = state.selected.indexOf(id);
  if (i >= 0) state.selected.splice(i, 1);
  else {
    if (state.selected.length >= MAX_ITEMS) { toast("12-piece limit reached. Remove one first."); renderSelection(); return; }
    state.selected.push(id);
  }
  afterSelectionChange();
}
function removeItem(id) { state.selected = state.selected.filter((x) => x !== id); afterSelectionChange(); }
function afterSelectionChange() { syncCards(); renderSelection(); renderOutputs(); }

function shuffle(a) { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }
function randomize() {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  state.paletteTouched = false;
  state.style = style.id;
  computeMatches();
  if (byId(COLOR_PALETTES, style.typicalPalette)) state.palette = style.typicalPalette;
  let pool = ITEMS.filter((i) => matchSet.has(i.id) && i.roomTypes.includes(state.room));
  if (pool.length < 5) pool = ITEMS.filter((i) => i.roomTypes.includes(state.room));
  // one piece per base so we don't pick three finishes of the same sofa
  const seen = new Set(), picks = [];
  shuffle(pool.slice()).forEach((i) => { const b = i.id.split("--")[0]; if (!seen.has(b)) { seen.add(b); picks.push(i.id); } });
  state.selected = picks.slice(0, 5 + Math.floor(Math.random() * 3));
  const spots = ["fl", "fr", "f", "bl", "br"];
  state.cam.pos = spots[Math.floor(Math.random() * spots.length)];
  state.pages = {};
  renderAll();
  toast("Surprised you with " + style.name);
}
function reset() {
  Object.assign(state, { style: null, styleQuery: "", styleGroup: "all", palette: "warm-neutrals", paletteTouched: false, paletteQuery: "",
    mood: "daylight", selected: [], search: "", category: "all", showAll: false, pages: {}, out: "3d", plan: "plan", size: { w: "", l: "" } });
  state.cam = { pos: "fl", height: "eye", lens: "24", ratio: "16:9", fmt: "plain" };
  computeMatches();
  ["search", "styleSearch", "paletteSearch", "sizeW", "sizeL"].forEach((id) => { $(id).value = ""; });
  $("showAll").setAttribute("aria-pressed", "false");
  $("showAll").textContent = "Show all rooms";
  renderAll();
  toast("Cleared");
}

/* ---------- copy ---------- */
function copyPrompt() {
  const text = currentPrompt();
  if (!text) { toast("Pick a style and add a piece first"); return; }
  const done = () => {
    const btn = $("copyBtn");
    btn.textContent = "Copied ✓";
    toast((state.out === "2d" ? "2D" : "Render") + " prompt copied");
    setTimeout(() => { btn.textContent = "Copy prompt"; }, 1400);
  };
  const fallback = () => {
    const range = document.createRange();
    range.selectNodeContents($("promptText"));
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
    toast("Prompt selected. Press Ctrl+C (⌘C on Mac) to copy.");
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback);
    else fallback();
  } catch (e) { fallback(); }
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

function wireDrawers() {
  const left = $("colLeft"), right = $("colRight"), scrim = $("scrim");
  const close = () => { left.classList.remove("open"); right.classList.remove("open"); scrim.classList.remove("show"); };
  $("openLeft").addEventListener("click", () => { close(); left.classList.add("open"); scrim.classList.add("show"); });
  $("openRight").addEventListener("click", () => { close(); right.classList.add("open"); scrim.classList.add("show"); });
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

function renderAll() {
  renderRooms(); renderStyleGroups(); renderStyles(); renderPalettes(); renderMoods();
  renderLibrary(); renderSelection(); renderCamera(); renderOutputs();
}
function init() {
  $("search").placeholder = "Search " + fmtNum(ITEMS.length) + " pieces — velvet sofa, zellige, olive tree…";
  // Open on a worked example so the first view shows real output; Reset clears it.
  state.style = "japandi";
  state.palette = "earth-tones";
  computeMatches();
  state.selected = ["sectional-sofa", "coffee-wood--oak", "paper-lantern", "wool-rug", "linen-curtains", "p-bonsai--cplanter"].filter((id) => ITEM_MAP.has(id));
  renderAll();

  let t1 = null;
  $("search").addEventListener("input", (e) => {
    clearTimeout(t1);
    t1 = setTimeout(() => { state.search = e.target.value; state.category = "all"; state.pages = {}; renderLibrary(); }, 120);
  });
  $("styleSearch").addEventListener("input", (e) => { state.styleQuery = e.target.value; renderStyles(); });
  $("paletteSearch").addEventListener("input", (e) => { state.paletteQuery = e.target.value; renderPalettes(); });
  ["sizeW", "sizeL"].forEach((id) => $(id).addEventListener("input", () => {
    state.size = { w: $("sizeW").value, l: $("sizeL").value };
    renderCamPlan(); renderOutputs();
  }));
  $("styleList").addEventListener("click", (e) => {
    const c = e.target.closest("[data-style]");
    if (c) setStyle(state.style === c.dataset.style ? null : c.dataset.style);
  });
  $("paletteList").addEventListener("click", (e) => {
    const c = e.target.closest("[data-palette]");
    if (!c) return;
    state.palette = c.dataset.palette; state.paletteTouched = true;
    renderPalettes(); renderOutputs();
  });
  $("chips").addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (!c) return;
    state.category = state.category === c.dataset.cat ? "all" : c.dataset.cat;
    renderLibrary();
  });
  $("libBody").addEventListener("click", (e) => {
    const more = e.target.closest("[data-more]");
    if (more) { const k = more.dataset.more; state.pages[k] = (state.pages[k] || PAGE) + PAGE * 2; renderLibrary(); return; }
    const card = e.target.closest("[data-id]");
    if (card) toggleItem(card.dataset.id);
  });
  $("showAll").addEventListener("click", (e) => {
    state.showAll = !state.showAll;
    e.currentTarget.setAttribute("aria-pressed", String(state.showAll));
    e.currentTarget.textContent = state.showAll ? "This room only" : "Show all rooms";
    state.category = "all"; state.pages = {};
    renderLibrary();
  });
  $("tab3d").addEventListener("click", () => { state.out = "3d"; renderPrompt(); });
  $("tab2d").addEventListener("click", () => { state.out = "2d"; renderPrompt(); });
  $("randomizeBtn").addEventListener("click", randomize);
  $("resetBtn").addEventListener("click", reset);
  $("copyBtn").addEventListener("click", copyPrompt);
  wireDrawers();
}
document.addEventListener("DOMContentLoaded", init);
