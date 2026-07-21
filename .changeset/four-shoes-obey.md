---
"@vitessce/layer-controller-beta": major
"@vitessce/spatial-beta": major
"@vitessce/constants-internal": major
"@vitessce/example-configs": major
"@vitessce/schemas": major
---

Replaces `spatial` and `layerController` view implementations with those formerly known as `spatialBeta` and `layerControllerBeta`. Configurations using schema versions `1.0.18` and below will be auto-upgraded. This release also removes the following features: legacy pre-OME-Zarr "BioFormats-Zarr" image format (alternative: use OME-Zarr), URL-based raster.json fileType (alternative: define the JSON inline via the `options` property, or better yet migrate to `image.ome-tiff` or `image.ome-zarr` fileTypes), "neighborhoods" delaunay triangle layer of spatial view (was never really documented, so should have little impact).  
