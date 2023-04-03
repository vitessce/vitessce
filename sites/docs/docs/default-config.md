---
id: default-config-json
title: Automatic Configuration
sidebar_label: Automatic Configuration
slug: /default-config-json
---

To allow quick and easy visualisation of an image or an AnnData object, Vitessce can now generate the __view config__ automatically, given the URLs to the datasets. This page explains how to use this feature and what dataset formats are supported.


### Supported formats

Vitessce currently supports automatic __view config__ generation for the following dataset formats:

- [OME-TIFF](https://docs.openmicroscopy.org/ome-model/6.2.0/ome-tiff/specification.html), 
- [OME_ZARR](https://ngff.openmicroscopy.org/latest/#on-disk),
- Anndata-ZARR - files that have been [saved to Zarr store](https://vitessce.github.io/vitessce-python/notebooks/widget_brain.html#3.2-Save-the-Data-to-Zarr-store).


### How to use

To use this functionality, go to the [App](/#?edit=true) page of this website and paste the URL of each of the datasets that you want to visualise, separating with semicolon (`;`). Make sure that each dataset is of supported format and complies with the [requirements](/docs/default-config-json/#requirements). Vitessce will display the generated __view config__ in the editor. Then, you can either launch Vitessce with the generated configuration directly, or change it further to reflect any custom requirements.


### Requirements

You need:
- One of more URLs, where each of them points to the static files of the dataset you want to visualise.
- Each dataset complies with its format-specific requirements outlined below.

#### OME-TIFF format

If you want to view a dataset of `OME-TIFF` format, make sure that the URL to the dataset ends with `ome.tif`. For example:
- https://example.my_dataset.ome.tif is a valid URL
- https://example.my_dataset.ome.tiff is not valid URL

#### Anndata-ZARR format

If you want to view a dataset of `Anndata-ZARR` format, make sure that the URL to the dataset ends with `h5ad.zarr`, `.adata.zarr` or `.anndata.zarr`.

In addition, make sure that a `.zmetadata` file, generated after running the [zarr consolidate_metadata](https://zarr.readthedocs.io/en/stable/api/convenience.html#zarr.convenience.consolidate_metadata) function, is present in the root of the dataset URL. 

For example, assuming that the URL to the dataset is https://example.my_dataset.h5ad.zarr, then going to https://example.my_dataset.h5ad.zarr/.zmetadata should result in the download of a `.zmetadata` file. If it returns a `404 Not Found` error instead, this means that the `.zmetadata` file is either missing or not uploaded at the root folder.

#### OME-ZARR format

If you want to view a dataset of `OME-ZARR` format, make sure that the URL to the dataset ends with `ome.zarr`. For example:
- https://example.my_dataset.1234585s.ome.zarr is a valid URL
- https://example.my_dataset.1234585s.zarr is not valid URL


### Assumptions

When generating the __view config__, Vitessce makes a couple of assumptions, depending on the dataset format:

#### OME-TIFF format

For datasets of `OME-TIFF` format, Vitessce adds `description`, `spatial` and `layerController` [view types](/docs/components/) by default. You can delete or adjust each of them using the editor. For the `layerController`, the sliders for each Channel are removed if RGB is detected. If you don't want this behavoiur, remove the following lines from the __view config__:

```
"props": {
    "disable3d": [],
    "disableChannelsIfRgbDetected": true
}
```

#### Anndata-ZARR format

For datasets of `Anndata-ZARR` format, Vitessce adds a `heatmap` and a `featureList` view type whenever `X` is present. The heatmap is transposed by default. If you don't want it transposed, remove the following lines from the __view config__:

```
"props": {
    "transpose": true
}
```

Vitessce adds `layerController` view type when `obsm/X_segmentations` is present in the dataset and `spatial` view type when `obsm/X_spatial` is present in the dataset. Every time when `layerController` and `spatial` view types are both present, Vitessce links them, creating an additional `spatialSegmentationLayer` coordination type. Tutorial on how to link views with the Vitessce Python API is available [here](https://github.com/vitessce/vitessce-python-tutorial/blob/main/examples/example_transcriptomics_obs_segmentations_polygon.ipynb).

Vitessce adds one `scatterplot` view with `embeddingType` equal to `t-SNE`, `PCA`, or `UMAP` if `obsm/X_tsne`, `obsm/X_pca` or `obsm/X_umap` are present in the dataset respectively. 

Vitessce adds an `obsSets` view whenever any of the following are present in `obs`:
- `cluster` or `cell_type`;
- `leiden` or `louvain`. You can generate these subgroups using the [leiden](https://scanpy.readthedocs.io/en/stable/generated/scanpy.tl.leiden.html) or [louvain](https://scanpy.readthedocs.io/en/stable/generated/scanpy.tl.louvain.html) scanpy functions;
- `cell_type`, `disease`, `organism`, `self_reported_ethnicity`, `tissue`, `sex`, which are some of the [obs conventions used in CellxGene](https://github.com/chanzuckerberg/single-cell-curation/blob/main/schema/3.0.0/schema.md#obs-cell-metadata).


#### OME-ZARR format

For datasets of `OME-ZARR` format, Vittessce adds a `description`, `spatial`, `layerController` and `status` view types by default.
