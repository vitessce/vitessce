---
name: vitessce-react-hooks
description: Use when writing or reviewing React hook patterns in Vitessce — useMemo vs useState/useEffect, useCallback, and Vitessce-specific hooks from @vitessce/vit-s. Trigger on "how should I use hooks", "useMemo vs useEffect", "React hooks in Vitessce", "optimize with hooks", "memoize this", "write a custom hook", or when reviewing a component that uses hooks incorrectly.
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
