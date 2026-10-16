# Roomprompt

A single-page tool that turns a **room**, a **style**, a **camera spot** and a few **pieces** into ready-to-paste AI image prompts — a photoreal 3D render prompt and a 2D prompt (floor plan, blueprint, elevation, isometric, flat illustration or moodboard).

Runs offline in any browser: open `index.html`. No libraries, no network.

## What's inside

| | |
|---|---|
| Rooms | 15 (incl. majlis, walk-in closet, home cinema, laundry, nursery) |
| Styles | 112 in 8 groups, searchable |
| Colour palettes | 62, five swatches each |
| Pieces | 1,437 — 100 hand-written + 1,337 generated from 164 base pieces × finishes |
| Lighting | 9 moods |
| Camera | 4 corners, 4 walls, overhead · 3 heights · 5 lenses · 5 aspect ratios · Midjourney format |

## Project layout

```
index.html               built page (open this)
src/shell.html           markup + CSS
src/signature-items.js   the 100 hand-written v1 pieces
src/data.js              rooms, styles, palettes, lighting, finishes, base pieces
src/app.js               expansion, state, rendering, prompt builders
build.py                 assembles index.html from src/
check.js                 data integrity check + sample prompts
docs/                    Obsidian vault: product, data, design, backlog, engineering notes
```

## Develop

```bash
python3 build.py     # rebuild index.html after editing src/
node check.js        # counts, duplicate ids, broken references, sample prompts
```

To add a style, add a row to `STYLE_ROWS` in `src/data.js`. To add pieces, add a row to `BASES` with a finish group — one piece is generated per finish.

## Docs

Open `docs/` as an Obsidian vault, starting at `00 Project Hub.md`.
