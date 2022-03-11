# Progress and documentation

### View config documentation

- Query+reference components all assume that there are two special dataset coordination scope names: `QUERY` and `REFERENCE`.

- All data provided through the `cells` data type and `CellsZarrLoader`, using this file definition structure in the view config:

```js
{
  type: 'cells',
  fileType: 'anndata-cells.zarr',
  url: `${zarrPath}/pancreas_easy/reference.zarr`,
  options: {
    expressionMatrix: {
      path: 'X'
    },
    anchorMatrix: {
      path: 'obsm/anchor_mat'
    },
    differentialGenes: {
      names: {
        path: 'uns/rank_genes_groups/_names'
      },
      scores: {
        path: 'uns/rank_genes_groups/_scores'
      }
    },
    features: {
      cellType: {
        path: 'obs/cell_type'
      },
      anchorCluster: {
        path: 'obs/anchor_cluster'
      }
    },
    embeddings: {
      UMAP: {
        path: 'obsm/X_umap'
      }
    },
  }
},
```

#### Change List
- Adds new visualization components which support multiple datasets
  - `qrComparisonScatterplot` (`src/components/scatterplot/QRComparisonScatterplotSubscriber.js`)
  - `qrSupportingScatterplot` (`src/components/scatterplot/QRSupportingScatterplotSubscriber.js`)
  - `qrCellSets` (`src/components/sets/QRCellSetsManagerSubscriber.js`)
These components all assume that there are two special dataset coordination scope names `QUERY` and `REFERENCE`.
- Adds the `useMultiDatasetCoordination` and `useDatasetUids` coordination hooks (`src/app/state/hooks.js`)
- Adds new demo at http://localhost:3000/?dataset=xai&theme=light (`src/demo/view-configs/xai.js`)
- Adds new demo at http://localhost:3000/?dataset=xai-polyphony&theme=light (`src/demo/view-configs/xai-polyphony.js`)
- Adds new view config schema version `xai` (`src/schemas/config-xai.schema.json`) to support multiple `dataset` coordination scopes and dataset-specific coordination scope mappings for all other coordination types
```js
...,
datasets: [
  {
    uid: 'my-query',
    name: 'My query dataset',
    files: [
      ...,
    ],
  },
  {
    uid: 'some-atlas',
    name: 'Some atlas dataset',
    files: [
      ...,
    ],
  },
],
coordinationSpace: {
  dataset: {
      REFERENCE: 'some-atlas,
      QUERY: 'my-query',
  },
  embeddingType: {
    common: 'UMAP',
  },
  embeddingZoom: {
    refZoom: 2,
    qryZoom: 4,
  },
  ...,
},
layout: [
  {
    component: 'qrComparisonScatterplot',
    coordinationScopes: {
      dataset: ['REFERENCE', 'QUERY'],
      embeddingType: 'common',
      embeddingZoom: { REFERENCE: 'refZoom', QUERY: 'qryZoom' },
    },
    x: 0, y: 0, w: 5, h: 12,
  },
  ...,
],
...
```