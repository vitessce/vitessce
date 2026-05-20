---
"@vitessce/zarr": patch
---

Add test fixtures that use anndata Python package versions 0.11 and 0.12 and spatialdata Python package versions 0.3 and 0.7. The anndata 0.12 and spatialdata 0.7 fixtures are written to Zarr v3 format. New unit tests and configurations that use the new fixtures are added. Update the `anndata.zarr` \_loadColumn function to support string-array and nullable-string-array encoding types. Update the `spatialdata.zarr` points format validation to allow points format 0.2.
