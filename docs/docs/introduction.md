---
id: introduction
title: Getting Started
slug: /
---


Vitessce is a framework for integrative visualization of multi-modal and spatially-resolved single-cell data.
Its modular design is optimized for scalable, linked visualizations that support spatial (and non-spatial) cellular and molecular observations.
Highly multiplexed, high-resolution, high-bit depth images can be viewed in Vitessce, loaded directly from OME-TIFF files and Bio-Formats-compatible Zarr stores (enabled by the [Viv](http://viv.gehlenborglab.org/) library).

## Learning Vitessce

Vitessce can be used to design a visualization for a wide range of single-cell assays.
This flexibility derives from the ability to configure Vitessce such that a visualization includes a set of relevant interactive plots and controls.
Vitessce can load single-cell data from a variety of file types.

### Configuration

A [JSON-based configuration](/docs/view-config-json/) termed the "view config" defines how data is retrieved, which views are rendered, and how different views are coordinated.
To simplify the configuration process, we also provide object-oriented APIs for generating view configs in [JavaScript](/docs/view-config-js/), [Python](https://vitessce.github.io/vitessce-python/api_config.html), and [R](https://vitessce.github.io/vitessceR/reference/VitessceConfig.html#examples).

### Views

A Vitessce instants consists of a grid of visualization and control views defined in the view config. The layout specifies the dimensions and positioning of each view in the grid. A description of each view type can be found in the [list of view types](/docs/components/).

### Data preparation

Vitessce loads single-cell datasets from static files hosted on static web servers or object storage systems.
For example, a dataset stored as an AnnData object can be saved to an AnnData-Zarr store, uploaded to AWS S3, and loaded by Vitessce.
A full list of file types supported by Vitessce can be found on the [Data Types and File Types](/docs/data-types-file-types/) page.

### Coordinated multiple views

The visualization grid may contain multiple visual representations of the same data entities (cells, cell types, genes, etc.). Therefore, the visualizations ("views") in the grid can be optionally linked, or "coordinated." For more information, visit the [Coordinated Multiple Views](/docs/coordination/) page.

## Using Vitessce

We currently support the following ways of using Vitessce:

- Configure Vitessce using the online editor on the [App](/#?edit=true) page of this website.
- Load a Vitessce configuration from a URL or JSON file on the [App](/#?edit=true) page of this website.
- Embed Vitessce as a [React component](/docs/js-overview/) in a React app.
- Use Vitessce in a [Jupyter Notebook](/docs/platforms/#python-jupyter-widget) via the Python Package
- Use Vitessce in [RStudio](/docs/platforms/#r-htmlwidget) via the R Package
- Use Vitessce as a widget in an [R Shiny app](/docs/platforms/#r-htmlwidget) via the R Package

The [Platforms](/docs/platforms/) page contains more information about these options.

## Resources

### Examples

A great starting point for configuring Vitessce is to take an [example](/examples/) and tailor it for your dataset and analysis questions.

### Tutorials

For full walk throughs of the data processing and view configuration processes, visit the [tutorials](/docs/tutorials/).

