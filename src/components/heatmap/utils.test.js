import expect from 'expect';
import {
  getCellByGeneTile, getGeneByCellTile,
  mouseToHeatmapPosition, heatmapToMousePosition,
} from './utils';
import { expressionMatrix, cellColors } from './Heatmap.test.fixtures';

describe('heatmap tiling utils', () => {
  it('creates cell x gene tiles (transpose = false)', () => {
    const arr = expressionMatrix.matrix;
    const numGenes = expressionMatrix.cols.length;
    const cells = expressionMatrix.rows;
    const cellOrdering = expressionMatrix.rows; // no re-ordering
    const numCells = cellOrdering.length;
    // Tile (0, 0)
    const tile00 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, cells,
    });
    expect(Array.from(tile00)).toEqual([
      0, 255, 255,
      0, 255, 0,
      0, 255, 255,
    ]);
    // Tile (0, 1)
    const tile01 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, cells,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ]);
    // Tile (1, 0)
    const tile10 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, cells,
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
    const cells = expressionMatrix.rows;
    const cellOrdering = expressionMatrix.rows; // no re-ordering
    const numCells = cellOrdering.length;
    const tile00 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, cells,
    });
    expect(Array.from(tile00)).toEqual([
      255, 0, 255,
      255, 255, 255,
      0, 0, 0,
    ]);
    const tile01 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, cells,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      255, 255, 0,
      0, 0, 0,
    ]);
    const tile10 = getGeneByCellTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, cells,
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
    const cells = expressionMatrix.rows;
    const cellOrdering = Array.from(cellColors.keys());
    const numCells = cellOrdering.length;
    // Tile (0, 0)
    const tile00 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 0, cellOrdering, cells,
    });
    expect(Array.from(tile00)).toEqual([
      0, 255, 0,
      0, 255, 255,
      0, 255, 0,
    ]);
    // Tile (0, 1)
    const tile01 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 0, tileJ: 1, cellOrdering, cells,
    });
    expect(Array.from(tile01)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ]);
    // Tile (1, 0)
    const tile10 = getCellByGeneTile(arr, {
      tileSize: 3, numCells, numGenes, tileI: 1, tileJ: 0, cellOrdering, cells,
    });
    expect(Array.from(tile10)).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 255, 255,
    ]);
  });
});

describe('heatmap tooltip utils', () => {
  it('transforms mouse coordinates to row and column indices when zoomed out', () => {
    const mouseX = 35;
    const mouseY = 78;
    const [colI, rowI] = mouseToHeatmapPosition(mouseX, mouseY, {
      offsetLeft: 10,
      offsetTop: 10,
      targetX: 0,
      targetY: 0,
      scaleFactor: 1,
      matrixWidth: 100,
      matrixHeight: 100,
      numRows: 5,
      numCols: 4,
    });
    expect(colI).toEqual(1);
    expect(rowI).toEqual(3);
  });

  it('transforms mouse coordinates to row and column indices when zoomed in', () => {
    const mouseX = 35;
    const mouseY = 78;
    const [colI, rowI] = mouseToHeatmapPosition(mouseX, mouseY, {
      offsetLeft: 10,
      offsetTop: 10,
      targetX: 21,
      targetY: -11,
      scaleFactor: 4,
      matrixWidth: 100,
      matrixHeight: 100,
      numRows: 5,
      numCols: 4,
    });
    expect(colI).toEqual(2);
    expect(rowI).toEqual(2);
  });

  it('transforms row and column indices when zoomed out', () => {
    const colI = 1;
    const rowI = 3;
    const [mouseX, mouseY] = heatmapToMousePosition(colI, rowI, {
      offsetLeft: 10,
      offsetTop: 10,
      targetX: 0,
      targetY: 0,
      scaleFactor: 1,
      matrixWidth: 100,
      matrixHeight: 100,
      numRows: 5,
      numCols: 4,
    });
    expect(mouseX).toEqual(47.5);
    expect(mouseY).toEqual(80);
  });

  it('transforms row and column indices when zoomed in', () => {
    const colI = 2;
    const rowI = 2;
    const [mouseX, mouseY] = heatmapToMousePosition(colI, rowI, {
      offsetLeft: 10,
      offsetTop: 10,
      targetX: 21,
      targetY: -11,
      scaleFactor: 4,
      matrixWidth: 100,
      matrixHeight: 100,
      numRows: 5,
      numCols: 4,
    });
    expect(mouseX).toEqual(26);
    expect(mouseY).toEqual(104);
  });
});
