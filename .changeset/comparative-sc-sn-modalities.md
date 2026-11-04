---
"@vitessce/comparative": patch
"@vitessce/biomarker-select": patch
"demo": patch
---

Support both single-cell and single-nucleus datasets in the comparative components. Replace the `datasetUrl` prop of `UncontrolledComparative` and `ControlledComparative` with `singleCellDatasetUrl` and `singleNucleusDatasetUrl` (at least one is required). The generated config defines one dataset per modality, and the `biomarkerSelectAlt` view renders a dropdown to switch between datasets when more than one is available.
