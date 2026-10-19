---
"@vitessce/scatterplot-embedding": patch
---

Fix crash in the dual scatterplot (`obsType` undefined) by passing the layout view uid to the child scatterplots for coordination lookups.
