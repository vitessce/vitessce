/**
 * Pool for workers to decode chunks of the images.
 * This is a line-for-line copy of GeoTIFFs old implementation: https://github.com/geotiffjs/geotiff.js/blob/v1.0.0-beta.6/src/pool.js
 */
export default class HeatmapPool extends Pool {
    constructor();
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
    process(args: any): array;
}
import { Pool } from '@vitessce/utils';
//# sourceMappingURL=HeatmapWorkerPool.d.ts.map