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
| `raster` | <ul><li>`ome-raster.zarr` (WIP)</li><li>`ome-raster.tiff` (WIP)</li><li>`raster.json`</li></ul> |
| `expression-matrix` | <ul><li>`expression-matrix.zarr`</li><li>`anndata-expression-matrix.zarr`</li><li>`clusters.json`</li><li>`genes.json`</li></ul> |
| `neighborhoods` | <ul><li>`neighborhoods.json`</li></ul> |
| `genomic-profiles` | <ul><li>`genomic-profiles.zarr` (WIP)</li></ul> |

:::note
For JSON file types, the file type will determine a JSON schema to validate against.
:::

## Data Conversion

In the `vitessce` Python package, we provide data conversion [helper classes and functions](https://vitessce.github.io/vitessce-python/wrappers.html#vitessce.wrappers.AnnDataWrapper).

### AnnData

File types with the prefix `anndata-` and suffix `.zarr` are intended to be used with the output of the AnnData [`.write_zarr`](https://anndata.readthedocs.io/en/latest/anndata.AnnData.write_zarr.html) function.

## File Loaders

If you develop a loader class for a new file type, please make a pull request to add it to the [existing loaders](https://github.com/hubmapconsortium/vitessce/tree/master/src/loaders).

### Limitations

Vitessce is a web-based tool, and it is currently difficult or impossible to read certain file types such as HDF5 directly over HTTP. Fortunately, HDF5 files can be easily converted to [Zarr](https://github.com/zarr-developers) stores, which support most HDF5 features (arrays, groups, unstructured attributes) and can be read in a web browser using [zarr.js](https://github.com/gzuidhof/zarr.js/).