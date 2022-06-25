import { quadtree } from 'd3-quadtree';
import range from 'lodash/range';

/**
 * Create a d3-quadtree object for cells data points.
 * @param {array} cellsEntries Array of [cellId, cell] tuples,
 * resulting from running Object.entries on the cells object.
 * @param {function} getCellCoords Given a cell object, return the
 * spatial/scatterplot coordinates [x, y].
 * @returns {object} Quadtree instance.
 */
export function createEmbeddingQuadTree(obsEmbedding) {
  // Use the cellsEntries variable since it is already
  // an array, converted by Object.entries().
  // Only use cellsEntries in quadtree calculation if there is
  // centroid data in the cells (i.e not just ids).
  // eslint-disable-next-line no-unused-vars
  if (!obsEmbedding) {
    // Abort if the cells data is not yet available.
    return null;
  }
  const tree = quadtree()
    .x(i => obsEmbedding.data[0][i])
    .y(i => obsEmbedding.data[1][i])
    .addAll(range(obsEmbedding.shape[1]));
  return tree;
}

export function createSegmentationsQuadTree(obsSegmentations) {
  // Use the cellsEntries variable since it is already
  // an array, converted by Object.entries().
  // Only use cellsEntries in quadtree calculation if there is
  // centroid data in the cells (i.e not just ids).
  // eslint-disable-next-line no-unused-vars
  if (!obsSegmentations) {
    // Abort if the cells data is not yet available.
    return null;
  }
  const tree = quadtree()
    // TODO: find center of polygon
    .x(i => obsSegmentations.data[i][0][0])
    .y(i => obsSegmentations.data[i][0][1])
    .addAll(range(obsSegmentations.data.length));
  return tree;
}
