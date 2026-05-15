---
"@vitessce/zarr": patch
---

Add test fixtures that use anndata Python package versions 0.11 and 0.12. For 0.12 fixtures, write them to Zarr v3 format by opting into anndata's zarr_write_format = 3 setting. Add the new fixtures to the existing anndata unit tests. Update the zarr \_loadColumn function to support string-array and nullable-string-array encoding types.
