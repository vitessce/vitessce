import { quadtree } from 'd3-quadtree';

/**
 * Create a d3-quadtree object for cells data points.
 * @param {array} cellsEntries Array of [cellId, cell] tuples,
 * resulting from running Object.entries on the cells object.
 * @param {function} getCellCoords Given a cell object, return the
 * spatial/scatterplot coordinates [x, y].
 * @returns {object} Quadtree instance.
 */
export function createCellsQuadTree(cellsEntries, getCellCoords) {
  // Use the cellsEntries variable since it is already
  // an array, converted by Object.entries().
  if (!cellsEntries) {
    // Abort if the cells data is not yet available.
    return null;
  }
  const tree = quadtree()
    .x(d => getCellCoords(d[1])[0])
    .y(d => getCellCoords(d[1])[1])
    .addAll(cellsEntries);
  return tree;
}
