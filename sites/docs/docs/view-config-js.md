---
id: view-config-js
title: View Configs via JS API
sidebar_label: View Configs via JS API
slug: /view-config-js
---

## Overview

The Vitessce view config defines how data is retrieved, which views are rendered, and how different views are coordinated.
Ultimately, this configuration must be a JSON object when it is passed to the `<Vitessce/>` React component's [`config`](/docs/js-react-vitessce/#config) prop.

Writing large JSON objects by hand can be difficult and prevents from using variables for more easily maintainable string constants, so we have developed object-oriented APIs to simplify this process. There are corresponding APIs in [Python](https://python-docs.vitessce.io/) and [R](https://r-docs.vitessce.io/) if one of those languages is more familiar to you.

## `VitessceConfig`

`VitessceConfig` is a class representing a Vitessce view config. To begin creating a view config with the API, you will need to instantiate a `VitessceConfig` object.
The methods of this object (and the objects its methods return) allow you to manipulate the underlying configuration.
When you are ready to render the Vitessce component, you can use the `.toJSON()` method to translate the `VitessceConfig` object to a plain JSON object.


### `constructor({ schemaVersion, name, description })`

Construct a Vitessce view config object.


#### Parameters:
- `params` (`object`) - An object with named arguments.
- `params.schemaVersion` (`string`) - The JSON schema version. Required.
- `params.name` (`string`) - A name for the view config. Required.
- `params.description` (`string|undefined`) - A description for the view config. Optional.

```js {3}
import { VitessceConfig } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
```


### `addDataset(name)`

Add a dataset to the config.

#### Parameters:
- `name` (`string`) - A name for the dataset.

#### Returns:
- Type: `VitessceConfigDataset`

Returns the instance for the new dataset.


```js {4}
import { VitessceConfig, DataType as dt, FileType as ft } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset")
    .addFile({
        url: "http://example.com/my-cell-coordinates.csv",
        fileType: ft.OBS_LOCATIONS_CSV,
        coordinationValues: { obsType: 'cell' },
    });
```


### `addView(dataset, viewType, extra)`

Add a view to the config.

#### Parameters:
- `dataset` (`VitessceConfigDataset`) - A dataset instance to be used for the data visualized in this view.
- `viewType` (`string`) - A view type name. A full list of view types can be found on the [view types](/docs/components/) documentation page. We recommend using the [`ViewType`](/docs/constants/#view-types) constant values rather than writing strings directly.
- `extra` (`object`) - An optional object with extra parameters.
    - `mapping` (`string`) - A convenience parameter for setting the `embeddingType` coordination scope value. This parameter is only applicable when adding the `scatterplot` view. Optional.
    - `x` (`number`) - The horizontal position of the view. Must be an integer between 0 and 11. Optional.
    - `y` (`number`) - The vertical position of the view. Must be an integer between 0 and 11. Optional.
    - `w` (`number`) - The width of the view. Must be an integer between 1 and 12. Optional.
    - `h` (`number`) - The height of the view. Must be an integer between 1 and 12. Optional.

#### Returns:
- Type: `VitessceConfigView`

Returns the instance for the new view.

```js {5-6}
import { VitessceConfig, ViewType as vt } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SCATTERPLOT, { mapping: "X_umap" });
```


### `linkViews(views, cTypes, cValues)`

A convenience function for setting up new coordination scopes across a set of views.

#### Parameters:
- `views` (`VitessceConfigView[]`) - An array of view objects to coordinate together.
- `cTypes` (`string[]`) - The coordination types on which to coordinate the views. We recommend using the [`CoordinationType`](/docs/coordination-types/#constants) constant values rather than writing strings directly.
- `cValues` (`array`) - Initial values for each coordination type. Should have the same length as the `cTypes` array. Optional.

#### Returns:
- Type: `VitessceConfig`

Returns `this` to allow chaining.

```js {7-11}
import { VitessceConfig, ViewType as vt, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
vc.linkViews(
    [v1, v2],
    [ct.SPATIAL_ZOOM, ct.SPATIAL_TARGET_X, ct.SPATIAL_TARGET_Y],
    [2, 0, 0]
);
```


### `layout(viewConcat)`

Create a multi-view layout based on (potentially recursive) view concatenations.

#### Parameters:
- `viewConcat` (`VitessceConfigViewHConcat` or `VitessceConfigViewVConcat` or `VitessceConfigView`) - Views arranged by concatenating vertically or horizontally. Alternatively, a single view can be passed.

#### Returns:
- Type: `VitessceConfig`

Returns `this` to allow chaining.

```js {8}
import { VitessceConfig, ViewType as vt, hconcat, vconcat } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
const v3 = vc.addView(dataset, vt.SPATIAL);
vc.layout(hconcat(v1, vconcat(v2, v3)));
```


### `addCoordination(...cTypes)`

Add scope(s) for new coordination type(s) to the config. See also `VitessceConfig.linkViews()`.

#### Parameters:
- `...cTypes` (variable number of `string`) - A variable number of coordination types. We recommend using the [`CoordinationType`](/docs/coordination-types/#constants) constant values rather than writing strings directly.

#### Returns:
- Type: `VitessceConfigCoordinationScope[]`

Returns the instances for the new scope objects corresponding to each coordination type. These can be linked to views via the `VitessceConfigView.useCoordination()` method.

```js {7-11}
import { VitessceConfig, ViewType as vt, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
const [zoomScope, xScope, yScope] = vc.addCoordination(
    ct.SPATIAL_ZOOM,
    ct.SPATIAL_TARGET_X,
    ct.SPATIAL_TARGET_Y,
);
v1.useCoordination(zoomScope, xScope, yScope);
v2.useCoordination(zoomScope, xScope, yScope);
zoomScope.setValue(2);
xScope.setValue(0);
yScope.setValue(0);
```

### `addCoordinationByObject(obj)`

Set up the initial values for multi-level coordination in the coordination space.
Get a reference to these values to pass to the `useCoordinationByObject` method
of either view or meta coordination scope instances.

#### Parameters:
- `obj` (`object`) - A (potentially nested) object with coordination types as keys
and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
instance, or a `CoordinationLevel` instance.
The `CL` function takes an array of objects as its argument, and returns a `CoordinationLevel`
instance, to support nesting.

#### Returns:
- Type: `object`

A (potentially nested) object with coordination types as keys and values
being either { scope }, { scope, children }, or an array of these. Not intended to be
manipulated before being passed to a `useCoordinationByObject` function.

```js {10-28}
import { VitessceConfig, CoordinationLevel as CL, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.16", name: "My config" });
const dataset = vc.addDataset("My dataset").addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
    coordinationValues: { [ct.FILE_UID]: 'AF' },
});

const imageScopes = vc.addCoordinationByObject({
    [ct.IMAGE_LAYER]: CL([
        {
            [ct.FILE_UID]: 'AF',
            [ct.SPATIAL_LAYER_OPACITY]: 1,
            [ct.SPATIAL_LAYER_VISIBLE]: true,
            [ct.PHOTOMETRIC_INTERPRETATION]: 'BlackIsZero',
            [ct.IMAGE_CHANNEL]: CL([
                {
                    [ct.SPATIAL_TARGET_C]: 0,
                    [ct.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
                    [ct.SPATIAL_CHANNEL_VISIBLE]: true,
                    [ct.SPATIAL_CHANNEL_OPACITY]: 1.0,
                    [ct.SPATIAL_CHANNEL_WINDOW]: null,
                },
            ]),
        },
    ]),
});

const metaCoordinationScope = vc.addMetaCoordination();
metaCoordinationScope.useCoordinationByObject(imageScopes);

const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
v1.useMetaCoordination(metaCoordinationScope);
v2.useMetaCoordination(metaCoordinationScope);
```

### `linkViewsByObject(views, obj, [options])`

Convenience function to simultaneously set up the initial values for multi-level coordination in the coordination space
and link an array of views on the resulting coordination scopes.

#### Parameters:
- `views` (`VitessceConfigView[]`) - Array of one or more view instances.
- `obj` (`object`) - A (potentially nested) object with coordination types as keys
and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
instance, or a `CoordinationLevel` instance.
The `CL` function takes an array of objects as its argument, and returns a `CoordinationLevel`
instance, to support nesting.
Internally, this will be passed to `VitessceConfig.addCoordinationByObject`.
- `options` (`object|null`) - An optional parameter to supply an object containing additional options.
- `options.meta` (`boolean`) - Whether or not to use meta-coordination. Optional. By default, `true`.
- `options.scopePrefix` (`string|null`) - A prefix to prepend to coordination scope names that are added by this function. Optional.

#### Returns:
- Type: `VitessceConfig`

Returns `this` to allow chaining.

```js {13-22}
import { VitessceConfig, CoordinationLevel as CL, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.16", name: "My config" });
const dataset = vc.addDataset("My dataset").addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
    coordinationValues: { [ct.FILE_UID]: 'AF' },
});

const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);

vc.linkViewsByObject([v1, v2], {
    [ct.IMAGE_LAYER]: CL([
        {
            [ct.FILE_UID]: 'AF',
            [ct.SPATIAL_LAYER_OPACITY]: 1,
            [ct.SPATIAL_LAYER_VISIBLE]: true,
            [ct.PHOTOMETRIC_INTERPRETATION]: 'RGB',
        },
    ]),
});
```



### `addMetaCoordination()`

Add a meta-coordination scope to the config.


#### Returns:
- Type: `VitessceConfigMetaCoordinationScope`

Returns an instance for the new meta-scope object. This can be linked to views via the `VitessceConfigView.useMetaCoordination()` method. See above code snippet for `addCoordinationByObject` method for an example.



### `toJSON()`

Convert the view config instance to a JSON object.

#### Returns:
- Type: `object`

Returns the config instance as a JSON object.

```js {6}
import { VitessceConfig, ViewType as vt } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
vc.layout(vc.addView(dataset, vt.SPATIAL));
const vcJson = vc.toJSON();
```


### `static fromJSON(config)`

Static method to construct a view config instance from an existing JSON config.

#### Parameters:
- `config` (`object`) - A view config as a JSON object.

#### Returns:
- Type: `VitessceConfig`

Returns the config instance.

```js {4}
import { VitessceConfig } from 'vitessce';
import myConfig from './my-config.json';

const vc = VitessceConfig.fromJSON(myConfig);
```


## `hconcat`

Helper function to allow horizontal concatenation of views in the Vitessce grid layout.

```js {7}
import { VitessceConfig, ViewType as vt, hconcat } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
vc.layout(hconcat(v1, v2));
```

### Visual Examples

- Split grid in half horizontally
    ```js
    hconcat(v1, v2)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
                <td>v2</td>
            </tr>
        </tbody>
    </table>

- Split grid in thirds horizontally
    ```js
    hconcat(v1, v2, v3)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
                <td>v2</td>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Split grid in half horizontally and in half again vertically on right side
    ```js
    hconcat(v1, vconcat(v2, v3))
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td rowSpan="2">v1</td>
                <td>v2</td>
            </tr>
            <tr>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Use a nested `hconcat` to split in half on left side and fourths on right side (top row).
    ```js {2}
    vconcat(
        hconcat(v1, hconcat(v2, v3)),
        hconcat(v4, v5, v6, v7)
    )
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td colSpan="2">v1</td>
                <td>v2</td>
                <td>v3</td>
            </tr>
            <tr>
                <td>v4</td>
                <td>v5</td>
                <td>v6</td>
                <td>v7</td>
            </tr>
        </tbody>
    </table>


## `vconcat`

Helper function to allow vertical concatenation of views in the Vitessce grid layout.

```js {7}
import { VitessceConfig, ViewType as vt, vconcat } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, vt.SPATIAL);
const v2 = vc.addView(dataset, vt.SPATIAL);
vc.layout(vconcat(v1, v2));
```

### Visual Examples

- Split grid in half vertically
    ```js
    vconcat(v1, v2)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
            </tr>
            <tr>
                <td>v2</td>
            </tr>
        </tbody>
    </table>

- Split grid in thirds horizontally
    ```js
    vconcat(v1, v2, v3)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
            </tr>
            <tr>
                <td>v2</td>
            </tr>
            <tr>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Split grid in half horizontally and in half again vertically on right side
    ```js
    vconcat(v1, hconcat(v2, v3))
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td colSpan="2">v1</td>
            </tr>
            <tr>
                <td>v2</td>
                <td>v3</td>
            </tr>
        </tbody>
    </table>


- Use a nested `vconcat` to split in half on top and fourths on bottom (left column).
    ```js {2}
    hconcat(
        vconcat(v1, vconcat(v2, v3)),
        vconcat(v4, v5, v6, v7)
    )
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td rowSpan="2">v1</td>
                <td>v4</td>
            </tr>
            <tr>
                <td>v5</td>
            </tr>
            <tr>
                <td>v2</td>
                <td>v6</td>
            </tr>
            <tr>
                <td>v3</td>
                <td>v7</td>
            </tr>
        </tbody>
    </table>

## `VitessceConfigDataset`

`VitessceConfigDataset` is a class used to represent a dataset (i.e. list of files containing common biological entities) in the Vitessce view config.

This class is not meant to be instantiated directly, but instances will be created and returned by the `VitessceConfig.addDataset()` method.

### `addFile({ url, fileType, coordinationValues, options })`

#### Parameters:
- `params` (`object`) - An object with named arguments.
- `params.url` (`string|undefined`) - The URL for the file, pointing to either a local or remote location. We don't associate any semantics with URL strings.
- `params.fileType` (`string`) - The file type. We recommend using the [`FileType`](/docs/data-types-file-types/#constants) constant values rather than writing strings directly.
- `params.coordinationValues` (`object|undefined`) An object defining the coordination values such as `obsType` and `featureType` which allow mapping between views to files.
- `params.options` (`object|array|undefined`) -  An object or array which may provide additional parameters to the loader class corresponding to the specified `fileType`.

#### Returns:
- Type: `VitessceConfigDataset`

Returns `this` to allow chaining.

```js {5-9}
import { VitessceConfig, DataType as dt, FileType as ft } from 'vitessce';

const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });
const dataset = vc.addDataset("My dataset")
    .addFile({
        url: "http://example.com/my-cell-coordinates.csv",
        fileType: ft.OBS_LOCATIONS_CSV,
        coordinationValues: { obsType: 'cell' }
    });
```

## `VitessceConfigView`

`VitessceConfigView` is a class used to represent a view in the Vitessce view config layout.

This class is not meant to be instantiated directly, but instances will be created and returned by the `VitessceConfig.addView()` method.

### `useCoordination(...cScopes)`

Attach coordination scopes to this view instance. All views using the same coordination scope for a particular coordination type will effectively be linked together.

#### Parameters:
- `...cScopes` (variable number of `VitessceConfigCoordinationScope`) - A variable number of coordination scope instances.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.


### `useCoordinationByObject(obj)`

Attach potentially multi-level coordination scopes to this view.

#### Parameters:
- `obj` (`object`) - A value returned by `VitessceConfig.addCoordinationByObject`. Not intended to be a manually-constructed object.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.


### `useMetaCoordination(metaScope)`

Attach coordination scopes to this view instance. All views using the same coordination scope for a particular coordination type will effectively be linked together.

#### Parameters:
- `metaScope` (`VitessceConfigMetaCoordinationScope`) - A meta coordination scope instance, such as the return value of `VitessceConfig.addMetaCoordination`.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

### `setProps(props)`

Set extra props for this view. Mostly for debugging.

#### Parameters:
- `props` (`object`) - The props as a JSON object.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

### `setXYWH(x, y, w, h)`

Set the x, y, w, h values for this view. This method can be used in place of calling `VitessceConfig.layout()` if more fine-grained control over the layout is required.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

## `VitessceConfigCoordinationScope`

Class representing a coordination scope in the coordination space.

### `setValue(cValue)`

Set the coordination value of the coordination scope.

#### Parameters:
- `cValue` (`any`) - The value to set.

#### Returns:
- Type: `VitessceConfigCoordinationScope`

Returns `this` to allow chaining.


## `VitessceConfigMetaCoordinationScope`

Class to represent a pair of `metaCoordinationScopes` and `metaCoordinationScopesBy` coordination scopes in the coordination space.

This class is not meant to be instantiated directly, but instances will be created and returned by the `VitessceConfig.addMetaCoordination()` method.

### `useCoordination(...cScopes)`

Attach coordination scopes to this meta-scopes instance.

#### Parameters:
- `...cScopes` (variable number of `VitessceConfigCoordinationScope`) - A variable number of coordination scope instances.

#### Returns:
- Type: `VitessceConfigMetaCoordinationScope`

Returns `this` to allow chaining.


### `useCoordinationByObject(obj)`

Attach potentially multi-level coordination scopes to this meta-scopes instance.

#### Parameters:
- `obj` (`object`) - A value returned by `VitessceConfig.addCoordinationByObject`. Not intended to be a manually-constructed object.

#### Returns:
- Type: `VitessceConfigMetaCoordinationScope`

Returns `this` to allow chaining.


## `CoordinationLevel`

Function to enable configuration of multi-level coordination. Acts as a flag to indicate that values in the object passed to `VitessceConfig.addCoordinationByObject()` are a new level of coordination objects (as opposed to a coordination value for the coordination type key). Alias the import as `CL` for brevity.

```js
import { CoordinationLevel as CL } from 'vitessce';
```