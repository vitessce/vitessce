# @vitessce/neuroglancer-workers

Inlined Neuroglancer worker scripts, so that consumers of Vitessce do not need to configure their bundler to emit Neuroglancer's worker and WebAssembly files (and so that Vitessce works when loaded cross-origin, e.g. from a CDN in vitessce-python).

```sh
pnpm run build
```

## How it works

Mainline [neuroglancer](https://github.com/google/neuroglancer) creates its workers with
`new Worker(new URL('./chunk_worker.bundle.js', import.meta.url), { type: 'module' })`
and loads WASM decoders (Draco, PNG, JPEG-XL, compresso) with
`fetch(new URL('./x.wasm', import.meta.url))`.

`scripts/build.mjs` uses Rollup to bundle each worker entry point into a single classic-worker IIFE:

- Neuroglancer's package-internal `#src/...` subpath imports are resolved with the `default` condition (all datasources/kvstores enabled).
- `new URL('./x.wasm', import.meta.url)` is replaced with a `data:application/wasm;base64,...` URL.
- The async-computation worker (decoders) is spawned from inside the chunk worker, so its code is embedded in the chunk worker and started from a Blob URL (a nested worker). Terminating the chunk worker also terminates these.

`dist/index.js` exports `ChunkWorker()`, which starts the chunk worker from a Blob URL.

The main-thread side lives in `@vitessce/neuroglancer`: `setup-viewer.js` passes the worker to Neuroglancer's `DataManagementContext`, which is patched (`patches/neuroglancer@2.41.2.patch`) to accept an injected worker instead of constructing one from a URL. The viewer takes ownership of the worker and terminates it on `viewer.dispose()`.

## Upgrading Neuroglancer

1. Bump `neuroglancer` here and in `@vitessce/neuroglancer`, and rename the patch / `patchedDependencies` entry to the new version (re-apply with `pnpm patch` if `lib/data_management_context.js` changed).
2. Run `pnpm run build`. The build fails loudly if the async worker construction in `lib/async_computation/request.js` changed shape, or if any `import.meta` reference survives bundling.
