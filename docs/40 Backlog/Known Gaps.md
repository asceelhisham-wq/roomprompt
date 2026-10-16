---
tags: [backlog, bugs]
---

# Known Gaps

Found while reading the current artifact source (version 1791993278-1592).

## Dead data
- `MATERIALS` (19 entries) is never read by the app — the prompt and preview use `style.typicalMaterials` free strings instead
- `style.keywords[]` is never read either
- `.sel` select styling exists in CSS but no `<select>` is rendered any more
- The `data.js` comment says "17 materials" while the array has 19

## Loose references
- `style.typicalMaterials` are free strings, so they drift from `MATERIALS` names: `white oak`, `oak`, `paper`, `bamboo`, `driftwood`, `plaster`, `olive wood`, `mahogany`, `gilt`, `stoneware`, `laminate`, `teak`, `cotton`, `greenery`, `mirror`, `galvanised metal` all appear in styles but not in `MATERIALS`
- `<title>` and `<meta name="description">` sit inside `<body>` rather than `<head>`
- `<label for="paletteTitle">` points at an id that does not exist (the palette group is a div, not a labelled control)

## Behaviour
- The library's search placeholder hard-codes "100 pieces" while the style hint is computed from `STYLES.length`
- No persistence at all: reload loses the look (deliberate, but worth a note in the UI)
- `randomize()` keeps the current room but can fall back to items that do not belong to it when the style pool is thin

## Coverage
- Room coverage is uneven: `kids-room`, `balcony` and `guest-room` have only a handful of items each
- Several styles have too few matching items for "Surprise me" to feel distinct (memphis, gothic-revival, loft, zen, urban-chic)

## Fixed in v2
- `title`/description now at the top of the file; dark theme also honours the explicit `data-theme` toggle
- Dead `MATERIALS` and `.sel` removed; `keywords` now used in the prompt
- Null-safe prompt builders; search index precomputed; paged library
- Thin rooms filled (kids 185, balcony 197, guest 217 pieces)

## Still open after v2
- Generated pieces share templates, so some read alike ("a low walnut coffee table", "a low teak coffee table")
- Japanese Traditional and Korean Hanok still have the fewest matching pieces
- No saved looks or sharing
