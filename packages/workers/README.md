We want to inline worker scripts to make the package more portable (i.e., not dependent on relative worker URLs).

Using typescript alone does not allow us to do this: we need a build step to do it for us.

We can use rollup and [rollup-plugin-web-worker-loader](https://github.com/darionco/rollup-plugin-web-worker-loader) to perform this build step.

```sh
pnpm run build
```