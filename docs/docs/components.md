---
id: components
title: Visualization Components
sidebar_label: Visualization Components
slug: /components
---

## Overview

Vitessce supports several components for visualization of single-cell data, and several controller components for updating visualization parameters. The component names found on this page are all valid values for the field [`layout[].component`](/docs/view-config-json/index.html#layout) in the view config.

More information about the data types mentioned on this page can be found on the [Supported File Types](/docs/data-file-types/index.html) page.

:::note
The terms "component" and "view" are used interchangeably thoughout this documentation.
:::


### `scatterplot`

The scatterplot component displays 2-dimensional (pre-computed) embeddings / projections (such as t-SNE or UMAP). Use with the `embeddingType` coordination type to specify which embedding to use when mapping cells onto scatterplot points. Use with datasets containing the `cells` data type. Optionally, the `cell-sets` and `genes` data types can be used for coloring cells on the plot.


### `heatmap`

The heatmap component displays a (normalized) cell-by-gene (or gene-by-cell) matrix visualization.
This component uses the `expression-matrix` data type, and optionally displays cell set color assignments if a file with the `cell-sets` data type is available in the same dataset.
The heatmap can support very large matrices (~6,000 x ~9,000) when using Zarr-based file types (best performance can be acheived when arrays are saved with the type `uint8`).


### `spatial`

The spatial component is meant to display data with spatial coordinates, including spatially-resolved cell segmentations (from the `cells` data type) and molecule positions (from the `molecules` data type). The spatial component also includes a multiplexed and multi-scale image viewer (implemented with [Viv](https://github.com/hms-dbmi/viv)). Image files can be defined with the `raster` data type. Cell segmentations can be colored by gene expression data through the `expression-matrix` data type or cell set color assignments through the `cell-sets` data type.


### `layerController`

The layer controller component provides an interface for manipulating the visualization layers displayed in the `spatial` component. The corresponding `spatial` component(s) can be specified through the [`spatialLayers`](/docs/coordination-types/index.html#spatialLayers) coordination type.


### `genomicProfiles`

The genomic profiles component displays genome browser tracks (using the `genomic-profiles` data type) containing bar plots, where the genome is along the x-axis and the value at each genome position is encoded with a bar along the y-axis. Genome tracks may be colored by corresponding cell set color assignments if the `cell-sets` data type is available in the same dataset, coordinated on the [`cellSetSelection`](/docs/coordination-types/index.html#cellSetSelection) coordination type. This component was implemented with [HiGlass](https://higlass.io/).


### `genes`

The genes component displays an interactive list of genes when used with datasets containing the `expression-matrix` data type.


### `cellSets`

The cell sets component displays an interactive list of (potentially hierarchical) cell sets when used with datasets containing the `cell-sets` data type. This can be useful for managing cell sets representing clustering algorithm outputs or cell type annotations.


### `cellSetSizes`

The cell set sizes component displays a bar plot with the currently-selected cell sets (using the `cell-sets` data type and [`cellSetSelection`](/docs/coordination-types/index.html#cellSetSelection) coordination type) on the x-axis and bars representing their size (by number of cells) on the y-axis. This component was implemented with [Vega-Lite](https://vega.github.io/vega-lite/).


### `description`

The description component can be used to display text content. This may be useful for communicating the details of a dataset or a data analysis process. When the `spatial` component is used for visualization of imaging data, the `description` component also renders a dropdown containing image metadata.


### `status`

The status component is meant for debugging purposes. This component displays app-wide error messages when datasets fail to load or schemas fail to validate.



