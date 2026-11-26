---
name: vitessce-sets
description: Use when modifying logic involving sets of observations (e.g., cells) or features (e.g., genes), either flat or hierarchical. Observation sets are used to store and manage cell type annotations and cell clustering results.
---

# Observation Sets and Feature Sets

Almost all set logic lives in **`packages/utils/sets-utils/`** (`@vitessce/sets-utils`) and is consumed by
loaders (`packages/file-types/*`), the manager view (`packages/view-types/obs-sets-manager/`), and every
view that colors or stratifies by set.

| File | Contents |
|---|---|
| `src/cell-set-utils.js` | Tree/node traversal, transforms, set operations, tree → render/color/size derivations |
| `src/set-path-utils.js` | Path comparison and hierarchy inference (`findLongestCommonPath`, `filterPathsByExpansionAndSelection`, `findChangedHierarchy`) |
| `src/utils.js` | Path key encoding (`PATH_SEP`, `pathToKey`), rename helpers, `mergeObsSets`, `setObsSelection` |
| `src/io.js` | JSON/CSV import, export, schema upgrade |
| `src/CellSetsZarrLoader.js` | `dataToCellSetsTree` — columnar data → tree (used by all loaders, despite the filename) |
| `src/expr-utils.js` | `stratifyArrays` / `stratifyExpressionData` — group values by (obs set, sample set, feature) |
| `src/interpolate-colors.js` | `getCellColors` and continuous color scales |
| `src/constants.js` | `HIERARCHICAL_SCHEMAS.latestVersion`, `SETS_DATATYPE_OBS`, file extension / MIME constants |

## Data model

A sets object is a forest, typed as `SetsTree` in `packages/types/src/sets.ts`:

```js
{
  version: '0.1.3',
  datatype: 'obs',            // SETS_DATATYPE_OBS; informational, stripped by Zod parse
  tree: [                     // level-zero nodes = "groups of sets" (e.g. one group to represent cell types, another group to store a clustering result, and so on)
    {
      name: 'Cell Type Annotations',
      children: [
        {
          name: 'Vasculature',
          children: [
            { name: 'Pericytes',   set: [['cell_1', null], ['cell_2', 0.87]] },
            { name: 'Endothelial', set: [['cell_4', null]] },
          ],
        },
      ],
    },
  ],
}
```


Invariants, all of which existing code assumes:

- **A node has either `children` or `set`, never both.** Leaf detection is `!node.children`
  throughout `cell-set-utils.js`. Putting a `set` on an internal node breaks `nodeToSet`,
  `getNodeLength`, and `treeToMembershipMap`. `onDropNode` in `ObsSetsManagerSubscriber.js`
  exists mostly to enforce this during drag-and-drop.
- **A `set` is an array of `[obsId, predictionScore]` tuples**, not an array of IDs. The score is
  `null` when unknown. Forgetting the tuple shape is the single most common bug here — always
  destructure: `nodeSet.map(([obsId]) => ...)`.
- **Names are unique among siblings**, which is what makes a path an identity.
- Level-zero nodes always have `children` (never a `set`), so the minimum useful depth is 2.
- `color` is optional per node and only used as a *seed* for `initializeCellSetColor`; the live
  color state is the `obsSetColor` coordination value, not the tree.

### Paths are the identity

A set is referenced everywhere by its **path**: an array of node names from the level-zero node down,
e.g. `['Cell Type Annotations', 'Vasculature', 'Pericytes']` (Zod: `obsSetPath` in
`packages/schemas/src/shared.ts`). Consequences:

- Compare paths with `lodash-es`'s `isEqual`, never `===`. Prefix tests use `isEqualOrPrefix`.
- `treeFindNodeByNamePath(tree, path)` returns `null` if zero **or more than one** node matches, so
  it silently returns `null` on a malformed tree with duplicate sibling names.
- React keys and the `rc-tree` API need strings, so paths are joined with `PATH_SEP` (`'___'`) via
  `pathToKey`. This is a lossy encoding — a set name containing `___` will corrupt the round trip.
  Prefer passing real path arrays and only convert at the `rc-tree` boundary.
