---
"@vitessce/scatterplot": patch
---

Fix zooming and panning becoming locked after an annotation frame transition in spatial and scatterplot views. Transition steps are now marked by wrapping the transition interpolator, so that user interactions are distinguished from transition steps and always end the transition.
