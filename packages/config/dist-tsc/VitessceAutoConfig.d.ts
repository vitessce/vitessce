/**
 * Returns the hints that are available for the given file URLs, depending on their types.
 * @param {Array} fileUrls containing urls of files to be loaded into Vitessce
 * @returns the hints available for these file URLs
 */
export function getHintOptions(fileUrls: any[]): any;
/**
 *
 * @param {Array} fileUrls containing urls of files to be loaded into Vitessce
 * @param {String} the hints config to be used for the dataset. Null by default
 * @returns ViewConfig as JSON
 */
export function generateConfig(fileUrls: any[], hintTitle?: null): Promise<object>;
//# sourceMappingURL=VitessceAutoConfig.d.ts.map