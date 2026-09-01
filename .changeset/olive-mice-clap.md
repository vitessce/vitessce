---
"@vitessce/sets-utils": patch
"@vitessce/workers": patch
"@vitessce/scatterplot": patch
"@vitessce/scatterplot-embedding": patch
"@vitessce/scatterplot-gating": patch
"@vitessce/types": patch
"@vitessce/zarr": patch
"@vitessce/csv": patch
"@vitessce/json": patch
---

Improve obs set performance on large datasets: accumulate set colors, memberships, and color indices in linear rather than quadratic time; color the embedding and gating scatterplots from a positional typed array instead of an observation-ID-keyed Map; and build the observation set membership encoding in a web worker, dispatched during idle time and transferred as typed arrays, falling back to the main thread when workers are unavailable. Also fixes `treeToMembershipMap` reporting duplicate set paths for leaf sets shallower than the height of their hierarchy.