- **Renaming or moving a node must update every place the path is stored**: the tree itself plus
  `obsSetColor`, `obsSetSelection`, and `obsSetExpansion`. Use `tryRenamePath` to rewrite a path and
  all of its descendant paths. See `onNodeSetName` and `onNodeRemove` in
  `ObsSetsManagerSubscriber.js` for the complete pattern.

### The membership map

Loaders also return `obsSetsMembership`: a `Map<obsId, string[][]>` from observation ID to the paths
of every leaf set containing it (`treeToMembershipMap`). This is the reverse index used for tooltips
(`useGetObsInfo` / `useGetObsMembership` in `packages/vit-s/src/hooks.js`) — use it instead of
scanning the tree when you have an ID and want its sets.

## Coordination state

The tree from the loader is read-only data. Everything mutable is coordination state:

| Coordination type | Shape | Meaning |
|---|---|---|
| `obsSetSelection` | `string[][] \| null` | Selected set paths. `null` means "all"; `[]` means "none" |
| `obsSetExpansion` | `string[][] \| null` | Set paths expanded in the tree UI |
| `obsSetColor` | `{ path: string[], color: [r,g,b] }[]` | Per-path color assignments |
| `additionalObsSets` | `SetsTree \| null` | User-defined sets, stored in the view config |
| `obsColorEncoding` | `'cellSetSelection' \| 'geneSelection' \| ...` | Which encoding wins when coloring |

Filtering/selection/highlighting semantics (including the `null` vs `[]` distinction and the
`obsSetFilter` / `obsSetHighlight` types) are covered by the **vitessce-filter-select-highlight**
skill; follow it for any change to what gets rendered or de-emphasized.

### Dataset-defined vs. user-defined sets

Two separate trees coexist and must not be conflated:

- `obsSets` — loaded from the dataset, immutable.
- `additionalObsSets` — created by the user (lasso selections, set operations, imports), persisted in
  the view config.

`mergeObsSets(obsSets, additionalObsSets)` concatenates their `tree` arrays into one forest.
**Merged sets are for reading only.** When writing, update `additionalObsSets` — never the loaded
`obsSets`. Every consumer follows this shape:

```js
const mergedObsSets = useMemo(
  () => mergeObsSets(obsSets, additionalObsSets),
  [obsSets, additionalObsSets],
);
```

Because `mergeObsSets` stamps `version` and `datatype` itself, name collisions between the two trees
would create ambiguous paths. `treesConflict` guards against this on import, and the manager view
refuses conflicting imports rather than deduplicating.

New user-defined sets should be created with `setObsSelection` (in `src/utils.js`), which appends a
numbered node under the `'My Selections'` level-zero node, assigns a palette color, selects the new
path, and switches `obsColorEncoding` to `'cellSetSelection'` — all in one call. Pass a `prefix` to
label the provenance (`'Union '`, `'Intersection '`, `'Complement '`, default `'Selection '`).

## Loading

Loaders convert columnar data to a tree with `dataToCellSetsTree(data, options)`, where `data` is
`[obsIndices, setIds, setScores]` (one entry per configured hierarchy) and `options` is the file
definition's `obsSets` array. Passing an array of columns for one hierarchy produces a multi-level
tree, coarse → fine; a single column produces a flat two-level tree. Redundant trailing levels
(`['Parent', 'Child', 'Child']`) collapse into a leaf.

Every sets loader then does the same three things — see
`packages/file-types/csv/src/csv-loaders/ObsSetsCsv.js` and
`packages/file-types/zarr/src/anndata-loaders/ObsSetsAnndataLoader.js`, which are near-identical:

```js
const obsSetsMembership = treeToMembershipMap(obsSets);
const coordinationValues = {
  // Auto-select every child of the first hierarchy.
  obsSetSelection: obsSets.tree[0].children.map(node => [obsSets.tree[0].name, node.name]),
  // Assign palette colors, per hierarchy and per level, seeding from node.color when present.
  obsSetColor: initializeCellSetColor(obsSets, []),
};
return new LoaderResult({ obsIndex, obsSets, obsSetsMembership }, url, coordinationValues);
```

Returning `coordinationValues` is how a loader seeds initial selection and colors; `useDataType`
applies them only where the view config left the value unset (see
`packages/vit-s/src/data-hook-utils.js`). If you add a sets loader, keep this block consistent with
the existing ones — views assume a non-empty initial selection and a populated `obsSetColor`.

