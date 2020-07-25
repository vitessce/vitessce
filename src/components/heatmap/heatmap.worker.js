/* eslint-disable no-restricted-globals */
import range from 'lodash/range';
import { getCellByGeneTile, getGeneByCellTile } from './utils';

/**
 * Map a gene expression matrix onto multiple square array tiles,
 * taking into account the ordering/selection of cells.
 * @param {object} params
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
 */
function getTiles({
  curr,
  xTiles,
  yTiles,
  tileSize,
  cellOrdering,
  rows,
  cols,
  data,
  transpose,
}) {
  const view = new Uint8Array(data);

  const numGenes = cols.length;
  const numCells = cellOrdering.length;

  const getTileFunction = (transpose ? getGeneByCellTile : getCellByGeneTile);

  const result = range(yTiles).map(i => range(xTiles).map(j => getTileFunction(
    view,
    {
      tileSize,
      tileI: i,
      tileJ: j,
      numCells,
      numGenes,
      cellOrdering,
      cells: rows,
    },
  )));
  return [{ tiles: result, buffer: data, curr }, [data]];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== 'undefined') {
  const nameToFunction = {
    getTiles,
  };

  self.addEventListener('message', (event) => {
    try {
      const [name, args] = event.data;
      const [message, transfers] = nameToFunction[name](args);
      self.postMessage(message, transfers);
    } catch (e) {
      console.warn(e);
    }
  });
}
