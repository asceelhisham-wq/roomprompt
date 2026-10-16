---
tags: [engineering, design-doc]
---

# System Design — Roomprompt v2

## Requirements
**Functional**
- Searchable style picker with 100+ styles (from current design vocabulary sources)
- Many more colour palettes (searchable)
- Camera position picker: which corner / wall the photo is taken from, height, lens, aspect
- Second output: a 2D prompt (floor plan, blueprint, elevation, flat illustration)
- 1000+ pieces, still searchable and filterable by room and category

**Non-functional**
- Still one self-contained page, offline, no libraries
- Library interactions under ~16ms at 1000+ items on a laptop
- Works at 400px width; light and dark

## High-level design
```
 data layer                 derived                  UI
 ─────────                  ───────                  ──
 STYLES[]  ─┐
 PALETTES[] ─┤             searchIndex (once)      Left: room · style search · palette search · camera
 BASES[] × FINISHES[] ──► ITEMS[1000+] ──► filter(room, query, category) ──► paged library
 CAMERA_*  ─┤                                       Right: selection · preview · [3D | 2D] prompt tabs
 PLAN_MODES ┘                       state ──► build3D(state) / build2D(state)
```

## Key decisions
| Decision | Choice | Trade-off |
|---|---|---|
| How to reach 1000+ pieces | ~200 base pieces × applicable finish groups (wood, upholstery, metal, stone…) generated at load | Compact and consistent; less hand-written flavour per item than 1000 bespoke lines. The 100 original pieces stay as "signature" items |
| Style match for generated items | union of base styles + finish styles | Broader suggestions; ranking keeps exact matches on top |
| Rendering 1000+ cards | per-category paging (24 then "Show more") + one delegated click handler | Slight extra click to see everything; avoids 1000-node rebuilds |
| Camera input | clickable mini floor plan with 8 positions (4 corners, 4 walls) + overhead | Visual and quick; does not model irregular rooms |
| 2D prompt | separate builder sharing state | Same picks drive both outputs |
| Persistence | none (in-memory) | Artifact hash can only carry a bare token, so URL-encoded state is not available; revisit with a storage capability |

## Revisit as it grows
- Move data to JSON files beside the page
- Saved looks + share via a storage capability
- Real per-item thumbnails