Options schemas live in `packages/schemas/src/file-def-options.ts` (`annDataObsSetsArr`,
`obsSetsCsvSchema`). Note the CSV loaders read `option.scorePath` while `obsSetsCsvSchema` declares
`scoreColumn` — if you touch confidence-score loading for CSV, reconcile the two rather than copying
either name.

## Utilities worth reaching for

Prefer these over hand-rolled recursion; they encode the invariants above.

**Traversal / query**
`nodeToSet` (flatten descendants to tuples) · `getNodeLength` · `nodeToHeight` ·
`treeFindNodeByNamePath` · `nodeToLevelDescendantNamePaths(node, level, prevPath, stopEarly)` ·
`treeToExpectedCheckedLevel` (infer which "color by cluster level" radio button matches the current
selection).

**Immutable transforms** — all return new nodes; none mutate.
`nodeTransform` (first match wins, stops recursing) vs `nodeTransformAll` (transforms match *and*
continues into children) · `nodeAppendChild` / `nodePrependChild` / `nodeInsertChild` ·
`filterNode(node, prevPath, filterPath)` returns `null` for the removed node, so always follow with
`.filter(Boolean)`.

**Set operations** — `treeToUnion`, `treeToIntersection`, `treeToComplement(tree, paths, items)`.
These return plain ID arrays (scores dropped). The complement needs the full `obsIndex` as `items`.
All three are `Array.prototype.includes`-based and therefore O(n²); if you call them on large
datasets, convert to `Set` first rather than adding another `includes` loop.

**Derivations for views** — `getCellColors` / `treeToCellColorsBySetNames` (mixes color with gray by
`predictionScore` when non-null, so low-confidence cells look desaturated) ·
`treeToCellSetColorIndicesBySetNames` · `treeToSelectedSetMap` (obsId → path) ·
`treeToObsIdsBySetNames` / `treeToObsIndicesBySetNames` · `treeToSetSizesBySetNames` (returns
`isGrayedOut` for unselected sets) · `getCellSetPolygons` · `nodeToRenderProps`.

**Hierarchy inference for plots** — `findLongestCommonPath`, `filterPathsByExpansionAndSelection`,
and `findChangedHierarchy` let a view show one hierarchy at a time based on what the user last
selected. `CellSetSizesPlotSubscriber.js` and `HeatmapSubscriber.js` are the reference consumers.

## Sample sets

`sampleSets` (`packages/file-types/*/…/SampleSets*.js`) use the **same tree structure, utilities, and
path semantics**, but hold sample IDs rather than observation IDs. Crossing between them requires
`sampleEdges` (a `Map<obsId, sampleId>`); `stratifyArrays` in `expr-utils.js` shows the join. When
adding set logic that should work for both, put it in `sets-utils` and keep it ID-agnostic instead of
naming parameters `cell*`.

## Feature sets

Feature-side sets are **not implemented as trees yet**. `FEATURE_SET_SELECTION`,
`FEATURE_SET_COLOR`, `FEATURE_SET_HIGHLIGHT`, and `ADDITIONAL_FEATURE_SETS` appear only as
commented-out `TODO`s in `packages/constants-internal/src/coordination.ts`. The existing
`featureSetEnrichment` data (used by `FeatureSetEnrichmentBarPlot`) is a separate, flat mechanism —
do not treat it as the feature analogue of `obsSets`. If asked to add hierarchical feature sets,
mirror the obs implementation and reuse `sets-utils` rather than forking it.

## Naming debt

Older code says `cellSets` / `cellSetSelection` / `cellSetColor`; the current vocabulary is
`obsSets` / `obsSetSelection` / `obsSetColor`. Within one file, match the surrounding names; for new
files and new exports, use the `obs*` names. `obsColorEncoding` still takes the legacy string value
`'cellSetSelection'` — that string is load-bearing, do not "fix" it.

## Lack of assumptions

Current code does not assume that each observation ID appears at least nor at most once within a given set group, for maximum flexibility.
E.g., within a group of sets, a cell with ID `cell_1` can appear as a member of multiple sibling leaf set nodes.
