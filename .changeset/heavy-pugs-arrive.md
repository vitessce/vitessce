---
"@vitessce/zarr-utils": patch
"@vitessce/zarr": patch
"@vitessce/sets-utils": patch
"@vitessce/types": patch
"@vitessce/scatterplot-embedding": patch
"@vitessce/scatterplot-gating": patch
---

Cache zarr store reads through the react-query client so concurrent requests for the same chunk share one download (fixes duplicate embedding chunk fetches), load contiguous embedding dims with a single sliced read, and read single-level categorical obs sets as raw codes end-to-end — building the sets tree, membership lookups, and the scatterplot color encoding from typed arrays instead of per-observation strings, with a fallback to the string-based route for scored, multi-level, or non-categorical columns.
