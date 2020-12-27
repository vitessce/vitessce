---
id: introduction
title: Introduction
slug: /
---


Vitessce is a visual integration tool for exploration of spatial single cell experiments. Its modular design is optimized for scalable, linked visualizations that support the spatial and non-spatial representation of tissue-, cell- and molecule-level data. Vitessce integrates the [Viv](https://github.com/hms-dbmi/viv) library to visualize highly multiplexed, high-resolution, high-bit depth image data directly from OME-TIFF files and Bio-Formats-compatible Zarr stores.

## Architecture

The diagram below highlights how Vitessce is composed of a top-level `<Vitessce/>` React component which encapsulates several individual visualization or controller components such as `<Scatterplot/>` and `<Spatial/>`.

[![Architecture diagram](https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650)](https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit)


## Configuration

When using the top-level `<Vitessce/>` component (or the Python/R widgets), a [JSON-based configuration](/docs/view-config-json/index.html) termed the "view config" defines how data is retrieved, which visualization components are rendered, and how different components are coordinated.
To simplify the configuration process, we also provide object-oriented APIs for generating view configs in [JavaScript](/docs/view-config-js/index.html), [Python](https://vitessce.github.io/vitessce-python/config_api.html), and [R](https://vitessce.github.io/vitessce-r/reference/VitessceConfig.html#examples).

## Distribution

Vitessce is distributed in multiple ways, and can be used as a:
* JavaScript package and React component
* Python package and Jupyter widget
* R package and R htmlwidget

## Integrations

Vitessce is being used in the following projects:

* [HuBMAP Data Portal](https://portal.hubmapconsortium.org/)

## Contributors

<ul><li><a href="https://github.com/keller-mark">Mark Keller</a></li><li><a href="https://github.com/mccalluc">Chuck McCallum</a></li><li><a href="https://github.com/ilan-gold">Ilan Gold</a></li><li><a href="https://github.com/manzt">Trevor Manz</a></li><li><a href="https://github.com/thomaslchan">Tos Chan</a></li><li><a href="https://github.com/sehilyi">Sehi Lyi</a></li><li><a href="https://github.com/jkmarx">Jennifer Marx</a></li><li><a href="https://github.com/pkharchenko">Peter Kharchenko</a></li><li><a href="https://github.com/ngehlenborg">Nils Gehlenborg</a></li></ul>
