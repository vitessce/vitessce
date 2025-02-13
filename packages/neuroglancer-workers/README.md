We want to inline worker scripts to make the package more portable (i.e., not dependent on relative worker URLs).

Using typescript alone does not allow us to do this: we need a build step to do it for us.

We can use rollup and [rollup-plugin-web-worker-loader](https://github.com/darionco/rollup-plugin-web-worker-loader) to perform this build step.

```sh
pnpm run build
```

## Neuroglancer Workers

The authors of `react-neuroglancer` suggest to copy workers from `neuroglancer` during a consumer application's bundling: https://github.com/neuroglancerhub/react-neuroglancer/issues/37#issuecomment-2576251703

However, we want to inline worker code to avoid passing the burden of setting up workers onto the consumers of Vitessce.
See `@vitessce/workers` for an example of how we have previously done this for custom worker scripts for the heatmap view.