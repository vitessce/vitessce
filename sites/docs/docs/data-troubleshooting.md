---
id: data-troubleshooting
title: Data Troubleshooting
slug: /data-troubleshooting
---

Some common questions may arise when writing or converting data to use with Vitessce.

## Seurat and SingleCellExperiment

We recommend using the [anndataR](https://github.com/scverse/anndataR) package to convert Seurat or SingleCellExperiment objects to AnnData objects, which can then be used with Vitessce.
Currently, you may need to do this in two steps: Seurat/SCE to `.h5ad` via anndataR, then `.h5ad` to `.zarr` via the AnnData Python package.
However, this will eventually be possible [without leaving R](https://github.com/scverse/anndataR/issues/91).


## AnnData

[AnnData](https://anndata.readthedocs.io/en/latest/index.html) (short for "annotated data") is an open-standard data format for single-cell data from the [Scverse](https://scverse.org/) community.
Per-cell information is stored along an observation (obs) axis, while per-gene information is stored along a feature (var) axis.

### Write AnnData object to Zarr format

First, read the AnnData object or construct it from scratch:

- Use AnnData's [`read_h5ad`](https://anndata.readthedocs.io/en/latest/generated/anndata.io.read_h5ad.html) function to load an existing `.h5ad` file as an AnnData object (or use any other AnnData reading function).
- Alternatively, use `from anndata import AnnData` and [construct](https://anndata.readthedocs.io/en/stable/generated/anndata.AnnData.html) a new object via `adata = AnnData(X=X_arr, obs=obs_df, var=var_df)`

Then use the [`.write_zarr`](https://anndata.readthedocs.io/en/stable/generated/anndata.AnnData.write_zarr.html) function to convert to a Zarr store. 

```py
from anndata import read_h5ad
import zarr

adata = read_h5ad('path/to/my_dataset.h5ad')
adata.write_zarr('my_store.zarr')
```

Converted outputs can be used with the [`anndata.zarr`](../data-file-types/#anndatazarr) family of file types.

:::note
The ids in the `obs` part of the `AnnData` store must match the other data files with which you wish to coordinate outside the `AnnData` store.  For example, if you have a bitmask that you wish to use with an `AnnData` store, the ids in `adata.obs.index` need to be the integers from each segmentation the bitmask.
:::

### AnnData-Zarr paths

When an AnnData object is written to a Zarr store (e.g., via `adata.write_zarr`), the columns and keys in the original object (e.g., `adata.obs["leiden"]` or `adata.obsm["X_umap"]`) become relative POSIX-style paths (e.g., `obs/leiden` and `obsm/X_umap`) in the Zarr store.

### AnnData-Zarr obsFeatureMatrix chunking strategy

A benefit of the Zarr format is that arrays can be chunked and stored in small pieces.
In Vitessce, we leverage the chunking features of Zarr to load only the subset of the `obsFeatureMatrix` which is required for each visualization.

For instance, if a gene is selected to color the points in the scatterplot or spatial views, we only load the chunks containing the gene of interest.

However, a poor chunking strategy (e.g., each chunk containing too many genes) can reduce the efficiency of this approach and result in too much data being requested when a gene is selected.

A `chunks` argument can be passed to the AnnData [`write_zarr`](https://anndata.readthedocs.io/en/latest/generated/anndata.AnnData.write_zarr.html) method to resolve this:

```py
# ...
VAR_CHUNK_SIZE = 10 # VAR_CHUNK_SIZE should be small
adata.write_zarr(out_path, chunks=(adata.shape[0], VAR_CHUNK_SIZE))
```


### AnnData-Zarr obsFeatureMatrix with sparse matrices

Vitessce can load `obsFeatureMatrix` data (e.g., `adata.X` or `adata.layers["counts"]`) stored as either dense or sparse matrix.

For sparse matrices, Vitessce supports the following SciPy sparse matrix types [supported by AnnData](https://anndata.readthedocs.io/en/latest/fileformat-prose.html#sparse-arrays): CSC and CSR.

__Dense and CSC sparse matrices are preferred__, as data for individual genes (a single matrix column) can be loaded efficiently (i.e., without needing to load the entire matrix) ([code](https://github.com/vitessce/vitessce/blob/a06eecfce33fc99ef0111b84db8186a9efb5d7ba/packages/file-types/zarr/src/anndata-loaders/ObsFeatureMatrixAnndataLoader.js#L108C14-L108C17)).
Meanwhile, loading a single gene from a CSR sparse matrix currently requires Vitessce to load the entire matrix, which can  result in out-of-memory errors in the web browser (if the matrix is large).

### My obsFeatureMatrix is too large to render everything

The `X` or `layers/foo` observation-by-feature matrix can be too large to feasibly render in its entirety in the Vitessce heatmap.
For instance, if the matrix contains whole-transcriptome data (~20,000 genes) for one thousand cells (`20,000 x 1,000`), this means loading and rendering over 20 million data points.
If instead the matrix contains data for a few hundred genes, but hundreds of thousands of cells, say `200 x 100,000`, we arrive at the same 20 million data point problem.
This is not only a data-loading scalability problem, it is also a visualization scalability problem, as our eyes/brains cannot meaningfully reason about 20 million data points simultaneously without some kind of organizational strategy.


The only two ways around this issue are for Vitessce to load a subset of data (i.e., filtering) or to aggregate the data somehow.
Aggregation is complicated by the fact that there is not a single agreed-upon way to order the cellular axis of an expression matrix (even hierarchical clustering only provides a partial ordering of the leaves).
Below, we provide guidance for how to pursue the former strategy (i.e., load and render a subset of the matrix) when using Vitessce.



#### Use or Store a subset of X

When the full expression matrix `adata.X` is large, there may be performance costs if Vitessce tries to load the full matrix for visualization, whether it be a heatmap
or just loading genes to overlay on a spatial or scatterplot view.
To resolve this issue:
1. Ensure the X array is stored using the CSC sparse format or __chunk the Zarr store efficiently__ (the latter is recommended, see above ["chunking strategy" section](#anndata-zarr-obsfeaturematrix-chunking-strategy)) so that the UI remains responsive when selecting a gene to load into the client.
Every time a gene is selected (or the heatmap is loaded), the client will use Zarr to fetch all the "cell x gene" information needed for rendering - however, a poor chunking strategy
can result in too much data be loaded (and then not used).  To remedy this, we recommend passing in the `chunk_size` argument to `write_zarr` so that the data is chunked in a manner that allows
remote sources (like browsers) to fetch only the genes (and all cells) necessary for efficient display - to this end the chunk size is usually something like `[num_cells, small_number]`
so every chunk contains all the cells, but only a few genes.  That way, when you select a gene, only a small chunk of data is fetched for rendering and little is wasted.  Ideally, at most
one small request is made for every selection.  You are welcome to try different chunking strategies as you see fit though!
2. If only interested in a subset of the expression matrix for a heatmap, a filter ([`initialFeatureFilterPath`](../data-file-types/#initialization-only-filtering) in the `options` for the file definition) for the matrix can be stored as a boolean array in `var`.
In the below example, we use the `highly_variable` column returned by `sc.pp.highly_variable_genes` as the boolean mask column specified as a `initialFeatureFilterPath`.  This will not alter the genes displayed in the `Genes` view (the user will still be able to select any gene from the list to view individually; the number of genes displayed initially in the heatmap will reflect the number of genes with `highly_variable=True`. Use the `geneFilter` option if you instead want to filter the list of genes everywhere).

```python
import scanpy as sc
from anndata import read_h5ad
import zarr
from vitessce.data_utils import VAR_CHUNK_SIZE

adata = read_h5ad('path/to/my_dataset.h5ad')

# Adds the `highly_variable` key to `var`
sc.pp.highly_variable_genes(adata, n_top_genes=200)
# If the matrix is sparse, it's best for performance to
# use non-sparse formats + chunking to keep the UI responsive.
# In the future, we should be able to use CSC sparse data natively
# and get equal performance with chunking:
# https://github.com/theislab/anndata/issues/524 
# but for now, it is still not as good (although not unusable).
if isinstance(adata.X, sparse.spmatrix):
    adata.X = adata.X.todense() # Or adata.X.tocsc() if you need to.
adata.write_zarr(zarr_path, [adata.shape[0], VAR_CHUNK_SIZE])  # VAR_CHUNK_SIZE should be something small like 10
```

Alternatively, a smaller matrix can be stored as multi-dimensional observation array in `adata.obsm` and used in conjunction with the [`featureFilterPath`](../data-file-types/#always-filtering) part of the view config.

```python
sc.pp.highly_variable_genes(adata, n_top_genes=200)
adata.obsm['X_top_200_genes'] = adata[:, adata.var['highly_variable']].X.copy()
adata.write_zarr('my_store.zarr')
```

### Viewing H5AD files without Zarr conversion

We recommend using the Zarr-based format to visualize AnnData objects in Vitessce.
However, it is possible to view `.h5ad` files directly in Vitessce with one additional step: construct a [Reference Spec](https://fsspec.github.io/kerchunk/spec.html) JSON file.

```py
import json
from vitessce.data_utils import generate_h5ad_ref_spec

# ...

ref_dict = generate_h5ad_ref_spec(h5_url)
with open(json_filepath, "w") as f:
    json.dump(ref_dict, f)
```


See a [full example](https://github.com/vitessce/vitessce-python/blob/main/docs/notebooks/widget_brain_h5ad.ipynb) for more details.


## Zarr dtypes

Vitessce uses [Zarrita.js](https://github.com/manzt/zarrita.js) to load Zarr data.
Zarrita.js currently supports a __[subset](https://github.com/manzt/zarrita.js/blob/0e809ef7cd4d1703e2112227e119b8b6a2cc9804/packages/zarrita/src/metadata.ts#L47)__ of NumPy data types, so ensure that the types used in the arrays and data frames of your AnnData store are supported (otherwise cast using [np.astype](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.astype.html) or [pd.astype](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.astype.html)).
In addition to the Zarr.js data types, Vitessce supports loading AnnData [string columns](https://github.com/vitessce/vitessce/blob/3615b55/src/loaders/data-sources/AnnDataSource.js#L102) with `vlen-utf8` or `|O` types.

To automatically do this casting for AnnData objects, the `vitessce` Python package provides the `optimize_adata` function:

```py
from vitessce.data_utils import optimize_adata
# ...
adata = optimize_adata(adata)
# ...
```

## Images and Segmentation Bitmasks (Label Images)

### Multi-resolution (Pyramidal) Representation

In order for Vitessce to load large images (from any supported image format), the image must be stored in a multi-resolution (i.e., [pyramidal](https://en.wikipedia.org/wiki/Pyramid_(image_processing))) and tiled form.
Pyramidal images enable Vitessce to load only the subset of data necessary (image tiles at a particular level of resolution), based on the user's current viewport (i.e., pan and zoom state).
Otherwise, without a pyramidal and tiled image, Vitessce must load all image pixels to visualize the image at all, which can quickly result in errors or crashes due to surpassing the memory limits of the web browser.
See the format-specific notes below for more information.


## OME-TIFF

The [Bio-Formats](https://www.glencoesoftware.com/blog/2019/12/09/converting-whole-slide-images-to-OME-TIFF.html) suite of tools can be used to convert from proprietary image formats to one of the open standard [OME file formats](http://www.openmicroscopy.org/ome-files/) supported by Vitessce.


### Multi-resolution OME-TIFF

A quick way to check if an OME-TIFF image is already pyramidal is to open it in FIJI.
If the `Bio-Formats Series Options` dialog appears (with checkboxes for selection of a subset of resolutions to open), then the image is already pyramidal.
Alternatively, use the [tiffcomment](https://bio-formats.readthedocs.io/en/stable/users/comlinetools/index.html#term-tiffcomment) command-line tool to check the OME-XML metadata for an indication that the image contains multiple resolutions, or use the [tifffile](https://pypi.org/project/tifffile/) Python package.


To create a multi-resolution OME-TIFF image, we recommend using the tool [bioformats2raw](https://github.com/glencoesoftware/bioformats2raw) followed by [raw2ometiff](https://github.com/glencoesoftware/raw2ometiff), developed by the Open Microscopy Environment.
Use the parameter `--resolutions` of `bioformats2raw`. For example, to create a pyramid with six level, specify `--resolutions 6`.

<!--While we recommend `bioformats2raw`+`raw2ometiff`, an alternative method is to use [bfconvert](https://bio-formats.readthedocs.io/en/stable/users/comlinetools/conversion.html#cmdoption-bfconvert-pyramid-resolutions) with the `-pyramid-resolutions` parameter.-->

### OME-TIFF offsets

When using OME-TIFF files with Vitessce, performance can be improved by creating an `offsets.json` file to accompany each OME-TIFF file.
This "offsets" file contains an index of byte offsets to different elements within the OME-TIFF file.
These byte offsets enable Vitessce to directly navigate to subsets of data within the OME-TIFF file, avoiding the need to seek through the entire file.
The [generate-tiff-offsets](https://github.com/hms-dbmi/generate-tiff-offsets) [Python package](https://pypi.org/project/generate-tiff-offsets/) or [web-based tool](https://hms-dbmi.github.io/generate-tiff-offsets/) can be used to generate an `offsets.json` file for an OME-TIFF image.

Then, configure Vitessce using the `offsetsUrl` option of the `image.ome-tiff` or `obsSegmentations.ome-tiff` [file types](https://vitessce.io/docs/data-file-types/#imageome-tiff).

For more information, see the Viv paper at [Manz et al. Nature Methods 2022](https://doi.org/10.1038/s41592-022-01482-7) which introduces the concept of an Indexed OME-TIFF file and benchmarks the approach.

### OME-TIFF compression

Vitessce can load OME-TIFFs which use the following compression methods:

- No compression
- Packbits
- LZW
- Deflate (with floating point or horizontal predictor support)
- JPEG
- LERC (with additional Deflate compression support)

This is based on Vitessce using [Viv](https://github.com/hms-dbmi/viv), as Viv internally uses [Geotiff.js](https://github.com/geotiffjs/geotiff.js) to load data from OME-TIFF files.

### RGB vs. multiplex

To determine whether an OME-TIFF image should be interpreted as red-green-blue (RGB, as a standard camera image would be) versus multiplexed, Vitessce uses the `PhotometricInterpretation` [TIFF tag](https://www.loc.gov/preservation/digital/formats/content/tiff_tags.shtml).
A value of `1` means "black is zero" (i.e., multi-channel/grayscale, where zero values should be rendered using the color black), whereas `2` means RGB.
To override the metadata in the image, the `photometricInterpretation` [coordination type](https://vitessce.io/docs/coordination-types/#photometricInterpretation) can be used (with value `'RGB'` or `'BlackIsZero'`).

### Alignment, coordinate transformations, and physical size

#### Physical size metadata

If the OME-XML metadata contains `PhysicalSizeX`, `PhysicalSizeXUnit`, `PhysicalSizeY`, and `PhysicalSizeYUnit`, then the physical size will be used for scaling.
These values define the physical size and unit of an individual pixel within the image (e.g., that one pixel has a physical size of 1x1 micron).

#### Coordinate transformations

Optionally, coordinate transformations can be defined using the `coordinateTransformations` option of the `image.ome-tiff` or `obsSegmentations.ome-tiff` [file types](https://vitessce.io/docs/data-file-types/#imageome-tiff), which will be interpreted according to the OME-NGFF v0.4 [coordinateTransformations](https://ngff.openmicroscopy.org/0.4/#trafo-md) spec.
The order of the transformations parameters must correspond to the order of the dimensions in the image (i.e., must match the `DimensionOrder` within the OME-XML metadata).
For example, to scale by 2x in the X and Y dimensions for an image with a DimensionOrder of `XYZCT`, use `"scale": [2.0, 2.0, 1.0, 1.0, 1.0]`.
For example, to translate by 3 and 4 units in the X and Y dimensions, respectively, use `"translation": [3.0, 4.0, 0.0, 0.0, 0.0]`.


### Channel names

Vitessce will use the channel names present within the OME-XML metadata and will display these within the user interface.
To edit the channel names, tools such as [tiffcomment](https://bio-formats.readthedocs.io/en/stable/users/comlinetools/edit.html) can be used.



## OME-NGFF

Also known as OME-Zarr.

### SpatialData Images and Labels

SpatialData uses [OME-NGFF](https://spatialdata.scverse.org/en/stable/design_doc.html#images) to store images and label images (i.e., segmentation bitmask images).
Thus, the following points apply not only to standalone OME-NGFF images but also to the Images and Labels elements within SpatialData objects.


#### Multi-resolution OME-NGFF

As noted above, Vitessce requires large-scale images to use multi-resolution representations on-disk.
When using the `spatialdata` Python package, images may not be saved as multi-resolution/multi-scale by default.
Use the `scale_factors` parameter of the `Image2DModel.parse` and `Labels2DModel.parse` [functions](https://spatialdata.scverse.org/en/stable/api/models.html#spatialdata.models.Image2DModel) as needed to ensure that the OME-NGFF images are stored as multi-resolution.

#### Non-power of 2 pyramid steps

Note that Vitessce does not yet support multi-resolution OME-NGFF images with a scaling factor other than `2`.
As SpatialData Image and Labels elements are stored in OME-NGFF format, this point applies to both OME-NGFFs contained within SpatialData objects and standalone OME-NGFF Zarr stores.

### Supported versions

Vitessce currently supports up to OME-NGFF spec v0.4.

### Supported features

Vitessce supports [OME-NGFF](https://ngff.openmicroscopy.org/latest/) images saved as Zarr stores and a subset of OME-NGFF features via the `image.ome-zarr` file type.
The following table lists the support for different OME-NGFF features:

| Feature | Supported by Vitessce |
|-----|-----|
| Downsampling along Z axis | N |
| `omero` field | Y |
| multiscales with a scaling factor other than 2 | N |
| URL (not only S3) | Y |
| 3D view | Y |
| labels | N |
| HCS plate | N |

To compare Vitessce to other OME-NGFF clients, see the [table](https://github.com/ome/ngff/issues/71) listing the OME-NGFF features supported by other clients.
We welcome feature requests or pull requests to add support for the remaining features to Vitessce.

### Metadata requirements

The [`omero`](https://ngff.openmicroscopy.org/latest/#omero-md) metadata field must be present. `omero.channels` and `omero.rdefs` fields provide metadata that Vitessce uses for the initial rendering settings and must be present.

### RGB vs. multiplex

For OME-NGFF images, Vitessce uses the field `omero.rdefs.model` to determine whether to interpret the image as RGB vs. multiplexed.
When `model` is `'color'`, the image is interpreted as RGB; otherwise, it will be considered multiplexed.
To override the metadata in the image, the `photometricInterpretation` [coordination type](https://vitessce.io/docs/coordination-types/#photometricInterpretation) can be used (with value `'RGB'` or `'BlackIsZero'`).

### Coordinate transformations

Optionally, coordinate transformations can be defined using the `coordinateTransformations` option of the `image.ome-zarr` or `obsSegmentations.ome-zarr` [file types](https://vitessce.io/docs/data-file-types/#imageome-zarr), which will be interpreted according to the OME-NGFF v0.4 [coordinateTransformations](https://ngff.openmicroscopy.org/0.4/#trafo-md) spec.
The order of the transformations parameters must correspond to the order of the dimensions in the image.

### Z-axis chunking

Vitessce does not yet support chunking along the Z axis. When writing OME-Zarr stores, you may need to specify a `chunks` argument manually such that the Z axis only has 1 chunk.

An example writing to a Zarr store using [ome-zarr-py](https://github.com/ome/ome-zarr-py) (`ome-zarr==0.2.1`):

```py
import zarr
import numpy as np
from tifffile import imread
from ome_zarr import writer

my_image = imread("my_image.tif")
my_image = np.transpose(my_image, axes=(1, 0, 3, 2)) # zcxy to czyx

z_root = zarr.open_group("my_image.zarr", mode = "w")

default_window = {
    "start": 0,
    "min": 0,
    "max": 65_535, # may need to change depending on the numpy dtype of the my_image array
    "end": 65_535 # may need to change depending on the numpy dtype of the my_image array
}

writer.write_image(
    image = my_image,
    group = z_root,
    axes = "czyx",
    omero = {
        "name": "My image",
        "version": "0.3",
        "rdefs": {},
        "channels": [
            {
                "label": f"Channel {i}",
                "color": "FFFFFF", # may want to use a different color for each channel
                "window": default_window
            } for i in range(my_image.shape[0])
        ]
    },
    chunks = (1, 1, 256, 256),
)
```

