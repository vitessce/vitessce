---
"@vitessce/scatterplot-gating": patch
"@vitessce/scatterplot": patch
---

Fix gating scatterplot view. Bugs during MUI upgrade were preventing multi-selection of genes; for now, have split into two single select inputs. Also needed to specify `embeddingPointsVisible: true` (prop of `Scatterplot` component).
