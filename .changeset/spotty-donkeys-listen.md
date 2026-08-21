---
"@vitessce/statistical-plots": patch
"@vitessce/constants-internal": patch
---

Update the treemap view to follow the Vitessce filtering, selection, and highlighting principles: filtering (obsFilter/obsSetFilter/sampleFilter/sampleSetFilter, with the corresponding filter modes) determines which observations and sets are included at all, selection (obsSelection/obsSetSelection/sampleSelection/sampleSetSelection, with the corresponding selection modes) de-emphasizes filter-included but un-selected rectangles rather than omitting them, and highlighting (obsHighlight/obsSetHighlight/sampleHighlight) outlines the corresponding rectangles. In particular, when there is no obsSetFilter or sampleSetFilter, the un-selected sets are now displayed as de-emphasized treemap nodes broken down by the sets of the other hierarchy level, rather than being omitted. The un-selected sets to include are the siblings of the selected sets, each expanded at its own corresponding hierarchy level.
