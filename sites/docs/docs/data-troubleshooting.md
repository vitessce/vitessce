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

Vitessce uses [Zarr.js](https://github.com/gzuidhof/zarr.js) to load Zarr data.
Zarr.js currently supports a __[subset](https://github.com/gzuidhof/zarr.js/blob/61d9cdb56ce6f8eaf97d213bcaa5b4ea8d01f5d1/src/nestedArray/types.ts#L32)__ of NumPy data types, so ensure that the types used in the arrays and data frames of your AnnData store are supported (otherwise cast using [np.astype](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.astype.html) or [pd.astype](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.astype.html)).
In addition to the Zarr.js data types, Vitessce supports loading AnnData [string columns](https://github.com/vitessce/vitessce/blob/3615b55/src/loaders/data-sources/AnnDataSource.js#L102) with `vlen-utf8` or `|O` types.

To automatically do this casting for AnnData objects, the `vitessce` Python package provides the `optimize_adata` function:

```py
from vitessce.data_utils import optimize_adata
# ...
adata = optimize_adata(adata)
# ...
```

## OME-NGFF

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
