/**
 * Get a mapping of cell IDs to cell colors based on
 * gene / cell set selection coordination state.
 * @param {object} params
 * @param {array[]} params.cellSetSelection Selected cell sets.
 * @param {object[]} params.cellSetColor Array of cell set color
 * objects, each containing a path and color [r, g, b].
 * @param {string[]} params.obsIndex Array of cell IDs,
 * in order to initialize all cells to the default color.
 * @param {string} params.theme The current theme,
 * in order to get the theme-based default color.
 * @returns {Map} Mapping from cell IDs to [r, g, b] color arrays.
 */
export function getCellColors(params: {
    cellSetSelection: array[];
    cellSetColor: object[];
    obsIndex: string[];
    theme: string;
}): Map<any, any>;
export function interpolateRdBu(t: any): any[];
export function interpolatePlasma(t: any): any;
//# sourceMappingURL=interpolate-colors.d.ts.map