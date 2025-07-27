### Ideas for refactoring


- Remove VolumeRenderManager - convert to more functional implementation
- Decouple the pageTable and brickCache initialization. These will always be needed
- Un-nest the class variables in VolumeDataManager (this.zarrStore.*, this.channels, etc.)
- State machine for stillRef, noNewRequests, triggerRequests, triggerUsage, isBusy, etc to clearly know which states are valid at which time
- Promise.all for loading Zarr chunks (Rather than for loop)
- AbortController for stopping Zarr chunk loading for chunks that have started loading, but processUsageData indicates are not needed anymore
- Functions for all indexing operations (bcIndex to bc coords, etc.)