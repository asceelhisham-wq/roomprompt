---
tags: [product, v2]
---

# v2 Features (2026-10-16)

## Style search
- 112 styles in 8 groups: Modern & minimal · Nordic & Japanese · Classic & period · Global & regional · Rustic & natural · Bold & glam · Industrial & urban · Trending now
- Search covers name, description, materials and keywords, so "velvet" or "calm" finds styles too
- Picking a style auto-sets its palette **until you choose a palette yourself**
- Includes regional styles relevant locally: **Arabian Majlis, Najdi, Modern Arabic**, Ottoman Turkish
- Sources for the list: Redfin, Krea, Genroom, &Academy, Centris, Qanvast style guides

## Palettes
62 palettes, 5 swatches each, searchable; the one that suits the chosen style is tagged "Suits style".

## Camera spot ("which corner the photo is taken from")
Clickable mini floor plan (entry door at the bottom):
- 4 corners → two-point perspective, diagonal across the room
- 4 wall centres → one-point perspective (entry wall = symmetrical doorway shot)
- Centre → overhead
- Height: low 0.8 m / eye 1.5 m / high 2.2 m · Lens: 16/24/35/50/85 mm (the view cone narrows with the lens)
- Aspect: 16:9, 3:2, 4:5, 1:1, 9:16 · Format: any tool, or Midjourney (`--ar … --style raw`)

## 2D version
Second tab next to "3D render": Floor plan · Blueprint · Wall elevation (wall chosen from the camera spot) · Isometric cutaway · Flat illustration · Moodboard (includes the palette hexes). Optional room size in metres feeds dimension lines.

## 1,437 pieces
- 100 hand-written signature pieces from v1
- 1,337 generated from ~170 base pieces × finish groups (wood, upholstery, metal, stone, ceramic, fibre, glass, textile, paint colour, pattern, planter, tile)
- A piece "suits" a style if tagged for it **or** if its finish word (velvet, rattan, travertine…) appears in the style's materials/keywords
- Library shows 24 per category, then "Show more"; selection updates cards in place instead of re-rendering

See [[System Design v2]] for the reasoning.
