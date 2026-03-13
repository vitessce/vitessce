---
name: vitessce-react-query
description: Use when working with React Query (TanStack Query) internals in Vitessce — understanding how data fetching works, adding new useDataType hooks, or debugging caching and query key issues. Trigger on "react query", "tanstack query", "useQuery in vitessce", "queryFn", "data loading internals", "query key", "caching", "how does data loading work", or "add a new data hook from scratch".
---

# React Query in Vitessce

Vitessce uses **React Query (TanStack Query)** for async data fetching and caching. For common tasks like adding a data hook to an existing view, see `vitessce-add-data-hook-to-view`. This skill covers the internals — useful when adding a new data type from scratch or debugging fetch behavior.

## Architecture

```
View Component
  → useObsEmbeddingData(loaders, dataset, ...)     [data-hooks.js — thin wrapper]
    → useDataType(DataType.OBS_EMBEDDING, ...)      [data-hook-utils.js]
      → useQuery({ queryFn: ... })                  [React Query]
        → getMatchingLoader(loaders, dataset, dataType)
        → loader.load()
        → returns { data, coordinationValues, urls }
  → returns [data, status, urls, error]
```

## useDataType

The central hook in `packages/vit-s/src/data-hook-utils.js`. It wraps `useQuery` with Vitessce-specific logic:

- Resolves the query key from `{ dataset, dataType, coordinationValues }`
- Finds and invokes the matching loader
- Returns a normalized `[data, status, urls, error]` tuple
- `status` is `'loading'`, `'success'`, or `'error'`

## Adding a new data hook

In `packages/vit-s/src/data-hooks.js`:

```js
export function useMyNewData(loaders, dataset, isRequired, addUrl, setItemIsReady, coordinationValues) {
  return useDataType(
    DataType.MY_NEW_TYPE,
    loaders,
    dataset,
    isRequired,
    addUrl,
    setItemIsReady,
    coordinationValues,
  );
}
```

For this to work, `DataType.MY_NEW_TYPE` must be defined in `@vitessce/constants-internal` and a `PluginFileType` registered for it (see `vitessce-add-file-type`).

## Query Keys and Caching

React Query caches by query key. Vitessce constructs keys from `{ dataset, dataType, coordinationValues }`, so the same data type with different `obsType` or `embeddingType` gets cached separately. This is why passing the right `coordinationValues` to a data hook matters — it determines which cached result you get.

## Status values and useReady

Data hooks return a `status` string. Collect all statuses and pass them to `useReady([...statuses])`, which returns `false` (blocking the view from rendering) until all are no longer `'loading'`. This prevents views from rendering with incomplete data.
