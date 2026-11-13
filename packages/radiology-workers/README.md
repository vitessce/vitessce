# @vitessce/radiology-workers

Decodes compressed DICOM pixel data for `@vitessce/radiology` in a web worker.

The worker is inlined into `dist/index.js` (see `@vitessce/workers`) so that it does not depend on a relative worker URL. The decoders are also exported as `@vitessce/radiology-workers/decoders`, for environments without workers.

```sh
pnpm run build
```
