---
"@vitessce/spatial-zarr": patch
"@vitessce/spatial-utils": patch
---

Fix SpatialData coordinate transformations bugs. Traverse DAG of coordinate transformations to identify target path. Refactor model matrix generation code in data loader classes.
