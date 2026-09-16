---
name: vitessce-spatial-layers
description: Use when modifying logic involving spatial layers or channels. Spatial layers include images, segmentations, and points.
---

# Spatial layers and channels

Multiple views consume, render, or control spatially-resolved information:

- `spatialBeta` — renders 2D spatial data (with limited support for 3D).
- `layerControllerBeta` — the UI for the spatial coordination state
- For 3D data: `neuroglancer`, `spatial-three`, and `spatial-accelerated`.


`packages/view-types/spatial/` and `packages/view-types/layer-controller/` are **legacy** views
(with `spatialImageLayer` and `spatialSegmentationLayer` as their legacy coordination properties). Do not port changes into them, and do not read them for reference — the data models are
different.

## The layer/channel hierarchy

Multi-level coordination gives each layer (and, for images and segmentations, each channel within a
layer) its own set of coordination scopes. A list of which coordination type belongs
at which level is located in the **Multi-level coordination** section of `sites/docs/docs/coordination-types.mdx`
— update this list when needed.

| Layer type | Levels | Matched to a file by | Notes |
|---|---|---|---|
| `imageLayer` | layer → `imageChannel` | `fileUid` | Channel = one `c` index of a (multiscale) image |
| `segmentationLayer` | layer → `segmentationChannel` | layer: `fileUid`; channel: `obsType` | Bitmask or polygon (`obsSegmentationsType`) or mesh |
| `spotLayer` | layer only | `obsType` | Circles with a radius; Used for Visium assays |
| `pointLayer` | layer only | `obsType` | No radius; supports tiled loading; Used for FISH-like transcript points |

Per-observation state (`obsSetSelection`, `obsColorEncoding`, `featureSelection`, `obsHighlight`, …)
lives **at the channel level for segmentations** but **at the layer level for spots and points**,
because a spot/point layer has exactly one `obsType` while a segmentation layer can carry several
(one per bitmask/polygon channel). This asymmetry is the single biggest source of bugs here: check whether
you are inside a `layerScope` loop or a `(layerScope, channelScope)` loop before reading anything
obs-related.

### The scope name is the identity

`imageLayer`, `imageChannel`, `segmentationLayer`, `segmentationChannel`, `spotLayer`, and
`pointLayer` are all registered as `z.string().nullable()` in `packages/main/all/src/base-plugins.ts`. Nothing reads their coordination values; the **coordination
scope name** (e.g. `'imageLayerA'`) is what identifies the layer or channel, and it is the key of every
per-layer object in this codebase.

The one meaningful value is `null`: `useMultiCoordinationScopesNonNull` and
`useMultiCoordinationScopesSecondaryNonNull` drop any scope whose value is `null`, so setting a
layer or channel scope to `null` removes it from the view entirely. That is different from
`spatialLayerVisible: false`, which keeps the layer (and its controller row) but hides it.

## Reading the coordination state

Both subscribers open with the identical block; keep them in sync. Order of arguments matters.

```js
// Meta-coordination must be resolved first — every hook below takes the *computed* scopes.
const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

// Two-level: (secondaryType, primaryType, ...) — the channel type comes FIRST.
const [imageLayerScopes, imageChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
  CoordinationType.IMAGE_CHANNEL, CoordinationType.IMAGE_LAYER,
  coordinationScopes, coordinationScopesBy,
);
// One-level:
const spotLayerScopes = useMultiCoordinationScopesNonNull(
  CoordinationType.SPOT_LAYER, coordinationScopes,
);

// Values + setters, keyed by scope name.
const imageLayerCoordination = useComplexCoordination(
  [/* per-layer coordination types */], coordinationScopes, coordinationScopesBy,
  CoordinationType.IMAGE_LAYER,
);
const imageChannelCoordination = useComplexCoordinationSecondary(
  [/* per-channel coordination types */], coordinationScopes, coordinationScopesBy,
  CoordinationType.IMAGE_LAYER, CoordinationType.IMAGE_CHANNEL,
);
```

Access patterns, which appear verbatim hundreds of times:

```js
layerCoordination[0][layerScope].spatialLayerOpacity                 // value
layerCoordination[1][layerScope].setSpatialLayerOpacity(0.5)         // setter
channelCoordination[0][layerScope][channelScope].spatialChannelColor
channelCoordination[1][layerScope][channelScope].setSpatialChannelColor([255, 0, 0])
```

Both hooks fall back from fine-grained to coarse-grained: `useComplexCoordination` falls back to the
view-level scope for a parameter that has no per-layer mapping in `coordinationScopesBy`, and
`useComplexCoordinationSecondary` falls back to a flat `coordinationScopes[channelType]` array shared
by every layer. Relying on the fallback is fine for reading; do not depend on it when writing, since
a "per-channel" setter that fell back to a view-level scope will write to every layer at once.

