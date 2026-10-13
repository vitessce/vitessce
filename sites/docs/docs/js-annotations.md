---
id: js-annotations
title: Annotation features
---

The `vitessce` package exports utility functions for adding annotation features to a view config at runtime, such as when an application toggles between an "editing" mode and an "annotating" mode.

## Utility functions

Each of these functions takes a view config object (JSON). Functions that return a config return a new object; the input config is not modified.

In the examples below, `config` is a view config object (e.g., the result of [`VitessceConfig.toJSON()`](/docs/view-config-js/#tojson)).


### `hasAnnotationControllerView(config)`

Detect whether an `annotationController` view already exists in a view config.

#### Parameters:
- `config` (`object`) - A view config object (JSON).

#### Returns:
- Type: `boolean`

Returns `true` if the layout contains an `annotationController` view.

```js {3}
import { hasAnnotationControllerView } from 'vitessce';

const hasController = hasAnnotationControllerView(config);
```


### `addAnnotationControllerView(config, options)`

Append an `annotationController` view to a view config.
The `annotationController` is placed in a column on the right side of the grid, with a height equal to that of the tallest column of existing views.
The existing views are scaled horizontally to fit into the remaining columns.
The left and right edges of each view are rounded to whole columns, so that views which were adjacent remain adjacent.
If existing views are mapped to `annotationStory`, `annotationFrameIndex`, or `annotationOverlayVisible` coordination scopes, the `annotationController` is mapped to the same scopes.

#### Parameters:
- `config` (`object`) - A view config object (JSON).
- `options` (`object`) - An optional object with extra parameters.
    - `width` (`number`) - The width of the `annotationController` view, in grid columns. Must be an integer between 1 and 11. By default, `3`. Optional.
    - `uid` (`string`) - The preferred `uid` for the `annotationController` view. If this `uid` is already used by another view, a numeric suffix is appended (e.g., `'annotation-controller-1'`). By default, `'annotation-controller'`. Optional.
    - `closeButtonVisible` (`boolean`) - The value of the `closeButtonVisible` prop of the new view. If not provided, the view's default is used. Optional.

#### Returns:
- Type: `object`

Returns the new view config.
Throws an error if `options.width` is not an integer between 1 and 11.

```js {3-6}
import { addAnnotationControllerView } from 'vitessce';

const nextConfig = addAnnotationControllerView(config, {
    width: 4,
    closeButtonVisible: false,
});
```


### `removeAnnotationControllerView(config)`

Remove all `annotationController` views from a view config.
Grid columns that are no longer occupied by any view (e.g., the column previously occupied by the `annotationController`) are removed, and the remaining views are stretched horizontally to fill the full width of the grid.
Coordination scopes and values are not modified.

#### Parameters:
- `config` (`object`) - A view config object (JSON).

#### Returns:
- Type: `object`

Returns the new view config.

```js {3}
import { removeAnnotationControllerView } from 'vitessce';

const nextConfig = removeAnnotationControllerView(config);
```


### `hasAnyAnnotationStory(config)`

Detect whether a view config contains a non-empty annotation story, i.e., whether any `annotationStory` coordination value (in any coordination scope, or defined directly by any view) contains at least one frame.

#### Parameters:
- `config` (`object`) - A view config object (JSON).

#### Returns:
- Type: `boolean`

Returns `true` if any `annotationStory` value is non-empty.

```js {3}
import { hasAnyAnnotationStory } from 'vitessce';

const hasStory = hasAnyAnnotationStory(config);
```


### `isAnyAnnotationEditing(config)`

Detect whether annotation editing is enabled anywhere in a view config, i.e., whether any `annotationEditable` coordination value (in any coordination scope, or defined directly by any view) is `true`.

#### Parameters:
- `config` (`object`) - A view config object (JSON).

#### Returns:
- Type: `boolean`

Returns `true` if any `annotationEditable` value is `true`.

```js {3}
import { isAnyAnnotationEditing } from 'vitessce';

const isEditing = isAnyAnnotationEditing(config);
```


### `enableAnnotationEditing(config)`

Enable annotation editing, by setting all `annotationEditable` coordination values in the view config to `true` (in all coordination scopes, and in values defined directly by views).
Views which support `annotationEditable` (including the `annotationController`) but are not yet mapped to a scope for it are mapped to a shared `annotationEditable` scope.

#### Parameters:
- `config` (`object`) - A view config object (JSON). Must contain an `annotationController` view.

#### Returns:
- Type: `object`

Returns the new view config.
Throws an error if the config does not contain an `annotationController` view.

```js {6}
import { hasAnnotationControllerView, addAnnotationControllerView, enableAnnotationEditing } from 'vitessce';

const configWithController = hasAnnotationControllerView(config)
    ? config
    : addAnnotationControllerView(config);
const nextConfig = enableAnnotationEditing(configWithController);
```


### `disableAnnotationEditing(config)`

Disable annotation editing, by setting all `annotationEditable` coordination values in the view config to `false` (in all coordination scopes, and in values defined directly by views).
Views which support `annotationEditable` (including the `annotationController`) but are not yet mapped to a scope for it are mapped to a shared `annotationEditable` scope.

#### Parameters:
- `config` (`object`) - A view config object (JSON). Must contain an `annotationController` view.

#### Returns:
- Type: `object`

Returns the new view config.
Throws an error if the config does not contain an `annotationController` view.

```js {3}
import { disableAnnotationEditing } from 'vitessce';

const nextConfig = disableAnnotationEditing(config);
```

## The `areAnnotationsEditable` prop

The [`<Vitessce/>`](/docs/js-react-vitessce) component accepts an `areAnnotationsEditable` prop (by default, `true`).
Views only allow editing annotations when both this prop and the `annotationEditable` coordination value are `true`.
The prop lets the parent application turn off editing in all views, whatever the coordination values in the config say.

## Usage pattern

Render `<Vitessce/>` as a controlled component: store the config in React state and update it from `onConfigChange`.
When updating the config with the utility functions:

- Set `remountOnUidChange={false}`, so that changing the config `uid` does not remount the views (which would reset their state).
- Give the new config a new `uid` value. Vitessce uses `config.uid` to detect that the config has changed.

```jsx
function AnnotatableVitessce(props) {
  const { config: initialConfig } = props;
  const [config, setConfig] = useState(initialConfig);
  const [areAnnotationsEditable, setAreAnnotationsEditable] = useState(false);

  const handleAnnotating = useCallback(() => {
    const configWithController = hasAnnotationControllerView(config)
      ? config
      : addAnnotationControllerView(config, { closeButtonVisible: false });
    const nextConfig = enableAnnotationEditing(configWithController);
    setConfig({ ...nextConfig, uid: `annotating-${Date.now()}` });
    setAreAnnotationsEditable(true);
  }, [config]);

  const handleEditing = useCallback(() => {
    let nextConfig = config;
    if (hasAnnotationControllerView(nextConfig)) {
      nextConfig = disableAnnotationEditing(nextConfig);
      // Keep the annotationController if there is a story to display.
      if (!hasAnyAnnotationStory(nextConfig)) {
        nextConfig = removeAnnotationControllerView(nextConfig);
      }
    }
    if (nextConfig !== config) {
      setConfig({ ...nextConfig, uid: `editing-${Date.now()}` });
    }
    setAreAnnotationsEditable(false);
  }, [config]);

  return (
    <>
      <Vitessce
        {...props}
        config={config}
        onConfigChange={setConfig}
        remountOnUidChange={false}
        areAnnotationsEditable={areAnnotationsEditable}
      />
      <button type="button" onClick={handleAnnotating}>Annotating</button>
      <button type="button" onClick={handleEditing}>Editing</button>
    </>
  );
}
```

See the full [`AnnotatableVitessce` source code](https://github.com/vitessce/vitessce/blob/main/sites/demo/src/vitessce-demo.jsx) in the demo site.
