# hubmap-tool

New requested features:
- Given a set, color it. / name it
- Recover the query, bounding rect that defined a subset (future)
- Spatial component is given colors for each cell: (it’s possible for a cell not to have a color)
  - Might be classification,  (palette, and names)
  - or might be expression levels.
- Separate events for genes and molecules coming from spatial.

Architecture:
- Global state not seen as a good thing: we want to decouple the components
- ... so each component may have its own, redundant copy of the cell or gene data: We might actually use the same data structure for each of them, but that’s not an assumption we want to build on.

Choices:
- Mobx?
- PubsubJS?
- Redux?

Usually when I think of an API, it’s centered on methods and their interfaces, but here it sounds like we want to instead identify events and the data they carry.

Scope:
- We are not discussing window management, resizing, etc.
- We are not discussing actions internal to a tool… ie, panning the spatial view, or mouse position in tSNE, but it may be that we do want to publish more, eventually.

Note:
- Different frameworks have different expectations for the structure of events...
Maybe objects make sense, or maybe pure JSON is better, but that doesn't need to be
decided now.

## Spatial Component

These events populate the component:

- [`AddCells`](src/api-fixtures/AddCells.json)
- [`AddMolecules`](src/api-fixtures/AddMolecules.json)
- [`AddRGBImagery`](src/api-fixtures/AddRGBImagery.json)
- [`AddBWImagery`](src/api-fixtures/AddBWImagery.json)

These events update the state:

- `HoverGene`
- `HoverMolecule`
- `HoverCell`

- `SelectGenes`
- `SelectMolecules`
- `SelectCells`

- [`ColorCellsByScale`](src/api-fixtures/ColorCellsByScale.json)
- [`ColorCellsByCategory`](src/api-fixtures/ColorCellsByCategory.json)

- `ColorGenesByScale`
- `ColorGenesByCategory`

- `ColorMoleculesByScale`
- `ColorMoleculesByCategory`

- `CreateCellSets`
- `CreateMoleculeSets`
- `CreateGeneSets`

- `DeleteCellSets`
- `DeleteMoleculeSets`
- `DeleteGeneSets`
```

These events are emitted:

- `HoverGene`
- `HoverMolecule`
- `HoverCell`

- `SelectGenes`
- `SelectMolecules`
- `SelectCells`
```

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

## Heatmap Component

These events populate the component:

- [`AddCells`](src/api-fixtures/AddCells.json)

These events update the state:

- `ColorCellsByScale`
- `ColorCellsByCategory`

- `ColorGenesByScale`
- `ColorGenesByCategory`

