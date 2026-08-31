---
'@vitessce/gl': patch
'@vitessce/scatterplot': patch
'@vitessce/scatterplot-embedding': patch
'@vitessce/scatterplot-gating': patch
'@vitessce/spatial': patch
'@vitessce/spatial-beta': patch
---

Show a loading overlay while a lasso/rectangle selection is being calculated and applied. At millions of observations the hit test and the selection-driven re-render block the main thread for seconds; the selection layer now signals a busy state, lets the browser paint the view's loading indicator first, and clears it in the same commit that shows the applied selection.
