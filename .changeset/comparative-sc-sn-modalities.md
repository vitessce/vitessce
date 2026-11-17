---
"@vitessce/comparative": patch
"@vitessce/biomarker-select": patch
"@vitessce/styles": patch
"demo": patch
---

Support both single-cell and single-nucleus datasets in the comparative UI by changing the `datasetUrl` prop of `UncontrolledComparative` and `ControlledComparative` components to the explicit `singleCellDatasetUrl` and `singleNucleusDatasetUrl` props. Fix bugs with URL state management syncing.
