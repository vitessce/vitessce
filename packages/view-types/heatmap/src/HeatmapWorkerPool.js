import { HeatmapWorker } from '@vitessce/workers';
import { Pool } from '@vitessce/utils';

// Reference: https://github.com/developit/jsdom-worker/issues/14#issuecomment-1268070123
function createWorker() {
  return new HeatmapWorker();
}

/**
 * Pool for workers to decode chunks of the images.
 * This is a line-for-line copy of GeoTIFFs old implementation: https://github.com/geotiffjs/geotiff.js/blob/v1.0.0-beta.6/src/pool.js
 */
export default class HeatmapPool extends Pool {
  constructor() {
    super(createWorker);
  }

  /**
   * Process each heatmap tile
   * @param {object} params The arguments passed to the heatmap worker.
   * @param {string} params.curr The current task uuid.
   * @param {number} params.xTiles How many tiles required in the x direction?
   * @param {number} params.yTiles How many tiles required in the y direction?
   * @param {number} params.tileSize How many entries along each tile axis?
   * @param {string[]} params.cellOrdering The current ordering of cells.
   * @param {string[]} params.rows The name of each row (cell ID).
   * Does not take transpose into account (always cells).
   * @param {string[]} params.cols The name of each column (gene ID).
   * Does not take transpose into account (always genes).
   * @param {ArrayBuffer} params.data The array buffer.
   * Need to transfer back to main thread when done.
   * @param {boolean} params.transpose Is the heatmap transposed?
   * @returns {array} [message, transfers]
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
      currentWorker.postMessage(['getTile', args], [args.data]);
    });
  }
}
