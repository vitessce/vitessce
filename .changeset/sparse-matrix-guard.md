---
"@vitessce/zarr": patch
"@vitessce/zarr-utils": patch
"@vitessce/utils": patch
"@vitessce/error": patch
"@vitessce/vit-s": patch
"docs": patch
---

Read individual features from CSR-encoded obsFeatureMatrix stores by scanning `indices`/`data` in chunks instead of densifying the whole matrix, coalescing concurrent selections into one scan and refusing scans beyond the browser's allocation budget with a descriptive `MatrixTooLargeError`; warn before full-matrix densification that exceeds the budget and report allocation failures descriptively; fix CSC selection on int64 `indptr` and the silent last-column result for unknown features on dense matrices; document that `csc_matrix` is the preferred sparse encoding.
