/**
 * Check if an imported tree has an old schema version that we know how to
 * "upgrade" to the latest schema version.  Validate against the schema.
 * @param {object} currTree A hierarchical tree object with a .version property,
 * which has already passed schema validation, but may not have the latest schema version.
 * @param {string} datatype The data type of the items in the schema.
 * @returns {[object, boolean]} The upgraded tree object and a boolean indicating
 * whether the tree was upgraded.
 */
export function tryUpgradeTreeToLatestSchema(currTree: object, datatype: string): [object, boolean];
/**
 * Handler for JSON imports. Validates and upgrades against the hierarchical sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
export function handleImportJSON(result: string, datatype: string, theme: string): object;
/**
 * Handler for tabular imports. Validates against the tabular sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
export function handleImportTabular(result: string, datatype: string, theme: string): object;
/**
 * Convert a tree object to a JSON representation.
 * @param {object} result The object to export.
 * @returns {string} The data in a string representation.
 */
export function handleExportJSON(result: object): string;
/**
 * Convert a tree object with one level (height === 1) to a tabular representation.
 * @param {object} result The object to export.
 * @returns {string} The data in a string representation.
 */
export function handleExportTabular(result: object): string;
/**
 * Download a file. Appends and removes an anchor node in the DOM.
 * @param {string} dataString The function that converts the data to a string.
 * @param {string} fileName The name of the file to be downloaded.
 */
export function downloadForUser(dataString: string, fileName: string): void;
//# sourceMappingURL=io.d.ts.map