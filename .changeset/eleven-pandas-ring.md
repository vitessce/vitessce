---
"@vitessce/neuroglancer": patch
"@vitessce/example-configs": patch
"@vitessce/schemas": patch
---

In the Neuroglancer view, adds on-demand-mesh-loading when centroids for pointsLayer are available. If there are both meshes and points configured with the same `obsType`, we infer that the points represent centroids of the meshes.
