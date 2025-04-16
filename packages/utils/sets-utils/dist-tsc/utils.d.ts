/**
 * Execute a callback function based on a keypress event.
 * @param {object} event The event from onKeyPress
 * @param {string} key The key identifier to match.
 * @param {Function} callback The function to execute.
 */
export function callbackOnKeyPress(event: object, key: string, callback: Function): void;
/**
 * Convert an array of [r, g, b] numbers to a hex color.
 * @param {number[]} rgbArray The color [r, g, b] array.
 * @returns {string} The hex color as a string.
 */
export function colorArrayToString(rgbArray: number[]): string;
/**
 * Convert a string color representation to an array of [r,g,b].
 * @param {string} colorString The color as a string.
 * @returns {number[]} The color as an array.
 */
export function colorStringToArray(colorString: string): number[];
/**
 * Get a string of help text for coloring a particular hierarchy level.
 * @param {integer} i The level. 1 for cluster, 2 for subcluster, etc.
 * @returns {string} The tooltip text for coloring the level.
 */
export function getLevelTooltipText(i: integer): string;
export function isEqualOrPrefix(targetPath: any, testPath: any): any;
export function tryRenamePath(targetPath: any, testPath: any, nextTargetPath: any): any;
export function pathToKey(path: any): any;
export function getNextNumberedNodeName(nodes: any, prefix: any, suffix: any): string;
/**
 * Create a new selected cell set based on a cell selection.
 * @param {string[]} cellSelection An array of cell IDs.
 * @param {object[]} additionalCellSets The previous array of user-defined cell sets.
 * @param {function} setCellSetSelection The setter function for cell set selections.
 * @param {function} setAdditionalCellSets The setter function for user-defined cell sets.
 */
export function setObsSelection(cellSelection: string[], additionalCellSets: object[], cellSetColor: any, setCellSetSelection: Function, setAdditionalCellSets: Function, setCellSetColor: any, setCellColorEncoding: any, prefix?: string, suffix?: string): void;
export function mergeObsSets(cellSets: any, additionalCellSets: any): {
    version: string;
    datatype: string;
    tree: any[];
};
export function getObsInfoFromDataWithinRange(range: any, data: any): any;
export const PATH_SEP: "___";
//# sourceMappingURL=utils.d.ts.map