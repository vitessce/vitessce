import { clamp } from 'lodash-es';
import { AXIS_LABEL_TEXT_SIZE, AXIS_FONT_FAMILY, AXIS_PADDING, AXIS_MIN_SIZE, AXIS_MAX_SIZE, } from '@vitessce/gl';
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
    }
    if (viewport.id === 'axisTop') {
        return layer.id.startsWith('axisTop');
    }
    if (viewport.id === 'cellColorLabel') {
        return layer.id.startsWith('cellColorLabel');
    }
    if (viewport.id === 'heatmap') {
        return layer.id.startsWith('heatmap');
    }
    if (viewport.id.startsWith('colorsLeft')) {
        const matches = viewport.id.match(/-(\d)/);
        if (matches)
            return layer.id.startsWith(`colorsLeftLayer-${matches[1]}`);
    }
    if (viewport.id.startsWith('colorsTop')) {
        const matches = viewport.id.match(/-(\d)/);
        if (matches)
            return layer.id.startsWith(`colorsTopLayer-${matches[1]}`);
    }
    return false;
}
/**
 * Uses canvas.measureText to compute and return the width of the given text
 * of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered
 * with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}
/**
 * Get the size of the left and top heatmap axes,
 * taking into account the maximum label string lengths.
 * @param {boolean} transpose Is the heatmap transposed?
 * @param {String} longestGeneLabel longest gene label
 * @param {String} longestCellLabel longest cell label
 * @param {boolean} hideObservationLabels are cell labels hidden?
 * @param {boolean} hideVariableLabels are gene labels hidden?
 * Increases vertical space for heatmap
 * @returns {number[]} [axisOffsetLeft, axisOffsetTop]
 */
export function getAxisSizes(transpose, longestGeneLabel, longestCellLabel, hideObservationLabels, hideVariableLabels) {
    const font = `${AXIS_LABEL_TEXT_SIZE}pt ${AXIS_FONT_FAMILY}`;
    const geneLabelMaxWidth = hideVariableLabels
        ? 0 : getTextWidth(longestGeneLabel, font) + AXIS_PADDING;
    const cellLabelMaxWidth = hideObservationLabels
        ? 0 : getTextWidth(longestCellLabel, font) + AXIS_PADDING;
    const axisOffsetLeft = clamp((transpose ? geneLabelMaxWidth : cellLabelMaxWidth), AXIS_MIN_SIZE, AXIS_MAX_SIZE);
    const axisOffsetTop = clamp((transpose ? cellLabelMaxWidth : geneLabelMaxWidth), AXIS_MIN_SIZE, AXIS_MAX_SIZE);
    return [axisOffsetLeft, axisOffsetTop];
}
/**
 * Convert a mouse coordinate (x, y) to a heatmap coordinate (col index, row index).
 * @param {number} mouseX The mouse X of interest.
 * @param {number} mouseY The mouse Y of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [colI, rowI]
 */
export function mouseToHeatmapPosition(mouseX, mouseY, { offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }) {
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
export function heatmapToMousePosition(colI, rowI, { offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }) {
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
/**
 * Convert a mouse coordinate (x, y) to a heatmap color bar coordinate (cell index, track index).
 * @param {number} mouseX The mouse X of interest.
 * @param {number} mouseY The mouse Y of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [cellI, trackI]
 */
export function mouseToCellColorPosition(mouseX, mouseY, { axisOffsetTop, axisOffsetLeft, offsetTop, offsetLeft, colorBarSize, numCellColorTracks, transpose, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }) {
    const cellPosition = transpose ? mouseX - offsetLeft : mouseY - offsetTop;
    const trackPosition = transpose ? mouseY - axisOffsetTop : mouseX - axisOffsetLeft;
    const tracksWidth = numCellColorTracks * colorBarSize;
    // outside of cell color tracks
    if (cellPosition < 0 || trackPosition < 0 || trackPosition >= tracksWidth) {
        return [null, null];
    }
    // Determine the trackI and cellI values based on the current viewState.
    const trackI = Math.floor(trackPosition / colorBarSize);
    let cellI;
    if (transpose) {
        const viewMouseX = mouseX - offsetLeft;
        const bboxTargetX = targetX * scaleFactor + matrixWidth * scaleFactor / 2;
        const bboxLeft = bboxTargetX - matrixWidth / 2;
        const zoomedOffsetLeft = bboxLeft / (matrixWidth * scaleFactor);
        const zoomedViewMouseX = viewMouseX / (matrixWidth * scaleFactor);
        const zoomedMouseX = zoomedOffsetLeft + zoomedViewMouseX;
        cellI = Math.floor(zoomedMouseX * numCols);
        return [cellI, trackI];
    }
    // Not transposed
    const viewMouseY = mouseY - axisOffsetTop;
    const bboxTargetY = targetY * scaleFactor + matrixHeight * scaleFactor / 2;
    const bboxTop = bboxTargetY - matrixHeight / 2;
    const zoomedOffsetTop = bboxTop / (matrixHeight * scaleFactor);
    const zoomedViewMouseY = viewMouseY / (matrixHeight * scaleFactor);
    const zoomedMouseY = zoomedOffsetTop + zoomedViewMouseY;
    cellI = Math.floor(zoomedMouseY * numRows);
    return [cellI, trackI];
}
