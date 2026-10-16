---
tags: [product]
---

# Overview

Roomprompt ("Interior Prompt Builder") builds an AI render prompt from four choices:

1. **Room** — one of 15 room types, optional size in metres
2. **Style** — one of 112 searchable styles (the prompt stays locked until one is picked)
3. **Palette + lighting** — 62 palettes, 9 lighting moods
4. **Pieces** — up to 12 from a 1,437-piece library
5. **Camera spot** — corner, wall or overhead; height, lens, aspect ratio

Outputs: a 3D render prompt and a 2D prompt (floor plan, blueprint, elevation, isometric, flat illustration, moodboard). See [[v2 Features]].

It is a single self-contained page: no external fonts, no libraries, no network, no `localStorage`. All state lives in memory and is lost on reload.

Audience: someone writing prompts for an AI image tool who knows the look they want but not the vocabulary. The library's `promptText` strings carry the vocabulary for them ("a live-edge wood coffee table", "polished Venetian plaster walls").

Related: [[UI Layout]], [[Prompt Formula]], [[Data Model]]
