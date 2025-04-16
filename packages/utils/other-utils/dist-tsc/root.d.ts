export declare function commaNumber(n: number): string;
/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export declare function capitalize(word: string | null): string;
/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export declare function pluralize(word: string, count?: number | null): any;
/**
 * Get the longest string in the array of strings.
 * @param {string[]} strings The array of strings.
 * @returns The longest string.
 */
export declare function getLongestString(strings: string[]): string;
/**
 * Generate a new scope name which does not
 * conflict / overlap with a previous scope name.
 * Really these just need to be unique within the coordination object.
 * So in theory they could be String(Math.random()) or uuidv4() or something.
 * However it may be good to make them more human-readable and memorable
 * since eventually we will want to expose a UI to update the coordination.
 * @param {string[]} prevScopes Previous scope names.
 * @returns {string} The new scope name.
 */
export declare function getNextScope(prevScopes: string[]): string;
/**
 * Generate a new scope name which does not
 * conflict / overlap with a previous scope name.
 * Really these just need to be unique within the coordination object.
 * So in theory they could be String(Math.random()) or uuidv4() or something.
 * In this version we use an incrementing integer starting from 0.
 * @param {string[]} prevScopes Previous scope names.
 * @returns {string} The new scope name.
 */
export declare function getNextScopeNumeric(prevScopes: string[]): string;
/**
 * Generate a getNextScopeNumeric function which includes a prefix.
 * @param {string} prefix The prefix to use.
 * @returns {Function} The getNextScope function.
 */
export declare function createPrefixedGetNextScopeNumeric(prefix: string): (prevScopes: string[]) => string;
/**
 * Get the prefix for an automatically-initialized coordination scope.
 * @param datasetUid The dataset UID.
 * @param dataType The dataType corresponding to the fileType
 * whose loader defines the initial coordination values.
 * @returns The prefix for the initial coordination scope
 * like "init_<datasetUid>_<dataType>_".
 */
export declare function getInitialCoordinationScopePrefix(datasetUid: string, dataType: string): string;
/**
 * Get the name for an automatically-initialized coordination scope.
 * @param datasetUid The dataset UID.
 * @param dataType The dataType corresponding to the fileType
 * whose loader defines the initial coordination values.
 * @param i Optional. If null, the initial coordination scope
 * name will be "init_<datasetUid>_<dataType>_0".
 * @returns The name for the initial coordination scope
 * like "init_<datasetUid>_<dataType>_<i>".
 */
export declare function getInitialCoordinationScopeName(datasetUid: string, dataType: string, i?: number | null): string;
//# sourceMappingURL=root.d.ts.map