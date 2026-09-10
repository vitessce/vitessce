---
"@vitessce/spatial-three": patch
---

Fix `Uncaught Error: @react-three/xr is not loaded; call loadXRModule() first.` at page load in consumer bundles. Five XR modules called `getXRModule()` at module scope, which made them depend on the consuming application's chunking: a bundler that folds the lazy XR chunks into an eagerly-evaluated chunk (for example a Vite `manualChunks` rule that groups all of `node_modules`, or an equivalent Webpack `splitChunks` config) evaluated them before `SpatialWrapper` had awaited `loadXRModule()`, throwing before any React component mounted and taking down the whole application rather than just the spatial view. All `getXRModule()` calls now happen at render time inside function bodies, and `xrStore` is replaced by a lazily-created `getXrStore()`, so evaluation order no longer matters.
