### Ideas for refactoring

- [x] Add maxResolutionSlider for each channel
- [ ] Remove VolumeRenderManager - convert to more functional implementation
- [ ] Un-nest the class variables in VolumeDataManager (this.zarrStore.*, this.channels, etc.)
- [ ] Functions for all indexing operations (bcIndex to bc coords, etc.), to unit test
- [ ] Promise.all for loading Zarr chunks (Rather than for loop)
  - [ ] AbortController for stopping Zarr chunk loading for chunks that have started loading, but processUsageData indicates are not needed anymore
- [ ] Interleave channel requests
- [ ] Can useFrame's delta parameter simplify frame counter / clock logic?
- [ ] Loading indicator (with progress based on number of bricks loaded vs. requested)
- [ ] Upgrade THREE and React-Three-Fiber?
- [ ] Decouple the pageTable and brickCache initialization from other initialization?
- [ ] Clearly define valid states (enum) for stillRef, noNewRequests, triggerRequests, triggerUsage, isBusy, etc
- [x] break out of handleRequests for loop early (check if breaking is needed every loop iteration)
- [x] Move the functions called by useFrame out of the component body (or into useCallbacks)
- [x] ~~To conserve memory, pass the Zarr getter an output buffer (brickCache array + offset) to write into~~ Update: I think this is not an issue, since the current new Uint8Array(await response.arrayBuffer()) should not have extra overhead.