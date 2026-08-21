---
name: vitessce-filter-select-highlight
description: Use when modifying the filtering, selection, or highlighting logic in Vitessce. Also use when writing example configurations if it involves filtering, selection, or highlighting.
---

The core principle is consistency. Despite different Vitessce views displaying data using different visualization designs or visual encodings, we want to ensure the following is the case across view implementations:

- Filtering refers to whether particular data items (or sets of data items) are considered at all during either rendering or computation. For example, if the filtering logic specifies that only immune cell types are included, then we do not render non-immune cell types (as data points, along categorical axes, in legends, etc.) In other words, when immune cell types are the only cell types that meet the current filtering criteria, we do not include non-immune cell types in any visual encoding (or upstream computation of a visual encoding, such as when computing distributions or averages).
- Selection refers to a visual emphasis on one or more data items or sets of data items (e.g., immune cell types). Items (or sets of items) which meet the filtering criteria, yet are un-selected, should still be rendered (as data points, along categorical axes, in legends), but should be de-emphasized visually (e.g., greyed-out or with reduced opacity or reduced size).
- Highlighting refers to ephemeral emphasis on one or a few data items (observation or feature) (e.g., a particular cell or gene). This emphasis should correspond to a visual encoding such as an outline.


Filtering, selection, and highlighting are controlled by several coordination types:
- obsFilter: a list of filter-included observation IDs
- obsSetFilter: a list of filter-included observation set paths (each path is an array of strings)
- obsFilterMode: behavior-modifier, whether to use obsFilter versus obsSetFilter for the current filtering criteria.
- obsSelection: a list of selected observation IDs
- obsSetSelection: a list of selected observation set paths (each path is an array of strings)
- obsSelectionMode: behavior-modifier, whether to use obsSelection versus obsSetSelection for the current selection criteria.
- obsHighlight: a single observation ID to highlight
- obsSetHighlight: a single observation set path to highlight
- featureFilter
- featureSetFilter
- featureFilterMode
- featureSelection
- featureSetSelection
- featureSelectionMode
- featureHighlight
- sampleFilter
- sampleSetFilter
- sampleFilterMode
- sampleSelection
- sampleSetSelection
- sampleSelectionMode
- sampleHighlight


When filtering or selection is `null`, this means that all data items (or sets of data items) should be included/selected. The empty array means that nothing should be included/selected. When highlight is `null`, this means that nothing is currently highlighted.

## Control views such as the observation set manager view

Control views are the only exception where items that are currently filtered-out may need to be included in the user interface, to facilitate users modifying the filtering criteria. For example, if immune cell types are currently the only cell types included according to the filtering criteria, users who become interested in non-immune cell types over the course of their analysis will need a mechanism to update the filtering criteria to specify that non-immune cell types should be included again. If there is no UI to facilitate this, then users will never be able to re-include data items that had been previously added to the exclusion list.

## Work in progress

Ensuring that these principles are applied across all view implementations is a work in progress.
We are working to address this in existing code.
New code should adhere to these principles from the start.
