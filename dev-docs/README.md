# Developer documentation

The developer documentation here is meant for usage by the internal development team, external contributors, and plugin developers.

## Documentation for plugin developers

- [View type implementation](./plugin-view-types.md)
- [File type implementation](./plugin-file-types.md)

## Documentation for internal developers

### Architecture

The diagram below highlights how Vitessce is composed of a top-level `<Vitessce/>` React component which encapsulates several individual visualization or control views such as `<Scatterplot/>` and `<Spatial/>`.

<a href="https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit" target="_blank">
    <img
        src="https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650"
        alt="Architecture diagram"
        className="ar-16x9"
    />
</a>

### Table of contents

- [Design guidelines](./design-guidelines.md)
- [Monorepo and bundling](./monorepo-and-bundling.md)
- [Config schema versioning](./config-schema-versioning.md)

### Note about developer documentation contents

Here, we not only want to document implementation details, but also higher-level architectural details and development processes.
However, documentation that would be relevant to a wider audience should instead be included in the main documentation website that is hosted at http://vitessce.io.
