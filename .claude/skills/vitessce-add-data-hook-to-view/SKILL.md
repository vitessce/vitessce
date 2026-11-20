---
name: vitessce-add-data-hook-to-view
description: Use when adding a new data-loading hook to an existing Vitessce subscriber component — fetching an additional data type like obs sets, embeddings, feature labels, or spatial data. Trigger on "add data loading", "load additional data in a view", "add a data hook", "fetch more data", "use obs sets in a view", "add useObsEmbeddingData", or "load feature labels".
---

# Adding a Data Hook to an Existing Subscriber

Data hooks live in `packages/vit-s/src/data-hooks.js`. Each is a thin wrapper around `useDataType`
(React Query) and returns `[data, status, urls, error]`.

## Signature

Every single-scope data hook takes the same six arguments:

```js
useSomethingData(loaders, dataset, isRequired, coordinationSetters, initialCoordinationValues, matchOn)
```

| Argument | Meaning |
|---|---|
| `loaders` | From `useLoaders()`. |
| `dataset` | The `dataset` coordination value. |
| `isRequired` | `true` surfaces a `LoaderNotFoundError` when no matching loader exists; `false` resolves to empty data. |
| `coordinationSetters` | Setters used to initialize coordination values that the loader returns. `{}` when not initializing. |
| `initialCoordinationValues` | From `useInitialCoordination`, controlling which returned values may initialize. `{}` when not initializing. |
| `matchOn` | Coordination values used to select **which file** to load. |

The `{}, {}` you see at most call sites are `coordinationSetters` and `initialCoordinationValues`.

## Pattern

```js
import { useLoaders, useReady, useUrls } from '@vitessce/vit-s';

// In the subscriber body:
const loaders = useLoaders();

// Existing hook (unchanged):
const [{ obsIndex: obsEmbeddingIndex, obsEmbedding }, embeddingStatus, embeddingUrls, embeddingError]
  = useObsEmbeddingData(loaders, dataset, true, {}, {}, { obsType, embeddingType });

// New hook (add this):
const [{ obsSets }, obsSetsStatus, obsSetsUrls, obsSetsError]
  = useObsSetsData(loaders, dataset, false, {}, {}, { obsType });

// Include the new status — isReady is false while any status is still 'loading':
const isReady = useReady([embeddingStatus, obsSetsStatus]);

// Include the new URLs for the download button:
const urls = useUrls([embeddingUrls, obsSetsUrls]);

// Include the new error for the error indicator:
const errors = [embeddingError, obsSetsError];
```

Pass the new data through to the child component, and `isReady` / `urls` / `errors` to `TitleInfo`.

`useReady` returns `true` once no status in the array equals `'loading'` — note that includes
`'error'`, so a failed load unblocks rendering and surfaces through `errors` instead.

## Common data hooks

The first element of the returned tuple is an object; these are its keys. Several hooks return
`obsIndex`, which subscribers conventionally rename at the destructuring site
(e.g. `{ obsIndex: obsEmbeddingIndex }`).

| Hook | Data type | Keys in the data object |
|---|---|---|
| `useObsEmbeddingData` | Dimensionality-reduced coordinates | `obsIndex`, `obsEmbedding` |
| `useObsSetsData` | Cell/obs set hierarchies | `obsSets`, `obsSetsMembership` |
| `useFeatureLabelsData` | Gene/feature label names | `featureLabelsMap` |
| `useObsLabelsData` | Cell/obs label names | `obsIndex`, `obsLabels` |
| `useObsLocationsData` | Spatial point coordinates | `obsIndex`, `obsLocations` |
| `useObsSegmentationsData` | Segmentation geometry/bitmasks | `obsIndex`, `obsSegmentations`, `obsSegmentationsType` |
| `useImageData` | Spatial images | `image` |
| `useObsFeatureMatrixIndices` | Matrix row/column indices only | `obsIndex`, `featureIndex` |
| `useObsFeatureMatrixData` | Full expression matrix | `obsIndex`, `featureIndex`, `obsFeatureMatrix` |

If you are unsure of a key, read the loader for the corresponding file type (for example
`packages/file-types/csv/src/csv-loaders/ObsEmbeddingCsv.js` sets `{ obsIndex, obsEmbedding }`), or
copy the destructuring from an existing subscriber such as
`packages/view-types/scatterplot-embedding/src/EmbeddingScatterplotSubscriber.js`.

There are also `useMulti*` variants (`useMultiObsPoints`, `useMultiImages`,
`useMultiObsSegmentations`, …) for per-layer/per-channel views; those wrap `useDataTypeMulti` and
take a `matchOnObj` keyed by scope instead of a single `matchOn`, plus `mergeCoordination` and
`viewUid`.

## matchOn — selecting the right file

The last argument disambiguates which file to load when a dataset contains multiple files of the
same data type:

```js
const [{ obsType, embeddingType }] = useCoordination(...);
// ...
useObsEmbeddingData(loaders, dataset, true, {}, {}, { obsType, embeddingType });
```

`matchOn` is compared against each file definition's `coordinationValues` in the view config via
`getMatchingLoader`. The coordination types you pass must be in `COMPONENT_COORDINATION_TYPES` for
the view — if `obsType` or `embeddingType` isn't there it will be `undefined` and the match will fail
(see `vitessce-add-coordination-to-view`).

`matchOn` is also part of the React Query key, so two hooks differing only in `matchOn` are cached
separately. Build it inline or with `useMemo`; do not construct a fresh object identity per render
inside a memo dependency list you rely on elsewhere.
