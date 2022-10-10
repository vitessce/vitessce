/* eslint-disable no-restricted-globals */
import range from 'lodash/range';

function getGeneByCellTile(view, {
  tileSize, tileI, tileJ, numCells, numGenes, cellOrdering, expressionRowLookUp,
}) {
  const tileData = new Uint8Array(tileSize * tileSize);
  let offset;
  let value;
  let cellI;
  let geneI;
  let sortedCellI;

  const tileSizeRange = range(tileSize);

  tileSizeRange.forEach((j) => {
    // Need to iterate over cells in the outer loop.
    cellI = (tileJ * tileSize) + j;
    if (cellI < numCells) {
      sortedCellI = expressionRowLookUp.get(cellOrdering[cellI]);
      if (sortedCellI >= -1) {
        tileSizeRange.forEach((i) => {
          geneI = (tileI * tileSize) + i;
          value = view[sortedCellI * numGenes + geneI];
          offset = ((tileSize - i - 1) * tileSize + j);
          tileData[offset] = value;
        });
      }
    }
  });
  return tileData;
}

function getCellByGeneTile(view, {
  tileSize, tileI, tileJ, numCells, numGenes, cellOrdering, expressionRowLookUp,
}) {
  const tileData = new Uint8Array(tileSize * tileSize);
  let offset;
  let value;
  let cellI;
  let geneI;
  let sortedCellI;

  const tileSizeRange = range(tileSize);

  tileSizeRange.forEach((i) => {
    // Need to iterate over cells in the outer loop.
    cellI = (tileI * tileSize) + i;
    if (cellI < numCells) {
      sortedCellI = expressionRowLookUp.get(cellOrdering[cellI]);
      if (sortedCellI >= -1) {
        tileSizeRange.forEach((j) => {
          geneI = (tileJ * tileSize) + j;
          if (geneI < numGenes) {
            value = view[sortedCellI * numGenes + geneI];
          } else {
            value = 0;
          }
          offset = ((tileSize - i - 1) * tileSize + j);
          tileData[offset] = value;
        });
      }
    }
  });

  return tileData;
}

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
