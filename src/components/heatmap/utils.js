import clamp from 'lodash/clamp';
import range from 'lodash/range';

import {
  AXIS_LABEL_TEXT_SIZE,
  AXIS_MIN_SIZE,
  AXIS_MAX_SIZE,
} from '../../layers/heatmap-constants';

export function getGeneByCellTile(view, {
  tileSize, tileI, tileJ, numCells, numGenes, cellOrdering, cells,
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
      sortedCellI = cells.indexOf(cellOrdering[cellI]);
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
  tileSize, tileI, tileJ, numCells, numGenes, cellOrdering, cells,
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
      sortedCellI = cells.indexOf(cellOrdering[cellI]);
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
 * Called before a layer is drawn to determine whether it should be rendered.
 * Reference: https://deck.gl/docs/api-reference/core/deck#layerfilter
 * @param {object} params A viewport, layer pair.
 * @param {object} params.layer The layer to check.
 * @param {object} params.viewport The viewport to check.
 * @returns {boolean} Should this layer be rendered in this viewport?
 */
export function layerFilter({ layer, viewport }) {
  if (viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } if (viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } if (viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmap');
  } if (viewport.id === 'colorsLeft') {
    return layer.id.startsWith('colorsLeft');
  } if (viewport.id === 'colorsTop') {
    return layer.id.startsWith('colorsTop');
  }
  return false;
}

/**
 * Get the size of the left and top heatmap axes,
 * taking into account the maximum label string lengths.
 * @param {boolean} transpose Is the heatmap transposed?
 * @param {number} geneLabelMaxLength What is the maximum length gene label?
 * @param {number} cellLabelMaxLength What is the maximum length cell label?
 * @returns {number[]} [axisOffsetLeft, axisOffsetTop]
 */
export function getAxisSizes(transpose, geneLabelMaxLength, cellLabelMaxLength) {
  const axisOffsetLeft = clamp(
    (transpose ? geneLabelMaxLength : cellLabelMaxLength) * AXIS_LABEL_TEXT_SIZE,
    AXIS_MIN_SIZE,
    AXIS_MAX_SIZE,
  );
  const axisOffsetTop = clamp(
    (transpose ? cellLabelMaxLength : geneLabelMaxLength) * AXIS_LABEL_TEXT_SIZE,
    AXIS_MIN_SIZE,
    AXIS_MAX_SIZE,
  );
  return [axisOffsetLeft, axisOffsetTop];
}

/**
 * Convert a mouse coordinate (x, y) to a heatmap coordinate (col index, row index).
 * @param {number} mouseX The mouse X of interest.
 * @param {number} mouseY The mouse Y of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [colI, rowI]
 */
export function mouseToHeatmapPosition(mouseX, mouseY, {
  offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols,
}) {
  // TODO: use linear algebra
  const viewMouseX = mouseX - offsetLeft;
  const viewMouseY = mouseY - offsetTop;

  if (viewMouseX < 0 || viewMouseY < 0) {
    // The mouse is outside the heatmap.
    return [null, null];
  }

  // Determine the rowI and colI values based on the current viewState.
  const bboxTargetX = targetX * scaleFactor + matrixWidth * scaleFactor / 2;
  const bboxTargetY = targetY * scaleFactor + matrixHeight * scaleFactor / 2;

  const bboxLeft = bboxTargetX - matrixWidth / 2;
  const bboxTop = bboxTargetY - matrixHeight / 2;

  const zoomedOffsetLeft = bboxLeft / (matrixWidth * scaleFactor);
  const zoomedOffsetTop = bboxTop / (matrixHeight * scaleFactor);

  const zoomedViewMouseX = viewMouseX / (matrixWidth * scaleFactor);
  const zoomedViewMouseY = viewMouseY / (matrixHeight * scaleFactor);

  const zoomedMouseX = zoomedOffsetLeft + zoomedViewMouseX;
  const zoomedMouseY = zoomedOffsetTop + zoomedViewMouseY;

  const rowI = Math.floor(zoomedMouseY * numRows);
  const colI = Math.floor(zoomedMouseX * numCols);
  return [colI, rowI];
}

/**
 * Convert a heatmap coordinate (col index, row index) to a mouse coordinate (x, y).
 * @param {number} colI The column index of interest.
 * @param {number} rowI The row index of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [x, y]
 */
export function heatmapToMousePosition(colI, rowI, {
  offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols,
}) {
  // TODO: use linear algebra
  let zoomedMouseY = null;
  let zoomedMouseX = null;

  if (rowI !== null) {
    const minY = -matrixHeight * scaleFactor / 2;
    const maxY = matrixHeight * scaleFactor / 2;
    const totalHeight = maxY - minY;

    const minInViewY = (targetY * scaleFactor) - (matrixHeight / 2);
    const maxInViewY = (targetY * scaleFactor) + (matrixHeight / 2);
    const inViewHeight = maxInViewY - minInViewY;

    const normalizedRowY = (rowI + 0.5) / numRows;
    const globalRowY = minY + (normalizedRowY * totalHeight);

    if (minInViewY <= globalRowY && globalRowY <= maxInViewY) {
      zoomedMouseY = offsetTop + ((globalRowY - minInViewY) / inViewHeight) * matrixHeight;
    }
  }
  if (colI !== null) {
    const minX = -matrixWidth * scaleFactor / 2;
    const maxX = matrixWidth * scaleFactor / 2;
    const totalWidth = maxX - minX;

    const minInViewX = (targetX * scaleFactor) - (matrixWidth / 2);
    const maxInViewX = (targetX * scaleFactor) + (matrixWidth / 2);
    const inViewWidth = maxInViewX - minInViewX;

    const normalizedRowX = (colI + 0.5) / numCols;
    const globalRowX = minX + (normalizedRowX * totalWidth);

    if (minInViewX <= globalRowX && globalRowX <= maxInViewX) {
      zoomedMouseX = offsetLeft + ((globalRowX - minInViewX) / inViewWidth) * matrixWidth;
    }
  }
  return [zoomedMouseX, zoomedMouseY];
}
