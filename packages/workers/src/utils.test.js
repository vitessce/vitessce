import { describe, it, expect } from 'vitest';
import { getCellByGeneTile, getGeneByCellTile } from './heatmap.js';
import { expressionMatrix, cellColors } from './Heatmap.test.fixtures.js';

describe('heatmap tiling utils', () => {
  it('creates cell x gene tiles (transpose = false)', () => {
    const arr = expressionMatrix.matrix;
    const numGenes = expressionMatrix.cols.length;
    const expressionRowLookUp = new Map();
    // eslint-disable-next-line no-return-assign
    expressionMatrix.rows.forEach((i, j) => expressionRowLookUp.set(i, j));
    const cellOrdering = expressionMatrix.rows; // no re-ordering
    const numCells = cellOrdering.length;
    // Tile (0, 0)
    const tile00 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile00)).toEqual([
      0, 255, 255,
      0, 255, 0,
      0, 255, 255,
    ]);
    // Tile (0, 1)
    const tile01 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ]);
    // Tile (1, 0)
    const tile10 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile10)).toEqual([
      0, 0, 0,
      0, 255, 0,
      0, 255, 0,
    ]);
  });

  it('creates gene x cell tile (transpose = true)', () => {
    const arr = expressionMatrix.matrix;
    const numGenes = expressionMatrix.cols.length;
    const cellOrdering = expressionMatrix.rows; // no re-ordering
    const numCells = cellOrdering.length;
    const expressionRowLookUp = new Map();
    // eslint-disable-next-line no-return-assign
    expressionMatrix.rows.forEach((i, j) => expressionRowLookUp.set(i, j));
    const tile00 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile00)).toEqual([
      255, 0, 255,
      255, 255, 255,
      0, 0, 0,
    ]);
    const tile01 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      255, 255, 0,
      0, 0, 0,
    ]);
    const tile10 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile10)).toEqual([
      255, 255, 255,
      0, 0, 0,
      0, 0, 0,
    ]);
  });

  it('creates cell x gene tiles (transpose = false) with re-ordered cells', () => {
    const arr = expressionMatrix.matrix;
    const numGenes = expressionMatrix.cols.length;
    const expressionRowLookUp = new Map();
    // eslint-disable-next-line no-return-assign
    expressionMatrix.rows.forEach((i, j) => expressionRowLookUp.set(i, j));
    const cellOrdering = Array.from(cellColors.keys());
    const numCells = cellOrdering.length;
    // Tile (0, 0)
    const tile00 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile00)).toEqual([
      0, 255, 0,
      0, 255, 255,
      0, 255, 0,
    ]);
    // Tile (0, 1)
    const tile01 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ]);
    // Tile (1, 0)
    const tile10 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, expressionRowLookUp,
    });
    expect(Array.from(tile10)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 255, 255,
    ]);
  });
});
