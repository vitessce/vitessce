/**
 * Ensure that the channel selection object does not have
 * extra dimension keys, as this will cause Viv functions
 * to throw errors about not being able to access the data.
 * @param {*} loader
 * @param {object} selection Mapping from dimension label to slice index.
 * @returns {object} The filtered selection.
 */
export function filterSelection(loader: any, selection: object): object;
/**
 * Get physical size scaling Matrix4
 * @param {Object} loader PixelSource
 * @returns {Object} matrix
 */
export function getPhysicalSizeScalingMatrix(loader: Object): Object;
/**
 * Get bounding cube for a given loader
 * @param {Object} loader PixelSource|PixelSource[]
 * @returns {Array} [0, width], [0, height], [0, depth]]
 */
export function getBoundingCube(loader: Object): any[];
export function abbreviateNumber(value: any): any;
export function toRgbUIString(on: any, arr: any, theme: any): string;
export function getSingleSelectionStats({ loader, selection, use3d }: Object): Object;
export function getMultiSelectionStats({ loader, selections, use3d }: {
    loader: any;
    selections: any;
    use3d: any;
}): Promise<{
    domains: any[];
    sliders: any[];
}>;
//# sourceMappingURL=layer-controller.d.ts.map