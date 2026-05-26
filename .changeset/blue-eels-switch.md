---
"@vitessce/spatial-zarr": patch
---

Updated tiled points loading implementation to rely on the first 2-4 rows of the points dataframe to compute the bounding box, rather than relying on non-standard metadata (as the new approach only requires sorting).
