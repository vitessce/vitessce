# hubmap-tool

New requested features:
- Given a set, color it. / name it
- Recover the query, bounding rect that defined a subset (future)
- Spatial component is given colors for each cell: (it’s possible for a cell not to have a color)
  - Might be classification,  (palette, and names)
  - or might be expression levels.
- Separate events for genes and molecules coming from spatial.

Usually when I think of an API, it’s centered on methods and their interfaces, but here it sounds like we want to instead identify events and the data they carry.

Scope:
- We are not discussing window management, resizing, etc.
- We are not discussing actions internal to a tool… ie, panning the spatial view, or mouse position in tSNE, but it may be that we do want to publish more, eventually.

Note:
- Different frameworks have different expectations for the structure of events,
but we can still try to clarify what information will be passed.

Worries:
- With everything being done via events, and without a global state, it's not going to be feasible
to recreate a given state. We're ok giving that up?

## File Picker component?

Something needs to generate `Add*` events. Perhaps at first it's hardcoded, but down the road
we might either support drag-and-drop, or a conventional file-picker UI.

## Spatial Component

These events populate the component:

| cells | genes | molecules |
| ----- | ----- | --------- |
| [`AddCells`](src/api-fixtures/AddCells.json) |  | [`AddMolecules`](src/api-fixtures/AddMolecules.json) |

- [`AddRGBImagery`](src/api-fixtures/AddRGBImagery.json)
- [`AddBWImagery`](src/api-fixtures/AddBWImagery.json

(Linnarsson Lab data doesn't have any base imagery, so not sure what we need to support here...
Perhaps just an img src would be sufficient? And I'm not sure what kind of image registration
needs to be supported... Maybe we need to allow a rotation to be given, or an arbitrary
transformation matrix? Can we assume that image registration will be correct, or is it something
the user might want to adjust by hand?)

These events update the state:

| cells | genes | molecules |
| ----- | ----- | --------- |
| `HoverCell` | `HoverGene` | `HoverMolecule` |
| `SelectCells` | `SelectGenes` | `SelectMolecules` |
| [`ColorCellsByScale`](src/api-fixtures/ColorCellsByScale.json) | `ColorGenesByScale` | `ColorMoleculesByScale` |
| [`ColorCellsByCategory`](src/api-fixtures/ColorCellsByCategory.json) | `ColorGenesByCategory` | `ColorMoleculesByCategory` |
| `CreateCellSets` | `CreateGeneSets` | `CreateMoleculeSets` |

(I'm not sure that a corresponding `Delete*Sets` would be useful: Since state is not persisted, ok
for it to get a bit cluttered, I think?)

Sets may have a representation in each component, but I don't think we need any other events which
reference sets: They enable events to be published that just list all the relevant member IDs.

These events are emitted:

| cells | genes | molecules |
| ----- | ----- | --------- |
| `HoverCell` | `HoverGene` | `HoverMolecule` |
| `SelectCells` | `SelectGenes` | `SelectMolecules` |

(I could also imagine `BrushCells` etc., to indicate the Cells that will be selected,
but I'm not sure this is necessary.)

## tSNE Component

These events populate the component:

- [`AddCells`](src/api-fixtures/AddCells.json)

These events update the state:

- [`ColorCellsByScale`](src/api-fixtures/ColorCellsByScale.json)
- [`ColorCellsByCategory`](src/api-fixtures/ColorCellsByCategory.json)
- `HoverCell`
- `SelectCells`

These events are emitted:

- `HoverCell`
- `SelectCells`
- `CreateCellSets`

## Heatmap + Dendrogram Component

These events populate the component:

- [`AddCells`](src/api-fixtures/AddCells.json)

(How should the dendrogram be represented in JSON? I think for now this question can be deferred,
but when we do get to it, perhaps something like the output of
[scipy `to_tree`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.to_tree.html#scipy.cluster.hierarchy.to_tree)?)

These events update the state:

| cells | genes | molecules |
| ----- | ----- | --------- |
| `ColorCellsByScale` | `ColorGenesByScale` | |
| `ColorCellsByCategory` | `ColorGenesByCategory` | |
| `HoverCell` | `HoverGene` | |
| `SelectCells` | `SelectGenes` | |
| `CreateCellSets` | `CreateGeneSets` | |

These events are emitted:

| cells | genes | molecules |
| ----- | ----- | --------- |
| `ColorCellsByScale` | `ColorGenesByScale` | |
| `ColorCellsByCategory` | `ColorGenesByCategory` | |
| `HoverCell` | `HoverGene` | |
| `SelectCells` | `SelectGenes` | |
| `CreateCellSets` | `CreateGeneSets` | |

## Gene Table component

These events populate the component:

- [`AddGenes`](src/api-fixtures/AddGenes.json)
- [`ColorGenesByScale`](src/api-fixtures/ColorCellsByScale.json)
- [`ColorGenesByCategory`](src/api-fixtures/ColorCellsByCategory.json)
- `HoverGenes`
- `SelectGenes`

These events are emitted:

- `HoverGene`
- `SelectGenes`
- `CreateGeneSets`

## Set Manager component?

Rather than having each component listen for set events, perhaps there should only be one listener?
It would be the place to do operations on sets, and could give summary statistics, and could emit
`Color*` events.

(Or maybe three Set Managers, one each for cells, genes, and molecules.)
