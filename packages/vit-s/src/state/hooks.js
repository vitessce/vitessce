/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import { useRef, useCallback, useMemo } from 'react';
import create from 'zustand';
import createContext from 'zustand/context';
import shallow from 'zustand/shallow';
import { isMatch, merge, cloneDeep } from 'lodash-es';
import { CoordinationType } from '@vitessce/constants-internal';
import { fromEntries, capitalize } from '@vitessce/utils';
import {
  removeImageChannelInMetaCoordinationScopesHelper,
  addImageChannelInMetaCoordinationScopesHelper,
} from './spatial-reducers.js';

// Reference: https://github.com/pmndrs/zustand#react-context
// Reference: https://github.com/pmndrs/zustand/blob/e47ea03/tests/context.test.tsx#L60
const {
  Provider: ViewConfigProviderLocal,
  useStore: useViewConfigStoreLocal,
  useStoreApi: useViewConfigStoreApiLocal,
} = createContext();

export const ViewConfigProvider = ViewConfigProviderLocal;
export const useViewConfigStore = useViewConfigStoreLocal;
export const useViewConfigStoreApi = useViewConfigStoreApiLocal;

const {
  Provider: AuxiliaryProviderLocal,
  useStore: useAuxiliaryStoreLocal,
} = createContext();

export const AuxiliaryProvider = AuxiliaryProviderLocal;
export const useAuxiliaryStore = useAuxiliaryStoreLocal;

/**
 * Get the "computed" coordinationScopes after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @returns {string|undefined} The coordinationScopesBy after meta-coordination.
 */
export function getScopes(coordinationScopes, metaSpace) {
  let result = { ...coordinationScopes };
  // Check if there is a matching meta-scope.
  if (metaSpace) {
    // Determine if there is a meta-scope that would take precedence.
    const metaScopes = coordinationScopes[CoordinationType.META_COORDINATION_SCOPES];
    if (metaScopes && metaSpace) {
      // The view.coordinationScopes.metaCoordinationScopes might be an array or a string.
      // Convert to an array.
      const metaScopesArr = Array.isArray(metaScopes) ? metaScopes : [metaScopes];
      metaScopesArr.forEach((metaScope) => {
        // Merge the original coordinationScopes with the matching meta-coordinationScopes
        // from the coordinationSpace.
        result = merge(result, metaSpace[metaScope]);
      });
    }
  }
  return result;
}

/**
 * Get the "computed" coordinationScopesBy after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationScopesBy The coordinationScopesBy for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @returns {string|undefined} The coordinationScopesBy after meta-coordination.
 */
export function getScopesBy(coordinationScopes, coordinationScopesBy, metaSpaceBy) {
  let result = { ...coordinationScopesBy };
  // Check if there is a matching meta-scope.
  if (metaSpaceBy) {
    // Determine if there is a meta-scope that would take precedence.
    const metaScopesBy = coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY];
    if (metaSpaceBy && metaScopesBy) {
      // The view.coordinationScopes.metaCoordinationScopes might be an array or a string.
      // Convert to an array.
      const metaScopesArr = Array.isArray(metaScopesBy) ? metaScopesBy : [metaScopesBy];
      metaScopesArr.forEach((metaScope) => {
        // Merge the original coordinationScopesBy with the matching meta-coordinationScopesBy
        // from the coordinationSpace.
        result = merge(result, metaSpaceBy[metaScope]);
      });
    }
  }
  return result;
}

/**
 * Get the matching parameter scope.
 * @param {string} parameter A coordination type.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @returns {string|undefined} The coordination scope that matches.
 */
export function getParameterScope(parameter, coordinationScopes) {
  return coordinationScopes[parameter];
}

/**
 * Get the matching parameter scope.
 * @param {string} parameter A coordination type.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationScopesBy The coordinationScopesBy for a view.
 * @returns {string|undefined} The coordination scope that matches.
 */
