/**
 * Get the "computed" coordinationScopes after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @returns {string|undefined} The coordinationScopesBy after meta-coordination.
 */
export function getScopes(coordinationScopes: any, metaSpace: any): string | undefined;
/**
 * Get the "computed" coordinationScopesBy after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationScopesBy The coordinationScopesBy for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @returns {string|undefined} The coordinationScopesBy after meta-coordination.
 */
export function getScopesBy(coordinationScopes: any, coordinationScopesBy: any, metaSpaceBy: any): string | undefined;
/**
 * Get the matching parameter scope.
 * @param {string} parameter A coordination type.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @returns {string|undefined} The coordination scope that matches.
 */
export function getParameterScope(parameter: string, coordinationScopes: any): string | undefined;
/**
 * Get the matching parameter scope.
 * @param {string} parameter A coordination type.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationScopesBy The coordinationScopesBy for a view.
 * @returns {string|undefined} The coordination scope that matches.
 */
export function getParameterScopeBy(parameter: string, byType: any, typeScope: any, coordinationScopes: any, coordinationScopesBy: any): string | undefined;
/**
 * This hook uses the same logic as for the `values` part of
 * the useCoordination hook, with the difference that it
 * gets its values from the _initial_ view config rather
 * than the current view config.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {object} Object containing all coordination values.
 */
export function useInitialCoordination(parameters: string[], coordinationScopes: object): object;
/**
 * The useCoordination hook returns both the
 * values and setter functions for the coordination objects
 * in a particular coordination scope mapping.
 * This hook is intended to be used within the ___Subscriber
 * components to allow them to "hook into" only those coordination
 * objects and setter functions of relevance.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
export function useCoordination(parameters: string[], coordinationScopes: object): array;
export function useMultiCoordinationScopes(parameter: any, coordinationScopes: any): any;
export function useMultiCoordinationScopesNonNull(parameter: any, coordinationScopes: any): any;
export function useMultiCoordinationScopesSecondary(parameter: any, byType: any, coordinationScopes: any, coordinationScopesBy: any): any;
export function useMultiCoordinationScopesSecondaryNonNull(parameter: any, byType: any, coordinationScopes: any, coordinationScopesBy: any): any;
export function useMultiCoordinationValues(parameter: any, coordinationScopes: any): any;
/**
 * Get a mapping from dataset coordination scopes to dataset UIDs.
 * @param {object} coordinationScopes The coordination scope mapping object for a view.
 * @returns {object} Mapping from dataset coordination scope names to dataset UIDs.
 */
export function useDatasetUids(coordinationScopes: object): object;
/**
 * Use coordination values and coordination setter functions corresponding to
 * {coordinationType}-specific coordination scopes for each coordination type.
 * @param {string[]} parameters An array of coordination types supported by a view.
 * @param {object} coordinationScopes The coordination scope mapping object for a view.
 * @param {object} coordinationScopesBy The per-coordinationType coordination scope
 * mapping object for a view.
 * @param {string} byType The {coordinationType} to use for per-{coordinationType} coordination
 * scope mappings.
 * @returns {array} [cValues, cSetters] where
 * cValues is a mapping from coordination scope name to { coordinationType: coordinationValue },
 * and cSetters is a mapping from coordination scope name to { setCoordinationType }
 * setter functions.
 */
export function useComplexCoordination(parameters: string[], coordinationScopes: object, coordinationScopesBy: object, byType: string): array;
/**
 * Get the "computed" (i.e., after accounting for meta-coordination)
 * value for coordinationScopes.
 * @param {object} coordinationScopes The original coordinationScopes passed to the view.
 * @returns {object} The coordinationScopes after filling in with meta-coordinationScopes.
 */
