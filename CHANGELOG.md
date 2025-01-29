
## 3.5.6

### Patch Changes

- Fix bug where tooltips would not appear when mousing over the body of unfilled polygons/segments in spatial beta component. (`@vitessce/spatial-beta`) ([#2031](https://github.com/vitessce/vitessce/pull/2031))

- Add dualScatterplot view. (`@vitessce/scatterplot-embedding`) ([#2014](https://github.com/vitessce/vitessce/pull/2014))


## 3.5.5

### Patch Changes

- Allow useExpandedFeatureLabelsMap to return success when disabled. (`@vitessce/vit-s`) ([#2024](https://github.com/vitessce/vitessce/pull/2024))

- Added search to docs (`docs`) ([#2021](https://github.com/vitessce/vitessce/pull/2021))


## 3.5.4

### Patch Changes

- Fix bug when loading shapes.parquet files from RPC-based zarr stores in vitessce-python. (`@vitessce/spatial-zarr`) ([#2013](https://github.com/vitessce/vitessce/pull/2013))


## 3.5.3

### Patch Changes

- Molecular observations now have tooltips when hovered over. (`@vitessce/spatial`) ([#1998](https://github.com/vitessce/vitessce/pull/1998))

- Added support for mapping ensemble gene ids to gene symbols. (`@vitessce/feature-list`, `@vitessce/heatmap`, `@vitessce/tooltip`, `@vitessce/vit-s`) ([#1970](https://github.com/vitessce/vitessce/pull/1970))

- Extracted abstract loaders and errors from core vit-s package to eliminate circular dependencies. Extracted spatial zarr utils to avoid pulling in spatial subdependencies when only concerned with basic zarr loading functionalities. (`@vitessce/abstract`, `@vitessce/ome-tiff`, `@vitessce/json`, `@vitessce/zarr`, `@vitessce/spatial-zarr`, `@vitessce/csv`, `@vitessce/glb`, `vitessce`, `@vitessce/all`, `@vitessce/example-plugins`, `@vitessce/vit-s`) ([#2006](https://github.com/vitessce/vitessce/pull/2006))

- Add linkController view type. Update state hooks in vit-s subpackage to set the mostRecentConfigSource value. (`@vitessce/link-controller`) ([#1933](https://github.com/vitessce/vitessce/pull/1933))

- Addressed accessibility issues with icons (`@vitessce/obs-sets-manager`, `@vitessce/scatterplot`) ([#2004](https://github.com/vitessce/vitessce/pull/2004))


## 3.5.2

### Patch Changes

- Fix tooltips in segmentations without locations in spatial layer (`@vitessce/spatial`) ([#1982](https://github.com/vitessce/vitessce/pull/1982))


## 3.5.1

### Patch Changes

- Added support to map channelNames to channelIndices provided via SpatialTargetC (`@vitessce/spatial-beta`) ([#1971](https://github.com/vitessce/vitessce/pull/1971))

- Export usePageModeView from main vitessce package. (`@vitessce/all`) ([#1986](https://github.com/vitessce/vitessce/pull/1986))

- Add Spatial Atlas example config. (`@vitessce/example-configs`) ([#1985](https://github.com/vitessce/vitessce/pull/1985))


## 3.5.0

### Minor Changes

- Add NaN percentage to legend (`@vitessce/legend`, `@vitessce/scatterplot-embedding`, `@vitessce/scatterplot-gating`, `@vitessce/heatmap`, `@vitessce/spatial`, `@vitessce/vit-s`) ([#1947](https://github.com/vitessce/vitessce/pull/1947))

### Patch Changes

- Fix obs index within AnnData-Zarr test fixture. (`@vitessce/zarr`) ([#1948](https://github.com/vitessce/vitessce/pull/1948))

- Fix scatterplot point layer z-index bug. (`@vitessce/scatterplot`) ([#1967](https://github.com/vitessce/vitessce/pull/1967))

- Correct x-axis label in `CellSetSizesPlot` (`@vitessce/statistical-plots`) ([#1949](https://github.com/vitessce/vitessce/pull/1949))

- Add biomarker-select view. Update pageMode functionality. Register default async function plugins, allow them to use queryClient. Add types related to knowledge. (`@vitessce/biomarker-select`, `@vitessce/constants-internal`, `@vitessce/example-configs`, `@vitessce/config`, `@vitessce/types`, `@vitessce/vit-s`) ([#1889](https://github.com/vitessce/vitessce/pull/1889))

- Fix tooltips in spatialBeta polygon segmentation (`@vitessce/spatial-beta`) ([#1966](https://github.com/vitessce/vitessce/pull/1966))

- Update citation info. (`docs`) ([#1959](https://github.com/vitessce/vitessce/pull/1959))

- Try removing dynamic import polyfill via a webpack ignore comment. (`@vitessce/zarr`) ([#1960](https://github.com/vitessce/vitessce/pull/1960))


## 3.4.14

### Patch Changes

- Support parquet-based spatialdata shapes for obsSpots. Incremental update to spatialdata file options schema. (`@vitessce/zarr`, `@vitessce/schemas`, `@vitessce/types`) ([#1849](https://github.com/vitessce/vitessce/pull/1849))


## 3.4.13

### Patch Changes

- Added support for ome-zarr-zip files (`@vitessce/constants-internal`, `@vitessce/all`, `@vitessce/example-configs`) ([#1945](https://github.com/vitessce/vitessce/pull/1945))

- Add a config that uses a spatialBeta view and relies on auto-initialization of the coordination space. (`@vitessce/example-configs`) ([#1901](https://github.com/vitessce/vitessce/pull/1901))


## 3.4.12

### Patch Changes

- Add more exports that are required for accessing multi-level coordination from python-defined plugin views. (`@vitessce/all`) ([#1942](https://github.com/vitessce/vitessce/pull/1942))

- Fix incorrect obsSets.spatialdata.zarr file definition schema. Add featureLabelsType coordination type. (`@vitessce/constants-internal`, `@vitessce/schemas`) ([#1938](https://github.com/vitessce/vitessce/pull/1938))


## 3.4.11

### Patch Changes

- Update showcase page of docs. (`docs`) ([#1939](https://github.com/vitessce/vitessce/pull/1939))

- Add obsSets to tooltip for Segmetations (`@vitessce/spatial-beta`) ([#1936](https://github.com/vitessce/vitessce/pull/1936))

- Added help text overlay for the views (`@vitessce/scatterplot-embedding`, `@vitessce/scatterplot-gating`, `@vitessce/statistical-plots`, `@vitessce/genomic-profiles`, `@vitessce/layer-controller`, `@vitessce/obs-sets-manager`, `@vitessce/feature-list`, `@vitessce/description`, `@vitessce/constants-internal`, `@vitessce/heatmap`, `@vitessce/spatial`, `@vitessce/status`, `@vitessce/vit-s`) ([#1911](https://github.com/vitessce/vitessce/pull/1911))


## 3.4.10

### Patch Changes

- Support anndata-as-h5ad via Zarr reference specs. (`@vitessce/constants-internal`, `@vitessce/zarr-utils`, `@vitessce/schemas`) ([#1811](https://github.com/vitessce/vitessce/pull/1811))

- Fixes the svg length error for legends in dev environment due to missing props (`@vitessce/scatterplot-embedding`, `@vitessce/heatmap`, `@vitessce/spatial`) ([#1925](https://github.com/vitessce/vitessce/pull/1925))

- Implement sequence transformation for OME-NGFF / SpatialData. (`@vitessce/spatial-utils`) ([#1900](https://github.com/vitessce/vitessce/pull/1900))

- Increase timeout for CCF test due to long loading time for CCF web component. (`vitessce`) ([#1931](https://github.com/vitessce/vitessce/pull/1931))

- Fixes type for the constants (`@vitessce/constants`, `vitessce`, `@vitessce/dev`) ([#1914](https://github.com/vitessce/vitessce/pull/1914))

- Support for markdown (rich text) in the description view (`@vitessce/description`, `@vitessce/constants-internal`, `@vitessce/example-configs`) ([#1924](https://github.com/vitessce/vitessce/pull/1924))

- Bump higlass version to fix css issue. (`@vitessce/genomic-profiles`) ([#1930](https://github.com/vitessce/vitessce/pull/1930))


## 3.4.9

### Patch Changes

- Fix issue in versioned URLs. (`vitessce`) ([#1917](https://github.com/vitessce/vitessce/pull/1917))


## 3.4.8

### Patch Changes

- Add configs for paper figures. (`@vitessce/statistical-plots`, `@vitessce/sets-utils`, `@vitessce/example-configs`) ([#1915](https://github.com/vitessce/vitessce/pull/1915))


## 3.4.7

### Patch Changes

- Update GH actions. (`vitessce`) ([#1913](https://github.com/vitessce/vitessce/pull/1913))

- Add sampleSets and sampleEdges data types, with file types for CSV and AnnData, respectively. (`@vitessce/constants-internal`, `@vitessce/zarr`, `@vitessce/csv`, `@vitessce/schemas`) ([#1793](https://github.com/vitessce/vitessce/pull/1793))

- Switch from using TypeScript v5.5 via nightly release to the official release (`vitessce`) ([#1902](https://github.com/vitessce/vitessce/pull/1902))

- Add support for pageMode prop on Vitessce and VitS components. (`@vitessce/vit-s`) ([#1885](https://github.com/vitessce/vitessce/pull/1885))

- Add support for plugin async functions. (`@vitessce/constants-internal`, `@vitessce/plugins`, `@vitessce/vit-s`) ([#1887](https://github.com/vitessce/vitessce/pull/1887))

- Use PNPM v9.5 and the catalog: feature. (`vitessce`) ([#1907](https://github.com/vitessce/vitessce/pull/1907))

- Updated GH actions to deploy to S3. Updated old S3 urls to use vitessce.io subdomains. (`vitessce`) ([#1910](https://github.com/vitessce/vitessce/pull/1910))


## 3.4.6

### Patch Changes

- Add expand=true URL parameter for docs site. (`docs`) ([#1884](https://github.com/vitessce/vitessce/pull/1884))

- Fix status check for Enter XR button. (`@vitessce/spatial-three`) ([#1876](https://github.com/vitessce/vitessce/pull/1876))


## 3.4.5

### Patch Changes

- Fix css for Enter XR button. (`@vitessce/spatial-three`) ([#1874](https://github.com/vitessce/vitessce/pull/1874))


## 3.4.4

### Patch Changes

- Fix bug in colors. (`@vitessce/statistical-plots`) ([#1872](https://github.com/vitessce/vitessce/pull/1872))


## 3.4.3

### Patch Changes

- Fix bugs with selecting meshes in spatial-three component. (`@vitessce/spatial-three`, `@vitessce/spatial-beta`) ([#1870](https://github.com/vitessce/vitessce/pull/1870))


## 3.4.2

### Patch Changes

- Mark existing obsSets as optional for obs component so users can generate their own observations (`@vitessce/obs-sets-manager`) ([#1868](https://github.com/vitessce/vitessce/pull/1868))


## 3.4.1

### Patch Changes

- Fix bugs in featureBarPlot. Update jain-2024 file URLs. (`@vitessce/statistical-plots`, `@vitessce/spatial-three`) ([#1865](https://github.com/vitessce/vitessce/pull/1865))


## 3.4.0

### Minor Changes

- Adds a ThreeJS-based spatial view for mesh and volumetric rendering. (`@vitessce/statistical-plots`, `@vitessce/spatial-three`, `@vitessce/glb`, `@vitessce/example-configs`) ([#1861](https://github.com/vitessce/vitessce/pull/1861))


## 3.3.12

### Patch Changes

- Added support for providing requestInit options to genomic profiles requests (`@vitessce/genomic-profiles`) ([#1854](https://github.com/vitessce/vitessce/pull/1854))

- Add documentation about spatialdata.zarr file type options. (`docs`) ([#1847](https://github.com/vitessce/vitessce/pull/1847))

- (feat): add support for int64 data types (+ testing for anndata 0.9-10) (`@vitessce/zarr`) ([#1830](https://github.com/vitessce/vitessce/pull/1830))

- Update table path regex for SpatialDataTableSource to support both table/ and tables/. (`@vitessce/zarr`) ([#1850](https://github.com/vitessce/vitessce/pull/1850))


## 3.3.11

### Patch Changes

- Support both hash and query params for MR demos. (`docs`) ([#1841](https://github.com/vitessce/vitessce/pull/1841))


## 3.3.10

### Patch Changes

- Add data-types types, refactor other types, refactor image-utils types. (`@vitessce/image-utils`, `@vitessce/types`) ([#1831](https://github.com/vitessce/vitessce/pull/1831))

- Set up redirects for MR demos for paper (at least until reviews complete). (`docs`) ([#1839](https://github.com/vitessce/vitessce/pull/1839))


## 3.3.9

### Patch Changes

- Update beta URL redirects for 3D paper. (`docs`) ([#1826](https://github.com/vitessce/vitessce/pull/1826))


## 3.3.8

### Patch Changes

- Redirect to beta-xr.vitessce.io (`docs`) ([#1825](https://github.com/vitessce/vitessce/pull/1825))

- Add webpack plugin for docusaurus site to support importing from @zarrita/storage. (`docs`) ([#1819](https://github.com/vitessce/vitessce/pull/1819))


## 3.3.7

### Patch Changes

- Add support for Zarr ZipFileStores for AnnData file types. (`@vitessce/constants-internal`, `@vitessce/zarr-utils`, `@vitessce/zarr`) ([#1810](https://github.com/vitessce/vitessce/pull/1810))

- Add sampleSets and sampleEdges data types, with file types for CSV and AnnData, respectively. (`@vitessce/constants-internal`, `@vitessce/zarr`, `@vitessce/csv`, `@vitessce/schemas`) ([#1791](https://github.com/vitessce/vitessce/pull/1791))

- Support featureLabels data type in spatialBeta legend. Add Maynard 2021 Visium example config. (`@vitessce/spatial-beta`, `@vitessce/constants-internal`, `@vitessce/example-configs`, `@vitessce/legend`, `@vitessce/vit-s`) ([#1815](https://github.com/vitessce/vitessce/pull/1815))


## 3.3.6

### Patch Changes

- Make light theme un-selected color lighter. (`@vitessce/utils`) ([#1814](https://github.com/vitessce/vitessce/pull/1814))

- Export useCoordination from main vitessce package. Implement remountOnUidChange prop. (`@vitessce/all`, `@vitessce/vit-s`) ([#1812](https://github.com/vitessce/vitessce/pull/1812))


## 3.3.5

### Patch Changes

- Update light2 theme styles to use border rather than grid background. (`@vitessce/vit-s`, `docs`) ([#1809](https://github.com/vitessce/vitessce/pull/1809))

- Add 'light2' theme in which views have a white background. (`@vitessce/layer-controller-beta`, `@vitessce/genomic-profiles`, `@vitessce/spatial-utils`, `@vitessce/utils`, `@vitessce/vit-s`, `@vitessce/vega`, `@vitessce/gl`, `demo`) ([#1800](https://github.com/vitessce/vitessce/pull/1800))

- Do not rely on a higlass server to load chromosome sizes. (`@vitessce/genomic-profiles`) ([#1797](https://github.com/vitessce/vitessce/pull/1797))

- Implement violin plot via D3 (rather than Vega-Lite). (`@vitessce/statistical-plots`) ([#1440](https://github.com/vitessce/vitessce/pull/1440))

- Add Salcher et al., Cancer Cell 2022 demo config. (`@vitessce/example-configs`) ([#1807](https://github.com/vitessce/vitessce/pull/1807))

- Add Lake et al. 2023 config. Fix y-axis min for violin plot. (`@vitessce/statistical-plots`, `@vitessce/example-configs`) ([#1790](https://github.com/vitessce/vitessce/pull/1790))

- Support loading AnnData.obs columns as an obsFeatureMatrix data type. (`@vitessce/statistical-plots`, `@vitessce/zarr`, `@vitessce/schemas`) ([#1806](https://github.com/vitessce/vitessce/pull/1806))

- Use built-in Object.fromEntries. (`@vitessce/spatial-utils`, `@vitessce/utils`, `@vitessce/schemas`, `@vitessce/config`, `@vitessce/vit-s`, `@vitessce/gl`) ([#1808](https://github.com/vitessce/vitessce/pull/1808))


## 3.3.4

### Patch Changes

- Fix circular dependencies between @vitessce/utils and @vitessce/sets-utils. (`@vitessce/utils`, `@vitessce/sets-utils`) ([#1787](https://github.com/vitessce/vitessce/pull/1787))


## 3.3.3

### Patch Changes

- Prevent URLs from being included in download dropdown for Zarr file types. (`@vitessce/spatial`, `@vitessce/zarr`, `@vitessce/vit-s`) ([#1759](https://github.com/vitessce/vitessce/pull/1759))

- SpatialData file type. (`@vitessce/schemas`) ([#1728](https://github.com/vitessce/vitessce/pull/1728))

- Support bitmask segmentations with gaps and irregular orderings. Enable usage of JSON-based Zarr stores in demos for tests. (`@vitessce/layer-controller-beta`, `@vitessce/spatial-beta`, `@vitessce/ome-tiff`, `@vitessce/spatial-utils`, `@vitessce/constants-internal`, `@vitessce/image-utils`, `@vitessce/utils`, `@vitessce/json`, `@vitessce/zarr`, `@vitessce/csv`, `@vitessce/all`, `@vitessce/example-configs`, `@vitessce/schemas`, `@vitessce/config`, `@vitessce/vit-s`, `@vitessce/gl`) ([#1758](https://github.com/vitessce/vitessce/pull/1758))

- Fix volume control text sizing bug in layerController. (`@vitessce/layer-controller`) ([#1746](https://github.com/vitessce/vitessce/pull/1746))


## 3.3.2

### Patch Changes

- Add the prop closeButtonVisible to all views, passed down to TitleInfo, to allow hiding the close buttons on each view by setting this prop in the config. (`@vitessce/vit-s`) ([#1740](https://github.com/vitessce/vitessce/pull/1740))

- Memoize button icons in TitleInfo to prevent unnecessary re-renders" (`@vitessce/vit-s`) ([#1736](https://github.com/vitessce/vitessce/pull/1736))

- Added a prop to hide download buttons and dropdowns. (`@vitessce/vit-s`) ([#1743](https://github.com/vitessce/vitessce/pull/1743))


## 3.3.1

### Patch Changes

- Update Deck.gl to 8.8.27 and Luma.gl to 8.5.21 (`@vitessce/layer-controller-beta`, `@vitessce/spatial-beta`, `@vitessce/gl`, `demo`, `docs`, `html`) ([#1724](https://github.com/vitessce/vitessce/pull/1724))


## 3.3.0

### Minor Changes

- Use Zarrita.js rather than ZarrJS to load Zarr data. (This change is needed to support Zarr features that are required for SpatialData but are not available in ZarrJS.) (`@vitessce/spatial-utils`, `@vitessce/zarr-utils`, `@vitessce/json`, `@vitessce/zarr`, `@vitessce/gl`) ([#1693](https://github.com/vitessce/vitessce/pull/1693))

### Patch Changes

- Types-only package. (`@vitessce/types`) ([#1708](https://github.com/vitessce/vitessce/pull/1708))

- TypeScript types for @vitessce/utils sub-package. (`@vitessce/utils`) ([#1706](https://github.com/vitessce/vitessce/pull/1706))

- Upgrade cypress to fix https://github.com/cypress-io/cypress/issues/27804. (`demo`, `html`) ([#1703](https://github.com/vitessce/vitessce/pull/1703))

- Convert @vitessce/constants-internal to TypeScript by changing file extensions. (`@vitessce/constants-internal`) ([#1701](https://github.com/vitessce/vitessce/pull/1701))


## 3.2.2

### Patch Changes

- Implement a workaround to allow for plugin zod schemas to be used. (`@vitessce/schemas`) ([#1696](https://github.com/vitessce/vitessce/pull/1696))

- Upgrade Viv to get snapping scale bar. (`@vitessce/spatial-beta`, `@vitessce/spatial`, `@vitessce/image-utils`, `@vitessce/gl`) ([#1691](https://github.com/vitessce/vitessce/pull/1691))

- Generate alt text based on existing view-types in config, add this to the VitessceGrid. (`@vitessce/vit-s`) ([#1695](https://github.com/vitessce/vitessce/pull/1695))


## 3.2.1

### Patch Changes

- Use react-aria's useId hook to support React v17. (`@vitessce/layer-controller-beta`, `@vitessce/scatterplot-embedding`, `@vitessce/scatterplot-gating`, `@vitessce/statistical-plots`, `@vitessce/layer-controller`, `@vitessce/feature-list`, `@vitessce/scatterplot`, `@vitessce/heatmap`, `@vitessce/spatial`, `@vitessce/vit-s`) ([#1687](https://github.com/vitessce/vitessce/pull/1687))


## 3.2.0

### Minor Changes

- Added spatialBeta and layerControllerBeta views to support multi-obsType segmentations (`@vitessce/layer-controller-beta`, `@vitessce/spatial-beta`, `@vitessce/vit-s`, `@vitessce/gl`) ([#1581](https://github.com/vitessce/vitessce/pull/1581))


## 3.1.3

### Patch Changes

- Added support for SpatialData image elements by supporting proposed OME-NGFF new coordinateTransformations spec and using the temporary channels_metadata property. (`@vitessce/spatial-utils`, `@vitessce/zarr`) ([#1664](https://github.com/vitessce/vitessce/pull/1664))


## 3.1.2

### Patch Changes

- Use pluralize instead of plur package for pluralization. Wrap in @vitessce/utils. (`@vitessce/utils`) ([#1638](https://github.com/vitessce/vitessce/pull/1638))

- Fix bug causing crash of Vitessce upon gene selection when earlier configs with both raster.json and expression data are used with pseudo-segmentation diamonds in the spatial view. (`@vitessce/spatial`) ([#1669](https://github.com/vitessce/vitessce/pull/1669))

- Display the image channel names in Spatial plot (`@vitessce/spatial`) ([#1647](https://github.com/vitessce/vitessce/pull/1647))

- Implemented expand/collapse button for vitessce.io (`docs`) ([#1651](https://github.com/vitessce/vitessce/pull/1651))

- Improved accessibility of React components (`@vitessce/scatterplot-embedding`, `@vitessce/scatterplot-gating`, `@vitessce/statistical-plots`, `@vitessce/layer-controller`, `@vitessce/feature-list`, `@vitessce/scatterplot`, `@vitessce/heatmap`, `@vitessce/spatial`, `@vitessce/tooltip`, `@vitessce/vit-s`) ([#1612](https://github.com/vitessce/vitessce/pull/1612))

- Fix bug causing crash during image channel name/color mapping for text rendering. (`@vitessce/spatial`) ([#1670](https://github.com/vitessce/vitessce/pull/1670))


## 3.1.1

### Patch Changes

- Updated changeset version script to write the version.json file containing the new package version. (`@vitessce/constants-internal`) ([#1625](https://github.com/vitessce/vitessce/pull/1625))

- Fix formatting of config.uid view-config-json docs. (`docs`) ([#1626](https://github.com/vitessce/vitessce/pull/1626))

- Remove extra version.json update now that it is done via changeset-version script. (`vitessce`) ([#1630](https://github.com/vitessce/vitessce/pull/1630))

- Stringify passed config object to use as key when uid is missing (`@vitessce/vit-s`) ([#1629](https://github.com/vitessce/vitessce/pull/1629))


## 3.1.0

### Minor Changes

- Regenerate View Config store on configKey change (`@vitessce/vit-s`) ([#1617](https://github.com/vitessce/vitessce/pull/1617))

### Patch Changes

- When there is not per-observation centroids, fall back to using the mouse position for tooltips in the spatial view. (`@vitessce/spatial`) ([#1458](https://github.com/vitessce/vitessce/pull/1458))

- Fix duplicate URLs appearing in download dropdown by filtering based on names. (`@vitessce/vit-s`) ([#1458](https://github.com/vitessce/vitessce/pull/1458))

- Added functions to the `VitessceConfig` object-oriented configuration APIs to support multi-level and meta (i.e., complex) coordination. (`@vitessce/config`) ([#1561](https://github.com/vitessce/vitessce/pull/1561))

- Implement hints for zero config mode. (`@vitessce/config`, `docs`) ([#1597](https://github.com/vitessce/vitessce/pull/1597))

  - Added a list of hints that user will select from, when using the zero config mode feature.
  - Modified the user interface, defined in `_ViewConfigEditor.js`:
    - Defined a list of hints, which depend on the types of the files the user pastes URLs for.
    - Removed the `Generate Config` button. Now each hint is a button that generates the view config when pressed.
  - Created a new file `constants.js` in `packages/config` that defines the range of supported hints, along with the name and coordinates of the desired layers.
  - Modified `VitessceAutoConfig.js`:
    - Added a function to return the type of files the user pasted the URLs for. The function is used in `_ViewConfigEditor.js` to determine what set of hints to display.
    - Adapted the existing code to take selected hint into an account, when creating the view config.

- Update styling of UI for auto-config layout hints in App page of docs. (`docs`) ([#1597](https://github.com/vitessce/vitessce/pull/1597))

- Make example packages private to prevent changesets from publishing to NPM (`@vitessce/example-configs`, `@vitessce/example-plugins`) ([#1496](https://github.com/vitessce/vitessce/pull/1496))




## [3.0.1](https://www.npmjs.com/package/vitessce/v/3.0.1) - 2023-06-30

### Added
- Add a URL param option to the demo site to wrap `<Vitessce/>` in `<React.StrictMode/>`
- Added a dropdown in `FeatureList` that allows the user to:
  - select between `alphabetical` and `original` ordering for the feature list.
  - show two columns in the feature list if the feature has a second identifier associated.
- Add initial config logging in `<Vitessce/>` for the pre-upgrade view config.
- Added support for generating view-config for Anndata-Zarr files that don't have .zmetadata file in the folder.
- Turn on unit test coverage in Vitest config.
- Add `useInitialCoordination` hook to get the values of the coordination space from the initial config, which can be used for viewState reset buttons.
- Use `config` object reference as hook dependency when no `config.uid` is present (to support both controlled and un-controlled component cases).
- Initialize Zustand store using closure over `createViewConfigStore` function, rather than via `useEffect`.
- Implement basic solution for multi `ome-zarr` images via `image.raster.json`

### Changed
- Fix Material UI import statement.
- Implemented the functionality required to re-order the feature list, based on the selection from the dropdown:
  - added state variables `featureListSort` and `showFeatureTable`.
  - hooked the state variables to `FeatureListOptions` and to `FeatureList`.
- Fix Heatmap bug causing incorrect positioning of tooltip when using `featureLabels` mapping.
- Modified the `AnndataZarrAutoConfig` class:
  - added a parser function that generates metadata summary without reading `.zmetadata` file.
  - the class calls the parser function if no `.zmetadata` file is present in the given URL.
- Implement custom createGenerateClassName without random numbers involved to ensure deterministic class names.
  - Rename `makeStyles` keys to be more specific to avoid conflicts.
- Only generate ESM builds for `vitessce` and `@vitessce/dev`.
- Use `@tanstack/react-query` for data fetching.
- Fixed a bug in SetManager popover menu, where the text is not visible in vitessce.io in dark mode.

## [3.0.0](https://www.npmjs.com/package/vitessce/v/3.0.0) - 2023-05-24

### Added
- Added a legend for quantitative color scales in the `SpatialSubscriber` and `EmbeddingScatterplotSubscriber` views.
- Support for automatic view config generation for OME-TIFF, Anndata-Zarr and OME-ZARR file formats.
- Added a speaker icon to the documentation nav bar for using the International Phonetic Alphabet (IPA) notation to demonstrate how to pronounce Vitessce.
- Added `image.ome-tiff` and `obsSegmentations.ome-tiff` file types.
- Added `coordinateTransformation` file type options for `image.ome-tiff` and `image.ome-zarr`.
- Modified the styling of the Vega-lite tooltips, so that it matches the scatterplot/spatial/heatmap tooltips.
- Fixed a small bug with the path configuration for the `obsSets` component when using zero config mode.
- Add notes about branch naming conventions and pull request merge process to README
- Added bidirectional interactions for the `CellSetSizesPlot` vega-lite plot to allow the Vitessce view to update and show the selected cluster on bar click.
- Implemented a "select-only" option for the `CellSetSizesPlot` on shift+click. 
- Implemented ability to select a gene by clicking on the heatmap rows for a given gene.
- Added developer troubleshooting instructions to README.
- Add `useFullResolutionImage` to `Spatial` to allow for loading only full resolution image from pyramid.
- Implemented ability to select an area on the Expression Histogram. On select, a new obs set selection is created. The new selection contains the ids of all obs that belong to the selected bars.
- Add integration test for consumer site built with NextJS.
- Implemented ability to show two columns in the feature-list view when each feature has a second identifer associated.
- Add `CITATION.cff`
- Added a button to recenter and rescale data to default for Scatterplot and Spatial views. 
- Removed the Select Rectangle button from Scatterplot and Spatial views.
- Added option to disable tooltips on Heatmap and Scatterplot components. The option is available from the options control dropdown.
- Added an option to skip sorting features alphabetically in feature list.
- Add GitHub Action workflow to report bundle size in PRs.

### Changed
- Fix hot module reloading by refactoring JS files that export React components (the component needs to be the only export for HMR to work). Add react-refresh eslint plugin to check for this moving forward.
- Fixes Go to Definition support in vscode (see https://github.com/microsoft/TypeScript/issues/49003#issuecomment-1164659854).
- Refactor `obsFeatureMatrix` normalization logic out of data loader classes and into custom hooks that can be used in view implementations as-needed.
- Fixed syntax highlighting for code examples and editor in documentation.
- Added a new file `VitessceAutoConfig.js` with methods and classes that can generate view config, given a list of dataset URLs.
- Added a new documentation page: `default-config.md` that describes the auto config generation functionality and how to use it.
- Small changes to the layout of `_ViewConfigEditor.js` to accomodate the new functionality: added a space for pasting links and a "Generate Config" button.
- Update Vitest configuration to only include test files contained within `src` directories.
- Added signals tracking and handling in the vega-lite schema for `CellSetSizesPlot` component.
- Modified the `treeToSetSizesBySetNames` function to return the `setNamePath`, so we can track which hierarchy the cluster represented by the clicked bar belongs to.
- Modified the `CellSetSizesPlotSubscriber` component to reset `cellSetSelection` to equal `setNamePath` when user clicks on a bar in the `CellSetSizesPlot` component.
- Changed `VegaPlot.js` to accept prop called `setName` and overwrite the default tooltip style of vega-tooltip.
- Added a new `styles.js` file that defines the style of the vega-tooltips.
- Changed `CellSetSizesPlot.js` and `CellSetExpressionPlot.js` to pass in `setName` as props when calling `VegaPlot`.
- Added more complex logic in `CellSetSizesPlotSubscriber.js` to determine which bars should be displayed in `CellSetSizesPlot.js`.
- Added a new `set-path-utils` file with the functions containing the more complex logic around choosing which hierarchy to display on the `CellSetSizesPlot`.
- Added one more prop under `data` in `CellSetSizesPlot`, called `isGrayedOut` and made vega-lite to color in gray bars where this property is set to true.
- Added `obsSetExpansion` to coordination scope and started using it in `CellSetSizesPlotSubscriber.js`.
- Added handling for the `onClick` function in the `Heatmap` component. The `Heatmap` component calls the `onHeatmapClick` function, defined in the `HeatmapSubscriber`, every time a user clicks on the heatmap. The `onHeatmapClick` function sets the currently selected gene to be equal to the gene the user clicked at. It also sets the cell color encoding to `geneSelection`.
- Upgrade `Viv` to `0.13.7`
- Fix physical size scaling for non-square 2D pixels.
- Removes logic for `tsconfig.json` from the meta-updater script
- Update issue template.
- Update documentation: fix broken links to source code, move Showcase to its own page from About page, replace Roadmap page with link to GitHub project.
- Updated how TypedArrays are diff-ed in `BitmaskLayer` to reduce memory usage.
- Changed the `ExpressionHistogramSubscriber` component:
  - Added ADDITIONAL_OBS_SETS, OBS_SET_COLOR, OBS_COLOR_ENCODING and OBS_SET_SELECTION coordination types to the Feature Histogram.
  - Added a new function called `onSelect`, passed as props to `ExpressionHistogram`. On selection on `ExpressionHistogram`, the function computes what cell ids belong to that selection. Then calls the pre-existing `setObsSelection` function to create a new cell set with the cell ids.
- Added a signal to `ExpressionHistogram` component, which calls `onSelect`, after 1 minute of debounce.
- Replace Ajv with Zod.
  - Add generic config schema.
  - Add builder function for generating plugin-specific config schema.
  - Reimplement config version upgrades.
- Provide plugins as React props rather than registering them globally on `window`.
- Use hooks in `ObsSetsManagerSubscriber` to improve controlled-component performance.
- Revert change that removed `airbnb` eslint config.
- Only set `additionalObsSets` in coordination space when upgrade was necessary to prevent infinite loop.
- Fix bug causing cell set hierarchy created via `Create hierarchy` button to contain the string `undefined` (e.g., `My hierarchy 1undefined`)
- Fix bug in `CellSetSizesPlotSubscriber` causing page to crash when no `obsSets` view is present (due to expectation of initialized `obsSetSelection` and `obsSetExpansion` coordination values).
- Fix bug causing incorrect gene selection upon heatmap click when `featureLabels` are used (such as in the case of gene aliases used in the HuBMAP data portal view configs).
- Added a new prop to `FeatureListSubscriber` to read in `showTable`, having it false by default.
- Modified the `FeatureList` component to pass in 2 columns and 2 column labels if `showTable` is true, otherwise just 1 column and 1 columnLabel if `showTable` is false.
- Modified the `SelectableTable` component and the table styles to handle showing 2 cells per row.
- Use `es2019` in Vite bundle targets for `packages/main/prod` and `packages/main/dev` to support HuBMAP portal-ui.
- Changes in `ToolMenu`:
  - Added a new button that calls `onRecenterButtonCLick` function on click.
  - Added css for the new button and introduced differentiation between a button and a tool.
- Added a new function `recenter` to `AbstractSpatialOrScatterplot` that gets overriden by descendants.
  - Added an implementation of that function in `Spatial` and `Scatterplot`.
  - The function is passed to `ToolMenu` as prop by `AbstractSpatialOrScatterplot` and called on click.
- Removed the `select rectangle` tool and all references to it.
- Added a state variable called `originalViewState` in `SpatialSubscriber` and `EmbeddingScatterplotSubscriber`.
  - `originalViewState` holds the value of the initial position of the view and is used for recentering.
- Fix bug preventing correct view sizing upon `config` prop change when `<Vitessce/>` used as a controlled component.
- Modified `HeatmapOptions`, `SpatialOptions` and `ScatterplotOptions` components - added a checkbox for making the tooltip not visible.
- Added a `tooltipsVisible` to the coordination scope for `Heatmap`, `Spatial` and `Scatterplot` coordination types. Its default value is true. Modified the components to hide the tooltip if `tooltipVsisible` is false.
- Removed `disableTooltip` from `props`.
- Fix bug that may cause `originalViewState.target` to not be an array as expected.
- Adjust the code in `onHover` in `Heatmap.js` to track cell position also for cells that are on the cell set bar.
- Add function `useGetObsMembership` in `hooks.js` to get the full path of the cell that was clicked.
- Adjusted the `onHeatmapClick` function in `HeatmapSubscriber.js` to distinguish between clicks on the heatmap and clicks on the cell set bar and take according actions.
- Added a prop `sort` in `FeatureListSubscriber`, with default value equal to `alphabetical`.
- Modified component `FeatureList` so that if sort is not equal to `alphabetical`, then sorting of data is skipped and the order of feature listis the same as original.
- Fixed equality check when creating default model matrices for `sizes`
- Split useEffect into useMemo + useEffect in SpatialSubscriber to fix infinite loop for `neumann-2020` demo on the docs site.
- Delay computing the initial view state longer in EmbeddingScatterplotSubscriber to ensure the view width/height is finished animating.
- Made the cursor type to `pointer` when the user is hovering over the heatmap.
- Fixed a bug in `CellSetSizesPlotSubscriber` plot causing rending of empty `CellSetSizesPlot` when there is no `obsSets` view (due to expectation of initialised `cellSetExpanded` coordination value).
- Created `FeatureListOptions` component, which allows the user to change the sorting order of the feature list.

## [2.0.3](https://www.npmjs.com/package/vitessce/v/2.0.3) - 2023-02-01

### Added
- Re-implemented PR 1240 (coordinationScopesBy)
- Added `MuData` file types.
- Added a `uid` prop for `VitS` to fix Jupyter notebook style conflicts caused by multiple `Vitessce` widget instances loaded in the same `JupyterLab` session.
- Added `!important` statements to override Jupyter Notebook (classic) style conflicts.
- Added `vite.config.js` and `pnpm run bundle` for bundling sub-packages as proper ESM.
- Added test for a "consumer" package of the Vitessce sub-packages in `consumer/` directory, with a corresponding cypress test in `sites/html/cypress/e2e/html.spec.cy.js`.

### Changed
- Converted all `rem` units to `px` to fix R/Python widget CSS bugs caused by different root style conflicts.
- Comment out `_DiffViewConfigSchema` in the docs to fix bug.
- Switched to using `react` via esm.sh rather than `es-react` via unpkg for the Cypress tests in `sites/html`.
- Simplify HiGlass dynamic import (possible now since no longer using Webpack) to resolve bug in Vitessce Python.
- Upgrade `Viv` to `0.13.6` to support OME-NGFF `v0.4`
- Use `pnpm pack` in all subpackages so that outdated packages from NPM are not used during the consumer package install test.
- Update GitHub Pages tutorial in docs.

## [2.0.2](https://www.npmjs.com/package/vitessce/v/2.0.2) - 2022-12-09

### Added
- Added ./copy-dev.sh and ./copy-docs.sh instructions.
- Added plugin registration exports to the `main/all` package exports, so that they are included in `vitessce` and `@vitessce/dev` package exports.

### Changed
- Don't `await` AnnData payloads that might be accessed in quickly repeatedly (i.e cache the promise, not the payload).
- Fixed CSS bug in the development demo: changed `overflow: hidden` to `overflow: scroll` on the list of demos.
- Bumped `@vitejs/plugin-react` version from `1.3.2` to `3.0.0-beta.0`
- Update parameters of MUI `createGenerateClassName` so that class names are deterministic
- Fixed broken cell highlight crosshairs upon hover events in scatterplots/spatial/heatmap views by porting SCSS to MUI JSS.
- Upgrade Viv to `0.13` and deck.gl to `8.8`
- Interleaved rgb images obey visibility prop
- Added workaround in `Spatial` view for apparent bug in DeckGL `PolygonLayer` preventing passing polygon vertices via `Uint32Array`.

## [2.0.1](https://www.npmjs.com/package/vitessce/v/2.0.1) - 2022-11-20


### Added
- Added `gating` component that allows users to dynamically generate a scatterplot based on gene expression values.
  - New coordination types of `gatingFeatureSelectionX` and `gatingFeatureSelectionY` for the values selected for the gating plot.
- Added new `arcsinh` option for the coordinaition type `featureValueTransform`
- Added new coordination type `featureValueTransformCoefficient` to apply a coefficent to a feature value transform.
- Added new demos to the documentation to showcase the new obs-by-feature features.
- Added `ViewType` as a main export from `src/index.js` alongside `Component`. Replaced `Component` with `ViewType` in the documentation.

### Changed
- Added new file type and data type constants.
- Implemented "minimal" file types and data types:
  - Added loaders for `obsSets.json` and `obsSets.cell-sets.json`.
  - Added loaders for `obsFeatureMatrix.clusters.json`
  - Added loaders for `obsFeatureMatrix.genes.json`
  - Added loaders for `obsLabels.cells.json`, `obsEmbedding.cells.json`, `obsLocations.cells.json`, `obsSegmentations.cells.json`
  - Added loaders for `image.raster.json`,`obsSegmentations.raster.json`, `image.ome-zarr`
  - Added loaders for `obsLabels.anndata-expression-matrix.zarr`, `featureLabels.anndata-expression-matrix.zarr`, `obsFeatureMatrix.anndata-expression-matrix.zarr`
  - Added loaders for `obsFeatureMatrix.expression-matrix.zarr`
  - Added loaders for `obsLabels.molecules.json` and `obsLocations.molecules.json`
- Added support for `datatype: 'obs'` in `obsSets.schema.json`
- Added the property `coordinationValues` for view config file definitions.
- Added the `useMatchingLoader` hook.
- Added tests for checking that FileType constants have been mapped to corresponding data types and loader classes.
- Implemented support for `obsLabelsType` which supersedes `factors`.
- Implemented obs set membership tooltips.
- Fixed bug in the v1.0.0 to v1.0.1 view config upgrade function caused by modification of a reference to the config object.
- Changed the `VitessceConfig` constructor and `VitessceConfigDataset.addFile` method to use named arguments via JS objects.
- Renamed and moved components
  - `genes/Genes` -> `feature-list/FeatureList`
  - `sets/CellSetsManagerSubscriber` -> `obs-sets/ObsSetsManagerSubscriber`
  - `sets/CellSetExpressionPlot` -> `statistical-plots/CellSetExpressionPlot`
  - `sets/CellSetSizesPlot` -> `statistical-plots/CellSetSizesPlot`
  - `genes/ExpressionHistogram` -> `statistical-plots/ExpressionHistogram`
- **Monorepo**
  - Change `<Vitessce/>` -> `<VitS/>` within @vitessce/vit-s
  - Wrote blog post
  - Updated docs to make them compatible with new build setup
  - Converted SCSS to JSS, for both external and internal stylesheets
  - Converted unit/component testing setup to jest/vitest/react-testing-library
  - Converted demo development server to vite
  - Converted inline worker bundling to `@vitessce/workers` sub-package with rollup + rollup plugin
  - Converted SVG React component imports to `@vitessce/icons` sub-package with vite + svgr
  - Converted glslify #pragma + webpack plugin to glslify CLI in `@vitessce/gl/src/glsl` with string manipulation to prevent need for plugin
- Make sure to exclude the background image when using `transparentColor`
- Fixed bug preventing `onConfigChange` from being called upon view resize events.


## [1.2.2](https://www.npmjs.com/package/vitessce/v/1.2.2) - 2022-09-23



### Added

### Changed

- Speed up heatmap load times (including when cell ordering changes) by implementing a custom indexing scheme on the shaders (see `src/components/heatmap/heatmap-indexing.pdf` for more info)
- Fixed deploy workflow to only attempt `npm publish` if the local version is higher than the latest version currently on NPM (indicating that a release is needed).


## [1.2.1](https://www.npmjs.com/package/vitessce/v/1.2.1) - 2022-08-03

### Added
- Added `gating` component that allows users to dynamically generate a scatterplot based on gene expression values.
  - New coordination types of `gatingFeatureSelectionX` and `gatingFeatureSelectionY` for the values selected for the gating plot.
    - Fixed bug in `GatingSubscriber` which accidentally modified the shared `cells` data object.
- Added new `arcsinh` option for the coordinaition type `featureValueTransform`
- Added new coordination type `featureValueTransformCoefficient` to apply a coefficent to a feature value transform.
- Added support for loading categorical columns stored as zarr groups from `anndata-cell-sets.zarr` file types.
- Pin `zarr.js` to `0.5.1` to fix URL concatentation issue.

### Changed
- Pass `NODE_OPTIONS` to the `npm publish` step of the deploy GitHub Action.


## [1.2.0](https://www.npmjs.com/package/vitessce/v/1.2.0) - 2022-07-22

### Added
- Added the property `coordinationValues` for view config file definitions but is not yet used to do file matching/lookups.
- Added warning log messages when outdated constant values have been accessed (via JS Proxy).
- Added the optional `uid` property for view definitions in the view config.
- Added `enableMultiSelect` prop for `GenesSubscriber`. Current built-in views do not display multiple gene selections but plugin views could use this functionality.
- Added a mapping from file types to data types, making the `datasets[].files[].type` property no longer required.
- Added a registration function for plugin convenience file types.
- Added coordination types for entity types.
  - `obsType`
  - `featureType`
  - `featureValueType`
- Add more usage examples to the `about` documentation page.
- Added `npm run start:nolint` script to disable linting for quickly prototyping code.
- Added the optional `isBounded` property to the `Vitessce` React component that prevents users from dragging or resizing components beyond the original grid boundary.
- Added support for multiple `cellColor` tracks in the Heatmap component.

### Changed
- Fixed buggy view closing behavior by using the view `uid` rather than the index as the component `key`.
- Update code to reflect renaming of the default branch from `master` to `main`.
- Concatenate gene alias with original id for uniqueness in the presence of duplicates like `alias (original)`
- Change spatial layer coordination type names.
  - `spatialRasterLayers` -> `spatialImageLayer`
  - `spatialCellsLayer` -> `spatialSegmentationLayer`
  - `spatialMoleculesLayer` -> `spatialPointLayer`
  - `spatialNeighborhoodsLayer` -> `spatialNeighborhoodLayer`
- Added the required `schemaVersion` parameter in the `VitessceConfig` constructor. (Breaking change for the `VitessceConfig` API.)
- Improved documentation.
  - More consistently using the term "view type" rather than "component".
  - Added a config schema version diff tool to the view config JSON documentation page.
- Changed cell- and gene-related coordination type names.
  - `cellFilter` -> `obsFilter`
  - `cellHighlight` -> `obsHighlight`
  - `cellSelection` -> `obsSelection`
  - `cellSetSelection` -> `obsSetSelection`
  - `cellSetHighlight` -> `obsSetHighlight`
  - `cellSetColor` -> `obsSetColor`
  - `geneFilter` -> `featureFilter`
  - `geneHighlight` -> `featureHighlight`
  - `geneSelection` -> `featureSelection`
  - `geneExpressionColormap` -> `featureValueColormap`
  - `geneExpressionColormapRange` -> `featureValueColormapRange`
  - `cellColorEncoding` -> `obsColorEncoding`
  - `additionalCellSets` -> `additionalObsSets`
  - `embeddingCellSetPolygonsVisible` -> `embeddingObsSetPolygonsVisible`
  - `embeddingCellSetLabelsVisible` -> `embeddingObsSetLabelsVisible`
  - `embeddingCellSetLabelSize` -> `embeddingObsSetLabelSize`
  - `embeddingCellRadius` -> `embeddingObsRadius`
  - `embeddingCellRadiusMode` -> `embeddingObsRadiusMode`
  - `embeddingCellOpacity` -> `embeddingObsOpacity`
  - `embeddingCellOpacityMode` -> `embeddingObsOpacityMode`
- Fixed schema v1.0.12
- Removed the requirement for `cellSets` data in the CellSetsManagerSubscriber component to support the use case where all cell sets are provided via `additionalCellSets` / the coordination space.
- Use Node v16 and NPM v8 for development, testing, and CI. Motivated by [issue](https://github.com/npm/cli/issues/2610) caused by GitHub SSH URLs in NPM v6-formatted package-lock.
  - Fixed package-lock issue

## [1.1.21](https://www.npmjs.com/package/vitessce/v/1.1.21) - 2022-04-27

### Added
- Adds new view config schema version `1.0.8` to support multiple `dataset` coordination scopes and dataset-specific coordination scope mappings for all other coordination types
  ```js
  datasets: [
    { uid: 'my-query', ... },
    { uid: 'some-atlas', ... },
  ],
  coordinationSpace: {
    dataset: {
      REFERENCE: 'some-atlas',
      QUERY: 'my-query',
    },
    embeddingType: {
      common: 'UMAP',
    },
    embeddingZoom: {
      refZoom: 2,
      qryZoom: 4,
    },
    ...,
  },
  layout: [
    {
      component: 'qrComparisonScatterplot',
      coordinationScopes: {
        dataset: ['REFERENCE', 'QUERY'],
        embeddingType: 'common',
        embeddingZoom: { REFERENCE: 'refZoom', QUERY: 'qryZoom' },
      },
      x: 0, y: 0, w: 5, h: 12,
    },
    ...,
  ],
  ...
  ```
- Add support for plugin view types, coordination types, and file types.
- Added more exports in `src/index.js` to better support plugin development.
- Added data troubleshooting documentation page.
- Added more old presentation links to the README.

### Changed
- Merged dependabot PRs.
- Allow `Description` component to render without a dataset.


## [1.1.20](https://www.npmjs.com/package/vitessce/v/1.1.20) - 2022-04-21



### Added
- Add a tutorial that describes how to deploy a Vitessce web app to GitHub pages.
- Support `var` alias for AnnData to display altenrative gene names via new `geneAlias` field.

### Changed
- Use a hash table lookup instead of calling `indexOf` repeatedly for the heatmap component tiling.
- Fix `molecules` layer sizing


## [1.1.19](https://www.npmjs.com/package/vitessce/v/1.1.19) - 2022-03-30

### Added
- Added a roadmap page to the documentation.

### Changed
- Update README: Point users to vitessce.io, use smaller screenshots, drop low-level details.
- Upgrade Viv to 0.12.6 to fix shader compilation issue with interleaved RGB images
- Fixed layer controller raster channel slider bug, related to [MUI slider issue](https://github.com/mui/material-ui/issues/20896).
- Started to update the documentation to use the term "view" rather than "component".


## [1.1.18](https://www.npmjs.com/package/vitessce/v/1.1.18) - 2022-02-14

### Added
- Added the `scoreName` property to the view config schema for the `anndata-cell-sets.zarr` file type.
- Added a new documentation site.
- Added the `./create-release.sh` Bash script to automate some steps of the release process.

### Changed
- Fix selection issue for bitmasks in external applications.
- Update deployment scripts to push the documentation site to `vitessce.io` and the minimal demo to `dev.vitessce.io`.
- Fix bug preventing user-defined colors provided via `cell-sets.json` from being used in the visualization.
- Upgrade `@material-ui/core` dependency from `4.8.3` to `4.12.3` in package-lock.json.
- Fix issues in the `LayerController` related to MUI's change from `ExpansionPanel` to `Accordion`.
- Added support for OME-NGFF v0.3 by upgrading Viv to `0.12.0`
- Bump dependency versions based on `npm audit` and dependabot pull requests.
- Updated Heatmap `layerFilter` function to reflect [changes between deck.gl 8.5 and 8.6 ](https://deck.gl/docs/upgrade-guide#layer-filtering)
- Updated R package URLs (to reflect repo name change from `vitessce-r` to `vitessceR`).
- Bump deck.gl version from `8.6.0` to `8.6.7` and bump viv version from `0.12.0` to `0.12.5` to fix [GLSL errors for 3d on chrome](https://github.com/hubmapconsortium/portal-ui/issues/2419#) issue.


## [1.1.17](https://www.npmjs.com/package/vitessce/v/1.1.17) - 2021-11-04

### Added

### Changed
- Updated the `build-lib:prod` npm script in `package.json` to generate the `esm` build in addition to the `umd` build.
- Fixed bug preventing opening of the popper menu for channel colors in the spatial layer controller component.
- Fixed bug where the border of polygons did not show expression values.  Needed to make sure instanced attributes were used when appropriate.
- Fixed tooltip z-index bug by switching a custom implementation to the MUI `<Popper/>` component.
- Changed `Array(...new Set(x))` to `Array.from(new Set(x))` in `CellSetsZarrLoader.js` to prevent compilation of the former to `Array.apply(void 0, new Set(x))`.
- Updated styles of `<ChannelSelectionDropdown/>` to prevent text cutoff.

## [1.1.16](https://www.npmjs.com/package/vitessce/v/1.1.16) - 2021-10-26

### Added
- Added support for passing an array to `setNames` within `options` objects for the `anndata-cell-sets.zarr` file type, which enables creating cell set hierarchies based on coarse-to-fine columns in `adata.obs`.
- Add esbuild script to generate ES Module library bundle

### Changed
- Fix bitmask picking/highlighting.
- Upgrade `Viv` to 0.11.0
- Fixed radius size of "edit handle" points rendered by the nebula.gl `EditableGeoJsonLayer` within `SelectionLayer`.
- Fixed incorrect cacheing of data sources by URL when URL is undefined (for instance, the `raster.json` data type may use `options` in place of `url`).

## [1.1.15](https://www.npmjs.com/package/vitessce/v/1.1.15) - 2021-09-21

### Added
- PR template including reminder for potential R and python package PR's when version schema changes.

### Changed
- Fix channel settings consistency issue while channels are loading for 3D/large imaging datasets.
- deck.gl should be pinned to minor version
- Upgrade Viv to 0.10.6 and deck.gl to 8.5
- Don't show image layer buttons if there is only one layer.
- Fix spatial options to only show what is necessary and display at all if necessary.
- Fix bug introduced by #1037 that broke channel removal/addition.
- Fix setting default schema values for properties that are not in the current deck.gl view state (for example, the z direction for `target`).
- Moved creation of `useViewConfigStore` and `useAuxiliaryStore` to the `ViewConfigProvider` and `AuxiliaryProvider` contexts (rather than creating global stores).

## [1.1.14](https://www.npmjs.com/package/vitessce/v/1.1.14) - 2021-09-01

### Added
- Add loading callbacks for gene selection.
- Added cell opacity modes
    - Auto mode (default)
    - Manual mode
- Added cell radius modes
    - Auto mode (default)
    - Manual mode
- Added a slider for `geneExpressionColormapRange` to the `ScatterplotOptions` component.
### Changed
- Prevent heatmap re-ordering when gene selection is made.
- Improve handling of large, thin volumes.  Those that cannot be loaded at all should not be shown with volume options.
- Switched to performing quantitative color mapping on the scatterplot shaders to enable fast responses to the heatmap colormap slider interactions.
- Updated scatterplot and heatmap shaders to take the `geneExpressionColormap` coordination value into account.
## [1.1.13](https://www.npmjs.com/package/vitessce/v/1.1.13) - 2021-08-10

### Added
- `disableChannelsIfRgbDetected` prop for turning of channel controllers when rgb is detected.

### Changed
- Introduce two-step data loaders for AnnData "files".
- Update README to have more info on using view configs via url parameters.
- Add a check for schema changes - schemas may not be updated once published, only new ones added.
- Make two-step data loaders universal for all file types.
- Upgrade `higlass-zarr-datafetchers` to 0.2.1 to prevent the latest Zarr.js from making failed HEAD requests.
- Replace "hubmapconsortium/vitessce" with "vitessce/vitessce"
- Fixed performance issue involving selection of many cells by using `Set.has` rather than `Array.includes`.

## [1.1.12](https://www.npmjs.com/package/vitessce/v/1.1.12) - 2021-07-20

### Added
- Attach on load callbacks and loading indicators to layer controller when using (global) selection slider.
- Added a new view config version `1.0.2` with corresponding upgrade function to fix backwards compatibility of the layer controller. The upgrade function sets the prop `globalDisable3d` for any layer controller components to keep the previous 2D-only functionality that older view configs would expect.

### Changed
- Change bitmask rendering to only display a unique pixel value instead of blending.
- Use component height for determining 3D sizing.
  - Use state rather than computing every render.
- Fix cell highlight bug with bitmask where tooltip information remains on screen after no longer highlighting.
- No selection of cells in bitmask now results in default "grey" color instead of the last selected cell set.
- Cache computation of internal data structures on `AnnData` zarr loaders.
- Upgrade zarr.js to 0.4.0
- Make getting node size efficient by using `reduce` instead of `length`.
- Fixed backwards-compatibility `spatialRasterLayers` bugs:
    - The layer `type` should not be used, since it is currently expected to be either `"raster"` or `"bitmask"`, but previously was allowed to be any string including `"t"`. Instead, need to detect whether the layer is a bitmask layer using `layerMeta.metadata.isBitmask` defined in the `raster.json` file definition.
    - The `visible` property was previously only available for channels. Now, there is a per-layer `visible` property, but old view configs may not contain this. Therefore, we need to explicitly check that the value is a boolean rather than simply falsy `undefined` or `null`.
    - Enforce `type` of `spatialRasterLayers` layer as `bitmask` or `raster`.

## [1.1.11](https://www.npmjs.com/package/vitessce/v/1.1.11) - 2021-06-25

### Added
- Global visibility button next to name in layer controller.
- Volumetric ray casting from `Viv`
    - Upgrade `Viv` to 0.10.4
    - Add new coordination types `spatialRotationX` `spatialRotationY` `spatialRotationZ` `spatialRotationOrbit` `spatialOrbitAxis` and update `spatialRasterLayers` with new parts
    - Add spatial view state coordination types to `LayerController`
    - Update UI for `LayerController`
- Global visbiility prop per layer in `spatialRasterLayers`.
- Add indication to Y axis title of cell set expression violin plot when log-transformation is active.

### Changed
- Cache cell set polygon outputs and do not calculate them unless requested.
  - Modify the cache to use an array of tuples, since using an array as an object key results in conversion to string.
- Clean up `getFlatArrDecompressed` fetching.
- Fix bitmask remove button style.
- Offsets error message gives the URL that failed, and the HTTP status.
- Don't show 3D dropdown if only 2D is available.
- Don't show Volume tab (or any tabs) when 3D is not available.

## [1.1.10](https://www.npmjs.com/package/vitessce/v/1.1.10) - 2021-05-19

### Added
- Add support for bitmasks to `Spatial` component and raster schema.
- Worker pool for processing heatmap tiles.

### Changed
- Use GH Action for Cypress specifically due to random failures on OME-TIFF example.
- Use raster loader for initial view state when present instead of cells.
- Fix `VlenUtf8` parsing for zarr.
- Fix bug where adding/removing layers only adds a `bitmask` controller.
- Fix condition for showing lasso with bitmask and/or centroids.
- Fix 0's displaying when selection is not enabled for `Spatial`.
- Fix bug where polygons or centroids would show under the `bitmask`.
- `bitmask` color texture creation assumed that `cellColors` prop was only rgb, but it can be rgba.
- Fix bug where quadtree wouldn't work with only scatterplot.
- Fix controller padding bug.
- Ensure `VlenUtf8` filter is only used/checked when necessary.

## [1.1.9](https://www.npmjs.com/package/vitessce/v/1.1.9) - 2021-05-07

### Added
- Add opacity slider when `layerController` is closed, with label.

### Changed
- Fix `cellSetColor` null bug.
- Improve violin plot performance by making `useExpressionByCellSet` faster.
- Allow for autosizing `CellSetExpressionPlot` bottom margin depending on axis labels.
- Make margin bottom of `CellSetExpressionPlot` proportional to the square root of the number of characters because the `labelAngle` is 45.

## [1.1.8](https://www.npmjs.com/package/vitessce/v/1.1.8) - 2021-03-31

### Added

### Changed
- Don't request `zattrs` every time when running `loadGeneSelection` on the AnnData loader.
- Fixed scale bar not displaying from `Viv` `0.9.3` issue.
- Fixed interleaved image not dispalying bug.
- Fix `raster` schema bug.
- Cache initial load of image settings.

## [1.1.7](https://www.npmjs.com/package/vitessce/v/1.1.7) - 2021-03-24

### Added
- Added logo to README.
- Log2 (plus 1) scaling for Violin Plot
- Add gene name to expression violin plot.
- Added a new view config schema version `1.0.1` which splits `spatialLayers` into `spatialRasterLayers`, `spatialCellsLayer`, `spatialMoleculesLayer`, and `spatialNeighborhoodsLayer`.
    - Added an auto-upgrade function to upgrade from v1.0.0 to v1.0.1.
    - Spatial layer definition objects in v1.0.1 do not have a `type` property.
- Added support for OME-Zarr raster files with the `OmeZarrLoader` class.
- Added a `title` prop for all subscriber components, to allow users to override component titles through the view config.
- `fetchOptions` for zarr loader via `requestInit` in config.

### Changed
- Fix bug from #867 where the view config is temporarily invalid due to null values.
- Separate out hooks to allow for arbitrary gene slicing.
- Update AnnData loader to handle artbitrary gene slicing.
- Updated the data hook functions to handle coordination value initialization, rather than doing initialization at the subscriber component level.
- `useDevicePixels` for large datasets in `AbstractSpatialOrScatterplot`.
- Use `Array.from` instead of `new Array` for `BaseAnnDataLoader`
- Use `concaveman` instead of `@turf/concave`.
- Fix `categories` parsing for AnnData with `dtype=|O`.
- Do not do call `makeDefaultGetCellIsSelected` if not necessary.
- Upgrade `Viv` to 0.9.3.
- Fix bug where formatting was required for image loader `metadata`.

## [1.1.6](https://www.npmjs.com/package/vitessce/v/1.1.6) - 2021-03-05

### Added
- Added a banner to the current minimal demo site, pointing to the beta version of the documentation and next iteration of the demo site.

### Changed
- Used `DataFilterExtension` from `deck.gl` to speed up filtering selections.

## [1.1.5](https://www.npmjs.com/package/vitessce/v/1.1.5) - 2021-02-25

### Added
- View state will automatically be set if it is not found for `Scatterplot` and `Spatial` components.

### Changed
- Added a check for undefined in the `nodeToSet` function in `cell-set-utils.js`.
- Fix bug which previously caused `anndata-cells.zarr` file types to fail to load when lacking a `"factors"` option.
- `targetX` and `targetY` coordination values are `null` by default.

## [1.1.4](https://www.npmjs.com/package/vitessce/v/1.1.4) - 2021-02-11

### Added
- Added an optional `description` field to the dataset definition config object. Updated the `<Description/>` component to prefer this value over the top-level description value, if available.
- Add `transparentColor` to `LayerController` for multi-modal imaging.

### Changed
- Fix AnnData text decoding.
- Refactor AnnData flat array decoding and resolve bug.
- Upgrade viv to 0.8.3
- Fix non-string cell id parsing in AnnData.
- Add automatic physical size scaling for multi-modal imaging if sizes are found.

## [1.1.3](https://www.npmjs.com/package/vitessce/v/1.1.3) - 2021-01-07

### Added
- Added a windows OS build to the Github Actions test matrix.

### Changed
- Upgrade Viv to 0.8.2 and deck.gl to 8.4.0-alpha.4

## [1.1.2](https://www.npmjs.com/package/vitessce/v/1.1.2) - 2020-12-31

### Added
- Allow for non-remote raster schemas.

### Changed
- Upgrade Viv to 0.8.0 and deck.gl to 8.4.0-alpha.2
- Added GitHub Actions workflow to replace the Travis CI workflow.
- Fix `test.sh` branch variable again.
- Fix deploy step again.
- Changed to using camelCase in the cell-sets-tabular schema.
- Fixed CSV and JSON file import / export bugs in the cell set manager component.

## [1.1.1](https://www.npmjs.com/package/vitessce/v/1.1.1) - 2020-12-27

### Added
- Implemented the view config API in JavaScript in a class called `VitessceConfig`.
- Add searchable genes list.
- Support loading AnnData from zarr.
- Added scatterplot component options pane.
- Added a `TextLayer` to render cell set names over the corresponding cell set centroid in the scatterplot.
- Added a gene expression histogram Vega-Lite component and a cell set by gene expression violin plot Vega component.

### Changed
- Genes list is now a virtual scroll to allow for more performant rendering.
- Fix molecules highlight reversion - hovered molecules now appear in the status component.
- Remove "Add Channel" button for RGB images.
- Lazy load HiGlass (and PIXI.js) from absolute URLs (unpkg) to avoid dynamic script import issues with relative paths after bundling.
    - When loading JS resources for HiGlass and PIXI.js, use the current environment (dev/prod) to determine `min.js` vs `js` extensions, and use `package.json` to determine package versions.
- Make ability to do cell set operations (union, intersection, complement) less restrictive
- Implemented the `genomicZoomX`, `genomicZoomY`, `genomicTargetX`, and `genomicTargetY` coordination types for coordinating the zoom and pan interactions of multiple HiGlass views.
    - Simplified the `hgViewConfig` prop so that it supports only a single HiGlass view, and then allows Vitessce to handle the HiGlass view's `initialXDomain` and `initialYDomain` properties (through the coordination space), as well as the rest of the view config.
    - Added the `genomicProfiles` component which abstracts away the HiGlass view config.

## [1.1.0](https://www.npmjs.com/package/vitessce/v/1.1.0) - 2020-11-17

### Added
- Built-in support for encoding and decoding compressed conf as url param.
- Add heatmap controls state to saved view config.
- Add `spatialLayers` validation to config schema.
- Add heatmap support to schema.
- `domainType` is now part of the raster spatial layers.
- `domain` is now removed from raster spatial layer channel definition schema, since channel-level domain settings could conflict with layer-level domain _type_ settings.

### Changed
- Fixed schema validity as state updates.
    - Expanded schema to allow null values which denote that these values can be auto-initialized.
        - Note that we do not want the empty array to denote anything special.
- For demos, added a `&debug=true` GET parameter option, to enable logging and validating the published view config on every change.
- Updated cell set functionality to support exporting state via view config:
    - Added the `additionalCellSets` coordination type to store user-defined cell sets
    - Added the `cellSetColor` coordination type to store mappings from cell set paths to cell set colors (for both user-defined and dataset-defined cell sets).
    - Updated the code to avoid reliance on uuid "key" variables. Instead, we want to always use the "name path": the array of strings representing the path down the hierarchy to the node.
    - Removed the distinction between "visible" sets and "selected" (i.e. checked) sets.
- Upgrade deck.gl to 8.3 and viv to 0.5
- Fix build issues with nebula.
- Use URL fragment instead of query param for `export-utils`.
- Store updates to the grid layout (removing / moving / resizing) in the view config zustand store.
- Clear the cell set selection when selecting a gene in `GenesSubsrciber`. Clear the gene selection when selecting cell set(s) in `CellSetsManagerSubscriber`.
- Don't require raster imagery for `layerController`.
- Fix bug from removing `domain` from the config schema that prevented updates when loader selection changes.
- Fix `additionalCellSets` having a tree without a version number.
- Update Viv reference

## [1.0.0](https://www.npmjs.com/package/vitessce/v/1.0.0) - 2020-09-2

### Added
- Introduced a [zustand](https://github.com/react-spring/zustand) store for managing the view config:
    - coordination space
    - layout
        - component-level coordination scopes
- Introduced a provider component: `DatasetLoaderProvider`.
    - `DatasetLoaderProvider` sets up Loader objects for each file of each dataset in the view config.
    - `VitessceGrid` is a consumer of `DatasetLoaderProvider` and injects the mapping from datasets-to-loaders into the child `___Subscriber` components. This functionality replaces the `SourcePublisher` component.
        - The loading spinner was moved into a new `LoadingIndicator` component.
        - Added a new prop `isReady` for the `TitleInfo` component (parent of the `LoadingIndicator` component), so that each `___Subscriber` component can handle its own loading spinner.
- Added a required `version` property to the view config schema.
- Added the `initStrategy` property to the `v1.0.0` view config schema, where the value can be one of `"auto"` or `"none"` (and potentially other things in the future).
    - This will determine how the coordination space is initialized.
    - `"auto"` results in certain coordination types having "global" coordination (all components map to same scope) while the remaining coordination types have "independent" coordination (all components map to different scopes).
        - The `"auto"` strategy also respects any initial coordination setup, and only fills in missing values.
- Added support for both `v0.1.0` ("legacy") and `v1.0.0` (coordination model) view configs via an `upgrade()` function.
    - `v0.1.0` view configs will be validated against the `v0.1.0` schema, then upgraded, and then validated again against the `v1.0.0` schema.
- Added a unique name constraint for cell set names.
    - Because `cellSetSelection` is now a coordination type, the value must be stored in the view config. Previously, multiple cell sets were allowed to exist with the same name because cell sets were identified with a random uuid key internally. We would not want a random uuid key to "leak" into the global state or view config, and instead want to use an externally-meaningful name when identifying cell sets in the view config.
    - Due to this constraint, the automatic naming for cell selections as `"Current selection"` (or `"Current union"`, `"Current intersection"`, `"Current complement"`) have been changed to `"Selection {i}"` (or `"Union {i}"`, `"Intersection {i}"`, `"Complement {i}"`) where `{i}` is the next integer that does not cause a conflict.
- Added the optional `onConfigChange` and `onLoaderChange` callback props to the `Vitessce` component.
    - These allow a consumer app to be notified of all view config (and by extension coordination object) updates.

### Changed
- Update README screenshots.
- Fixed bug in `Status` component in which `cellHighlight` and `geneHighlight` were incorrectly expected to be objects.
- Moved the `Vitessce` component out of `src/app/app.js` into `src/app/Vitessce.js`.
- Moved the `Warning` component out of `src/app/app.js` into `src/app/Warning.js`.
- Renamed `VitessceGrid` to `VitessceGridLayout`.
- Renamed `PubSubVitessceGrid` to `VitessceGrid`.
- Moved utility functions that are common to both `src/components/` and `src/app/` to a new `src/utils.js` file.
- Updated the view config schema to include a coordination space, which supports coordinated multiple view functionality. The coordination space holds coordination objects, each of which has a type, a set of scopes, and a value assigned to each scope.
- Updated the view config schema to handle multiple datasets, and added a `dataset` configuration object type for coordinated multi-dataset view configs.
- Added a mapping from component type to coordination object types, streamlining the process of consuming and updating coordination object state in the `___Subscriber` components.
- Removed the unnecessary `name` field from dataset file definitions (previously a property of the `layers` objects) in the view config.
- Changed view config `layers[].type` (now `datasets[].files[].type`) values to lowercase.
- Renamed `staticLayout` to `layout` in the view config.
- Changed the title text of `LayerController` from "Layer Controller" to "Spatial Layers".
- Moved the Spatial layer initialization from `LayerControllerSubscriber` to `SpatialSubscriber`.
    - Changed the `LayerControllerSubscriber` to a "controlled" component which obtains layer state information from the `spatialLayers` coordination object.
    - Eliminated usage of randomly-generated uuids for layer and channel states.
- Changed the `Spatial` component implementation (back) to a React class component, after experiencing difficult-to-debug performance issues with the function component implementation.
- Simplified the `GenesSubscriber` implementation such that it no longer handles converting gene expression data to colors. Instead, the plot components (spatial, scatterplot, and heatmap) must look up the gene expression data and handle color conversion themselves, de-coupling them from `GenesSubscriber`.
- Added a file `src/components/data-hooks.js` containing React hook functions for initial data load (and data update subscriptions) for each data type.
    - Added error handling for data loading errors within the hook functions, which emit the `STATUS_WARN` event and subsequently call the `Vitessce` component's `onWarn` prop.
- Added a file `src/components/hooks.js` containing custom React hook functions which are un-related to dataset management (see above bullet).
    - Moved existing hook functions out of `src/components/utils.js` and into this `src/components/hooks.js` file.
- Removed the global app-level "please wait" spinner, and replaced with component-level spinners, to account for the multi-dataset support (for example if the dataset coordination object for a component changes then the component will need to obtain a different dataset, and this may occur at any time).
- Moved auto image layer initialization out of `LayerControllerSubscriber` and into `SpatialSubscriber` to allow initialization even when no `layerController` component exists.
- Removed usage of random uuid values from image layer identifiers, and instead replace with the `index` property, which refers to the index of the layer within the `raster.json` layer array.
- Switched from a local layer controller state management approach (via local reducer functions) to a global coordination object layer state management approach.
- Switched from using the property `visibility` to `visible` in image channel state to be more consistent with DeckGL layer `visible` convention.
- Moved a `range()` function call out of a "hot" loop in `src/components/heatmap/utils.js` to cache the value and prevent calling every iteration (every row and column during heatmap tile creation).
- Updated `___TooltipSubscriber` components and the `Status` component to use the `cellHighlight` and `geneHighlight` coordination object values. This allows highlight functionality to be local to a particular coordination scope (rather than global to the whole app).
- Updated the `DescriptionSubscriber` to use the image layer definitions in the `spatialLayers` coordination object.
- Refactored the `Status` and `StatusSubscriber` components to move the `TitleInfo` child component out of `Status` and into `StatusSubscriber` to be consistent with the other subscriber components.
- Separate out development from production builds.
- Only test/publish on production builds.
- Don't include dependencies in production ES build.
- Added terms and diagrams related to the coordination model to the `GLOSSARY.md` document.
- Update README screenshots.
- Use a random `uuid` when upgrading `v0.1.0` view configs to `v1.0.0` to enable the data hook `dataset` dependency to detect dataset updates resulting from passing new view configs.
- Fixed bug in `Status` component in which `cellHighlight` and `geneHighlight` were incorrectly expected to be objects.
- Fix `Spatial` initialization bug.
- Remove dead code from Rollup config in `packages/workers`.
- Remove Showcase section from `About` page now that we have a standalone Showcase documentation page.

## [0.2.5](https://www.npmjs.com/package/vitessce/v/0.2.5) - 2020-08-31

### Added
- Add contributor information to homepage.

### Changed
- Updated styling and text of homepage.

## [0.2.4](https://www.npmjs.com/package/vitessce/v/0.2.4) - 2020-08-24

### Added
- Added the `higlass-zarr-datafetchers` dependency.
- Added a demo containing a HiGlass component with a `horizontal-multivec` track using a `zarr-multivec` plugin data fetcher.
- Add auto-sliders to layer controller.

### Changed
- In the SpatialSubscriber component, no longer display counts for cells, molecules, or locations if the count value is zero.
- Upgrade Viv to 0.4.2.
- Fix channel names bug (#721) where they do not show if they are not the first dimension.
- Make sliders nicer for 32 bit data.

## [0.2.3](https://www.npmjs.com/package/vitessce/v/0.2.3) - 2020-08-04

### Changed
- Upgrade Viv to 0.3.3 to fix a tiff parsing issue.
- Removed the lines between the radio buttons in the cell set manager to make a more compact interface.


## [0.2.2](https://www.npmjs.com/package/vitessce/v/0.2.2) - 2020-08-03

### Changed
- Upgrade `vitessce-grid` to 0.0.10 to fix problem switching view configurations.
- Copied the `vitessce-grid` source files into the `vitessce` repository to reduce friction when updating the `vitessce-grid` code (avoids an extra NPM publish / pull-down).
- Fixed tests in `VitessceGrid.test.js`.


## [0.2.1](https://www.npmjs.com/package/vitessce/v/0.2.1) - 2020-07-30

### Changed
- Fixed a bug (typo in prop name) in which the heatmap axis title overrides were not passed correctly from HeatmapSubscriber to Heatmap.


## [0.2.0](https://www.npmjs.com/package/vitessce/v/0.2.0) - 2020-07-30

### Added
- Added the `fileType` property to the view config `layers` objects, which is used to choose a data loader class.

### Changed
- Improved the heatmap by re-implementing using DeckGL layers.
- Update Download button style/action in `TitleInfo` as per #681.
- Bump Viv to 0.3.2.
- Prevent CellSetManager leaf node "switcher icons" from calling the TreeNode component's `onNodeExpand` function.


## [0.1.10](https://www.npmjs.com/package/vitessce/v/0.1.10) - 2020-07-24

### Added

### Changed
- Fix #674 bug around flipped scatterplots.
- Fix #645 bug around clearing genes and heatmap.
- Add heatmap label override.
- Fix #682 `TitleInfo` spacing bug.
- Remove Global dimensions when there is only one value (for OME-TIFF, mostly).


## [0.1.9](https://www.npmjs.com/package/vitessce/v/0.1.9) - 2020-07-23

### Added
- Add `labelOverride` prop for genes component.
- Cell boundaries are visible when opacity drops below a cutoff.
- Add download lists for files to components that display data.
- Added `onWarn` callback to the `<Vitessce/>` component to allow a consumer app to manage display of warning messages.
- Set RGB defaults for Viv.

### Changed
- Remove layers menu and add functionality to layer controller + opacity control.
- Update genes schema to take non-integer values.
- Changed the `SelectionLayer` picking approach to use a quadtree rather than the built-in deck.gl pixel-based method.
- Flip y-axis for our graphics use-case.
- Clean up pubsub events in layer controller.
- Slider range remains as unchanged as possible under domain changes.
- Take away some spacing from `LayerController`.
- Make `LayerControllerSubscriber` names booleans-questions.
- Fix reisizing bug.
- Bump `vitessce-data` to 0.0.30.
- Changed the "Please wait" modal to a spinner.
- Bump `viv` to 0.3.1.
- Fix Heatmap regression/bug.
- Fix Cypress tests.
- Make cell boundaries depend on a pixel size setting.
- Fix small slider bug so the range stays the same.
- Filter our zarr from file list.

## [0.1.8](https://www.npmjs.com/package/vitessce/v/0.1.8) - 2020-07-02

### Added
- Trevor's slides from NLM conference to README.md.
- Added a `cell-sets.json` schema version `0.1.3` to support probabilistic cell set assignments, with backwards compatibility with schema version `0.1.2`.
- Added a `RESET` event so that the `SourcePublisher` can notify other components that a new viewconfig and dataset has been loaded.
- Added a callback for the `RESET` event in the `SpatialSubscriber` component to clear previous cells, molecules, neighborhoods, and imaging data.
- Added a callback for the `RESET` event in the `DescriptionSubscriber` component to clear previous imaging metadata tables.
- Added a callback for the `RESET` event in the `CellSetsManagerSubscriber` component to clear previous cell sets.
- Added a publisher for `GRID_RESIZE` when `rowHeight` changes in `PubSubVitessceGrid` to allow the `useGridItemSize` hook to update in this additional case. 

### Changed
- Updated the `cell-sets.json` schemas to allow both leaf nodes and non-leaf nodes in the same tree level.
- Updated the `cell-sets.json` schemas to allow both leaf nodes and non-leaf nodes in the same tree level.
- Update layer controller overflow.
- Updated the `Spatial` component data processing of `cells`, `molecules`, and `neighborhoods` with `useMemo` (rather than `useRef` + `useEffect`).
- Temporarily removed the `React.lazy` wrapper for the `Vega` component from `react-vega`, as a workaround for https://github.com/hubmapconsortium/portal-ui/issues/571 (using Vitessce viewconfigs with React.lazy components is causing the HuBMAP portal interface to crash).
- Increased the `isNarrow` threshold from `300` to `500` for the `CellTooltip` component, to use a smaller font size at a wider plot width.


## [0.1.7](https://www.npmjs.com/package/vitessce/v/0.1.7) - 2020-06-25

## Added
- Testing protocol calls for all three browsers now.

### Changed
- Fix Safari channel controller bug.
- Fix Safari heatmap display bug.
- Heatmap color canvas has precedence over selection canvas when resizing.

## [0.1.6](https://www.npmjs.com/package/vitessce/v/0.1.6) - 2020-06-23

### Added
- Added the `cellOpacity` prop for the `Scatterplot` and `Spatial` components, to pass a value to the `opacity` deck.gl `ScatterplotLayer` and `PolygonLayer` prop.
- Imaging support for Safari via a new Viv version.

### Changed
- Change one of the initial colors from red to magenta.
- Use kebab-case for cell sets files (`cell_sets` becomes `cell-sets`).
- Upgraded HiGlass to v1.9.5 and scoped the HiGlass external CSS under the `vitessce-container` class using SCSS nesting.
- Remove height css from color palette.

## [0.1.5](https://www.npmjs.com/package/vitessce/v/0.1.5) - 2020-06-15

### Added
- Initial slider/selection values and light theme for channel controller.
- Added a `VegaPlot` component, a Vega-Lite implementation of a cell set size bar plot, and a `useGridItemSize` hook to enable responsive charts.
- Compute the `cellRadiusScale` prop of `Scatterplot` relative to the extent of the `cells` mapping coordinates.

### Changed
- Updated the selection coloring for the `Scatterplot` and `Spatial` layers to take the theme background color into account.
- Switched to a black background color for `Spatial` regardless of theme.
- Pass the `height` prop to `VitessceGrid` so that the `WidthProvider` component can detect `height` changes.
- Updated slider color for white slider with white theme.

## [0.1.4](https://www.npmjs.com/package/vitessce/v/0.1.4) - 2020-06-01

### Added
- Added `METADATA_REMOVE` event to facilitate removal of image layer metadata from the `DescriptionSubscriber` upon layer removal.
- Added support for providing cell sets files in view configs.
- Added support for responsive height in the `Welcome` and `PubSubVitessceGrid` components.

### Changed
- Refactored the Scatterplot and Spatial components. Removed the AbstractSelectableComponent class. Moved getter functions to props.
- Added `src/` to the list of directories to publish to NPM, and renamed build directories (`build-lib/` to `dist/` and `build-demo/` to `dist-demo/`).
- Abstracted the CellTooltip components to allow any child element to be passed as the tooltip content.
- Updated the cell set hierarchy schema.
- Updated the cell set manager, to try to improve usability.
- Updated the default color palette to improve visibility when using the light theme.
- Increased the minimum & maximum scatterplot radius and added the `cellRadiusScale` prop.

## [0.1.3](https://www.npmjs.com/package/vitessce/v/0.1.3) - 2020-05-15

### Added
- Trevor's lab presentation on multimodal imaging (2020-05-14).
- Added support for displaying tables of metadata in the `Description` component by wrapping in a `DescriptionSubscriber` component.

### Changed
- Updated README to note a change to the development process: back to merging feature branches into `master` (rather than a `dev` branch).
- Reduced global style creep by adding a `StylesProvider` with custom `generateClassName` function from [mui](https://material-ui.com/styles/api/#creategenerateclassname-options-class-name-generator). Temporarily commented out HiGlass styles.
- Scrollable image layer popout.
- Upgrade `viv` to 0.2.5.
- Theme for image layer button.

## [0.1.2](https://www.npmjs.com/package/vitessce/v/0.1.2) - 2020-05-12

### Added
- Added a Travis CI `deploy` step for publishing to NPM when on the master branch.
- OMETIFF loading for raster imagery.

### Changed
- Moved `demos.md` to `DEMOS.md`.
- Fixed the example JSON URL config in `TESTING.md`.
- Fixed a horizontal scroll bug caused by overflow of the `{num} genes` subtitle in the Linnarsson demo.
- Fixed a regression caused by the updated bundling scripts minifying HTML assets and removing intentional spaces.
- Upgrade LayerController to be more general.
- In `src/app/app.js` and `src/demo/index.js`, separated rendering from validation.
- Changed export method for components.
- Fixed backwards webpack `externals` object (`react` and `react-dom` were not properly externalized previously).
- Upgrade `viv` and `vitessce-grid` to 0.2.4 and 0.0.7, respectively.

## [0.1.1](https://www.npmjs.com/package/vitessce/v/0.1.1) - 2020-05-05

### Added
- HiGlass integration
- Added multi-modal Spraggins example.
- Added a new event type `METADATA_ADD` for publishing layer metadata (image layer details, heatmap layer details, etc).

### Changed
- Changed rectangle tool interaction to dragging (rather than clicking twice).
- Clicking while using the rectangle or lasso tool now clears the current selection by emitting a new empty selection.
- Upgrade vitessce-image-viewer to `0.2.2`
- Changed `raster.json` schema.
- Changed `Channels` component to more general `LayerController` component which publishes `LAYER_ADD`, `LAYER_REMOVE`, and `LAYER_CHANGE` events.

## [0.1.0](https://www.npmjs.com/package/vitessce/v/0.1.0) - 2020-04-28

### Added
- Added a selectable table component with radio- and checkbox-like functionality.

### Changed
- Changed the bundling process so that subsets of components are bundled into separate JS files by targeting the `src/components/{name}/index.js` files.

## [0.0.25](https://www.npmjs.com/package/vitessce/v/0.0.25) - 2020-03-26
### Added
- Removed nwb, added custom webpack configuration.
- Added glossary.
- Added theme props, with support for "light" and "dark". Added a URL theme parameter for the demo.

### Changed
- Upgrade vitessce-image-viewer to 0.1.3 & use data loaders.
- Rename "LayerPublisher" to "SourcePublisher".
- Converted the polygon tool to a lasso tool.
- Loosened assumptions about cell info object properties when rendering cell hover messages to fix a `TypeError` bug.

## [0.0.24](https://www.npmjs.com/package/vitessce/v/0.0.24) - 2020-03-02
### Added
- Check that HTTP status is good before trying to parse response.
- Please-wait only applies to component.
- Make scatterplot dot size a constant 1px, and molecules 3px.
- Friendlier error if mapping in config doesn't match data.
- Test error handling in Cypress.
- Log a data-URI for the viewconf on load.
- Restore dark background to homepage.

### Changed
- No more missing spaces when we spell out the acronym.

### Removed
- Remove vestigial gh-pages.

## [0.0.23](https://www.npmjs.com/package/vitessce/v/0.0.23) - 2020-02-06
### Added
- HTTP headers to pass can be specified in the layers of the viewconf.
### Changed
- Fix merge-to-master builds on Travis.
- Upgrade vitessce-grid to v0.0.6 to support pane closing.
- Removed bootstrap and moved the small set of bootstrap styles being used into an SCSS mixin.
- Fixed broken rectangular selection tool (broke due to a `nebula.gl` upgrade from v0.12.0 to v0.17.1), but switched the interaction from dragging to clicking.

## [0.0.22](https://www.npmjs.com/package/vitessce/v/0.0.22) - 2019-01-22
### Added
- Now, a plain scatterplot will also clear the please-wait.

## [0.0.21](https://www.npmjs.com/package/vitessce/v/0.0.21) - 2019-01-21
### Added
- Until UI is available, dump viewconf to console.
- Added styles to prevent unintentional text selection during grid item resize in Safari.
### Changed
- Loosen the cells schema to accommodate data from HuBMAP.

## [0.0.20](https://www.npmjs.com/package/vitessce/v/0.0.20) - 2019-01-06
### changed
- Removed OpenSeadragon in favor of deckgl

## [0.0.19](https://www.npmjs.com/package/vitessce/v/0.0.19) - 2019-12-10
### Removed
- Removed Docz and .mdx files and update package.json.
### Added
- Travis checks that changelog was updated.
- Links to component demos.
- Top-level CSS rule to keep component styles from leaking out.
### Changed
- CSS filename in UMD no longer contains hash.
- Update to NodeJS 10 on Travis.

## [0.0.18](https://www.npmjs.com/package/vitessce/v/0.0.18) - 2019-11-18
### Added
- Initial zoom can be specified for scatterplots.
- Allow background imagery to be translated horizontally and vertically.
- Close cell set tabs.
- Color cell sets.
- Split long menu of cell operations into smaller menus from icons.
- Cell sets can be exported and imported as JSON.
- Union, intersection, and complement of cell sets.
- View all set descendants at a particular level.
- More public demos.
- Export `validateAndRender` for use as component.
### Changed
- Gave up on CSS modules. We'll still split out CSS into separate files, but the extra name-munging was just confusing.
- Crosshairs are now full height and width.
- S3 data is now organized by dataset.

## [0.0.17](https://www.npmjs.com/package/vitessce/v/0.0.17) - 2019-07-19
### Added
- Polygon selection tool leveraging the Nebula.gl package.
- Tooltip in heatmap.
- WIP: Using CSS modules.
- Hierarchical cell set manager component with save, name, rename, delete, rearrange, and view functionality.
### Changed
- PubSubVitessceGrid is now exported, and the registry lookup function is a parameter.
- A HiGlass demo no longer requires HiGlass to be checked in as part of this project.

## [0.0.16](https://www.npmjs.com/package/vitessce/v/0.0.16) - 2019-06-26
### Added
- Linked hover effect between spatial, scatterplot, and heatmap.
- Tooltip for cell status text upon hover in spatial and scatterplot views.
### Changed
- Using Deck.gl's built in picking instead of quadtree.

## [0.0.15](https://www.npmjs.com/package/vitessce/v/0.0.15) - 2019-06-07
### Added
- The `<TitleInfo>` component now takes children, and our JSX is tidier.
- Using [docz](https://www.docz.site/) for documentation, and add to the push script.
- Each JSON schema now checks that we are getting all and only the expected fields...
and we have a sort-of schema for the schema to make sure these checks are in place.
- Handle arbitrary mappings, not just t-SNE. Now computing PCA in vitessce-data.
- Flexible configuration: load components by name, or have multiple instances
of the same type of component.
- Half-baked proof-of-concept integration with HiGlass.
- Separate registry that holds Name -> Component mappings.
- Easy deployment to vitessce.io.
- Friendlier error page on AWS deployment.
- Display current version info in deployed demo.
- Can now specify the URL of a JSON config to load.
### Changed
- Make Heatmap more usable as a standalone.
- Fix (?) the scrollbars which had spontaneously appeared.
- Factor out the grid machinery into a separate package, `vitessce-grid`.
- More information on the Welcome page, so changed it to a two-column layout.

## [0.0.14](https://www.npmjs.com/package/vitessce/v/0.0.14) - 2019-04-29
### Added
- Add Cypress.io tests.
- Thank-you to NIH on the front page.
- Add Google Analytics to all pages.
- "Please wait" now waits for all layers.
- Use [react-grid-layout](https://github.com/STRML/react-grid-layout) for draggable panes;
Layouts can be specified either responsively, or with fixed grid positions. Grid height is
based on window height at load.
- Script (`push-demo.sh`) to push demo to S3, without making a new release.
- Use [OpenSeadragon](http://openseadragon.github.io/) for tiled imagery.
### Changed
- Spatial viewport is part of the initial FAKE_API_RESPONSE, instead of being hardcoded.
- Neighborhoods are enabled, but hidden by default.

## [0.0.13](https://www.npmjs.com/package/vitessce/v/0.0.13) - 2019-03-26
### Changed
- Lots of display tweaks to create a consistent dark color scheme.

## [0.0.12](https://www.npmjs.com/package/vitessce/v/0.0.12) - 2019-03-26
### Added
- Heatmap is row-normed. (This is a change in `vitessce-data`.)
- Borders on heatmap components... but this will be reverted.
- Cells are visible on initial load.
### Changed
- Dark color scheme, with better contrast when colored
- Heatmap spans the entire bottom.

## [0.0.11](https://www.npmjs.com/package/vitessce/v/0.0.11) - 2019-03-20
### Added
- Roll up the layers list when not hovered.
- Component titles give summary stats about data.
### Changed
- Change color scales, styling of unselected cells, and marquee rendering, to improve contrast.
- Only update selected set at end of drag.

## [0.0.10](https://www.npmjs.com/package/vitessce/v/0.0.10) - 2019-03-19
### Added
- Heatmap: Gene expression levels occupy most of the space; Above, there are bands showing
the currently selected cell set, and the current cell coloring.
### Changed
- Spatial and t-SNE backgrounds are now black.
- Move the Factor radio buttons to their own component, above Genes.

## [0.0.9](https://www.npmjs.com/package/vitessce/v/0.0.9) - 2019-03-17
### Added
- Neighborhoods layer: no interactivity, and it's obvious that the source data has some problems.
### Changed
- Got the image registration right, finally.
- Initial viewport is hardcoded: Data is no longer centered on (0, 0) origin.

## [0.0.8](https://www.npmjs.com/package/vitessce/v/0.0.8) - 2019-03-16
### Added
- Load and validate JSON for clusters, categorical factors, gene expression levels, and cell neighborhoods.
- Toggle between factor values: Spatial and t-SNE categorical colors are updated.
- Toggle between gene expression levels: Spatial and t-SNE continuous colors are updated.
- Toggle between multiple imagery layers.
### Changed
- The stained imagery is positioned and scaled better, but still slightly off.
- No outlines on cell polygons.

## [0.0.7](https://www.npmjs.com/package/vitessce/v/0.0.7) - 2019-03-07
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

## [0.0.6](https://www.npmjs.com/package/vitessce/v/0.0.6) - 2019-02-25
### Added
- Welcome screen where user picks dataset.
- All the cells are selected on start.
### Removed
- No longer supports drag and drop to add file.

## [0.0.5](https://www.npmjs.com/package/vitessce/v/0.0.5) - 2019-02-20
### Added
- Distinguish pan and single-select mode from drag-to-select.
- Drag-to-select supported for both Spatial and Tsne: Selection state is linked.
- Set of selected cells is updated during drag; there is also a grey overlay.
- Add the strict AirBNB linting rules.
- Load Linnarsson cell data by default, rather than starting from a blank screen.
### Changed
- Assume data has been scaled to fit a 2000 pixel-wide window, centered on the origin,
  and adjust line widths and dot sizes accordingly.

## [0.0.4](https://www.npmjs.com/package/vitessce/v/0.0.4) - 2019-02-08
### Added
- Drag and drop JSON files representing cells and molecules.
- There is a helpful link to the sample data download.
- JSON files are validated against schema, and detailed errors go to console.
- Flexbox CSS for clean columns.
