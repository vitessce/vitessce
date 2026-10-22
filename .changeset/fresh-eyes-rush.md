---
"@vitessce/neuroglancer": patch
"@vitessce/example-configs": patch
"@vitessce/layer-controller-beta": patch
"@vitessce/constants-internal": patch
"@vitessce/schemas": patch
"@vitessce/spatial-zarr": patch
"@vitessce/all": patch
---

Allows support for adding multiple points layers to the Neuroglancer view. Adds the `obsLocations.ng-annotations` file type for segmentation centroids, which are rendered implicitly alongside the segmentation layer with a matching `obsType` (using its visual properties) rather than being listed as point layers. Removes `SegmentationCentroidsController` from the layer controller.
