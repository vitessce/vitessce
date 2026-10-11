---
id: js-annotations
title: Annotation features
---

The `vitessce` package exports utility functions for adding annotation features to a view config at runtime, such as when an application toggles between an "editing" mode and an "annotating" mode.

## Utility functions

Each of these functions takes a view config object (JSON). Functions that return a config return a new object; the input config is not modified.

- `hasAnnotationControllerView(config)`: Returns `true` if the layout contains an `annotationController` view.
- `addAnnotationControllerView(config, options?)`: Adds an `annotationController` view in a new column on the right side of the grid, and scales the existing views to fit in the remaining columns. Options: `width` (grid columns, default `3`), `uid` (default `'annotation-controller'`), `closeButtonVisible`.
- `removeAnnotationControllerView(config)`: Removes all `annotationController` views, and stretches the remaining views to fill the width of the grid.
- `hasAnyAnnotationStory(config)`: Returns `true` if any `annotationStory` coordination value contains at least one frame.
- `isAnyAnnotationEditing(config)`: Returns `true` if any `annotationEditable` coordination value is `true`.
- `enableAnnotationEditing(config)`: Sets all `annotationEditable` coordination values to `true`. Views that support `annotationEditable` but are not yet mapped to a scope for it are mapped to a shared scope. The config must contain an `annotationController` view.
- `disableAnnotationEditing(config)`: Same as `enableAnnotationEditing`, but sets the values to `false`.

```js
import {
  hasAnnotationControllerView,
  addAnnotationControllerView,
  removeAnnotationControllerView,
  hasAnyAnnotationStory,
  isAnyAnnotationEditing,
  enableAnnotationEditing,
  disableAnnotationEditing,
} from 'vitessce';
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
