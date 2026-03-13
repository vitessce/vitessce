---
name: vitessce-modify-view-config
description: Use when modifying an existing Vitessce view config — changing datasets, files, layout positions, or coordination space values. Trigger on "change the layout", "add a file to the config", "update the dataset", "modify the config", "add a view to the layout", "change coordination values", "edit the view config", "adjust the grid", or "update a config".
---

# Modifying a View Config

View configs are plain JSON objects. This skill covers the most common modifications.

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
      },
    ],
  },
],
```

`coordinationValues` disambiguates when multiple files provide the same data type (e.g., two different embeddings).

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

Layout uses a **12-column grid**. `x`/`y` are column/row positions, `w`/`h` are width/height in grid units.

## Making two views share state (linked) vs. independent

Point views at the **same scope name** to link them. Give them **different scope names** for independent state:

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

## Adding a new coordination scope

Add the scope value to `coordinationSpace`, then reference the scope name in any layout entry that should use it:

```js
coordinationSpace: {
  // ...existing scopes...
  spatialZoom: { A: -4 },
},
// In layout:
{ component: 'spatial', coordinationScopes: { spatialZoom: 'A' }, ... }
```

## Using initStrategy: 'auto'

With `initStrategy: 'auto'`, Vitessce fills in missing coordination scopes with defaults. You only need to declare scopes you want to explicitly set.

## For creating a config from scratch

See the `vitessce-create-view-config` skill.

## Schema versioning

If your change introduces a new coordination type that requires a schema update, increment `version` and see `packages/schemas` for current version and upgrade functions.