export function getParameterScopeBy(
  parameter, byType, typeScope, coordinationScopes, coordinationScopesBy,
) {
  const parameterScopeGlobal = coordinationScopes[parameter];
  // Set parameterScope to the non-meta-value first.
  const parameterScopeByType = coordinationScopesBy?.[byType]?.[parameter];

  if (parameterScopeByType && parameterScopeByType[typeScope]) {
    return parameterScopeByType[typeScope];
  }
  // console.error(`coordination scope for ${parameter} was not found.`);
  return parameterScopeGlobal;
}


/**
 * The useViewConfigStore hook is initialized via the zustand
 * create() function, which sets up both the state variables
 * and the reducer-type functions.
 * References:
 * - https://github.com/react-spring/zustand
 * - https://github.com/pmndrs/zustand/releases/tag/v3.6.0
 * - https://github.com/pmndrs/zustand#using-subscribe-with-selector
 * @returns {function} The useStore hook.
 */
export const createViewConfigStore = (initialLoaders, initialConfig) => create(set => ({
  // State:
  // The viewConfig is an object which must conform to the schema
  // found in src/schemas/config.schema.json.
  viewConfig: initialConfig,
  // Store the initial config so that its values can be used for resetting.
  initialViewConfig: cloneDeep(initialConfig),
  // The loaders object is a mapping from dataset ID to
  // data type to loader object instance.
  loaders: initialLoaders,
  // Reducer functions which update the state
  // (although technically also part of state):
  setViewConfig: viewConfig => set({ viewConfig, initialViewConfig: viewConfig }),
  setLoaders: loaders => set({ loaders }),
  setCoordinationValue: ({
    parameter, value, coordinationScopes,
    byType, typeScope, coordinationScopesBy,
  }) => set((state) => {
    const { coordinationSpace } = state.viewConfig;
    let scope;
    if (!byType) {
      scope = getParameterScope(parameter, coordinationScopes);
    } else {
      scope = getParameterScopeBy(
        parameter, byType, typeScope, coordinationScopes, coordinationScopesBy,
      );
      if (!scope) {
        // Fall back to using the view-level scope.
        scope = getParameterScope(parameter, coordinationScopes);
      }
    }
    return {
      viewConfig: {
        ...state.viewConfig,
        coordinationSpace: {
          ...coordinationSpace,
          [parameter]: {
            ...coordinationSpace[parameter],
            [scope]: value,
          },
        },
      },
    };
  }),
  removeImageChannelInMetaCoordinationScopes: (coordinationScopesRaw, layerScope, channelScope) => set((state) => {
    const { coordinationSpace } = state.viewConfig;
    return {
      viewConfig: {
        ...state.viewConfig,
        coordinationSpace: removeImageChannelInMetaCoordinationScopesHelper(
          coordinationScopesRaw,
          layerScope,
          channelScope,
          coordinationSpace,
        ),
      },
    };
  }),
  addImageChannelInMetaCoordinationScopes: (coordinationScopesRaw, layerScope) => set((state) => {
    const { coordinationSpace } = state.viewConfig;
    return {
      viewConfig: {
        ...state.viewConfig,
        coordinationSpace: addImageChannelInMetaCoordinationScopesHelper(
          coordinationScopesRaw,
          layerScope,
          coordinationSpace,
        ),
      },
    };
  }),
  removeComponent: uid => set((state) => {
    const newLayout = state.viewConfig.layout.filter(c => c.uid !== uid);
    return {
      viewConfig: {
        ...state.viewConfig,
        layout: newLayout,
      },
    };
  }),
  changeLayout: newComponentProps => set((state) => {
    const newLayout = state.viewConfig.layout
      .slice()
      .map(componentProps => ({
        ...componentProps,
        ...newComponentProps[componentProps.uid],
      }));
    return {
      viewConfig: {
        ...state.viewConfig,
        layout: newLayout,
      },
    };
  }),
}));

/**
 * Hook for getting components' layout from the view config based on
 * matching all coordination scopes.
 * @returns {Object} The components' layout.
 */
