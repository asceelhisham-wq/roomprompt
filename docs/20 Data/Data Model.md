---
tags: [data, v2]
updated: 2026-10-16
---

# Data Model (v2)

Data is stored as compact rows and expanded once at load by `app.js`.

| Global | Row shape | Expands to |
|---|---|---|
| `ROOM_TYPES` | `{ id, name, code }` | — |
| `STYLE_GROUPS` | `{ id, name }` | — |
| `STYLE_ROWS` | `[id, name, group, palette, materials, keywords, description]` | `STYLES[]` with `typicalMaterials[]`, `keywords[]`, `terms`, `hay` (search text) |
| `PALETTE_ROWS` | `[id, name, "hex hex hex hex hex"]` | `COLOR_PALETTES[]` |
| `FINISHES` | `{ group: [[key, label, phrase, matchTerms, styleTags]] }` | used by the generator |
| `BASES` | `[id, name, category, roomCodes, group(-skip), template, baseStyles]` | one item per finish |
| `SIGNATURE_ITEMS` | v1 item objects | kept as-is, flagged `sig: true` |
| `CATEGORIES`, `LIGHTING_MOODS` | `{ id, name }`, `{ id, label, phrase }` | — |

**Generated item:** `{ id: "base--finish", name, finish, category, roomTypes[], styleTags[], terms[], promptText, hay }`

**Reference rules**
- room codes → `ROOM_TYPES.code`; `styleTags` → `STYLES.id`; `palette` → `COLOR_PALETTES.id`
- A test script asserts: no duplicate ids, every tag/room/category/palette resolves, no `{` left in any prompt

Related: [[Rooms]] · [[Styles]] · [[Items]] · [[Palettes]] · [[Lighting Moods]] · [[System Design v2]]
