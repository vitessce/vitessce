---
"@vitessce/scatterplot-embedding": patch
"@vitessce/scatterplot-gating": patch
---

Fix a flash of the previous selection's colors after a lasso selection made while coloring by feature values. The switch to set-selection coloring is now deferred together with the new selection and colors, so the points change straight from feature values to the new selection.
