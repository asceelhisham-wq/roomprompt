---
tags: [product, prompt, v2]
updated: 2026-10-16
---

# Prompt Formula (v2)

## 3D render
```
A {style} {room}[ of about W × L m] with {pieces},
{palette} colour palette, {style materials}, {first 3 style keywords},
{lighting phrase}, {camera spot phrase}, {height phrase}, {lens phrase},
photorealistic, high detail, interior design photography, {ratio} aspect ratio.
```
Midjourney format swaps the last part for ` --ar {ratio} --style raw`.

### Camera spot phrases
| Spot | Phrase |
|---|---|
| Corner (4) | photographed from the {front-left} corner looking diagonally toward the {back-right} corner, two-point perspective showing two walls |
| Entry wall | photographed from the entry doorway looking straight at the back wall, one-point perspective with a centred, symmetrical composition |
| Other walls | photographed from the {left wall} looking toward {the right wall}, one-point perspective |
| Overhead | overhead view looking straight down from the ceiling, flat-lay composition (height is skipped) |

Heights: low 0.8 m · eye level 1.5 m · high 2.2 m. Lenses: 16 / 24 / 35 / 50 / 85 mm.

## 2D version (6 modes)
| Mode | Opens with | Ratio |
|---|---|---|
| Floor plan | A 2D top-down architectural floor plan of… symbols, flat fills, door swing, dimension lines, scale bar, north arrow | 1:1 |
| Blueprint | A 2D architectural blueprint… white lines on deep blue, title block | 1:1 |
| Wall elevation | A 2D front elevation drawing of the {wall facing the camera}… | chosen ratio |
| Isometric | A 2.5D isometric cutaway illustration… ceiling and two walls removed | chosen ratio |
| Flat illustration | A flat 2D vector illustration… no perspective distortion | chosen ratio |
| Moodboard | A 2D interior design moodboard… palette hex codes listed | 1:1 |

## Example (3D)
> A japandi living room of about 4 × 5.5 m with a cream bouclé sectional sofa, a low pale oak coffee table, a bonsai in a glazed ceramic planter, an olive tree in a terracotta pot, and a large abstract artwork in an ebonised black oak frame, earth tones colour palette, oak, paper, linen, and bamboo, minimal, natural, muted, bright natural daylight through the windows, photographed from the front-left corner looking diagonally toward the back-right corner, two-point perspective showing two walls, camera at eye level, about 1.5 m, with vertical lines kept straight, 24 mm wide-angle lens, photorealistic, high detail, interior design photography, 16:9 aspect ratio.

Guard: both outputs stay as hint text until a style and at least one piece are chosen.
