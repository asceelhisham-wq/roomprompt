---
tags: [product, ui, v2]
updated: 2026-10-16
---

# UI Layout (v2)

Topbar + three columns (`330px | 1fr | 400px`).

**Left — choose:** Room (15) + optional size in metres → Style (search, 8 group chips, "Selected" bar, scroll list) → Palette (search, 62 rows, "Suits style" tag) → Lighting (9).

**Centre — browse:** search across 1,437 pieces (debounced 120 ms), "Show all rooms", count line ("718 pieces for living room · 144 suit Japandi"), category chips with counts → **subcategory chips** (second row, once a category is picked), grouped grid with 24 per category and "Show more".

**Right — output:** Prompt (tabs: 3D render / 2D version + 6 mode chips, word and character count, Copy) → Your selection (max 40, note after 15) → Camera spot (mini plan with view cone, height, lens, ratio, format) → Preview card.

**Responsive:** ≤1180px the right column becomes a drawer ("Prompt" button); ≤760px the left becomes a drawer too. Esc closes drawers.

Opens on a worked Japandi example; **Reset** clears everything.
