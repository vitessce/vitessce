---
"@vitessce/spatial-beta": patch
---

Fixed 3D volume rendering in the beta spatial view applying physical pixel size twice, which stretched anisotropic volumes along their coarsest axis by the anisotropy ratio (a 1x1x2 um voxel rendered twice as deep as it should). Restored the "Fix Camera Axis" control in the beta spatial view's plot options menu, so the orbit target can be pinned rather than drifting on every pan. The camera is also re-initialized when switching between 2D and 3D, so a volume is no longer left framed by (or panned out of view with) the camera from the previous mode, and spatialOrbitAxis now round-trips through the beta view's setViewState like the rest of the camera state.
