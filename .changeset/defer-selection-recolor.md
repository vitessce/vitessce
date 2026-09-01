---
"@vitessce/scatterplot-embedding": patch
"@vitessce/scatterplot-gating": patch
---

Make cell set selection changes paint immediately on large datasets: the scatterplot views now defer set selection and color values into a non-urgent render (via useDeferredValue), so the sets manager checkbox updates in the first commit and the per-observation recoloring follows, and the contour stratification pass only runs when contours are visible or the points layer is hidden, instead of on every selection change.
