---
"@vitessce/spatial-accelerated": patch
"@vitessce/spatial-beta": patch
"@vitessce/spatial-utils": patch
"@vitessce/zarr-utils": patch
"@vitessce/example-configs": patch
---

Improve the accelerated 3D view: load levels within the page table address limits (binning Z of stacks deeper than 4096 planes), show volume size and loading levels in an info panel, prioritize overview bricks, coalesce range reads of sharded Zarr, accept uppercase OME-Zarr axis names, and add a `volumeZReduction` option. Brick requests that are still pending when the camera moves are aborted (via AbortSignal, for Zarr chunks and TIFF tiles) once the view no longer requests those bricks; the Zarr store cache aborts a shared request only after all of its callers have aborted.
