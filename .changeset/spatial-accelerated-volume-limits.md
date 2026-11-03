---
"@vitessce/spatial-accelerated": patch
"@vitessce/spatial-beta": patch
"@vitessce/spatial-utils": patch
"@vitessce/zarr-utils": patch
"@vitessce/example-configs": patch
---

Improve the accelerated 3D view: load levels within the page table address limits (binning Z of stacks deeper than 4096 planes), show volume size and loading levels in an info panel, add virtual levels halving the coarsest stored level down to a one-brick overview (Z-sampled, loaded first) followed by a coarse warm-up level, widen value ranges measured from the overview, limit concurrent chunk downloads so bricks of large one-plane chunks finish one slab at a time, fail chunk loads that stall so loading goes on, cancel the downloads of a stopped batch on restart or when a new channel needs its overview, resume loading when a frame drawn after it stopped requests bricks, coalesce range reads of sharded Zarr, accept uppercase OME-Zarr axis names, add a `volumeZReduction` option, keep the camera in the coordination space (spatialZoom, spatialTarget, spatialRotation), and use a white background in the light themes.
