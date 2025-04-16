/**
 * Pool for workers to decode chunks of the images.
 * This is a line-for-line copy of GeoTIFFs old implementation: https://github.com/geotiffjs/geotiff.js/blob/v1.0.0-beta.6/src/pool.js
 */
export default class Pool {
    workers: Worker[];
    idleWorkers: Worker[];
    waitQueue: {
        resolve?: (worker: Worker) => void;
    }[];
    /**
     * @constructor
     * @param {object} Worker The worker class to be used for processing.
     */
    constructor(createWorker: () => Worker);
    process(): Promise<void>;
    waitForWorker(): Promise<unknown>;
    finishTask(currentWorker: Worker): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=Pool.d.ts.map