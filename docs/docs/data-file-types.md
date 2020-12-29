---
id: data-file-types
title: Supported File Types
sidebar_label: Supported File Types
slug: /data-file-types
---

Vitessce supports a small set of **data types** which denote in an abstract sense the type of observations contained in a file. For each data type, Vitessce may support multiple **file types** which denote specific schemas and file formats that Vitessce knows how to read.

For example, a file that conforms to the `cells` data type may contain embedding (e.g. UMAP and PCA) coordinates for each cell. But depending on which file format is more convenient, you may opt to use the `cells.json` or `anndata-cells.zarr` file type.

## Data Types and File Types

| Data Type | File Types |
| --- | --- |
| `cells` | <ul><li>`cells.json`</li><li>`anndata-cells.zarr`</li></ul> |
| `molecules` | <ul><li>`molecules.json`</li></ul> |
| `cell-sets` | <ul><li>`cell-sets.json`</li><li>`anndata-cell-sets.zarr`</li></ul> |
| `raster` | <ul><li>`raster.ome-zarr` (WIP)</li><li>`raster.ome-tiff` (WIP)</li></ul> |
| `expression-matrix` | <ul><li>`expression-matrix.zarr`</li><li>`anndata-expression-matrix.zarr`</li><li>`clusters.json`</li><li>`genes.json`</li></ul> |
| `neighborhoods` | <ul><li>`neighborhoods.json`</li></ul> |
| `genomic-profiles` | <ul><li>`genomic-profiles.zarr` (WIP)</li></ul> |

:::note
For JSON file types, the file type determines a JSON schema to validate against.
:::

## Data Conversion

In the `vitessce` Python package, we provide data conversion [helper classes and functions](https://vitessce.github.io/vitessce-python/wrappers.html#vitessce.wrappers.AnnDataWrapper).

### AnnData

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
      // This is just like cell-sets.json, but from AnnData stores.
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
      // The `group_name` is the display name and the `set_name` is the path within the zarr store
      // (this schema corresponds to the `cell-sets-tabular` schema).
      "options": [
        {
          "group_name": "Ledien",
          "set_name": "obs/leiden"
        },
        {
          "group_name": "Cell Type",
          "set_name": "obs/cell_type"
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

## File Loaders

If you develop a loader class for a new file type, please make a pull request to add it to the [existing loaders](https://github.com/vitessce/vitessce/tree/master/src/loaders).

### Limitations

Vitessce is a web-based tool, and it is currently difficult or impossible to read certain file types such as HDF5 directly over HTTP. Fortunately, HDF5 files can be easily converted to [Zarr](https://github.com/zarr-developers) stores, which support most HDF5 features (arrays, groups, unstructured attributes) and can be read in a web browser using [zarr.js](https://github.com/gzuidhof/zarr.js/).
