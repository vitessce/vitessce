---
name: vitessce-create-view-config
description: Use when creating a new Vitessce view config from scratch — the JSON object that defines datasets, layout, and coordination space. Also use when writing example configs or generating configs programmatically with the VitessceConfig API. Trigger on "create a view config", "write a config", "new example config", "configure vitessce", "set up a layout", or "write a JSON config".
---

# Creating a View Config

A view config defines what data to show, how to lay out views, and how to link them through the
coordination space.

## JSON Structure

```js
export const myConfig = {
  name: 'My visualization',
  description: 'Example config',
  version: '1.0.18',       // latest schema version
  initStrategy: 'auto',    // fills in missing coordination scopes automatically
  datasets: [
    {
      uid: 'my-dataset',
      name: 'My Dataset',
      files: [
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://example.com/embedding.csv',
          coordinationValues: { obsType: 'cell', embeddingType: 'UMAP' },
          options: { obsIndex: 'index', obsEmbedding: ['UMAP_1', 'UMAP_2'] },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingType: { UMAP: 'UMAP' },
    obsType: { A: 'cell' },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: { embeddingType: 'UMAP', obsType: 'A' },
      h: 6, w: 6, x: 0, y: 0,
    },
    {
      component: 'description',
      coordinationScopes: {},
      h: 6, w: 6, x: 6, y: 0,
    },
  ],
};
```

Key points:
- `version`: the latest is **`1.0.18`**. Confirm with `latestConfigSchema` in
  `packages/schemas/src/previous-config-meta.ts` rather than trusting this doc — the value moves.
  Older versions still load; `upgradeAndParse` in `packages/schemas/src/view-config-versions.ts`
  migrates them.
- `initStrategy: 'auto'` fills in missing coordination scopes — you only need to declare scopes you
  want to customize. `'none'` disables that.
- `files[].coordinationValues` disambiguates when multiple files provide the same data type (e.g., two
  embeddings with different `embeddingType`). It is matched against each data hook's `matchOn`.
- `files[].options` is validated per file type; see `packages/schemas/src/file-def-options.ts`.
- Layout uses a **12-column grid** (`packages/vit-s/src/vitessce-grid-layout/layout-utils.js`).
  `x`/`y` are column/row positions; `w`/`h` are width/height in grid units and are optional in the
  schema, though every real config sets them.
- `coordinationScopesBy` (a sibling of `coordinationScopes`, added in schema `1.0.16`) holds
  per-layer/per-channel scope mappings for the spatial and layer-controller views.

## VitessceConfig Programmatic API

For complex configs, use the builder from `@vitessce/config` (`packages/config/src/VitessceConfig.js`):

```js
import { VitessceConfig, hconcat, vconcat, CoordinationLevel as CL } from '@vitessce/config';

const vc = new VitessceConfig({ schemaVersion: '1.0.18', name: 'My Config' });

// addDataset(name, description) — the uid is auto-generated, not the first argument.
const dataset = vc.addDataset('My Dataset').addFile({
  fileType: 'obsEmbedding.csv',
  url: 'https://example.com/embedding.csv',
  coordinationValues: { obsType: 'cell', embeddingType: 'UMAP' },
});

// addView returns a single view object (NOT an array — do not destructure it).
const scatterplot = vc.addView(dataset, 'scatterplot');
const description = vc.addView(dataset, 'description');

// Set coordination values shared by a group of views.
vc.linkViewsByObject([scatterplot], { embeddingType: 'UMAP' }, { meta: false });

// hconcat/vconcat are standalone imports, not methods on vc.
vc.layout(hconcat(scatterplot, description));

const config = vc.toJSON();
```

Common `VitessceConfig` methods:

| Method | Purpose |
|---|---|
| `addDataset(name, description)` | Add a dataset; returns a `VitessceConfigDataset`. |
| `dataset.addFile({ fileType, url, coordinationValues, options })` | Add a file; returns the dataset for chaining. |
| `addView(dataset, component, { x, y, w, h, uid, mapping })` | Add a view; returns one `VitessceConfigView`. |
| `addCoordination(...cTypes)` | Returns an **array** of new scope objects — destructure this one. |
| `linkViews(views, cTypes, cValues)` | Put a set of views on shared scopes for the given coordination types. |
| `linkViewsByObject(views, valuesObject, { meta })` | Same, but keyed by coordination type name; supports nesting via `CoordinationLevel`. |
| `layout(tree)` | Set the grid layout from an `hconcat`/`vconcat` tree; computes `x`/`y`/`w`/`h`. |
| `toJSON()` | Produce the plain config object. |

`hconcat`, `vconcat`, and `CoordinationLevel` (aliased `CL`) are named exports of `@vitessce/config`,
alongside `VitessceConfig` — see `packages/config/src/index.js`.

## Example Configs

Real examples live in `examples/configs/src/view-configs/` and are registered in
`examples/configs/src/index.js` under a `<name>-example` key. Study these before writing from
scratch; `lemur.js` is a good reference for the programmatic API including `linkViews` and nested
`hconcat`/`vconcat`.

Note many older example configs pin older schema versions (`1.0.0` through `1.0.17`) and still work
via the upgraders — copy their structure, not their `version` string.

## Schema Versioning

Zod schemas live in `packages/schemas/`. The **coordination types, file types, and view type names
are all built dynamically from the registered plugins** (`schema-builders.ts`), so adding one of
those does not require a version bump. Increment the version only for structural changes to the
config format itself, and add a matching `upgradeFrom1_0_N` function in
`previous-config-upgraders.ts`.

## For modifying an existing config

See the `vitessce-modify-view-config` skill.
