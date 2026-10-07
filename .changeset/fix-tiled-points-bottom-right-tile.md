---
"@vitessce/spatial-zarr": patch
---

Fix the bottom-right tile of tiled points failing to load by clamping the row group bisection result to the final row group index.
