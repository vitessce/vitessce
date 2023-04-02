---
id: default-config-json
title: Automatic Configuration
sidebar_label: Automatic Configuration
slug: /default-config-json
---

To allow quick and easy visualisation of an image or AnnData object, Vitessce can now generate the __view config__ automatically using the URLs to your datasets. This page explains what file types we support and how to use the functionality.

#### Supported file formats
We currently support automatic __view config__ generation for the following dataset formats:

- [OME-TIFF](https://docs.openmicroscopy.org/ome-model/6.2.0/ome-tiff/specification.html), 
- [OME_ZARR](https://ngff.openmicroscopy.org/latest/#on-disk) and
- Anndata-ZARR, where

datasets of `Anndata-ZARR` format are Anndata files that have been [saved to Zarr store](https://vitessce.github.io/vitessce-python/notebooks/widget_brain.html#3.2-Save-the-Data-to-Zarr-store).

Vitessce can generate __view config__ automatically, given one or more datasets, where each follows one of these formats and conforms with the [prerequisites](/docs/default-config-json/#prerequisites).
 
# How to use

To use this functionality, go to the [App](/#?edit=true) page of this website and paste the URL of each of the datasets that you want to visualise together, separating with semicolon (`;`). 

<!-- repetition so remove. If the URLs and the datasets are of the right format and each of them complies with the [prerequisites](/docs/default-config-json/#prerequisites), a view config will be displayed in the editor. -->

### Prerequisites

A valid URL that conforms with the requirements of the Vitessce dataset ingestion (see here todo put link).

There are also additional prerequisites, which vary depending on the format of your dataset. To generate a view config for your datasets, make sure that the URL of each dataset is of supported format and follows the specific prerequisites for that format, which are written below. 

#### OME-TIFF datasets

If you want to view a dataset of `OME-TIFF` format, make sure that the URL to the dataset ends with `ome.tif`. For example:
- https://example.my_dataset.ome.tif is a valid URL
- https://example.my_dataset.ome.tiff is not valid URL


#### Anndata-ZARR datasets

If you want to view a dataset of `Anndata-ZARR` format, make sure that the URL to the dataset ends with `h5ad.zarr`, `.adata.zarr` or `.anndata.zarr`.

In addition, make sure that a `.zmetadata` file, generated after running the [zarr consolidate_metadata](https://zarr.readthedocs.io/en/stable/api/convenience.html#zarr.convenience.consolidate_metadata) function, is present in the root of the dataset URL. 
For example, assuming that the URL of your dataset of `Anndata-ZARR` format is https://example.my_dataset.h5ad.zarr, then going to https://example.my_dataset.h5ad.zarr/.zmetadata should not return a `404 Not Found` error, but instead result in the download of a `.zmetadata` file.


#### OME-ZARR datasets

If you want to view a dataset of `OME-ZARR` format, make sure that the URL to the dataset ends with `ome.zarr`. For example:
- https://example.my_dataset.ome.zarr is a valid URL
- https://example.my_dataset.1234585s.zarr is not valid URL
