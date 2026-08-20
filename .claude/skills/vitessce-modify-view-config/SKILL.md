---
name: vitessce-modify-view-config
description: Use when modifying an existing Vitessce view config — changing datasets, files, layout positions, or coordination space values. Trigger on "change the layout", "add a file to the config", "update the dataset", "modify the config", "add a view to the layout", "change coordination values", "edit the view config", "adjust the grid", or "update a config".
---

# Modifying a View Config

View configs are plain JSON objects. This skill covers the most common modifications. Configs in
this repo live in `examples/configs/src/view-configs/`.

## Adding a file to a dataset

```js
datasets: [
  {
    uid: 'my-dataset',
    files: [
      // existing files...
      {
        fileType: 'obsEmbedding.csv',
        url: 'https://example.com/new-embedding.csv',
        coordinationValues: { obsType: 'cell', embeddingType: 'PCA' },
        options: { obsIndex: 'index', obsEmbedding: ['PC_1', 'PC_2'] },
      },
    ],
  },
],
```

`coordinationValues` disambiguates when multiple files provide the same data type (e.g., two
different embeddings) — it is matched against the `matchOn` argument each data hook passes. The
shape of `options` depends on the file type; see `packages/schemas/src/file-def-options.ts`.

## Adding a view to the layout

```js
layout: [
  // existing views...
  {
    component: 'heatmap',
    coordinationScopes: { obsType: 'A', featureType: 'A' },
    h: 6, w: 6, x: 6, y: 6,
  },
],
```

Layout uses a **12-column grid**. `x`/`y` are column/row positions, `w`/`h` are width/height in grid
units. `component` must be a registered view type name (the value side of a `ViewType` entry, e.g.
`'scatterplot'`, `'obsSets'`).

## Making two views share state (linked) vs. independent

Point views at the **same scope name** to link them. Give them **different scope names** for
independent state:

```js
coordinationSpace: {
  obsType: {
    A: 'cell',      // scope A
    B: 'nucleus',   // scope B — independent
  },
},
layout: [
  { component: 'scatterplot', coordinationScopes: { obsType: 'A' }, ... },
  { component: 'heatmap',     coordinationScopes: { obsType: 'A' }, ... },  // linked to scatterplot
  { component: 'description', coordinationScopes: { obsType: 'B' }, ... },  // independent
],
```

A view only reacts to a coordination type listed in `COMPONENT_COORDINATION_TYPES` for its view type
(`packages/constants-internal/src/coordination.ts`). Adding a scope the view doesn't declare has no
effect — see `vitessce-add-coordination-to-view`.

## Adding a new coordination scope

Add the scope value to `coordinationSpace`, then reference the scope name in any layout entry that
should use it:

```js
coordinationSpace: {
  // ...existing scopes...
  spatialZoom: { A: -4 },
},
// In layout:
{ component: 'spatial', coordinationScopes: { spatialZoom: 'A' }, ... }
```

## Per-layer / per-channel values: coordinationScopesBy

Spatial and layer-controller views nest scopes one or two levels deep (layer → channel →
coordination type) in a `coordinationScopesBy` object, a sibling of `coordinationScopes`. In
practice these views don't inline it: they declare `metaCoordinationScopes` and
`metaCoordinationScopesBy` scope names, and the nested structure lives in the coordination space
under those keys:

```js
coordinationSpace: {
  metaCoordinationScopesBy: {
    metaA: {
      segmentationLayer: {
        segmentationChannel: { layerA: ['channelA'] },
        spatialLayerVisible: { layerA: 'visibleA' },
      },
      segmentationChannel: {
        obsType: { channelA: 'cellScope' },
        spatialChannelOpacity: { channelA: 'opacityA' },
      },
    },
  },
},
layout: [
  {
    component: 'spatialBeta',
    coordinationScopes: {
      dataset: 'A',
      metaCoordinationScopes: ['metaA'],
      metaCoordinationScopesBy: ['metaA'],
    },
    x: 0, y: 0, w: 8, h: 12,
  },
],
```

`useCoordinationScopes` / `useCoordinationScopesBy` resolve this indirection inside the subscriber.
Editing it by hand is error-prone — prefer the `VitessceConfig` API with `CoordinationLevel` (`CL`)
via `linkViewsByObject`, or copy from
`examples/configs/src/view-configs/spatial-beta/spatialdata-blobs.js`.

## Using initStrategy: 'auto'

With `initStrategy: 'auto'`, Vitessce fills in missing coordination scopes using each coordination
type's registered default value, plus data-dependent values that loaders report back. You only need
to declare scopes you want to explicitly set. `'none'` disables this.

## Schema version

Changing datasets, files, layout, or coordination values never requires touching `version` —
coordination types, file types, and view names are validated against the **registered plugins**, not
against a hardcoded list. The version only matters if you are changing the config format itself.

If you copy structure from an older example config, keep the `version` field that matches the
structure you actually wrote (or use the latest, currently `1.0.18` — confirm via
`latestConfigSchema` in `packages/schemas/src/previous-config-meta.ts`).

## For creating a config from scratch

See the `vitessce-create-view-config` skill.
