---
"@vitessce/gl": patch
---

Speed up lasso selection by pruning quadtree nodes against the selection's bounding box and testing candidate points against the exact polygon. Include observations at index zero.