export const useComponentLayout = (component, scopes, coordinationScopes) => useViewConfigStore(
  state => state.viewConfig.layout.filter(l => l.component === component).filter(
    l => scopes.every(scope => l.coordinationScopes[scope]
          === coordinationScopes[scope]),
  ),
);

/**
 * The useAuxiliaryStore hook is initialized via the zustand
 * create() function, which sets up both the state variables
 * and the reducer-type functions.
 * Reference: https://github.com/react-spring/zustand
 * It is meant to be used for non-viewconfig-based coordination between components.
 * For example, as currently happens, the layer controller can coordinate
 * on-load callbacks with spatial view based on whether or not they are
 * coordinated via `spatialImageLayer` - the callbacks are not part of the view config
 * though so they live here.
 * @returns {function} The useStore hook.
 */
export const createAuxiliaryStore = () => create(set => ({
  auxiliaryStore: null,
  setCoordinationValue: ({ parameter, scope, value }) => set(state => ({
    auxiliaryStore: {
      ...state.auxiliaryStore,
      [parameter]: {
        [scope]: value,
      },
    },
  })),
}));

/**
 * The hover store can be used to store global state
 * related to which component is currently hovered,
 * which is required for tooltip / crossover elements.
 * @returns {function} The useStore hook.
 */
const useHoverStore = create(set => ({
  // Components may need to know if they are the "hover source"
  // for tooltip interactions. This value should be a unique
  // component ID, such as its index in the view config layout.
  componentHover: null,
  setComponentHover: componentHover => set({ componentHover }),
}));

/**
 * The warning store can be used to store global state
 * related to app warning messages.
 * @returns {function} The useStore hook.
 */
const useWarnStore = create(set => ({
  // Want a global state to collect warning messages
  // that occur anywhere in the app.
  warning: null,
  setWarning: warning => set({ warning }),
}));

/**
 * The view info store can be used to store component-level
 * viewInfo objects,
 * which are required for tooltip / crossover elements.
 * @returns {function} The useStore hook.
 */
const useViewInfoStore = create(set => ({
  // The viewInfo object is a mapping from
  // component IDs to component view info objects.
  // Each view info object must have a project() function.
  viewInfo: {},
  setComponentViewInfo: (uuid, viewInfo) => set(state => ({
    viewInfo: {
      ...state.viewInfo,
      [uuid]: viewInfo,
    },
  })),
}));

/**
 * The grid size store can be used to store a
 * counter which updates on each window or react-grid-layout
 * resize event.
 * @returns {function} The useStore hook.
 */