The `[values, setters]` object identities change on **every render** (only the inner per-scope
objects are memoized). Never put `xLayerCoordination` in a `useMemo`/`useEffect` dependency array;
use `coordinationScopes` and `coordinationScopesBy` as indirect dependencies, as the existing hooks
do (with the `eslint-disable react-hooks/exhaustive-deps` comment explaining why).

## Loading the data

Each layer type has a `useMulti*` hook in `packages/vit-s/src/data-hooks.js` (layer-level) or
`data-hooks-multilevel.js` (channel-level). They build a `matchOn` object from the coordination
values and hand it to `useDataTypeMulti` / `use*MultiLevel`, so the returned object is keyed the same
way as the coordination objects:

| Hook | Keyed by | Match on |
|---|---|---|
| `useMultiImages` | `[layerScope]` | `fileUid` |
| `useMultiObsSegmentations` | `[layerScope]` | `fileUid` |
| `useMultiObsSpots` / `useMultiObsPoints` | `[layerScope]` | `obsType` |
| `useSegmentationMultiObsSets` / `…ObsLocations` / `…ObsFeatureMatrixIndices` / `…FeatureSelection` | `[layerScope][channelScope]` | `obsType` (+ `featureType`, `featureValueType`) |
| `useSpotMultiObsSets` / `useSpotMulti*`, `usePointMulti*` | `[layerScope]` | `obsType` |


Payload shapes worth knowing:

- Images: `imageData[layerScope].image.instance` is an `ImageWrapper`
  (`packages/utils/image-utils/src/ImageWrapper.ts`). Ask it for metadata rather than digging into
  viv loaders: `getModelMatrix()`, `getChannelNames()`, `getChannelIndex()`,
  `getNumChannels()`, `hasDimC/Z/T()`, `getNumZ/T()`, `isMultiResolution()`,
  `getMultiResolutionStats()`, `getAutoTargetResolution()`, `getBoundingCube()`, `isInterleaved()`,
  `getPhotometricInterpretation()`.
- Bitmask segmentations: `obsSegmentations[layerScope].obsSegmentations.instance` — also an
  `ImageWrapper`, with `obsSegmentationsType === 'bitmask'`.
- Polygon segmentations: `obsSegmentations[layerScope].obsSegmentations.data` is an array of polygons,
  with `obsSegmentationsType === 'polygon'`.

## Initial values from loaders

Loaders seed the whole hierarchy by returning `CoordinationLevel` objects in `coordinationValues`
(`CL` from `@vitessce/config`). Canonical example, `OmeZarrLoader.js`:

```js
const coordinationValues = {
  spatialTargetZ: imageWrapper.getDefaultTargetZ(),   // view-level, not per-layer
  spatialTargetT: imageWrapper.getDefaultTargetT(),
  imageLayer: CL([{
    fileUid: this.coordinationValues?.fileUid || null,
    spatialLayerVisible: true,
    spatialLayerOpacity: 1.0,
    photometricInterpretation: imageWrapper.getPhotometricInterpretation(),
    imageChannel: CL(channelCoordination),  // one object per channel, ≤ 5 by default
  }]),
};
```

`useDataTypeMulti` passes these to `mergeCoordination` with the prefix
`init_{datasetUid}_{dataType}_` (`getInitialCoordinationScopePrefix`), which expands `CL` into
`metaCoordinationScopes` + `metaCoordinationScopesBy` entries. Generated scope names are
deterministic so a config author can override any of them; existing (user-defined) scopes are never
overwritten, and generated meta-scopes are *prepended* so user meta-coordination wins. Loaders that
already do this: `OmeZarrLoader`, `OmeTiffLoader`, `*AsObsSegmentationsLoader`, `SpatialData*Loader`,
`ObsSpots*`/`ObsPoints*`/`ObsSegmentations*` loaders. Match one of them rather than inventing a shape.

## Authoring configs

Use `linkViewsByObject` with nested `CL` (see the doc comment on
`VitessceConfig.addCoordinationByObject`, which contains a full worked example):

```js
config.linkViewsByObject([spatialView, lcView], {
  imageLayer: CL([{
    fileUid: 'my-image',
    spatialLayerOpacity: 1,
    imageChannel: CL([
      { spatialTargetC: 0, spatialChannelColor: [255, 0, 0] },
      { spatialTargetC: 1, spatialChannelColor: [0, 255, 0] },
    ]),
  }]),
}, { meta: true });
```

`spatialTargetC` accepts a channel **name or index** (`z.number().or(z.string())`); always resolve it
through `ImageWrapper.getChannelIndex()` before passing it to viv. See
**vitessce-create-view-config** / **vitessce-modify-view-config** for the surrounding config rules.

### `scopePrefix`: overriding what the loader auto-initializes

Without it, `linkViewsByObject` names its new scopes with the usual `getNextScope` sequence (`A`,
`B`, …). Those names cannot collide with the loader's auto-generated names, so the config-defined
layer and the loader-initialized layer both survive the merge — you get **two** image layers where
you wanted one, with only one of them carrying your values.

