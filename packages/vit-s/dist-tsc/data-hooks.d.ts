/**
 * Get the dataset description string.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @returns {array} [description] where
 * description is a string.
 */
export function useDescription(loaders: object, dataset: string): array;
/**
 * Get data from a cells data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [cells, cellsCount] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useObsEmbeddingData(loaders: object, dataset: string, isRequired: boolean, coordinationSetters: object, initialCoordinationValues: object, matchOn: any): array;
export function useObsSpotsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsPointsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsLocationsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsLabelsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsSegmentationsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsSetsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useSampleSetsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useSampleEdgesData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useObsFeatureMatrixData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useFeatureLabelsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useImageData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useGenomicProfilesData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
export function useNeighborhoodsData(loaders: any, dataset: any, isRequired: any, coordinationSetters: any, initialCoordinationValues: any, matchOn: any): array;
/**
 * Get data from the expression matrix data type loader for a given gene selection.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {boolean} selection A list of gene names to get expression data for.
 * @returns {array} [geneData] where geneData is an array [Uint8Array, ..., Uint8Array]
 * for however many genes are in the selection.
 */
export function useFeatureSelection(loaders: object, dataset: string, isRequired: boolean, selection: boolean, matchOn: any): array;
/**
 * Get the attributes for the expression matrix data type loader,
 * i.e names of cells and genes.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.  Should not be used in conjunction (called in the same component)
 * with useExpressionMatrixData.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {object} [attrs] { rows, cols } object containing cell and gene names.
 */
export function useObsFeatureMatrixIndices(loaders: object, dataset: string, isRequired: boolean, matchOn: any): object;
export function useMultiObsPoints(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any, mergeCoordination: any, viewUid: any): any[];
export function useMultiObsSpots(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any, mergeCoordination: any, viewUid: any): any[];
export function useSpotMultiObsSets(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any): any[];
export function useSpotMultiFeatureLabels(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any): any[];
export function useMultiObsLabels(coordinationScopes: any, obsType: any, loaders: any, dataset: any): any[];
export function useMultiObsSegmentations(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any, mergeCoordination: any, viewUid: any): any[];
export function useMultiImages(coordinationScopes: any, coordinationScopesBy: any, loaders: any, dataset: any, mergeCoordination: any, viewUid: any): any[];
//# sourceMappingURL=data-hooks.d.ts.map