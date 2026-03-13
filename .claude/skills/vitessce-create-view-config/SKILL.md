---
name: vitessce-create-view-config
description: Use when creating a new Vitessce view config from scratch — the JSON object that defines datasets, layout, and coordination space. Also use when writing example configs or generating configs programmatically with the VitessceConfig API. Trigger on "create a view config", "write a config", "new example config", "configure vitessce", "set up a layout", or "write a JSON config".
---

# Creating a View Config

A view config is a JSON object that defines what data to show, how to lay out views, and how to link them through the coordination space.

## JSON Structure

```js
export const myConfig = {
  name: 'My visualization',
  description: 'Example config',
  version: '1.0.17',       // always use the latest schema version
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
- `version`: use the latest (currently `"1.0.17"`). Check `packages/schemas` for the current version.
- `initStrategy: 'auto'` fills in missing coordination scopes — you only need to declare scopes you want to customize.
- `files[].coordinationValues` disambiguates when multiple files provide the same data type (e.g., two embeddings with different `embeddingType`).
- Layout uses a **12-column grid**. `x`/`y` are column/row positions, `w`/`h` are width/height in grid units.

## VitessceConfig Programmatic API

For complex configs, use the builder from `packages/config`:

```js
import { VitessceConfig } from '@vitessce/config';

const vc = new VitessceConfig({ schemaVersion: '1.0.17', name: 'My Config' });
const dataset = vc.addDataset('my-dataset').addFile({
  fileType: 'obsEmbedding.csv',
  url: 'https://example.com/embedding.csv',
  coordinationValues: { obsType: 'cell', embeddingType: 'UMAP' },
});
const [scatterplot] = vc.addView(dataset, 'scatterplot');
const [description] = vc.addView(dataset, 'description');
vc.layout(vc.hconcat(scatterplot, description));
const config = vc.toJSON();
```

Source: `packages/config/src/VitessceConfig.js`

## Example Configs

Many examples live in `examples/configs/`. Study these for patterns before writing from scratch.

## Schema Versioning

- Zod schemas are in `packages/schemas` (versioned).
- When adding new coordination types, increment the schema version and add an upgrade function for backward compatibility.

## For modifying an existing config

See the `vitessce-modify-view-config` skill.
