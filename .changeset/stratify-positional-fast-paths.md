---
"@vitessce/sets-utils": patch
"@vitessce/vit-s": patch
"@vitessce/scatterplot": patch
"@vitessce/scatterplot-embedding": patch
"@vitessce/statistical-plots": patch
---

Speed up per-observation work on large datasets: stratify expression values and embedding arrays (violin/dot plots, scatterplot contours) from positional set indices instead of string-keyed map lookups per observation, using raw categorical codes when available; build the observation index map only when a set selection resolves; skip embedding re-alignment and the expression index mapping when the observation indices are the same array; and build the scatterplot's selection quadtree on first use rather than on every embedding change. `stratifyArrays` no longer takes a sampleId-to-obsIds map argument.
