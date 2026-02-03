---
"@vitessce/spatial-zarr": patch
"@vitessce/spatial-beta": patch
"@vitessce/example-configs": patch
---

Add spatialdata blobs example dataset configuration. Improve support for non-tiled SpatialData points when they have a feature_index column mapping each point to an index in the corresponding SpatialData Table var.index column, e.g. to map points to gene indices.
