---
'@vitessce/abstract': patch
'@vitessce/csv': patch
'@vitessce/zarr': patch
'@vitessce/spatial': patch
'@vitessce/spatial-beta': patch
---

Three follow-up optimizations surfaced by the 2M-cell dataset. The remaining dense obs-by-feature loaders (AnnData `obsFeatureColumns`, plain matrix zarr, CSV) now share an allocation guard: an over-budget estimate logs a warning before the attempt, and an allocation failure is rethrown as a descriptive `MatrixTooLargeError` naming the matrix. The spatial views build their lasso/rectangle-selection quadtrees lazily on first use instead of on every data update. Zarr data sources memoize node opens per path, so a node's metadata documents (`.zattrs`/`.zarray`/`.zgroup`) are read once per data source instead of once per access pattern. `loadNumericForDims` uses the contiguous sliced read only when the requested dims actually share chunks, and per-dim reads when each dim has its own chunk column, avoiding needless 2D assembly on per-column-chunked embeddings.
