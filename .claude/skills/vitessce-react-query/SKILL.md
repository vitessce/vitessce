---
name: vitessce-react-query
description: Use when working with React Query (TanStack Query) internals in Vitessce — understanding how data fetching and loading works, adding new useDataType hooks, or debugging caching and query key issues. Trigger on "react query", "tanstack query", "useQuery in vitessce", "queryFn", "data loading internals", "query key", "caching", "how does data loading work", or "add a new data hook from scratch".
---

# React Query in Vitessce

Vitessce uses **React Query (TanStack Query v5)** for async data fetching and caching. For common
tasks like adding a data hook to an existing view, see `vitessce-add-data-hook-to-view`. This skill
covers the internals — useful when adding a new data type from scratch or debugging fetch behavior.

## Architecture

```
View Component
  → useObsEmbeddingData(loaders, dataset, ...)     [data-hooks.js — thin wrapper]
    → useDataType(DataType.OBS_EMBEDDING, ...)      [data-hook-utils.js]
      → useQuery({ queryFn: dataQueryFn })          [React Query]
        → getMatchingLoader(loaders, dataset, dataType, matchOn)
        → loader.load()  →  LoaderResult
        → returns { data, coordinationValues, urls, requestInit }
  → returns [data, status, urls, error]
```

## useDataType

The central hook in `packages/vit-s/src/data-hook-utils.js`:

```js
useDataType(dataType, loaders, dataset, isRequired,
            coordinationSetters, initialCoordinationValues, matchOn)
```

It wraps `useQuery` with Vitessce-specific logic:

- Builds the query key (below) and runs `dataQueryFn`, which resolves the loader via
  `getMatchingLoader` and awaits `loader.load()`.
- Sets `structuralSharing: false` and a stable `placeholderData` object, so `data` is never
  `undefined` — consumers can destructure immediately (`const [{ obsSets }] = ...`).
- Passes `loaders` through `meta` rather than closing over it, keeping the `queryFn` referentially
  stable.
- In a `useEffect`, feeds any `coordinationValues` the loader returned into `initCoordinationSpace`,
  which is how data-dependent initial coordination values reach the coordination space.
- Returns a normalized `[data, status, urls, error]` tuple.

`useDataTypeMulti` is the per-scope variant used by the `useMulti*` hooks: it takes a `matchOnObj`
keyed by scope, uses `useQueries`, and additionally accepts `mergeCoordination` and `viewUid` so
multi-level views merge coordination under a generated scope prefix.

## Adding a new data hook

In `packages/vit-s/src/data-hooks.js`:

```js
export function useMyNewData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.MY_NEW_TYPE,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}
```

Keep the argument order identical — every hook in this file is the same six parameters, and view
code depends on that uniformity. For this to work, `DataType.MY_NEW_TYPE` must be defined in
`packages/constants-internal/src/constants.ts` and a `PluginFileType` registered for it (see
`vitessce-add-file-type`). Export the hook from `packages/vit-s/src/index.js`.

## Query keys and caching

The key is an **array**, not an object:

```js
queryKey: [dataset, dataType, matchOn, isRequired, 'useDataType']
```

- `matchOn` in the key is why passing the right coordination values matters: the same data type with
  a different `obsType` or `embeddingType` is a separate cache entry.
- The `'useDataType'` suffix guards against an accidental cache hit from an unrelated hook that
  happened to build the same prefix.
- `useDataTypeMulti` and `getQueryKeyScopeTuplesAux` deliberately construct the **same** key
  structure so single- and multi-scope hooks share cached results. If you change the key shape in one
  place, change it in all three.
- `dataQueryFn` reads its arguments back out of `ctx.queryKey` by position, so the key ordering is
  load-bearing.

Debugging a suspected cache issue: check whether `matchOn` is a new object identity each render (it
is part of the key, and React Query hashes it), and whether `isRequired` differs between two call
sites for the same data — that alone forks the cache entry.

## Status values and useReady

`dataStatus = isFetching ? STATUS.LOADING : status`, where `STATUS` is from
`@vitessce/constants-internal`:

```js
export const STATUS = { LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };
```

Because `placeholderData` is always set, TanStack's own status is `'success'` from the first render,
so in practice the observed values are `'loading'` while fetching, then `'success'` or `'error'`.
Compare against the `STATUS` constants rather than string literals.

Collect all statuses and pass them to `useReady([...statuses])`. It returns `false` only while some
status is still `'loading'` — an `'error'` status counts as ready, so failures unblock rendering and
surface through the `errors` array passed to `TitleInfo`.
