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

```
AddCells({
  "cell-42": {
    "boundary_poly": [[1234, 2345], [1235, 2366], ...],
    ...
  },
  ...
})

AddMolecules({
  "molecule-42": {
    "gene_id": "gene-42",
    "position": [1234, 2345]
  },
  ...
})

AddRGBImagery({
  "name": "Interesting stain",
  "imagery": [
    [[r, g, b], [r, g, b], ...],
    [[r, g, b], [r, g, b], ...],
    ....
  ],
  "boundary_rect": {
    "top": 0,
    "left": 0,
    "right": 3000,
    "bottom": 3000
  }
})

AddScaleImagery({
  "name": "Interesting black-white",
  "imagery": [
    [[value], [value], ...],
    [[value], [value], ...],
    ....
  ],
  "color_scale": {
    0: [0, 0, 0],
    1: [1, 1, 1]
  }
  "boundary_rect": {
    "top": 0,
    "left": 0,
    "right": 3000,
    "bottom": 3000
  }
})
```

These events update the state:

```
HoverGene("gene-42")
HoverMolecule("molecule-42")
HoverCell("cell-42")

SelectGenes(["gene-42", ...])
SelectMolecules(["molecule-42", ...])
SelectCells(["cell-42", ...])

ColorCellsByScale({
  "cells": {"cell-42": 0.5, ...},
  "color_scale": {
    0: [0, 0, 0],
    1: [1, 1, 1]
  }
})
ColorCellsByCategory({
  "cells": {"cell-42": "category-1", ...},
  "color_categories": {"category-1": [0, 0, 0], ...}
})

ColorMoleculesByScale(...)
ColorMoleculesByCategory(...)

ColorGenesByScale(...)
ColorGenesByCategory(...)

CreateCellSets(...)
CreateMoleculeSets(...)
CreateGeneSets(...)

DeleteCellSets(...)
DeleteMoleculeSets(...)
DeleteGeneSets(...)
```

These events are emitted:

```
HoverGene("gene-42")
HoverMolecule("molecule-42")
HoverCell("cell-42")

SelectGenes(["gene-42", ...])
SelectMolecules(["molecule-42", ...])
SelectCells(["cell-42", ...])
```

## tSNE Component

These events populate the component:

```
AddCells({
  "cell-42": {
    "tsne": [1234, 2345],
    ...
  },
  ...
})
```

These events update the state:

```
ColorCellsByScale(...)
ColorCellsByCategory(...)

HoverCell(...)
SelectCells(...)
```

These events are emitted:

```
HoverCell(...)
SelectCells(...)
```

## Heatmap Component

These events populate the component:

```
AddCells({
  "cell-42": {
    "gene_expression": {"gene-42": 1234, ...},
    ...
  },
  ...
})
```

These events update the state:

```
ColorCellsByScale(...)
ColorCellsByCategory(...)

ColorGenesByScale(...)
ColorGenesByCategory(...)
```
