---
"@vitessce/config": patch
"@vitessce/zarr-utils": patch
---

Treat a 403 response for `.zmetadata` as missing consolidated metadata during automatic config generation, since buckets that deny `s3:ListBucket` return AccessDenied rather than Not Found for keys that do not exist.
