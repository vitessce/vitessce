---
"@vitessce/launcher": patch
"@vitessce/config": patch
---

Improvements to generateConfig to support Zarr stores containing recarrays (will skip rather than error) and to reduce network requests by passing the `kind` parameter to zarr.open.
