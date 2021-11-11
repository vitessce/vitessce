---
id: dev-overview
title: Developer Docs
sidebar_label: Overview
---

The **Developer Docs** are meant for internal usage by the developers of Vitessce (including external contributors).


## Architecture

The diagram below highlights how Vitessce is composed of a top-level `<Vitessce/>` React component which encapsulates several individual visualization or controller components such as `<Scatterplot/>` and `<Spatial/>`.

<a href="https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit" target="_blank">
    <img
        src="https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650"
        alt="Architecture diagram"
        className="ar-16x9"
    />
</a>


## Configuration

When using the top-level `<Vitessce/>` component (or the Python/R widgets), a [JSON-based configuration](/docs/view-config-json/) termed the "view config" defines how data is retrieved, which visualization components are rendered, and how different components are coordinated.
To simplify the configuration process, we also provide object-oriented APIs for generating view configs in [JavaScript](/docs/view-config-js/), [Python](https://vitessce.github.io/vitessce-python/api_config.html), and [R](https://vitessce.github.io/vitessce-r/reference/VitessceConfig.html#examples).


