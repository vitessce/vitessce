/* eslint-disable export/no-unresolved */
/* eslint-disable max-len */
export { default as ChunkWorker } from 'web-worker:@janelia-flyem/neuroglancer/dist/module/chunk_worker.bundle.js';
export { default as SegmentColorWorker } from 'web-worker:./segmentColors.worker.js';
// TODO: is the AsyncComputationWorker needed? The react-neuroglancer component seems to render without it.
// export { default as AsyncComputationWorker } from 'web-worker:@janelia-flyem/neuroglancer/dist/module/async_computation.bundle.js';
