---
"@vitessce/layer-controller-beta": patch
"@vitessce/spatial-beta": patch
---

The beta layer controller now honors a `globalDisable3d` prop, so a view config can hide the 3D rendering-mode switch as it could with the legacy layer controller. This matters for configs whose data cannot usefully be volume-rendered, which previously had no way to prevent a user from switching the spatial view into 3D. The beta spatial view also no longer builds a viv `VolumeLayer` for image layers that are hidden: `VolumeLayer` downloads a whole volume per channel from `updateState`, and DeckGL does not gate layer updates on `visible`, so a hidden layer previously paid the full cost of a volume load whenever 3D was switched on.
