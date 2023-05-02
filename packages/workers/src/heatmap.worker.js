/* eslint-disable no-restricted-globals */
import { getGeneByCellTile, getCellByGeneTile } from './heatmap.js';

/**
 * Map a gene expression matrix onto multiple square array tiles,
 * taking into account the ordering/selection of cells.
 * @param {object} params
 * @param {string} params.curr The current task uuid.
 * @param {number} params.xTiles How many tiles required in the x direction?
 * @param {number} params.yTiles How many tiles required in the y direction?
 * @param {number} params.tileSize How many entries along each tile axis?
 * @param {string[]} params.cellOrdering The current ordering of cells.
 * @param {string[]} params.cols The name of each column (gene ID).
 * Does not take transpose into account (always genes).
 * @param {ArrayBuffer} params.data The array buffer.
 * Need to transfer back to main thread when done.
 * @param {boolean} params.transpose Is the heatmap transposed?
 * @param {boolean} params.expressionRowLookUp A lookup table for the array index of a given cell.
 * This is needed for performance reasons instead of calling `indexOf` repeatedly.
 * @returns {array} [message, transfers]
 */
function getTile({
  curr,
  tileI,
  tileJ,
  tileSize,
  cellOrdering,
  cols,
  data,
  transpose,
  expressionRowLookUp,
}) {
  const view = new Uint8Array(data);

  const numGenes = cols.length;
  const numCells = cellOrdering.length;

  const getTileFunction = (transpose ? getGeneByCellTile : getCellByGeneTile);

  const result = getTileFunction(
    view,
    {
      tileSize,
      tileI,
      tileJ,
      numCells,
      numGenes,
      cellOrdering,
      expressionRowLookUp,
    },
  );
  return [{ tile: result, buffer: data, curr }, [data]];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== 'undefined') {
  const nameToFunction = {
    getTile,
  };

  self.addEventListener('message', (event) => {
    try {
      if (Array.isArray(event.data)) {
        const [name, args] = event.data;
        const [message, transfers] = nameToFunction[name](args);
        self.postMessage(message, transfers);
      }
    } catch (e) {
      console.warn(e);
    }
  });
}
