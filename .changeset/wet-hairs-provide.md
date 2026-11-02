---
"@vitessce/neuroglancer": patch
---

Terminate AsyncComputation worker in neuroglancer to avoid piling up of workers on vc.widget() runs within jupyter notebooks -- avoiding a kernel stuck position and wasm out of memory errors.