const useGridSizeStore = create(set => ({
  resizeCount: {},
  incrementResizeCount: () => set(state => ({
    resizeCount: state.resizeCount + 1,
  })),
}));

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
export function useInitialCoordination(parameters, coordinationScopes) {
  const values = useViewConfigStore((state) => {
    const { coordinationSpace } = state.initialViewConfig;
    return fromEntries(parameters.map((parameter) => {
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][coordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  }, shallow);
  return values;
}

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
export function useCoordination(parameters, coordinationScopes) {
  const setCoordinationValue = useViewConfigStore(state => state.setCoordinationValue);

  const values = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return fromEntries(parameters.map((parameter) => {
      if (coordinationSpace) {
        const parameterScope = getParameterScope(parameter, coordinationScopes);
        if (coordinationSpace && coordinationSpace[parameter]) {
          const value = coordinationSpace[parameter][parameterScope];
          return [parameter, value];
        }
      }
      return [parameter, undefined];
    }));
  }, shallow);

  const setters = useMemo(() => fromEntries(parameters.map((parameter) => {
    const setterName = `set${capitalize(parameter)}`;
    const setterFunc = value => setCoordinationValue({
      parameter,
      coordinationScopes,
      value,
    });
    return [setterName, setterFunc];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [parameters, coordinationScopes]);

  return [values, setters];
}

export function useMultiCoordinationScopes(parameter, coordinationScopes) {
  return useMemo(() => {
    const scopes = coordinationScopes[parameter];
    return Array.isArray(scopes) ? scopes : [scopes];
  }, [parameter, coordinationScopes]);
}

export function useMultiCoordinationScopesNonNull(parameter, coordinationScopes) {
  const scopes = getParameterScope(parameter, coordinationScopes);

  // Return array of coordination scopes,
  // but filter out any whose value is null / falsey.
  const parameterSpace = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[parameter];
  }, shallow);
  const nonNullScopes = useMemo(() => {
    // Convert a single scope to an array of scopes to be consistent.
    const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
    return scopesArr.filter((scope) => {
      if (parameterSpace) {
        const value = parameterSpace[scope];
        return value !== null;
      }
      return false;
    });
  }, [parameter, coordinationScopes, scopes, parameterSpace]);
  return nonNullScopes;
}

export function useMultiCoordinationScopesSecondary(
  parameter, byType, coordinationScopes, coordinationScopesBy,
) {
  return useMemo(() => {
    const scopes = getParameterScope(byType, coordinationScopes);
    if (scopes && coordinationScopesBy?.[byType]?.[parameter]) {
      const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
      return [scopesArr, fromEntries(scopesArr.map((scope) => {
        const secondaryScopes = coordinationScopesBy[byType][parameter][scope];
        const secondaryScopesArr = Array.isArray(secondaryScopes)
          ? secondaryScopes
          : [secondaryScopes];
        return [scope, secondaryScopesArr];
      }))];
    }
    // Fallback from fine-grained to coarse-grained.
    if (scopes && !coordinationScopesBy?.[byType]?.[parameter] && coordinationScopes?.[parameter]) {
      const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
      return [scopesArr, fromEntries(scopesArr.map((scope) => {
        const secondaryScopes = coordinationScopes?.[parameter];
        const secondaryScopesArr = Array.isArray(secondaryScopes)
          ? secondaryScopes
          : [secondaryScopes];
        return [scope, secondaryScopesArr];
      }))];
    }
    return [[], {}];
  }, [parameter, byType, coordinationScopes, coordinationScopesBy]);
}

export function useMultiCoordinationScopesSecondaryNonNull(
  parameter, byType, coordinationScopes, coordinationScopesBy,
) {
  const scopes = getParameterScope(byType, coordinationScopes);

  const parameterSpace = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[parameter];
  }, shallow);
  const byTypeSpace = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[byType];
  }, shallow);

  return useMemo(() => {
    if (scopes && coordinationScopesBy?.[byType]?.[parameter]) {
      const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
      const scopesNonNull = scopesArr.filter((scope) => {
        if (byTypeSpace) {
          const value = byTypeSpace[scope];
          return value !== null;
        }
        return false;
      });
      return [scopesNonNull, fromEntries(scopesNonNull.map((scope) => {
        const secondaryScopes = coordinationScopesBy[byType][parameter][scope];
        const secondaryScopesArr = Array.isArray(secondaryScopes)
          ? secondaryScopes
          : [secondaryScopes];
        const secondaryScopesNonNull = secondaryScopesArr.filter((innerScope) => {
          if (parameterSpace) {
            const value = parameterSpace[innerScope];
            return value !== null;
          }
          return false;
        });
        return [scope, secondaryScopesNonNull];
      }))];
    }
    // Fallback from fine-grained to coarse-grained.
    if (scopes && !coordinationScopesBy?.[byType]?.[parameter] && coordinationScopes?.[parameter]) {
      const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
      const scopesNonNull = scopesArr.filter((scope) => {
        if (byTypeSpace) {
          const value = byTypeSpace[scope];
          return value !== null;
        }
        return false;
      });
      return [scopesNonNull, fromEntries(scopesNonNull.map((scope) => {
        const secondaryScopes = coordinationScopes?.[parameter];
        const secondaryScopesArr = Array.isArray(secondaryScopes)
          ? secondaryScopes
          : [secondaryScopes];
        const secondaryScopesNonNull = secondaryScopesArr.filter((innerScope) => {
          if (parameterSpace) {
            const value = parameterSpace[innerScope];
            return value !== null;
          }
          return false;
        });
        return [scope, secondaryScopesNonNull];
      }))];
    }
    return [[], {}];
  }, [parameter, byType, scopes, coordinationScopes, coordinationScopesBy, parameterSpace, byTypeSpace]);
}

