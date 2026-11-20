---
name: vitessce-react-hooks
description: Use when writing or reviewing React hook patterns in Vitessce — useMemo vs useState/useEffect, useCallback, and Vitessce-specific custom hook functions. Trigger when writing a custom hook, updating code that performs state management, adding memoization, or when reviewing a component that uses hooks incorrectly.
---

# React Hooks in Vitessce

Vitessce uses **functional components with hooks only** — no class components in new code.

## Prefer useMemo over useState + useEffect for derived values

`useMemo` computes a derived value synchronously during render. `useState` + `useEffect` does the same thing but with an extra render cycle and intermediate `null` state. For pure data transformations, `useMemo` is simpler and faster:

```js
// Preferred:
const processedData = useMemo(() => transform(rawData), [rawData]);

// Avoid when useMemo is sufficient:
const [processedData, setProcessedData] = useState(null);
useEffect(() => {
  setProcessedData(transform(rawData));
}, [rawData]);
```

Use `useState` for **user-driven interactive state** (hover position, open/closed toggle, user text input). Use `useEffect` for genuine side effects (subscribing to external events, imperative DOM/canvas operations).

Use `useCallback` to memoize event handlers passed as props, so child components don't re-render unnecessarily.


## useMemo with custom equality function for comparison of previous and next dependencies

Vitessce provides a custom `useMemoCustomComparison` hook that allows you to provide a custom equality function for comparing previous and next dependencies. This is useful when you have complex objects or arrays as dependencies and want to avoid unnecessary re-computations.

`useMemo`'s built-in dependency comparison is a shallow, per-element `Object.is` check. That breaks down when a dependency is a nested object (e.g. per-layer/per-channel coordination values) that gets a new reference every render even though its contents didn't meaningfully change — `useMemo` would re-run the factory on every render regardless. `useMemoCustomComparison(factory, dependencies, customIsEqual)` fixes this by letting you supply your own `(prevDeps, nextDeps) => boolean` function, e.g. using `isEqual` from `lodash-es` for a deep-equality check instead of relying on reference equality:

```js
import { isEqual } from 'lodash-es';
import { useMemoCustomComparison } from '@vitessce/vit-s';

// dependencies is a single object here (not an array) since we need
// to pass both prevDeps and nextDeps as whole objects to customIsEqual.
const dependencies = { obsSetColor, obsColorEncoding, spatialLayerColor };

const cellColorMapping = useMemoCustomComparison(
  () => computeCellColorMapping(dependencies),
  dependencies,
  isEqual,
);
```

For cases where a deep equality check over the whole dependency object is too expensive (e.g. very large nested layer/channel coordination structures), `@vitessce/vit-s` also exports narrower comparison helpers (`shallowDiff`, `shallowDiffByLayer`, `shallowDiffByChannel`, and `*WithKeys` variants) for building a `customIsEqual` that only inspects the specific fields that matter — see `packages/view-types/neuroglancer/src/use-memo-custom-equals.js` for a real example.

Each helper takes `(prevDeps, nextDeps, depName, ...)`, so a common pattern is to curry them once per `customIsEqual` call, then iterate over the layer/channel scopes to check only the keys relevant to the computation:

```js
import {
  shallowDiff,
  shallowDiffByLayer,
  shallowDiffByLayerWithKeys,
} from '@vitessce/vit-s';

function customIsEqual(prevDeps, nextDeps) {
  // Curry so we don't have to repeat prevDeps/nextDeps at every call site.
  const curriedShallowDiff = depName => shallowDiff(prevDeps, nextDeps, depName);
  const curriedShallowDiffByLayer = (depName, layerScope) => shallowDiffByLayer(
    prevDeps, nextDeps, depName, layerScope,
  );
  const curriedShallowDiffByLayerWithKeys = (depName, layerScope, keys) => shallowDiffByLayerWithKeys(
    prevDeps, nextDeps, depName, layerScope, keys,
  );

  // If the set of layers itself changed, everything needs to be recomputed.
  if (curriedShallowDiff('layerScopes')) {
    return false; // not equal -> recompute
  }

  // Otherwise, only recompute if a relevant field changed for any single layer.
  const layerChanged = nextDeps.layerScopes.some(layerScope => (
    curriedShallowDiffByLayer('obsData', layerScope)
      || curriedShallowDiffByLayerWithKeys('layerCoordination', layerScope, ['spatialLayerVisible', 'spatialLayerColor'])
  ));

  return !layerChanged; // isEqual === true means "skip recomputation"
}
```

## Vitessce-specific hooks (from `@vitessce/vit-s`)

| Hook | Purpose |
|---|---|
| `useCoordination(types, scopes)` | Read/write shared coordination state. Returns `[values, setters]`. Both values and setters are stable references. |
| `useCoordinationScopes(raw)` | Process raw coordination scopes from props. Call this before `useCoordination`. |
| `useLoaders()` | Get data loader instances for the current dataset context. |
| `useReady(statuses[])` | Returns `true` only when no status in the array is `'loading'`. Pass all data hook statuses here. |
| `useUrls(urlArrays[])` | Flattens and deduplicates URL arrays from data hooks for the download button. |

## Debugging mode

```js
import { getDebugMode, log } from '@vitessce/globals';

if (getDebugMode()) {
  throw new Error(`In debug mode, index file is required.`);
} else {
  log.error(`Index file is missing, which can increase loading times.`);
}
```

## What to avoid

- Class components
- `useEffect` for pure data transformations (use `useMemo`)
- Default exports for components (use named exports)