export function useCoordinationScopes(coordinationScopes: object): object;
/**
 * Get the "computed" (i.e., after accounting for meta-coordination)
 * value for coordinationScopesBy.
 * @param {object} coordinationScopes The original coordinationScopes passed to the view.
 * @param {object} coordinationScopesBy The original coordinationScopesBy passed to the view.
 * @returns {object} The coordinationScopesBy after filling in with meta-coordinationScopesBy.
 */
export function useCoordinationScopesBy(coordinationScopes: object, coordinationScopesBy: object): object;
/**
 * Use a second level of complex coordination.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopesBy The coordinationScopesBy object from the view definition.
 * @param {string} primaryType The first-level coordination type, such as spatialImageLayer.
 * @param {string} secondaryType The second-level coordination type, such as spatialImageChannel.
 * @returns The results of useComplexCoordination.
 */
export function useComplexCoordinationSecondary(parameters: string[], coordinationScopes: any, coordinationScopesBy: object, primaryType: string, secondaryType: string): any[];
/**
 * Use coordination values and coordination setter functions corresponding to
 * dataset-specific coordination scopes for each coordination type.
 * @param {string[]} parameters An array of coordination types supported by a view.
 * @param {object} coordinationScopes The coordination scope mapping object for a view.
 * @param {object} coordinationScopesBy The per-coordinationType coordination scope
 * mapping object for a view.
 * @returns {array} [cValues, cSetters] where
 * cValues is a mapping from coordination scope name to { coordinationType: coordinationValue },
 * and cSetters is a mapping from coordination scope name to { setCoordinationType }
 * setter functions.
 */
export function useMultiDatasetCoordination(parameters: string[], coordinationScopes: object, coordinationScopesBy: object): array;
/**
 * The useAuxiliaryCoordination hook returns both the
 * values and setter functions for the auxiliary coordination objects
 * in a particular coordination scope mapping.
 * This hook is intended to be used within the ___Subscriber
 * components to allow them to "hook into" only those auxiliary coordination
 * objects and setter functions of relevance, for example "on load" callbacks.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
export function useAuxiliaryCoordination(parameters: string[], coordinationScopes: object): array;
/**
 * Obtain the loaders object from
 * the global app state.
 * @returns {object} The loaders object
 * in the `useViewConfigStore` store.
 */
export function useLoaders(): object;
/**
 * Find a specific loader instance for a particular dataset, data type, and view
 * coordination values (mapping from coordination types to coordination values).
 * Uses lodash/isMatch to perform matching against the file definition's
 * coordination value mapping.
 * @param {object} loaders The value returned by useLoaders.
 * @param {string} dataset The dataset UID.
 * @param {string} dataType The data type for the matching file.
 * @param {object} viewCoordinationValues Current coordination values
 * from the view. Match these against a subset of file definition coordination
 * values.
 * @returns The matching loader instance or `null`.
 */
export function getMatchingLoader(loaders: object, dataset: string, dataType: string, viewCoordinationValues: object): any;
/**
 * Find a specific loader instance for a particular dataset, data type, and view
 * coordination values (mapping from coordination types to coordination values).
 * Uses lodash/isMatch to perform matching against the file definition's
 * coordination value mapping.
 * @param {object} loaders The value returned by useLoaders.
 * @param {string} dataset The dataset UID.
 * @param {string} dataType The data type for the matching file.
 * @param {object} viewCoordinationValues Current coordination values
 * from the view. Match these against a subset of file definition coordination
 * values.
 * @returns The matching loader instance or `null`.
 */
export function useMatchingLoader(loaders: object, dataset: string, dataType: string, viewCoordinationValues: object): any;
/**
 * Obtain the view config layout array from
 * the global app state.
 * @returns {object[]} The layout array
 * in the `useViewConfigStore` store.
 */
export function useLayout(): object[];
/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useRemoveComponent(): Function;
/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useRemoveImageChannelInMetaCoordinationScopes(): Function;
/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useAddImageChannelInMetaCoordinationScopes(): Function;
/**
 * Obtain the component prop setter function from
 * the global app state.
 * @returns {function} The set component props function
 * in the `useViewInfoStore` store.
 */
