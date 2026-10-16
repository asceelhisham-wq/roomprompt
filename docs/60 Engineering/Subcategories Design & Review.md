---
tags: [engineering, design-doc, review]
updated: 2026-10-16
---

# Subcategories — Design & Review (v2.1)

## Requirement
Every library category gets subcategories (Furniture → Sofas, Armchairs, Dining, Coffee/side, Beds, Nightstands & dressers, Desks, Stools & ottomans; same for all 13 categories), filterable from the library.

## Design
```
SUBCATEGORIES[cat] = [[subId, name, "baseId baseId …"]]
        │  built once at load into subOf["cat/baseId"] → subId
        ▼
item.sub  (generated items use the part of the id before "--")
        ▼
chips row 1: categories  ──click──►  chips row 2: "All <cat>" + subcategories with counts
library: All → sections per category · One category → sections per subcategory (own paging)
search text includes the subcategory name, so "beds" or "nursery" finds the group
```

| Decision | Choice | Trade-off |
|---|---|---|
| Where the mapping lives | One table keyed by base id, not a field on each of 164 base rows | One place to read and edit; a new base must also be added here (the check enforces it) |
| Key | `category/baseId` | Same base id in two categories (e.g. `wardrobe` in furniture and storage) maps independently |
| Unmapped pieces | Fall into "More" and fail `check.js` | Never invisible, never silently wrong |
| Rugs | Moved the two v1 rugs from Textiles to Flooring → Rugs & runners | One home for all rugs |

## Code review
| # | Where | Finding | Severity | Status |
|---|---|---|---|---|
| 1 | `app.js` buildItems | `subName()` called before its declaration | — | OK: function declarations are hoisted |
| 2 | chips handler | Sub filter must reset when the category, room, search or "show all" changes | 🟠 | Fixed: every reset path sets `sub = "all"` |
| 3 | paging | Page counts keyed by section id; category and sub sections share the map | 🟡 | Fixed: sub sections use `cat/sub` keys, reset on filter change |
| 4 | `check.js` | Must fail on unmapped pieces | 🟡 | Fixed: exit code 1 when any piece has no subcategory |
| 5 | Security | No user text rendered as HTML (all `textContent`) | — | OK |

**Verdict:** approve. Browser test: bedroom → Furniture → Beds shows 28 pieces under one "Beds" section, the selection shows "Furniture › Beds", no console errors.
