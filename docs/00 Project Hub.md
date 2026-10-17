---
tags: [project, roomprompt, hub]
---

# Roomprompt — Project Hub

**What it is:** a single-page web tool that turns a room + a style + a few pieces into a ready-to-paste AI image prompt.
**Live artifact:** https://claude.ai/code/artifact/7119d008-107f-4165-9067-04733fa673b6
**Local source folder (separate React project):** `Desktop/ProomStudio_Project`
**Vault created:** 2026-10-16
**Live site (Vercel):** https://roomprompt.vercel.app — auto-deploys on every push to `main`
**GitHub:** https://github.com/asceelhisham-wq/roomprompt (public; vault mirrored in `docs/`)

## Map of content

- [[Overview]] — what the app does, who it's for
- [[UI Layout]] — the four panels
- [[Prompt Formula]] — exactly how the output sentence is assembled
- [[State & Interactions]] — state shape, actions, limits
- [[Data Model]] — all datasets and how they reference each other
- [[Rooms]] · [[Styles]] · [[Items]] · [[Subcategories]] · [[Palettes]] · [[Lighting Moods]]
- [[Design System]] — colours, type, components, responsive rules
- [[Roadmap]] — what's next
- [[Known Gaps]] — bugs and rough edges found while reading the code
- [[System Design v2]] · [[Tech Debt Register]] · [[Code Review v1]]
- [[v2 Features]] — what changed in v2 and how it works

## At a glance

| Dataset | Count |
|---|---|
| | v1 | **v2 (2026-10-16)** |
|---|---|---|
| Room types | 10 | **15** (+ majlis, walk-in closet, home cinema, laundry, nursery) |
| Styles | 30 | **112** in 8 groups, searchable |
| Pieces | 100 | **1,437** (100 signature + 1,337 generated), 13 categories, 52 subcategories |
| Colour palettes | 6 | **62** (5 hex each), searchable |
| Lighting moods | 4 | **9** |
| Camera | — | 9 spots on a plan, 3 heights, 5 lenses, 5 ratios |
| Outputs | 3D prompt | 3D prompt + **6 kinds of 2D prompt** |
| Max items per prompt | 12 | 40 |
