---
id: data-file-types
title: Supported File Types
sidebar_label: Supported File Types
slug: /data-file-types
---

This page contains details about the file types that are supported by Vitessce, both those which can be loaded natively (by specifying file URLs in the view config) and those other file types for which conversion to native file types is straightforward.

## Native File Types

Native file types are those which Vitessce can read directly from a static web server via a [loader class](https://github.com/vitessce/vitessce/tree/master/src/loaders). We welcome pull requests which implement loader classes to support additional file types natively.

### AnnData as Zarr

Once your AnnData object has been written to a Zarr store, columns and keys in the original object (such as `adata.obs["leiden"]` or `adata.obsm["X_umap"]`) become relative file paths such as `obs/leiden` and `obsm/X_umap`.
In the `options` property for file definitions in the Vitessce view config, you must specify which columns and keys will be used for visualization using POSIX-style paths.

Note that the same Zarr store URL can be used for defining multiple files in the view config, for different data types and file types.

#### `anndata-cells.zarr`

- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "cells",
      "fileType": "anndata-cells.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      "options": {
        // XY values represent spatial centroids, so values point to an array of tuples, one per observation/cell.
        "xy": "obsm/centroids",
        // Polygon values represent spatial segmentations, so values point to an array of arrays, one per observation/cell.
        "poly": "obsm/polygons",
        // Mappings define coordinates for scatterplot points - 
        // the original arrays may contain more than two dimensions per observation/cell,
        // so the `dims` property must slice these down to tuples.
        // This allows comparing the fourth and fifth principal components, for example.
        // The key immediately under `mappings` must be used in the coordination scopes.
        "mappings": {
          "UMAP": {
            "key": "obsm/umap",
            "dims": [ 0, 1 ]
          },
          "PCA": {
            "key": "obsm/pca",
            "dims": [ 4, 5 ]
          }
        },
        // Factors define per-observation annotations, like clustering results, to display in the popover.
        "factors": [
          "obs/leiden"
        ]
      }
    },
    ...
  ```

#### `anndata-cell-sets.zarr`

- View config file definition JSON snippet:

  ```javascript
    ...,
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
    ...
  ```

#### `anndata-expression-matrix.zarr`

- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "expression-matrix",
      "fileType": "anndata-expression-matrix.zarr",
      "url": "https://storage.googleapis.com/anndata-test/pbmc3k_processed.zarr",
      "options": {
        "matrix": "X"
      }
    },
    ...
  ```

  Note that the expression matrix file loader fetches the entire matrix and stores it in memory.
  If this causes performance issues, you may [add a subset of the matrix](#store-a-subset-of-x) to the Zarr store.

  The following snippet uses a Zarr store in which `obsm/X_top_200_genes` contains a 200-gene subset of `X`:

  ```javascript
    ...,
    {
      "type": "expression-matrix",
      "fileType": "anndata-expression-matrix.zarr",
      "url": "https://storage.googleapis.com/anndata-test/my_store.zarr",
      "options": {
        // Matrix provides the location of an
        // obs-by-var (cell-by-gene) matrix to load into memory.
        "matrix": "obsm/X_top_200_genes",
        // Genes filter is a boolean list which defines
        // the subset of genes contained in the matrix,
        // and must be defined if the matrix is a subset of AnnData.X
        "genesFilter": "var/highly_variable"
      }
    },
    ...
  ```


### `cells.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/cells.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "cells",
      "fileType": "cells.json",
      "url": "http://example.com/my_cells.json"
    },
    ...
  ```

### `cell-sets.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/cell-sets.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "cell-sets",
      "fileType": "cell-sets.json",
      "url": "http://example.com/my_cell_sets.json"
    },
    ...
  ```

### `molecules.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/cell-sets.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "molecules",
      "fileType": "molecules.json",
      "url": "http://example.com/my_molecules.json"
    },
    ...
  ```

### `genes.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/genes.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "expression-matrix",
      "fileType": "genes.json",
      "url": "http://example.com/my_expression_matrix_a.json"
    },
    ...
  ```

### `clusters.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/clusters.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "expression-matrix",
      "fileType": "clusters.json",
      "url": "http://example.com/my_expression_matrix_b.json"
    },
    ...
  ```


### `expression-matrix.zarr`

- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "expression-matrix",
      "fileType": "expression-matrix.zarr",
      "url": "http://example.com/my_expression_matrix.zarr"
    },
    ...
  ```

### `raster.json`

