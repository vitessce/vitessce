---
"@vitessce/layer-controller": patch
"@vitessce/spatial": patch
---

Use PhotometricInterpretation TIFF metadata rather than heuristic in spatial/layerController views to determine RGB vs. not. Use photometricInterpretation coordination type in spatial/layerController views to enable overriding TIFF metadata when necessary.
