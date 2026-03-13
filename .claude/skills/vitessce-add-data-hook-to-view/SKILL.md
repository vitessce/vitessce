---
name: vitessce-add-data-hook-to-view
description: Use when adding a new data-loading hook to an existing Vitessce subscriber component — fetching an additional data type like obs sets, embeddings, feature labels, or spatial data. Trigger on "add data loading", "load additional data in a view", "add a data hook", "fetch more data", "use obs sets in a view", "add useObsEmbeddingData", or "load feature labels".
---

# Adding a Data Hook to an Existing Subscriber

Data hooks live in `packages/vit-s/src/data-hooks.js`. Each wraps `useDataType` (React Query) and returns `[data, status, urls, error]`.

## Pattern

```js
import { useLoaders, useReady, useUrls } from '@vitessce/vit-s';

// In the subscriber body:
const loaders = useLoaders();

// Existing hook (unchanged):
const [{ obsEmbedding, obsEmbeddingIndex }, embeddingStatus, embeddingUrls, embeddingError]
  = useObsEmbeddingData(loaders, dataset, true, {}, {}, { obsType, embeddingType });

// New hook (add this):
const [{ obsSets }, obsSetsStatus, obsSetsUrls, obsSetsError]
  = useObsSetsData(loaders, dataset, false, {}, {}, { obsType });

// Include the new status — isReady is false until all are done loading:
const isReady = useReady([embeddingStatus, obsSetsStatus]);

// Include the new URLs for the download button:
const urls = useUrls([embeddingUrls, obsSetsUrls]);

// Include the new error for the error indicator:
const errors = [embeddingError, obsSetsError];
```

Pass the new data and updated `isReady`, `urls`, and `errors` through to `TitleInfo` and the child component.

## Common data hooks

| Hook | Data type | Key fields in data object |
|---|---|---|
| `useObsEmbeddingData` | Dimensionality-reduced coordinates | `obsEmbedding`, `obsEmbeddingIndex` |
| `useObsSetsData` | Cell/obs set hierarchies | `obsSets` |
| `useFeatureLabelsData` | Gene/feature label names | `featureLabels` |
| `useObsLabelsData` | Cell/obs label names | `obsLabels` |
| `useObsLocationsData` | Spatial coordinates | `obsLocations` |
| `useImageData` | Spatial images | `image` |

## coordinationValues — matching the hook to the right file

Each hook takes coordination values as its last argument. These disambiguate which file to load when a dataset contains multiple files of the same type:

```js
const [{ obsType, embeddingType }] = useCoordination(...);
// ...
useObsEmbeddingData(loaders, dataset, true, {}, {}, { obsType, embeddingType });
```

The coordination values must be in `COMPONENT_COORDINATION_TYPES` for the view — if `obsType` or `embeddingType` isn't there, add it first (see `vitessce-add-coordination-to-view`).

## Third argument: isRequired

The third argument (`true`/`false`) controls whether Vitessce shows an error when no matching loader is found. Use `true` for data the view can't function without, `false` for optional data.