export function useMultiCoordinationValues(parameter, coordinationScopes) {
  const scopes = getParameterScope(parameter, coordinationScopes);

  // Mapping from dataset coordination scope name to dataset uid
  const vals = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    // Convert a single scope to an array of scopes to be consistent.
    const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
    return fromEntries(scopesArr.map((scope) => {
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][scope];
        return [scope, value];
      }
      return [scope, undefined];
      // eslint-disable-next-line no-unused-vars
    }).filter(([k, v]) => v !== undefined));
  }, shallow);

  return vals;
}

/**
 * Get a mapping from dataset coordination scopes to dataset UIDs.
 * @param {object} coordinationScopes The coordination scope mapping object for a view.
 * @returns {object} Mapping from dataset coordination scope names to dataset UIDs.
 */
export function useDatasetUids(coordinationScopes) {
  return useMultiCoordinationValues(CoordinationType.DATASET, coordinationScopes);
}

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
export function useComplexCoordination(
  parameters, coordinationScopes, coordinationScopesBy, byType,
) {
  const setCoordinationValue = useViewConfigStore(state => state.setCoordinationValue);

  const parameterSpaces = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return parameters.map(parameter => coordinationSpace[parameter]);
  }, shallow);

  const values = useMemo(() => {
    const typeScopes = getParameterScope(byType, coordinationScopes);
    if (typeScopes) {
      // Convert a single scope to an array of scopes to be consistent.
      const typeScopesArr = Array.isArray(typeScopes) ? typeScopes : [typeScopes];
      return fromEntries(typeScopesArr.map((datasetScope) => {
        const datasetValues = fromEntries(parameters.map((parameter, i) => {
          if (parameterSpaces[i]) {
            const parameterSpace = parameterSpaces[i];
            const parameterScope = getParameterScopeBy(
              parameter,
              byType,
              datasetScope,
              coordinationScopes,
              coordinationScopesBy,
            );
            if (parameterScope) {
              const value = parameterSpace[parameterScope];
              return [parameter, value];
            }
            // Fall back to global scope for this parameter.
            const globalParameterScope = getParameterScope(parameter, coordinationScopes);
            const globalValue = parameterSpace[globalParameterScope];
            return [parameter, globalValue];
          }
          return [parameter, undefined];
        }));
        return [datasetScope, datasetValues];
      }));
    }
    return {};
  }, [byType, coordinationScopes, coordinationScopesBy, parameterSpaces]);

  const setters = useMemo(() => {
    const typeScopes = getParameterScope(byType, coordinationScopes);
    if (typeScopes) {
      // Convert a single scope to an array of scopes to be consistent.
      const typeScopesArr = Array.isArray(typeScopes) ? typeScopes : [typeScopes];
      return fromEntries(typeScopesArr.map((datasetScope) => {
        const datasetSetters = fromEntries(parameters.map((parameter) => {
          const setterName = `set${capitalize(parameter)}`;
          const setterFunc = value => setCoordinationValue({
            parameter,
            byType,
            typeScope: datasetScope,
            coordinationScopes,
            coordinationScopesBy,
            value,
          });
          return [setterName, setterFunc];
        }));
        return [datasetScope, datasetSetters];
      }));
    }
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // parameters is assumed to be a constant array.
  }, [coordinationScopes]);

  return [values, setters];
}

/**
 * Get the "computed" (i.e., after accounting for meta-coordination)
 * value for coordinationScopes.
 * @param {object} coordinationScopes The original coordinationScopes passed to the view.
 * @returns {object} The coordinationScopes after filling in with meta-coordinationScopes.
 */
