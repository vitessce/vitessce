---
"@vitessce/spatial-accelerated": patch
"@vitessce/spatial-beta": patch
"@vitessce/layer-controller-beta": patch
"@vitessce/spatial-utils": patch
"@vitessce/zarr-utils": patch
"@vitessce/example-configs": patch
---

Improve the accelerated 3D view: load levels within the page table address limits (binning Z of stacks deeper than 4096 planes), show volume size and loading levels in an info panel, prioritize overview bricks, coalesce range reads of sharded Zarr, accept uppercase OME-Zarr axis names, and add a `volumeZReduction` option. Brick requests that are still pending when the camera moves are aborted if those bricks are no longer needed. Implement an opt-in `volumeProgressiveLoading` mode that loads requested bricks after their missing coarser-level ancestors.
The layer controller's LOD slider now halves the LOD factor every 25 steps (75% is the default, while 100% gives 2–4 voxels per pixel).
