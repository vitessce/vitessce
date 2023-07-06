# Monorepo organization and bundling practices

This repository is organized as a PNPM monorepo.
It contains:
- `packages/`: "sub-packages" (that are published to NPM as individual packages)
- `sites/`: web applications that consume the sub-packages
  - `sites/docs`: The documentation web app (corresponds to http://vitessce.io).
  - `sites/demo`: The development demo web app (corresponds to http://dev.vitessce.io).
  - `sites/html`: A plain HTML page that imports sub-packages for testing.
- `examples/`: packages that consume the sub-packages but are just used internally (e.g., for the demo or docs web apps; not published to NPM)

## Code transformation

This monorepo organization has implications for how code is "transformed".
We make a distinction between three different types of transformations of code: "build", "start", and "bundle".

### Build

- __When__: Build refers to a transformation step required for __development__ within the monorepo.
- __How__: This transformation is typically performed by running a `build` script (e.g., `pnpm run build`).
- __Why__: Build is meant to get the "raw" code (i.e., what we write and track with git) into a state where the sibling packages and development sites (in `sites/`) can consume it.

#### Non-standard imports

CSS and JSON imports like `import 'styles.css';` and `import dataStructure from 'file.json';` are not valid ESM, so try to avoid them.

For CSS, we use Material UI's [makeStyles](https://v4.mui.com/styles/api/#makestyles-styles-options-hook) to define styles.
[Global selectors](https://cssinjs.org/jss-plugin-global/) can be used to target CSS selectors defined by third parties.

For JSON, import from plain JS files rather than from `.json` files.

#### Build via `tsc`

With a few exceptions, we run `tsc --build` to build sub-packages. This transforms JSX -> JS and TS(X) -> JS.

While in theory we could use recursive PNPM script execution to run `tsc --build` in multiple sub-packages in parallel, in practice this is not very efficient.

Instead, we use TypeScript's [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) feature which allows running `tsc --build` once, from the root of the repo.
As a result, all sub-packages referenced from the root `tsconfig.json` get transformed at once.

The result of building with TypeScript should be located in `dist-tsc/`.

### Start

- __When__: Start refers to running Build plus re-running on code changes.
- __How__: This transformation is typically performed by running a `start` script (e.g., `pnpm run start`).
- __Why__: Hot-reloading during development.

In practice, this is achieved by:
- Running `tsc -b --watch` from the root of the repo to re-transform sub-packages
- Starting the web apps in `sites/docs` and `sites/demo` using their respective development scripts that support hot-reloading

#### Exceptions

The following sub-packages are exceptions to the above (i.e., there is not currently a hot-reload/watch option during development):
- `@vitessce/icons` in `packages/icons` uses a custom Vite configuration with `vite-plugin-svgr` to transform SVGs into React components.
- `@vitessce/workers` in `packages/workers` uses a custom Rollup configuration with `rollup-plugin-web-worker-loader` to transform web worker code into base64-encoded URLs that can be inlined.
- `@vitessce/dev` in `packages/main/dev` uses a Vite configuration so that its output is bundled during development.
- `@vitessce/prod` in `packages/main/prod` uses a Vite configuration so that its output is bundled during development, with the addition of minification.

### Bundle

- __When__: Bundle refers to running transforming code for publishing to NPM for consumption by other packages or applications.
- __How__: This transformation is typically performed by running a `bundle` script (e.g., `pnpm run bundle`).
- __Why__: When publishing to NPM, sub-packages need to be bundled with their dependencies (with the exceptions of React and ReactDOM which we externalize, as consumer React applications will have their own copies).

The result of bundling should be located in `dist/`.

#### End-to-end testing

We test that the bundles can be imported in different environments using Cypress. We simulate a consumer package installing bundled and `npm pack`-ed sub-packages in the `consumer/` directory by running the `script/consumer-install.sh` script after `pnpm run build && pnpm run bundle`.

#### Bundle size

For each sub-package, the total payload that is pushed to NPM during publishing must remain below 50 MB, as this is the limit beyond which CDNs like Unpkg will serve the contents.

## Changesets

We use changesets for automated management of changelogs and versioning/releases.

<a href="https://docs.google.com/drawings/d/1SOVlMQenNFR4s9Yw-1YvhoriNsaWPlpozVJd2CJK1Pg/edit?usp=sharing">
  <img src="https://docs.google.com/drawings/d/e/2PACX-1vRngHjctoUQnHxpZXVTK4mYomM097LKW7zJMFANwUEPWYEpX-T59UZQPOsiIcQC0a8Z_fjAIHs-i7WS/pub?w=1787&amp;h=1447">
</a>