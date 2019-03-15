# Changelog
Vitessce adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## in progress
### Added
- Load and validate JSON for clusters, categorical factors, gene expression levels, and cell neighborhoods.
- Toggle between factor values: Spatial and t-SNE categorical colors are updated.
- Toggle between gene expression levels: Spatial and t-SNE continuous colors are updated.
- Toggle between multiple imagery layers.
### Changed
- The stained imagery is positioned and scaled better, but still slightly off.
- No outlines on cell polygons.

## [0.0.7] - 2019-03-07
### Added
- Component diagram and minimal documentation of library.
- Make space for a brief description of the dataset on the welcome page.
- Load background imagery.
- More unit tests.
- Label each component, and identify the current dataset.
- Replace global selection tools with in-component tools.
- Toggle visibility of each layer.
- "Please wait" while molecules load.
- Add placeholder for genes component.
### Changed
- Use a quadtree to identify the cells in the selected region.

## [0.0.6] - 2019-02-25
### Added
- Welcome screen where user picks dataset.
- All the cells are selected on start.
### Removed
- No longer supports drag and drop to add file.

## [0.0.5] - 2019-02-20
### Added
- Distinguish pan and single-select mode from drag-to-select.
- Drag-to-select supported for both Spatial and Tsne: Selection state is linked.
- Set of selected cells is updated during drag; there is also a grey overlay.
- Add the strict AirBNB linting rules.
- Load Linnarsson cell data by default, rather than starting from a blank screen.
### Changed
- Assume data has been scaled to fit a 2000 pixel-wide window, centered on the origin,
  and adjust line widths and dot sizes accordingly.

## [0.0.4] - 2019-02-08
### Added
- Drag and drop JSON files representing cells and molecules.
- There is a helpful link to the sample data download.
- JSON files are validated against schema, and detailed errors go to console.
- Flexbox CSS for clean columns.
