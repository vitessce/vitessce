---
"@vitessce/constants-internal": patch
"@vitessce/all": patch
"@vitessce/sets-utils": patch
"@vitessce/vit-s": patch
"@vitessce/scatterplot-embedding": patch
"@vitessce/spatial": patch
"@vitessce/spatial-beta": patch
"@vitessce/heatmap": patch
---

Add the `tooltipObsSetsMode` coordination type. Setting it to `selected` limits the obs sets listed in hover tooltips to the groups of the current `obsSetSelection`, which keeps tooltips readable for datasets with many obs set groups. The default, `all`, keeps the previous behavior.
