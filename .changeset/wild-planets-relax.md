---
"@vitessce/spatial-three": patch
---

Fix build errors in consumer bundlers when the optional `@react-three/xr` peer dependency is not installed. XR modules previously used static named imports of `@react-three/xr`, which bundlers resolve at build time even for lazy-loaded chunks (Vite stubs the missing optional peer, causing MISSING_EXPORT). All XR access now goes through a single dynamic namespace import, so the non-XR 3D view works without `@react-three/xr`.
