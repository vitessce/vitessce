---
id: default-config-json
title: Automatic view config generation
sidebar_label: Automatic view config generation
slug: /default-config-json
---

To allow quick and easy visualisation of an image or AnnData object, Vitessce can now generate the __view config__ automatically using the URLs to your datasets. This page explains what file types we support and how to use the functionality.

# Supported file formats
We currently support automatic __view config__ generation for the following file formats: (OME-TIFF)[https://docs.openmicroscopy.org/ome-model/6.2.0/ome-tiff/specification.html], Anndata-ZARR and OME-ZARR, where:

- Files that end with `ome.tif` are of "OME-TIFF" file format.
- Files that end with `h5ad.zarr`, `.adata.zarr` or `.anndata.zarr` are of "Anndata-ZARR" file format.
- Files that end with `.zarr` and are not of "Anndata-ZARR" file format, are of "OME-ZARR" file format.
 
# How to use


### Prerequisites
Run the consolidate_metadata function to have .zmetadata file or it will not work

Support for multiple URLs, comma and/or space separated

Default views for ome-tiff and ome-zarr are ....

