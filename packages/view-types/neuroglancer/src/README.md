# neuroglancer view

This view is powered by neuroglancer.
Here, we provide developer-facing documentation on working with Neuroglancer and its `viewerState`:

## viewerState

### Camera position (zoom, translation, rotation)

The following properties in the viewerState control the camera:

- `viewerState.position`
- `viewerState.projectionScale`
- `viewerState.projectionOrientation`

The complete viewerState schema is available in the [Neuroglancer documentation](https://neuroglancer-docs.web.app/json/api/index.html).

## Mesh format

See the Neuroglancer documentation to learn about the [precomputed multi-resolution mesh format](https://github.com/google/neuroglancer/blob/master/src/datasource/precomputed/meshes.md#multi-resolution-mesh-format).

## Points format



## Converting a SpatialData object to the Neuroglancer data formats

Use [tissue-map-tools](https://github.com/hms-dbmi/tissue-map-tools) to convert data from a SpatialData object to the mesh and point formats that are compatible with Neuroglancer.