---
tags: [design]
---

# Design System

Direction: a material-forward tool on a **warm oatmeal canvas** with ink text and one **olive/moss** accent — deliberately not the cream + serif + terracotta interior-design cliché. System font stacks only, so it runs offline.

## Tokens (light)
| Token | Value | Use |
|---|---|---|
| `--paper` | #ece6d9 | app canvas |
| `--panel` | #f7f3ea | panel surface |
| `--panel-2` | #fcf9f2 | inner cards |
| `--ink` | #272019 | text |
| `--ink-soft` | #4b4335 | secondary text |
| `--muted` | #7d7361 | labels, hints |
| `--line` / `--line-soft` | #ddd3bf / #e7dfce | borders |
| `--accent` | #5f6f45 | moss — selection, focus |
| `--accent-deep` / `--accent-ink` | #45512f | hover, accent text |
| `--ochre` | #a9772f | "suggested by style" bar only |
| `--danger` | #9a3b2e | limit warning, remove hover |

Dark mode flips every token under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` — accent becomes #9fb272 on #171511.

Radii `12px` / `8px`; two shadow levels; pills (`999px`) for chips and the toast.

## Component language
- **Toggle = button with `aria-pressed`** everywhere (rooms, styles, palettes, moods, chips)
- Selected: accent-soft fill + accent border; style cards add an inset 3px accent bar
- Item cards: hover lifts 1px; selected shows a round ✓ badge top-right
- Focus: 2px accent outline, 2px offset, on everything
- Toast: ink pill, bottom-centre, 1.8s

## Accessibility notes
- `aria-pressed` on all toggles, `aria-label` on remove buttons, `role="status"` + `aria-live` on the toast
- `prefers-reduced-motion` kills transitions
- Mobile gutters: 14px panel padding at ≤760px

Related: [[UI Layout]]

## v2 components
- **Search field (small)** for styles and palettes; same icon-in-field pattern as the library search
- **Mini chips** for style groups (ink fill when on)
- **Picked bar**: accent-soft strip showing the chosen style with a Clear link
- **Camera plan**: SVG room with entry door swing, 9 clickable spots, view cone tinted `--cone`, width set by lens
- **Tabs** for 3D / 2D with an accent underline
- **Show more** button per library category
- New tokens: `--on-accent`, `--plan-floor`, `--plan-wall`, `--cone`, `--scrim`; dark theme now also applies under `:root[data-theme="dark"]`
