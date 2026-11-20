---
"@vitessce/spatial-accelerated": patch
"@vitessce/spatial-beta": patch
"@vitessce/all": patch
"@vitessce/example-configs": patch
---

The accelerated 3D view now reads and writes its camera via the `spatialCameraSnapshot` coordination type (in the physical units of the image), rather than `spatialZoom`/`spatialTarget*`/`spatialRotation*` in the units of its scene, so that its camera can be synchronized with Neuroglancer and other `spatialBeta` 3D views.