export function useChangeLayout(): Function;
/**
 * Obtain the loaders setter function from
 * the global app state.
 * @returns {function} The loaders setter function
 * in the `useViewConfigStore` store.
 */
export function useSetLoaders(): Function;
/**
 * Obtain the loaders setter function from
 * the global app state.
 * @returns {function} The loaders setter function
 * in the `useViewConfigStore` store.
 */
export function useMergeCoordination(): Function;
/**
 * Obtain the view config setter function from
 * the global app state.
 * @returns {function} The view config setter function
 * in the `useViewConfigStore` store.
 */
export function useSetViewConfig(viewConfigStoreApi: any): Function;
/**
 * Obtain the component hover value from
 * the global app state.
 * @returns {number} The hovered component ID
 * in the `useHoverStore` store.
 */
export function useComponentHover(): number;
/**
 * Obtain the component hover setter function from
 * the global app state.
 * @returns {function} The component hover setter function
 * in the `useHoverStore` store.
 */
export function useSetComponentHover(): Function;
/**
 * Obtain the warning message from
 * the global app state.
 * @returns {string} The warning message
 * in the `useWarnStore` store.
 */
export function useWarning(): string;
/**
 * Obtain the warning setter function from
 * the global app state.
 * @returns {function} The warning setter function
 * in the `useWarnStore` store.
 */
export function useSetWarning(): Function;
/**
 * Obtain the component view info value from
 * the global app state.
 * @returns {object} The view info object for the component
 * in the `useViewInfoStore` store.
 */
export function useComponentViewInfo(uuid: any): object;
/**
 * Obtain the component view info setter function from
 * the global app state.
 * @returns {function} The component view info setter function
 * in the `useViewInfoStore` store.
 */
export function useSetComponentViewInfo(uuid: any): Function;
/**
 * Obtain the grid resize count value
 * from the global app state.
 * @returns {number} The grid resize increment value.
 */
export function useGridResize(): number;
/**
 * Obtain the grid resize count increment function
 * from the global app state.
 * @returns {function} The grid resize count increment
 * function.
 */
export function useEmitGridResize(): Function;
export const ViewConfigProvider: ({ initialStore, createStore, children, }: {
    initialStore?: import("zustand").UseBoundStore<object> | undefined;
    createStore: () => import("zustand").UseBoundStore<object>;
    children: import("../../../plugins/node_modules/@types/react/index.js").ReactNode;
}) => import("../../../plugins/node_modules/@types/react/index.js").FunctionComponentElement<import("../../../plugins/node_modules/@types/react/index.js").ProviderProps<import("zustand").UseBoundStore<object> | undefined>>;
export const useViewConfigStore: import("zustand/context.js").UseContextStore<object>;
export const useViewConfigStoreApi: () => {
    getState: import("zustand").GetState<object>;
    setState: import("zustand").SetState<object>;
    subscribe: import("zustand").Subscribe<object>;
    destroy: import("zustand").Destroy;
};
export const AuxiliaryProvider: ({ initialStore, createStore, children, }: {
    initialStore?: import("zustand").UseBoundStore<object> | undefined;
    createStore: () => import("zustand").UseBoundStore<object>;
    children: import("../../../plugins/node_modules/@types/react/index.js").ReactNode;
}) => import("../../../plugins/node_modules/@types/react/index.js").FunctionComponentElement<import("../../../plugins/node_modules/@types/react/index.js").ProviderProps<import("zustand").UseBoundStore<object> | undefined>>;
export const useAuxiliaryStore: import("zustand/context.js").UseContextStore<object>;
export function createViewConfigStore(initialLoaders: any, initialConfig: any): Function;
export function useComponentLayout(component: any, scopes: any, coordinationScopes: any): Object;
export function createAuxiliaryStore(): Function;
//# sourceMappingURL=hooks.d.ts.map