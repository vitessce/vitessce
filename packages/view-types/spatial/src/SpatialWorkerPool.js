import { Uint8ColorsWorker } from '@vitessce/workers';
import { Pool } from '@vitessce/utils';

// Reference: https://github.com/developit/jsdom-worker/issues/14#issuecomment-1268070123
function createWorker() {
  return new Uint8ColorsWorker();
}

/**
 * Pool for workers to decode chunks of the images.
 * This is a line-for-line copy of GeoTIFFs old implementation: https://github.com/geotiffjs/geotiff.js/blob/v1.0.0-beta.6/src/pool.js
 */
export default class SpatialWorkerPool extends Pool {
  constructor() {
    super(createWorker);
  }

  /**
   * Convert colors
   * @param {object} params The arguments passed to the heatmap worker.
   * @param {string} params.curr The current task uuid.
   * @param {number} params.cellColors How many tiles required in the x direction?
   * @param {ArrayBuffer} params.data The array buffer.
   * Need to transfer back to main thread when done.
   * @returns {Promise.<ArrayBuffer>} the decoded result as a `Promise`
   */
  async process(args) {
    const currentWorker = await this.waitForWorker();
    return new Promise((resolve, reject) => {
      currentWorker.onmessage = (event) => {
        // this.workers.push(currentWorker);
        this.finishTask(currentWorker);
        resolve(event.data);
      };
      currentWorker.onerror = (error) => {
        // this.workers.push(currentWorker);
        this.finishTask(currentWorker);
        reject(error);
      };
      currentWorker.postMessage(['getColors', args], [args.data]);
    });
  }
}
