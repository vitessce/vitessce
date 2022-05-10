---
id: data-troubleshooting
title: Data preparation troubleshooting
sidebar_label: Troubleshooting
slug: /data-troubleshooting
---

Some common issues may arise when writing or converting data to use with Vitessce.

## General Zarr format troubleshooting

### Zarr dtypes

Vitessce uses the [Zarr.js](https://github.com/gzuidhof/zarr.js) package internally to load data stored in Zarr arrays.
This package [supports a subset](https://github.com/gzuidhof/zarr.js/blob/61d9cdb56ce6f8eaf97d213bcaa5b4ea8d01f5d1/src/nestedArray/types.ts#L32) of Zarr and NumPy  data types (dtypes). You may need to cast your data (e.g., NumPy arrays, Pandas dataframe columns (including those within AnnData objects)) to a compatible dtype before writing to a Zarr store that will be loaded with Vitessce.

### raster.ome-zarr troubleshooting

#### Metadata requirements

The [`omero`](https://ngff.openmicroscopy.org/latest/#omero-md) metadata field must be present. `omero.channels` and `omero.rdefs` fields provide metadata that Vitessce uses for the initial rendering settings and must be present in the 


#### OME-NGFF version support

Vitessce currently supports up to OME-NGFF spec v3.0. Until v4.0 is supported in [viv](https://github.com/hms-dbmi/viv/issues/586) (and then in Vitessce) you may need to use previous versions of OME-NGFF writer tools. For example, v0.2.1 of [ome-zarr-py](https://github.com/ome/ome-zarr-py) (`ome-zarr==0.2.1`) writes v3.0 OME-NGFFs.


#### Z-axis chunking

Vitessce does not yet support chunking along the Z axis. When writing OME-Zarr stores, you may need to specify a `chunks` argument manually such that the Z axis only has 1 chunk.

An example writing to a Zarr store using [ome-zarr-py](https://github.com/ome/ome-zarr-py):

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