---
"@vitessce/comparative": patch
"@vitessce/biomarker-select": patch
"demo": patch
---

Support both single-cell and single-nucleus datasets in the comparative components. Replace the `datasetUrl` prop of `UncontrolledComparative` and `ControlledComparative` with `singleCellDatasetUrl` and `singleNucleusDatasetUrl` (at least one is required). The generated config defines one dataset per modality, and the `biomarkerSelectAlt` view renders a dropdown to switch between datasets when more than one is available. The sample group dropdowns of the `biomarkerSelectAlt` view now reflect the `sampleSetSelection` coordination value (e.g., from URL params upon initial page load). Upon a change of modality, `obsSetSelection` is reset to `null` so that the selected cell types are re-initialized for the new modality. Fix selection of "All" in the "In group" dropdown, which previously did not clear the sample set selection.
