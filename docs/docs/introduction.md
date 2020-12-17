---
id: introduction
title: Introduction
slug: /
---


Vitessce is a visual integration tool for exploration of spatial single cell experiments. Its modular design is optimized for scalable, linked visualizations that support the spatial and non-spatial representation of tissue-, cell- and molecule-level data. Vitessce integrates the [Viv](https://github.com/hms-dbmi/viv) library to visualize highly multiplexed, high-resolution, high-bit depth image data directly from OME-TIFF files and Bio-Formats-compatible Zarr stores.

## Architecture

The diagram below highlights how Vitessce is composed of a top-level `<Vitessce/>` React component which encapsulates several individual visualization or controller components such as `<Scatterplot/>` and `<Spatial/>`. When using the top-level `<Vitessce/>` component (or the Python/R widgets), a JSON-based configuration termed the "View Config" defines how data is retrieved, which visualization components are rendered, and how different components are coordinated.

[![Architecture diagram](https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650)](https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit)

## Distribution

Vitessce is distributed in multiple ways, and can be used as a:
* JavaScript package and React component
* Python package and Jupyter widget
* R package and R htmlwidget

## Integrations

Vitessce is being used in the following projects:

* [HuBMAP Data Portal](https://portal.hubmapconsortium.org/)

## Funding

* NIH/OD Human BioMolecular Atlas Program (HuBMAP) (OT2OD026677, PI: Nils Gehlenborg).
* NIH/NLM Biomedical Informatics and Data Science Research Training Program (T15LM007092, PI: Nils Gehlenborg)
* Harvard Stem Cell Institute (CF-0014-17-03, PI: Nils Gehlenborg)

