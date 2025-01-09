---
"@vitessce/abstract": patch
"@vitessce/ome-tiff": patch
"@vitessce/json": patch
"@vitessce/zarr": patch
"@vitessce/spatial-zarr": patch
"@vitessce/csv": patch
"@vitessce/glb": patch
"vitessce": patch
"@vitessce/all": patch
"@vitessce/example-plugins": patch
"@vitessce/vit-s": patch
---

Extracted abstract loaders and errors from core vit-s package to eliminate circular dependencies. Extracted spatial zarr utils to avoid pulling in spatial subdependencies when only concerned with basic zarr loading functionalities.
