---
id: upgrade-guide
title: Upgrade Guide
---

This guide describes how to upgrade from one major version of the `vitessce` JavaScript package to the next.

## v3 to v4

### React 19

Vitessce v4 is built against React 19.

- React 18.3+ is required for 2D views.
- React 19 is required for 3D / spatial / VR (XR) views, because Vitessce now uses
  `@react-three/fiber` v9, which only supports React 19.
- React 16 and 17 are no longer supported.

If your app still uses the legacy `ReactDOM.render`, switch to `createRoot`:

```diff
- import ReactDOM from 'react-dom';
- ReactDOM.render(<Vitessce {...props} />, document.getElementById('root'));
+ import { createRoot } from 'react-dom/client';
+ createRoot(document.getElementById('root')).render(<Vitessce {...props} />);
```

For further React upgrade information, see the [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).
### Three.js and React Three Fiber peer dependencies

The following information is only relevant for Vitessce users who use the ThreeJS-based `spatial-three` or `spatial-accelerated` views for 3D volumetric and mesh rendering (which includes users of [Vitessce Link](https://vitessce.link/about) and its VR rendering features). Users who only rely on the DeckGL- and Neuroglancer-based 3D rendering functionality in Vitessce can ignore this section.


Previously, `three` and the `@react-three/*` packages were bundled into Vitessce.
In v4 they are **peer dependencies**, so that a single copy is shared with your
application. (Multiple copies of `@react-three/fiber` cause runtime errors such as
`"R3F: Hooks can only be used within the Canvas component!"`.)

If you use the ThreeJS-based functionality, install the required dependencies alongside
Vitessce:

```sh
npm install three @react-three/fiber @react-three/drei
# Only if you use VR / XR views:
npm install @react-three/xr
```

Recommended versions (with React 19):

| Package | Version |
| --- | --- |
| `three` | `>=0.159.0` |
| `@react-three/fiber` | `^9.0.0` |
| `@react-three/drei` | `^10.0.0` |
| `@react-three/xr` | `^6.0.0` |

If you already had `three` / `@react-three/fiber` installed, bump them to these
versions. Note that `@react-three/fiber` v9 requires React 19. For more details, visit the [react-three-fiber documentation](https://r3f.docs.pmnd.rs/getting-started/introduction).

If you only use 2D views, you do **not** need to install these packages. The 3D
code is loaded lazily; when the peer dependencies are absent, the 3D view shows a
fallback message instead of crashing.

## v2 to v3


### Global plugin registration

In v2, we provided a global plugin registration API (`registerPluginViewType`, `registerPluginFileType`, etc).
This registration mechanism had several drawbacks:
- It used `window` which complicates usage of Vitessce in server-side rendering situations (e.g., NextJS) where `window` is not available.
- It prevented usage of multiple `<Vitessce/>` components on the same page with different plugins registered for each component.

If you still need this type of global plugin registration functionality, it can be implemented in userland:

```js
import React from 'react';
import {
  Vitessce,
  PluginFileType, PluginViewType, PluginCoordinationType, PluginJointFileType,
} from 'vitessce';

const PLUGINS = {
  viewTypes: [], coordinationTypes: [], fileTypes: [], jointFileTypes: [],
};

/**
 * @param {PluginViewType} pluginObj
 */
export function registerPluginViewType(pluginObj) {
  PLUGINS.viewTypes.push(pluginObj);
}

/**
 * @param {PluginCoordinationType} pluginObj
 */
export function registerPluginCoordinationType(pluginObj) {
  PLUGINS.coordinationTypes.push(pluginObj);
}

/**
 * @param {PluginFileType} pluginObj
 */
export function registerPluginFileType(pluginObj) {
  PLUGINS.fileTypes.push(pluginObj);
}

/**
 * @param {PluginJointFileType} pluginObj
 */
export function registerPluginJointFileType(pluginObj) {
  PLUGINS.jointFileTypes.push(pluginObj);
}

// React component which wraps <Vitessce/>
// to provide the globally-registered plugins via props.
export function VitessceWithGlobalPlugins(props) {
  return (
    <Vitessce
      {...props}
      pluginViewTypes={PLUGINS.viewTypes}
      pluginFileTypes={PLUGINS.fileTypes}
      pluginJointFileTypes={PLUGINS.jointFileTypes}
      pluginCoordinationTypes={PLUGINS.coordinationTypes}
    />
  );
}
```

### Fully-resolved JS imports

If you were previously importing from the package using a full JS filepath, it may need to be updated.


```diff
import React from 'react';
// highlight-start
- import { Vitessce } from 'vitessce/dist/index.min.mjs';
+ import { Vitessce } from 'vitessce/dist/index.min.js';
// highlight-end
```

For background, we corrected the previous lack of `"type": "module"` in the published `package.json`, meaning that Vite then uses the `.js` extension rather than `.mjs` for the ESM bundle.



## v1 to v2

Breaking changes involve the contents of the `dist` directory that is published to NPM.

### CSS imports

The explicit CSS import needs to be removed.
This import will fail in v2.

```js
import React from 'react';
import { Vitessce } from 'vitessce';
// highlight-start
import 'vitessce/dist/es/production/static/css/index.css';
// highlight-end
```

### Fully-resolved JS imports

If you were previously importing from the package using a full JS filepath, it may need to be updated.

```js
import React from 'react';
// highlight-start
import { Vitessce } from 'vitessce/dist/something.js';
// highlight-end
```

View the contents of the `dist/` directory in local `node_modules` or browse on Unpkg:
- https://unpkg.com/browse/vitessce@1.2.2/dist/
- https://unpkg.com/browse/vitessce@2.0.3/dist/

### Deprecation of certain constant keys

The keys for certain [constants](/docs/constants/) within `ViewType`, `DataType`, and `CoordinationType` were deprecated.
(The top-level variables `ViewType`, `DataType`, and `CoordinationType` were **not** deprecated.)
See the [blog post](/blog/obs-by-feature-update/) for the motivation behind this change.

In v2, the old constants are still exported for backwards compatibility, as they remain useful when defining view configs corresponding to previous schema versions.
However, instead of implementing them using plain JS objects, deprecated constants are exposed via [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which log deprecation warnings in the console when accessed.

For example, accessing `CoordinationType.CELL_COLOR_ENCODING` logs a warning that it is deprecated in favor of `CoordinationType.OBS_COLOR_ENCODING`.

### VitessceConfig constructor calls

The [constructor](/docs/view-config-js/#constructor-schemaversion-name-description-) in v2 takes named arguments via an object.
If you have existing code that calls the constructor and would like to keep the previous behavior:
`"1.0.7"` was the schema version that was previously hard-coded internally.

```diff
- const vc = new VitessceConfig("My config");
+ const vc = new VitessceConfig({ schemaVersion: "1.0.7", name: "My config" });
```

### VitessceConfigDataset addFile calls

The [`addFile`](/docs/view-config-js/#addfile-url-filetype-coordinationvalues-options-) method now accepts named arguments via an object.
Data type is no longer a required argument.
A new named `coordinationValues` argument can be passed.

```diff
- dataset.addFile('http://example.com/my_cells.json', dt.CELLS, ft.CELLS_JSON);
+ dataset.addFile({ url: 'http://example.com/my_cells.json', fileType: ft.CELLS_JSON });
```

### Label override props

Previously, overrides for `cell` and `gene` terminology could be configured via props:

```js
...,
layout: [
  {
    component: 'heatmap',
    props: {
      observationsLabelOverride: 'spot',
      variablesLabelOverride: 'antigen',
    },
    ...
  },
],
...

```

Now, the coordination types `obsType` and `featureType` must be used for this purpose instead.


### Previously-documented file types

While still supported by Vitessce, the following file types have been removed from the documentation, as we do not encourage their use in new code:

- `cells.json`
- `molecules.json`
- `anndata-cells.zarr`
- `anndata-expression-matrix.zarr`
- `anndata-cell-sets.zarr`
- `genes.json`
- `clusters.json`

If you are still using these file types in your configurations, please look back to an [older version of the documentation](https://github.com/vitessce/vitessce/blob/main/DOCS.md).
