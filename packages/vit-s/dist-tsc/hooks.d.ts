export function useVitessceContainer(ref: any): any;
/**
 * Custom hook, gets the full window dimensions.
 * @returns {array} `[width, height]` where width and height
 * are numbers.
 */
export function useWindowDimensions(): array;
/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, containerRef]` where width and height
 * are numbers and containerRef is a React ref.
 */
export function useGridItemSize(): array;
/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, deckRef]` where width and height
 * are numbers and deckRef is a React ref to be used with
 * a <DeckGL/> element (or a forwardRef to one).
 */
export function useDeckCanvasSize(): array;
/**
 * This hook handles a boolean isReady value,
 * which only returns true once every item in the
 * input list has been marked as "ready".
 * @param {string[]} statusValues The items to wait on.
 * @returns {boolean} Whether the status values are all success.
 */
export function useReady(statusValues: string[]): boolean;
/**
 * This hook helps manage a list of URLs.
 * @param {(null|object[])[]} urls Array of (null or array of { url, name }).
 * @returns {array} An array of { url, name } objects (flattened from the input).
 */
export function useUrls(urls: (null | object[])[]): array;
/**
 * Custom hook, subscribes to the width and height of the closest .vitessce-container
 * element and updates upon window resize events.
 * @param {Ref} ref A React ref object within the `.vitessce-container`.
 * @returns {array} `[width, height]` where width and height
 * are numbers.
 */
export function useClosestVitessceContainerSize(ref: Ref): array;
/**
 * Normalize an obsFeatureMatrix to a Uint8Array.
 * @param {object} params
 * @param {object} params.obsFeatureMatrix The obsFeatureMatrix
 * returned by the useObsFeatureMatrix hook.
 * @returns {array} A tuple [obsFeatureMatrix, dataExtent]
 * where obsFeatureMatrix
 * is a Uint8Array with the same shape as
 * params.obsFeatureMatrix.data, and dataExtent is the
 * [min, max] of the original data.
 */
export function useUint8ObsFeatureMatrix({ obsFeatureMatrix }: {
    obsFeatureMatrix: object;
}): array;
/**
 * Normalize a feature selection (data for selected
 * columns of an obsFeatureMatrix) to a Uint8Array.
 * @param {array|null} expressionData The expressionData
 * returned by the useFeatureSelection hook,
 * where each element corresponds to an
 * array of values for a selected feature.
 * @returns {array} A tuple [normData, extents] where
 * normData is an array of Uint8Arrays (or null), and extents is
 * an array of [min, max] values for each feature (or null).
 */
export function useUint8FeatureSelection(expressionData: array | null): array;
export function useExpressionValueGetter({ instanceObsIndex, matrixObsIndex, expressionData }: {
    instanceObsIndex: any;
    matrixObsIndex: any;
    expressionData: any;
}): any;
export function useGetObsMembership(obsSetsMembership: any): any;
export function useGetObsInfo(obsType: any, obsLabelsTypes: any, obsLabelsData: any, obsSetsMembership: any): any;
//# sourceMappingURL=hooks.d.ts.map