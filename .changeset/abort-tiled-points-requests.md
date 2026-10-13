---
"@vitessce/zarr-utils": patch
"@vitessce/spatial-zarr": patch
"@vitessce/types": patch
---

Abort requests for tiled SpatialData points when tiles are no longer needed. Requests shared with other tiles continue until every tile using them has aborted.
