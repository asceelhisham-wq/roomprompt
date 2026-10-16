---
tags: [engineering, review]
---

# Code Review — v1 (artifact version 1791993278-1592)

## Summary
Small, readable vanilla-JS app with clean render functions and good a11y basics. No security exposure (no network, no `innerHTML` with user input except a numeric count). Main problems are dead data, loose string references, and render strategy that will not survive a 10x larger dataset.

## Issues
| # | Where | Issue | Severity |
|---|---|---|---|
| 1 | `buildPrompt()` | Reads `style.name` / `palette.name` / `mood.phrase` with no null guard; only safe because callers pre-check. Any new caller (e.g. a 2D prompt) crashes on null style | 🟠 Medium |
| 2 | `renderLibrary()` | Rebuilds every card on every selection click. Fine at 100 items, ~10x DOM churn at 1000+ | 🟠 Medium |
| 3 | `roomSearchList()` | Lower-cases name+prompt+category for every item on every keystroke | 🟡 Low |
| 4 | head | `<title>` and description meta inside `<body>` | 🟡 Low |
| 5 | Palette field | `<label for="paletteTitle">` targets a missing id | 🟡 Low |
| 6 | Search placeholder | Hard-codes "100 pieces" | 🟡 Low |
| 7 | `randomize()` | Can pick items outside the current room when style pool is thin, with no hint to the user | 🟡 Low |

## Suggestions
- Precompute a `haystack` string per item once at load
- Render per-category pages (first 24, then "Show more") instead of all items
- Make every prompt builder total over state (return `""` or a guard message, never throw)
- Delete `MATERIALS`, `.sel`, or wire them up

## What looks good
- `aria-pressed` toggles everywhere, visible focus, reduced-motion support
- Clipboard path with a real fallback
- Data/logic separation is clear and easy to extend

## Verdict
Approve for v1; request changes before scaling the dataset.
