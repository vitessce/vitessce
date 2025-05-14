---
id: data-troubleshooting
title: Data Troubleshooting
slug: /data-troubleshooting
---

Some common issues may arise when writing or converting data to use with Vitessce.

## AnnData-Zarr paths

When an AnnData object is written to a Zarr store (e.g., via `adata.write_zarr`), the columns and keys in the original object (e.g., `adata.obs["leiden"]` or `adata.obsm["X_umap"]`) become relative POSIX-style paths (e.g., `obs/leiden` and `obsm/X_umap`) in the Zarr store.

## AnnData-Zarr obsFeatureMatrix chunking strategy

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

