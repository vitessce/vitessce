---
id: data-file-types
title: Supported File Types
sidebar_label: Supported File Types
slug: /data-file-types
---

This page contains details about the file types that are supported by Vitessce.

## AnnData

File types with the prefix `anndata-` and suffix `.zarr` are intended to be used with the output of the AnnData [`.write_zarr`](https://anndata.readthedocs.io/en/latest/anndata.AnnData.write_zarr.html) function.

There are some things worth noting about the `anndata` stores.
  1. All links to stores like
  ```javascript
  {
    ...,
    "xy": "obsm/spatial_cell_centroids"
    ...
  }
  ```
  are paths within the `zarr` store instead of dot notation like `obsm.spatial_cell_centroids` as in `python`.
  2. There are a lot of options for the  `AnnData` store, mostly corresponding to the various `json` options for displaying data, and the following store highlights most of them, with comments noting what each part does:
  ```javascript
  {
    ...,
    {
      "type": "cells",
      // This is just like cells.json, but from AnnData stores.
      "fileType": "anndata-cells.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      "options": {
        // These are cell/obs spatial centroids, so a array of tuples, one per observation/cell.
        "xy": "obsm/centroids",
        // These are cell/obs spatial polygons, so a array of arrays, one per observation/cell.
        "poly": "obsm/polygons",
        // These are scatterplot coordinates for the scatterplot components - 
        // these can be more than a tuple per obs/cell where the `dims` key slices this down to a tuple.
        // This allows you to compare various principal components, for example.
        // The key immediately under `mappings` must be used in the coordination scopes.
        "mappings": {
          "UMAP": {
            "key": "obsm/umap",
            "dims": [
              0,
              1
            ]
          },
          "PCA": {
            "key": "obsm/pca",
            "dims": [
              0,
              2
            ]
          }
        },
        // These are a list of per-observation annotations, like clustering results, to display in the popover.
        "factors": [
          "obs/leiden"
        ]
      }
    },
    {
      "type": "cell-sets",
      "fileType": "anndata-cell-sets.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      // These are the various cell sets (clustering results) for the cell sets component.
      // The `groupName` is the display name and the `setName` is the path within the zarr store
      // (this schema corresponds to the `cell-sets-tabular` schema).
      "options": [
        {
          "groupName": "Ledien",
          "setName": "obs/leiden"
        },
        {
          "groupName": "Cell Type",
          "setName": "obs/cell_type"
        },
      ]
    },
    {
      "type": "expression-matrix",
      "fileType": "anndata-expression-matrix.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      // `matrix` provides the location of the obs by var (cell-by-genes) matrix to load into memory
      // while `genesFilter` links to a boolean list to subset the `var.index` if the `matrix` key is a subset
      // of `X` (see below).
      "options": {
        "matrix": "obsm/X_top_200_genes",
        "genesFilter": "var/highly_variable"
      }
    }
    ...
  }
  ```
  3. `expression-matrix` types load the entire zarr store into memory so doing something like
  ```javascript
  {
    ...,
    {
      "type": "expression-matrix",
      "fileType": "anndata-expression-matrix.zarr",
      "url": "https://storage.googleapis.com/anndata-test/pbmc3k_processed.zarr",
      "options": {
        "matrix": "X"
      }
    }
    ...
  }
  ```
  will load the entire contents of `X` (i.e the cell-by-gene matrix) into memory which can be quite a lot of data, especially remotely.  This is not always true,
  but if it is, you may use a subset of `X` by doing something like this, for example:
  ```javascript
  {
    ...,
    {
      "type": "expression-matrix",
      "fileType": "anndata-expression-matrix.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      "options": {
        "matrix": "obsm/X_top_200_genes",
        "genesFilter": "var/highly_variable"
      }
    }
    ...
  }
  ```
  where `obsm/X_top_200_genes` contiains a 200-gene subset of `X` obtained via the following commands in `python`:
  ```python
  sc.pp.highly_variable_genes(adata, n_top_genes=200)
  adata.obsm['X_top_200_genes'] = adata[:, adata.var['highly_variable']].X.copy()
  adata.write_zarr('my_store.zarr')
  ```