export function useCoordinationScopes(coordinationScopes) {
  const metaSpace = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[CoordinationType.META_COORDINATION_SCOPES];
  }, shallow);
  const vals = useMemo(() => {
    const scopes = getScopes(
      coordinationScopes,
      metaSpace,
    );
    // Prevent infinite loop, delete metaCoordinationScopes now that they are computed.
    delete scopes[CoordinationType.META_COORDINATION_SCOPES];
    return scopes;
  }, [coordinationScopes, metaSpace]);
  return vals;
}

/**
 * Get the "computed" (i.e., after accounting for meta-coordination)
 * value for coordinationScopesBy.
 * @param {object} coordinationScopes The original coordinationScopes passed to the view.
 * @param {object} coordinationScopesBy The original coordinationScopesBy passed to the view.
 * @returns {object} The coordinationScopesBy after filling in with meta-coordinationScopesBy.
 */
export function useCoordinationScopesBy(coordinationScopes, coordinationScopesBy) {
  const metaSpaceBy = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[CoordinationType.META_COORDINATION_SCOPES_BY];
  }, shallow);
  const vals = useMemo(() => {
    const scopesBy = getScopesBy(
      coordinationScopes,
      coordinationScopesBy,
      metaSpaceBy,
    );
    return scopesBy;
  }, [coordinationScopes, coordinationScopesBy, metaSpaceBy]);
  return vals;
}

/**
 * Use a second level of complex coordination.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopesBy The coordinationScopesBy object from the view definition.
 * @param {string} primaryType The first-level coordination type, such as spatialImageLayer.
 * @param {string} secondaryType The second-level coordination type, such as spatialImageChannel.
 * @returns The results of useComplexCoordination.
 */
export function useComplexCoordinationSecondary(
  parameters, coordinationScopes, coordinationScopesBy, primaryType, secondaryType,
) {
  const coordinationScopesFake = useMemo(() => {
    if (coordinationScopesBy?.[primaryType]?.[secondaryType]) {
      return {
        ...coordinationScopes, // TODO: this is needed for falling back to view-level coordination scopes, but does it affect performance?
        [secondaryType]: Object.values(coordinationScopesBy[primaryType][secondaryType]).flat(),
      };
    }
    // First fallback: try coarser (_Channel -> _Layer -> view)
    // coordination values when finer ones are null/undefined.
    if (coordinationScopes?.[secondaryType] && Array.isArray(coordinationScopes[secondaryType])) {
      return {
        ...coordinationScopes, // TODO: this is needed for falling back to view-level coordination scopes, but does it affect performance?
        [secondaryType]: coordinationScopes[secondaryType],
      };
    }
    // Finally, fall back to empty array.
    return { [secondaryType]: [] };
  }, [coordinationScopesBy, primaryType, secondaryType]);
  const [flatValues, flatSetters] = useComplexCoordination(
    parameters, coordinationScopesFake, coordinationScopesBy, secondaryType,
  );
  const nestedValues = useMemo(() => {
    // Re-nest
    const result = {};
    if (coordinationScopesBy?.[primaryType]?.[secondaryType]) {
      Object.entries(coordinationScopesBy[primaryType][secondaryType])
        .forEach(([layerScope, channelScopes]) => {
          result[layerScope] = {};
          channelScopes.forEach((channelScope) => {
            result[layerScope][channelScope] = flatValues[channelScope];
          });
        });
    } else if (coordinationScopes?.[secondaryType] && Array.isArray(coordinationScopes[secondaryType])) {
      // Re-nesting for fallback case.
      const layerScopes = coordinationScopes[primaryType];
      layerScopes.forEach((layerScope) => {
        // eslint-disable-next-line prefer-destructuring
        result[layerScope] = flatValues;
      });
    }
    return result;
  }, [flatValues]);
  const nestedSetters = useMemo(() => {
    // Re-nest
    const result = {};
    if (coordinationScopesBy?.[primaryType]?.[secondaryType]) {
      Object.entries(coordinationScopesBy[primaryType][secondaryType])
        .forEach(([layerScope, channelScopes]) => {
          result[layerScope] = {};
          channelScopes.forEach((channelScope) => {
            result[layerScope][channelScope] = flatSetters[channelScope];
          });
        });
    } else if (coordinationScopes?.[secondaryType] && Array.isArray(coordinationScopes[secondaryType])) {
      // Re-nesting for fallback case.
      const layerScopes = coordinationScopes[primaryType];
      layerScopes.forEach((layerScope) => {
        // eslint-disable-next-line prefer-destructuring
        result[layerScope] = flatSetters;
      });
    }
    return result;
  }, [flatSetters]);

  return [nestedValues, nestedSetters];
}


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
export function useMultiDatasetCoordination(parameters, coordinationScopes, coordinationScopesBy) {
  return useComplexCoordination(
    parameters, coordinationScopes, coordinationScopesBy,
    CoordinationType.DATASET,
  );
}

