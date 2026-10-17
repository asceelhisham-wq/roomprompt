---
tags: [product, code, v2]
updated: 2026-10-16
---

# State & Interactions (v2)

```js
state = { room, size{w,l}, style, styleQuery, styleGroup, palette, paletteTouched, paletteQuery,
          mood, cam{pos, height, lens, ratio, fmt}, out ('3d'|'2d'), plan, selected[], search,
          category, showAll, pages{} }
matchSet  // ids of pieces that suit the current style, rebuilt on style change
```

| Action | Effect |
|---|---|
| `setStyle` | rebuild `matchSet`; set palette to the style's palette unless `paletteTouched`; re-sort library |
| Limit | `MAX_ITEMS = 40`; past 15 pieces a note suggests putting key pieces first |
| `toggleItem` | updates cards in place (`syncCards`), selection, prompt, preview — no library rebuild |
| Library clicks | one delegated listener on `#libBody` for cards and "Show more" |
| `randomize` | random style + palette, one piece per base (5–7), random camera spot |
| `reset` | everything back to defaults, empty selection |
| `copyPrompt` | copies the active tab; on failure selects the text and asks for Ctrl+C |
