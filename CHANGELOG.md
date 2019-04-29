# Changelog

## [0.0.14] - 2019-04-29
### Added
- Add Cypress.io tests.
- Thank-you to NIH on the front page.
- Add Google Analytics to all pages.
- "Please wait" now waits for all layers.
- Use [`react-grid-layout`](https://github.com/STRML/react-grid-layout) for draggable panes;
Layouts can be specified either responsively, or with fixed grid positions. Grid height is
based on window height at load.
- Script to push demos to S3, without making a new release.
- Use OpenSeadragon for tiled imagery.
### Changed
- Spatial viewport is part of the initial FAKE_API_RESPONSE, instead of being hardcoded.
- Neighborhoods are enabled, but hidden by default.

## [0.0.13] - 2019-03-26
### Changed
- Lots of display tweaks to create a consistent dark color scheme.

## [0.0.12] - 2019-03-26
### Added
- Heatmap is row-normed. (This is a change in `vitessce-data`.)
- Borders on heatmap components... but this will be reverted.
- Cells are visible on initial load.
### Changed
- Dark color scheme, with better contrast when colored
- Heatmap spans the entire bottom.

## [0.0.11] - 2019-03-20
### Added
- Roll up the layers list when not hovered.
- Component titles give summary stats about data.
### Changed
- Change color scales, styling of unselected cells, and marquee rendering, to improve contrast.
- Only update selected set at end of drag.

## [0.0.10] - 2019-03-19
### Added
- Heatmap: Gene expression levels occupy most of the space; Above, there are bands showing
the currently selected cell set, and the current cell coloring.
### Changed
- Spatial and t-SNE backgrounds are now black.
- Move the Factor radio buttons to their own component, above Genes.

## [0.0.9] - 2019-03-17
### Added
- Neighborhoods layer: no interactivity, and it's obvious that the source data has some problems.
### Changed
- Got the image registration right, finally.
- Initial viewport is hardcoded: Data is no longer centered on (0, 0) origin.

## [0.0.8] - 2019-03-16
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
