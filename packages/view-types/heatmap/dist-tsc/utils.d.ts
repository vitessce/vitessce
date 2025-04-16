/**
 * Called before a layer is drawn to determine whether it should be rendered.
 * Reference: https://deck.gl/docs/api-reference/core/deck#layerfilter
 * @param {object} params A viewport, layer pair.
 * @param {object} params.layer The layer to check.
 * @param {object} params.viewport The viewport to check.
 * @returns {boolean} Should this layer be rendered in this viewport?
 */
export function layerFilter({ layer, viewport }: {
    layer: object;
    viewport: object;
}): boolean;
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
export function getAxisSizes(transpose: boolean, longestGeneLabel: string, longestCellLabel: string, hideObservationLabels: boolean, hideVariableLabels: boolean): number[];
/**
 * Convert a mouse coordinate (x, y) to a heatmap coordinate (col index, row index).
 * @param {number} mouseX The mouse X of interest.
 * @param {number} mouseY The mouse Y of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [colI, rowI]
 */
export function mouseToHeatmapPosition(mouseX: number, mouseY: number, { offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }: object): number[];
/**
 * Convert a heatmap coordinate (col index, row index) to a mouse coordinate (x, y).
 * @param {number} colI The column index of interest.
 * @param {number} rowI The row index of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [x, y]
 */
export function heatmapToMousePosition(colI: number, rowI: number, { offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }: object): number[];
/**
 * Convert a mouse coordinate (x, y) to a heatmap color bar coordinate (cell index, track index).
 * @param {number} mouseX The mouse X of interest.
 * @param {number} mouseY The mouse Y of interest.
 * @param {object} param2 An object containing current sizes and scale factors.
 * @returns {number[]} [cellI, trackI]
 */
export function mouseToCellColorPosition(mouseX: number, mouseY: number, { axisOffsetTop, axisOffsetLeft, offsetTop, offsetLeft, colorBarSize, numCellColorTracks, transpose, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }: object): number[];
//# sourceMappingURL=utils.d.ts.map