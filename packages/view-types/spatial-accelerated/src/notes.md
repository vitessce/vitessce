### Ideas for refactoring

- [ ] Upgrade THREE and React-Three-Fiber?
- [ ] Remove VolumeRenderManager - convert to more functional implementation
- [ ] Decouple the pageTable and brickCache initialization
- [x] Un-nest the class variables in VolumeDataManager (this.zarrStore.*, this.channels, etc.)
- [ ] State machine for stillRef, noNewRequests, triggerRequests, triggerUsage, isBusy, etc to clearly know which states are valid at which time
- [x] Move the functions called by useFrame out of the component body (or into useCallbacks)
- [ ] To conserve memory, pass the Zarr getter an output buffer (brickCache array + offset) to write into
- [ ] Promise.all for loading Zarr chunks (Rather than for loop)
- [ ] AbortController for stopping Zarr chunk loading for chunks that have started loading, but processUsageData indicates are not needed anymore OR break out of handleRequests for loop early (check if breaking is needed every loop iteration)
- [ ] Functions for all indexing operations (bcIndex to bc coords, etc.)
- [ ] Loading indicator (with progress based on number of bricks loaded vs. requested)
- [ ] Interleave channel requests