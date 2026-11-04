---
"@vitessce/comparative": patch
"@vitessce/biomarker-select": patch
"@vitessce/styles": patch
"demo": patch
---

Support both single-cell and single-nucleus datasets in the comparative components. Replace the `datasetUrl` prop of `UncontrolledComparative` and `ControlledComparative` with `singleCellDatasetUrl` and `singleNucleusDatasetUrl` (at least one is required). The generated config defines one dataset per modality, and the `biomarkerSelectAlt` view renders a dropdown to switch between datasets when more than one is available. The sample group dropdowns of the `biomarkerSelectAlt` view now reflect the `sampleSetSelection` coordination value (e.g., from URL params upon initial page load). Upon a change of modality, `obsSetSelection` is reset to `null` so that the selected cell types are re-initialized for the new modality. Fix selection of "All" in the "In group" dropdown, which previously did not clear the sample set selection. Rename the `gene` URL param of `UncontrolledComparative` to `feature`, which holds the single item selected in the `biomarkerSelectAlt` autocomplete (formatted like `gene:UMOD` or `pathway:<name>`); a selected pathway is transformed into its member genes internally for the `featureSelection`. The autocomplete reflects this selection upon initial page load. Add an optional controlled `value` prop to `SimpleAutocomplete`.
