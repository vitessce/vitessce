This package is the main `vitessce` package on NPM.
It exports the `<Vitessce/>` from `@vitessce/all` for backwards compatibility.

The source code and vite configuration can be found in `../dev/`.

The `@vitessce/dev` package.json does not contain its own `build` script, instead it gets built during the `build` script in this directory's package.json.

This is because the steps need to happen in the following order:
- clean up the prod/dist directory
- clean up the dev/dist directory
- compile dev/dist/index.js using `tsc`
- bundle dev/dist/index.X.js using `vite`
- bundle prod/dist/index.X.js using `vite`