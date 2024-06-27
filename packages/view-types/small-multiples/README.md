The intention behind `spatial-beta` and `layer-controller-beta` is to be able to develop them alongside the existing `spatial` and `layerController` views, allowing both implementations to exist simultaneously while the beta implementations stabilize.

Once the beta implementations support all current spatial/layerController features, the goal would be to:
- replace `spatial` with `spatial-beta`
- implement a view config schema version upgrade function that maps `spatial-beta` to `spatial`
- likewise for `layer-controller-beta`