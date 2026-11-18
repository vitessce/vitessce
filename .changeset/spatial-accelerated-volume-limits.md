---
"@vitessce/spatial-accelerated": patch
"@vitessce/spatial-beta": patch
"@vitessce/spatial-utils": patch
"@vitessce/zarr-utils": patch
"@vitessce/example-configs": patch
---

Improve the accelerated 3D view: load levels within the page table address limits (binning Z of stacks deeper than 4096 planes), show volume size and loading levels in an info panel, prioritize overview bricks, coalesce range reads of sharded Zarr, accept uppercase OME-Zarr axis names, and add a `volumeZReduction` option. Brick requests that are still pending when the camera moves are aborted (via AbortSignal, for Zarr chunks and TIFF tiles) once the view no longer requests those bricks; the Zarr store cache aborts a shared request only after all of its callers have aborted. Add a `volumeMaxConcurrentBrickRequests` prop to raise (or, with `Infinity`, lift) the limit of 6 bricks fetched at once; the bricks requested per batch grow with it. Add an opt-in `volumeProgressiveLoading` prop that loads requested bricks after their missing coarser-level ancestors, so that the view refines one level at a time, across all bricks in view, instead of jumping from the overview to full resolution. Both can also be changed in the spatialBeta view's options menu.

Also add virtual levels halving the coarsest stored level down to a one-brick overview (Z-sampled, loaded first) followed by a coarse warm-up level, widen value ranges measured from the overview, limit concurrent chunk downloads (scaled with the brick fetch limit, and counting bricks still loading from earlier batches) so that bricks of large one-plane chunks finish one slab at a time, fail chunk loads that stall so that loading goes on, abort the bricks still loading when a new channel needs its overview, resume loading when a frame drawn after it stopped requests bricks, keep the camera in the coordination space (spatialZoom, spatialTarget, spatialRotation), and use a white background in the light themes.
