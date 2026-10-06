---
"@vitessce/spatial-zarr": patch
---

Fix tiled points not loading in the final row/column of tiles by clamping (rather than throwing on) Morton query rectangles that extend beyond the points bounding box.
