---
id: components
title: Visualization Components
sidebar_label: Visualization Components
slug: /components
---

## Overview

Vitessce supports several components for visualization of single-cell data, and several controller components for updating visualization parameters.

:::note
The terms "component" and "view" are used interchangably thoughout this documentation.
:::

### `description`

The description component can be used to display text content. This may be useful for communicating the details of a dataset or a data analysis process. When the `spatial` component is used for visualization of imaging data, the `description` component also renders a dropdown containing image metadata.

### `status`

The status component is meant for debugging purposes. This component displays app-wide error messages when datasets fail to load or schemas fail to validate.

### `genes`

The genes component displays an interactive list of genes when used with datasets containing the `expression-matrix` data type.

### `cellSets`

The cell sets component displays an interactive list of (potentially hierarchical) cell sets when used with datasets containing the `cell-sets` data type. This can be useful for managing cell sets representing clustering algorithm outputs or cell type annotations.

### `scatterplot`

The scatterplot component displays 2-dimensional (pre-computed) embeddings / projections (such as t-SNE or UMAP). Use with the `embeddingType` coordination type to specify which embedding to use when mapping cells onto scatterplot points. Use with datasets containing the `cells` data type. Optionally, the `cell-sets` and `genes` data types can be used for coloring cells on the plot.

### `spatial`

### `heatmap`

### `layerController`

### `genomicProfiles`

### `cellSetSizes`
