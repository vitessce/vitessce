---
"@vitessce/spatial-beta": patch
---

Fix the initial camera of the `spatialBeta` view. The zoom backoff was applied twice, so 3D volumes started about eight times too small. In 2D, the initial Z slice from the view config or the image loader is no longer overwritten when the camera is initialized, and switching from 3D back to 2D returns to the previous slice.

Fix the 3D clipping planes of the `spatialBeta` view. The clipping plane sliders use physical units, but the values were passed to Viv as voxel indices, so most of each slider's range clipped the whole volume.
