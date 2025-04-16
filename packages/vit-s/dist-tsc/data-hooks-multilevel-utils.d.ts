/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} selections
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getFeatureSelectionQueryKeyScopeTuples(selections: object, matchOnObj: object, depth: number, dataset: string, dataType: string, isRequired: any): any;
/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getMatrixIndicesQueryKeyScopeTuples(matchOnObj: object, depth: number, dataset: string, dataType: string, isRequired: any): any;
/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getQueryKeyScopeTuples(matchOnObj: object, depth: number, dataset: string, dataType: string, isRequired: any): any;
/**
 * For a list of paths into a nested object,
 * initialize the object if the object keys do not yet exist.
 * For the first level, the object is initialized to the return
 * value of getBaseValue. For example, this allows initializing
 * to an empty array (without reusing the same array object reference).
 * @param {string[]} levelScopes
 * @param {object} currObj
 * @param {function} getBaseValue
 * @returns The value at the end of the path specified by `levelScopes`.
 */
export function initializeNestedObject(levelScopes: string[], currObj: object, getBaseValue: Function): any;
/**
 * Nest query results.
 * @param {array} queryKeyScopeTuples
 * @param {array} flatQueryResults Return value of useQueries,
 * after .map() to get inner data elements.
 * @returns The nested object.
 */
export function nestFeatureSelectionQueryResults(queryKeyScopeTuples: array, flatQueryResults: array): {};
/**
 * Nest query results.
 * @param {array} queryKeyScopeTuples
 * @param {array} flatQueryResults Return value of useQueries,
 * after .map() to get inner data elements.
 * @returns The nested object.
 */
export function nestQueryResults(queryKeyScopeTuples: array, flatQueryResults: array): {};
export function useFeatureSelectionMultiLevel(loaders: any, dataset: any, isRequired: any, matchOnObj: any, selections: any, depth: any): any[];
export function useObsFeatureMatrixIndicesMultiLevel(loaders: any, dataset: any, isRequired: any, matchOnObj: any, depth: any): any[];
export function useObsLocationsMultiLevel(loaders: any, dataset: any, isRequired: any, matchOnObj: any, depth: any): any[];
export function useObsSetsMultiLevel(loaders: any, dataset: any, isRequired: any, matchOnObj: any, depth: any): any[];
export function useObsLabelsMultiLevel(loaders: any, dataset: any, isRequired: any, matchOnObj: any, depth: any): any[];
//# sourceMappingURL=data-hooks-multilevel-utils.d.ts.map