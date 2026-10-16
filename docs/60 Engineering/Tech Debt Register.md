---
tags: [engineering, tech-debt]
---

# Tech Debt Register

Priority = (Impact + Risk) × (6 − Effort)

| Item | Type | Impact | Risk | Effort | Priority |
|---|---|---|---|---|---|
| Full library re-render on every click | Code / perf | 4 | 4 | 2 | **32** |
| Prompt builder not null-safe | Code | 3 | 4 | 1 | **35** |
| `typicalMaterials` free strings drift from `MATERIALS` | Code | 2 | 2 | 1 | 20 |
| Dead data: `MATERIALS`, `keywords`, `.sel` CSS | Code | 2 | 1 | 1 | 15 |
| Hand-authored items do not scale to 1000+ | Architecture | 5 | 3 | 3 | **24** |
| No persistence / no shareable state | Architecture | 3 | 2 | 3 | 15 |
| Zero automated tests | Test | 3 | 3 | 2 | 24 |
| Data + app + CSS in one 70KB file | Architecture | 2 | 1 | 3 | 9 |
| Docs only lived in the code comments | Documentation | 2 | 2 | 1 | 20 (fixed by this vault) |

## Remediation plan
**Phase 1 — with the v2 feature work (now):** null-safe builders, precomputed search index, paged category rendering, generated item catalogue (base pieces × finishes), remove dead data, use `keywords`.
**Phase 2:** a tiny test page that asserts counts, id uniqueness, and that every reference resolves.
**Phase 3:** split data into `data/*.json` published as artifact files; saved looks via a storage capability.
