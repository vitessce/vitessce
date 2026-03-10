---
"@vitessce/spatial-zarr": patch
"@vitessce/neuroglancer": patch
"@vitessce/example-configs": patch
---

Define obsPoints.ng-annotations as a fileType, enabling users to specify Neuroglancer point annotations via the usual datasets part of the Vitessce configuration. Add logic for controlling segmentation and point layers via the existing layerControllerBeta UI, including coloring and filtering points via the featureList.