- [JSON schema for options](https://github.com/vitessce/vitessce/blob/master/src/schemas/raster.schema.json)
- View config file definition JSON snippet with an OME-TIFF:

  ```javascript
    ...,
    {
      "type": "raster",
      "fileType": "raster.json",
      "options": {
        "schemaVersion": "0.0.2",
        "images": [
          {
            "name": "My OME-TIFF Image",
            "url": "http://example.com/my_image.ome.tif",
            "type": "ome-tiff",
            "metadata": {
              "transform": {
                "matrix": [
                  0.81915098, -0.57357901, 0, 3264.76514684,
                  0.57357502, 0.819152, 0, 556.50440621,
                  0, 0, 1, 0,
                  0, 0, 0, 1
                ]
              }
            }
          }
        ]
      }
    },
    ...
  ```

- View config file definition JSON snippet with a Bioformats-compatible Zarr store:

  ```javascript
    ...,
    {
      "type": "raster",
      "fileType": "raster.json",
      "options": {
        "schemaVersion": "0.0.2",
        "images": [
          {
            "name": "My Bioformats-Zarr Image",
            "url": "http://example.com/my_image.zarr",
            "type": "zarr",
            "metadata": {
              "dimensions": [
                {
                  "field": "channel",
                  "type": "nominal",
                  "values": [
                    "DAPI - Hoechst (nuclei)",
                    "FITC - Laminin (basement membrane)",
                    "Cy3 - Synaptopodin (glomerular)",
                    "Cy5 - THP (thick limb)"
                  ]
                },
                {
                  "field": "y",
                  "type": "quantitative",
                  "values": null
                },
                {
                  "field": "x",
                  "type": "quantitative",
                  "values": null
                }
              ],
              "isPyramid": true,
              "transform": {
                "translate": {
                  "y": 0,
                  "x": 0
                },
                "scale": 1
              }
            }
          }
        ]
      }
    },
    ...
  ```
### `neighborhoods.json`

- [JSON schema](https://github.com/vitessce/vitessce/blob/master/src/schemas/neighborhoods.schema.json)
- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "neighborhoods",
      "fileType": "neighborhoods.json",
      "url": "http://example.com/my_neighborhoods.json"
    },
    ...
  ```

### `genomic-profiles.zarr`

- View config file definition JSON snippet:

  ```javascript
    ...,
    {
      "type": "genomic-profiles",
      "fileType": "genomic-profiles.zarr",
      "url": "http://example.com/my_genomic_profiles.zarr"
    },
    ...
  ```


## Other File Types

Other file types must be converted to native file types prior to being used with Vitessce.
Here we provide tips for conversion from common single-cell file types.

### AnnData as h5ad

#### Convert to Zarr

Use AnnData's [`read_h5ad`](https://anndata.readthedocs.io/en/latest/anndata.read_loom.html) function to load the file as an AnnData object, then use the [`.write_zarr`](https://anndata.readthedocs.io/en/latest/anndata.AnnData.write_zarr.html) function to convert to a Zarr store. 

```python
from anndata import read_h5ad

adata = read_h5ad('path/to/my_dataset.h5ad')
adata.write_zarr('my_store.zarr')
```

Converted outputs can be used with the [AnnData as Zarr](#anndata-as-zarr) family of native file types.

#### Store a subset of X

When the full expression matrix `adata.X` is large, there may be performance costs if Vitessce tries to load the full matrix for visualization.
If only interested in a subset of the expression matrix, a smaller matrix can be stored as multi-dimensional observation array in `adata.obsm`.

```python
import scanpy as sc
from anndata import read_h5ad

adata = read_h5ad('path/to/my_dataset.h5ad')

sc.pp.highly_variable_genes(adata, n_top_genes=200)
adata.obsm['X_top_200_genes'] = adata[:, adata.var['highly_variable']].X.copy()
adata.write_zarr('my_store.zarr')
```

Converted outputs can be used with the [AnnData as Zarr](#anndata-as-zarr) family of native file types.

### Loom

#### Convert to Zarr via AnnData

Use AnnData's [`read_loom`](https://anndata.readthedocs.io/en/latest/anndata.read_loom.html) function to load the Loom file as an AnnData object, then use the [`.write_zarr`](https://anndata.readthedocs.io/en/latest/anndata.AnnData.write_zarr.html) function to convert to a Zarr store. 

```python
from anndata import read_loom

adata = read_loom('path/to/my_dataset.loom', obsm_names={ "tSNE": ["_tSNE_1", "_tSNE_2"], "spatial": ["X", "Y"] })
adata.write_zarr('my_store.zarr')
```

Converted outputs can be used with the [AnnData as Zarr](#anndata-as-zarr) family of native file types.

### Seurat

The Vitessce R package can be used to [convert Seurat objects](https://vitessce.github.io/vitessce-r/reference/SeuratWrapper.html) to the [`cells.json`](#cellsjson) and [`cell-sets.json](#cell-setsjson) file types.

### SnapATAC

The Vitessce Python package can be used to [convert SnapATAC outputs](https://vitessce.github.io/vitessce-python/data_examples.html) to the [`genomic-profiles.zarr`](#genomic-profileszarr), [`cells.json`](#cellsjson), and [`cell-sets.json`](#cell-setsjson) file types.