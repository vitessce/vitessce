import { range } from 'lodash-es';

export function getGeneByCellTile(view, {
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

export function getCellByGeneTile(view, {
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