`scopePrefix` swaps in `createPrefixedGetNextScopeNumeric(prefix)` for the duration of the call, so
every scope created by it is named `{prefix}0`, `{prefix}1`, …. Passing the loader's own prefix makes
the collision happen **on purpose**:

```js
import { CL, getInitialCoordinationScopePrefix } from '@vitessce/vit-s';

config.linkViewsByObject([spatialView, lcView], {
  imageLayer: CL({ photometricInterpretation: 'RGB' }),
}, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') }); // 'A' = the dataset UID
```

The prefix must match the loader exactly: `getInitialCoordinationScopePrefix(datasetUid, dataType)`,
where `dataType` is the loader's `DataType` (`'image'`, `'obsSegmentations'`, `'obsSpots'`,
`'obsPoints'`) — **not** the coordination type. Getting the dataset UID or the data type wrong fails
silently in exactly the duplicated-layer way described above.

Use one `linkViewsByObject` call per prefix. Two calls sharing a prefix restart the numbering from
`{prefix}0` and would overwrite each other's scopes.

## Adding a per-layer or per-channel coordination type

1. `packages/constants-internal/src/constants.ts` — the `CoordinationType` constant.
2. `packages/main/all/src/base-plugins.ts` — `new PluginCoordinationType(type, default, zodSchema)`.
3. `packages/constants-internal/src/coordination.ts` — add to `COMPONENT_COORDINATION_TYPES` for
   **both** `ViewType.SPATIAL_BETA` and `ViewType.LAYER_CONTROLLER_BETA`.
4. Add it to the matching `useComplexCoordination` / `useComplexCoordinationSecondary` parameter
   array in **both** `SpatialSubscriber.js` and `LayerControllerSubscriber.js` (they are separate
   lists and already differ slightly — e.g. `pixelHighlight` is spatial-only).
5. Seed a default in the relevant loader's `CL` block.
6. Document it under the right level in `sites/docs/docs/coordination-types.mdx`.
7. For a per-**image-channel** type, also add it to
   `addImageChannelInMetaCoordinationScopesHelper` in `packages/vit-s/src/state/spatial-reducers.js`,
   otherwise the "Add Channel" button creates a channel with no scope for it. (Note the existing bug
   there: `spatialMaxResolution` is keyed by `nextOpacityScope` instead of its own scope — do not
   copy that line.)

See **vitessce-add-coordination-type** for the non-multi-level parts of this checklist.

## Rendering conventions in `Spatial.js`

`Spatial` is a class component extending `AbstractSpatialOrScatterplot`, deliberately bypassing React
state for performance. The structure is rigid; follow it exactly:

- Derived data lives in **instance variables keyed by scope** (`this.spotColors[layerScope]`,
  `this.segmentationColors[layerScope][channelScope]`, `this.obsSpotsQuadTree`, …), each declared and
  commented in the constructor.
- Every instance variable has an `onUpdateX(layerScope[, channelScope])` method plus an
  `onUpdateAllX()` that loops over the scopes, and both are invoked from the constructor.
- `componentDidUpdate(prevProps)` diffs props with `shallowDiff` / `shallowDiffByLayer` /
  `shallowDiffByChannel` / `shallowDiffBy{Layer,Channel}Coordination`, calls the narrowest
  `onUpdate*`, and sets `forceUpdate = true`. Any new derived value needs a branch here or it will
  silently go stale; when the `*LayerScopes` array itself changes, the `onUpdateAll*` path runs.
- `createXLayer(s)` build DeckGL layers with ids `image-layer-`/`volume-layer-`/
  `segmentation-layer-`/`spot-layer-`/`point-layer-` + `layerScope`. Bitmask and polygon segmentation
  layers deliberately share the same id.
- Layer and channel state **compose multiplicatively**: `visible && spatialChannelVisible`,
  `spatialLayerOpacity * spatialChannelOpacity`. Legends and tooltips gate on the same conjunction
  plus `legendVisible` / `tooltipsVisible`.
- RGB images (`photometricInterpretation === 'RGB'`) ignore `channelScopes` entirely and hard-code
  three channels; the layer controller hides the channel rows in that case.

## Layer controller conventions

- `LayerController.js` renders layer scopes **reversed**, so controller rows read top-to-bottom in
  the same order the layers stack on screen.
- Adding/removing image channels rewrites the meta-coordination scopes via
  `useAddImageChannelInMetaCoordinationScopes` / `useRemoveImageChannelInMetaCoordinationScopes`,
  which is why `ImageLayerController` needs the **raw** `coordinationScopesRaw` prop rather than the
  computed scopes. The add button is capped at `viv.MAX_CHANNELS` and at the image's channel count.
  There is no equivalent add/remove for segmentation channels, spots, or points.
- `spatialTargetZ` / `spatialTargetT` / `spatialRenderingMode` are **view-level**, shared by all
  layers (the global Z/T sliders); everything else in the controller is per-layer or per-channel.