const AUXILIARY_COORDINATION_TYPES_MAP = {
  spatialImageLayer: ['imageLayerCallbacks', 'areLoadingImageChannels'],
  spatialSegmentationLayer: ['segmentationLayerCallbacks', 'areLoadingSegmentationChannels'],
};

/**
 * The maps the coordination types of incoming scopes to new types
 * for the auxiliary store.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {object} Mapping of coordination types
 * to new scope names for the auxiliary store.
 */
const mapCoordinationScopes = (coordinationScopes) => {
  const newCoordinationScopes = {};
  Object.keys(coordinationScopes).forEach((key) => {
    const newCoordinationTypes = AUXILIARY_COORDINATION_TYPES_MAP[key] || [];
    newCoordinationTypes.forEach((coordinationType) => {
      newCoordinationScopes[coordinationType || key] = coordinationScopes[key];
    });
  });
  return newCoordinationScopes;
};

const mapParameters = parameters => parameters
  .map(parameter => AUXILIARY_COORDINATION_TYPES_MAP[parameter]).filter(Boolean).flat();

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
export function useAuxiliaryCoordination(parameters, coordinationScopes) {
  const setCoordinationValue = useAuxiliaryStore(state => state.setCoordinationValue);
  const mappedCoordinationScopes = mapCoordinationScopes(coordinationScopes);
  const mappedParameters = mapParameters(parameters);
  const values = useAuxiliaryStore((state) => {
    const { auxiliaryStore } = state;
    return fromEntries(mappedParameters.map((parameter) => {
      if (auxiliaryStore && auxiliaryStore[parameter]) {
        const value = auxiliaryStore[parameter][mappedCoordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  }, shallow);
  const setters = useMemo(() => fromEntries(mappedParameters.map((parameter) => {
    const setterName = `set${capitalize(parameter)}`;
    const setterFunc = value => setCoordinationValue({
      parameter,
      scope: mappedCoordinationScopes[parameter],
      value,
    });
    return [setterName, setterFunc];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [parameters, coordinationScopes]);

  return [values, setters];
}

/**
 * Obtain the loaders object from
 * the global app state.
 * @returns {object} The loaders object
 * in the `useViewConfigStore` store.
 */
export function useLoaders() {
  return useViewConfigStore(state => state.loaders);
}


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
export function getMatchingLoader(loaders, dataset, dataType, viewCoordinationValues) {
  if (!loaders[dataset]) {
    return null;
  }
  const loaderInternMap = loaders[dataset].loaders[dataType];
  if (!loaderInternMap) {
    return null;
  }
  const loaderKeys = Array.from(loaderInternMap.keys());
  const matchingKey = loaderKeys
    .find(fileCoordinationValues => isMatch(fileCoordinationValues, viewCoordinationValues));
  if (!matchingKey) {
    return null;
  }
  return loaderInternMap.get(matchingKey);
}

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
export function useMatchingLoader(loaders, dataset, dataType, viewCoordinationValues) {
  return useMemo(() => getMatchingLoader(
    loaders, dataset, dataType, viewCoordinationValues,
  ), [loaders, dataset, dataType, viewCoordinationValues]);
}

/**
 * Obtain the view config layout array from
 * the global app state.
 * @returns {object[]} The layout array
 * in the `useViewConfigStore` store.
 */
export function useLayout() {
  return useViewConfigStore(state => state.viewConfig?.layout);
}

/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useRemoveComponent() {
  return useViewConfigStore(state => state.removeComponent);
}

/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useRemoveImageChannelInMetaCoordinationScopes() {
  return useViewConfigStore(state => state.removeImageChannelInMetaCoordinationScopes);
}

/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useAddImageChannelInMetaCoordinationScopes() {
  return useViewConfigStore(state => state.addImageChannelInMetaCoordinationScopes);
}

/**
 * Obtain the component prop setter function from
 * the global app state.
 * @returns {function} The set component props function
 * in the `useViewInfoStore` store.
 */
export function useChangeLayout() {
  return useViewConfigStore(state => state.changeLayout);
}

/**
 * Obtain the loaders setter function from
 * the global app state.
 * @returns {function} The loaders setter function
 * in the `useViewConfigStore` store.
 */
export function useSetLoaders() {
  return useViewConfigStore(state => state.setLoaders);
}

/**
 * Obtain the view config setter function from
 * the global app state.
 * @returns {function} The view config setter function
 * in the `useViewConfigStore` store.
 */
export function useSetViewConfig(viewConfigStoreApi) {
  const setViewConfigRef = useRef(viewConfigStoreApi.getState().setViewConfig);
  const setViewConfig = setViewConfigRef.current;
  return setViewConfig;
}

/**
 * Obtain the component hover value from
 * the global app state.
 * @returns {number} The hovered component ID
 * in the `useHoverStore` store.
 */
export function useComponentHover() {
  return useHoverStore(state => state.componentHover);
}

/**
 * Obtain the component hover setter function from
 * the global app state.
 * @returns {function} The component hover setter function
 * in the `useHoverStore` store.
 */
export function useSetComponentHover() {
  return useHoverStore(state => state.setComponentHover);
}

/**
 * Obtain the warning message from
 * the global app state.
 * @returns {string} The warning message
 * in the `useWarnStore` store.
 */
export function useWarning() {
  return useWarnStore(state => state.warning);
}

/**
 * Obtain the warning setter function from
 * the global app state.
 * @returns {function} The warning setter function
 * in the `useWarnStore` store.
 */
export function useSetWarning() {
  return useWarnStore(state => state.setWarning);
}

/**
 * Obtain the component view info value from
 * the global app state.
 * @returns {object} The view info object for the component
 * in the `useViewInfoStore` store.
 */
export function useComponentViewInfo(uuid) {
  return useViewInfoStore(useCallback(state => state.viewInfo[uuid], [uuid]));
}

/**
 * Obtain the component view info setter function from
 * the global app state.
 * @returns {function} The component view info setter function
 * in the `useViewInfoStore` store.
 */
export function useSetComponentViewInfo(uuid) {
  const setViewInfoRef = useRef(useViewInfoStore.getState().setComponentViewInfo);
  const setComponentViewInfo = useCallback(
    viewInfo => setViewInfoRef.current(uuid, viewInfo),
    [uuid],
  );
  return setComponentViewInfo;
}

/**
 * Obtain the grid resize count value
 * from the global app state.
 * @returns {number} The grid resize increment value.
 */
export function useGridResize() {
  return useGridSizeStore(state => state.resizeCount);
}

/**
 * Obtain the grid resize count increment function
 * from the global app state.
 * @returns {function} The grid resize count increment
 * function.
 */
export function useEmitGridResize() {
  return useGridSizeStore(state => state.incrementResizeCount);
}
