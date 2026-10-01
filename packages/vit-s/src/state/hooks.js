/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { create, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { subscribeWithSelector } from 'zustand/middleware';
import { isMatch, cloneDeep } from 'lodash-es';
import { CoordinationType } from '@vitessce/constants-internal';
import { capitalize, getAnnotationFrameCoordinationValues } from '@vitessce/utils';
import { getCoordinationSpaceAndScopes, CoordinationLevel as CL } from '@vitessce/config';
import {
  removeImageChannelInMetaCoordinationScopesHelper,
  addImageChannelInMetaCoordinationScopesHelper,
} from './spatial-reducers.js';

// References for Zustand v3:
// - https://github.com/pmndrs/zustand#react-context
// - https://github.com/pmndrs/zustand/blob/e47ea03/tests/context.test.tsx#L60
// References for Zustand v4:
// - https://github.com/pmndrs/zustand/discussions/1180#discussioncomment-3354713
// - https://zustand.docs.pmnd.rs/previous-versions/zustand-v3-create-context#migration
const ViewConfigStoreContext = createContext(null);
const AuxiliaryStoreContext = createContext(null);

export function ViewConfigProvider(props) {
  const {
    createStore,
    children,
  } = props;

  // Reference: https://github.com/pmndrs/zustand/discussions/1180
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return (
    <ViewConfigStoreContext.Provider value={storeRef.current}>
      {children}
    </ViewConfigStoreContext.Provider>
  );
}

export function useViewConfigStoreApi() {
  const store = useContext(ViewConfigStoreContext);
  if (!store) {
    throw new Error('Missing StoreProvider');
  }
  return store;
}
export function useViewConfigStore(selector) {
  const store = useViewConfigStoreApi();
  if (!store) {
    throw new Error('Missing StoreProvider');
  }
  const slice = useStore(store, selector);
  return slice;
}

export function useViewConfigStoreShallow(selector) {
  return useViewConfigStore(useShallow(selector));
}

/* Begin auxiliary store things */
export function AuxiliaryProvider(props) {
  const {
    createStore,
    children,
  } = props;

  // Reference: https://github.com/pmndrs/zustand/discussions/1180
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return (
    <AuxiliaryStoreContext.Provider value={storeRef.current}>
      {children}
    </AuxiliaryStoreContext.Provider>
  );
}

export function useAuxiliaryStoreApi() {
  const store = useContext(AuxiliaryStoreContext);
  if (!store) {
    throw new Error('Missing StoreProvider');
  }
  return store;
}
export function useAuxiliaryStore(selector) {
  const store = useAuxiliaryStoreApi();
  if (!store) {
    throw new Error('Missing StoreProvider');
  }
  const slice = useStore(store, selector);
  return slice;
}

export function useAuxiliaryStoreShallow(selector) {
  return useAuxiliaryStore(useShallow(selector));
}
/* end auxiliary store things */


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
        let o1 = result;
        const o2 = metaSpace[metaScope] || {};
        Object.entries(o2).forEach(([cType, cScope]) => {
          o1 = {
            ...o1,
            [cType]: cScope,
          };
        });
        result = o1;
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
        let o1 = result;
        const o2 = metaSpaceBy[metaScope] || {};
        // Cannot simply use lodash merge(o1, o2)
        // because we do not want to merge (objects/arrays) at the leaf
        // (i.e., secondaryScopeVal) level.
        // We want the values in o2 to take precedence over the values in o1.
        Object.entries(o2).forEach(([primaryType, primaryObj]) => {
          Object.entries(primaryObj).forEach(([secondaryType, secondaryObj]) => {
            Object.entries(secondaryObj).forEach(([primaryScope, secondaryScopeVal]) => {
              o1 = {
                ...o1,
                [primaryType]: {
                  ...(o1?.[primaryType] || {}),
                  [secondaryType]: {
                    ...(o1?.[primaryType]?.[secondaryType] || {}),
                    [primaryScope]: secondaryScopeVal,
                  },
                },
              };
            });
          });
        });
        result = o1;
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
 * Determine whether a view defines a value for a coordination type directly,
 * in which case that value takes precedence over any coordination scope
 * (from coordinationScopes or metaCoordinationScopes) for the same type.
 * @param {object|undefined} coordinationValues The view.coordinationValues object, if any.
 * @param {string} parameter A coordination type.
 * @returns {boolean} True if there is a direct value for this coordination type.
 */
export function hasCoordinationValue(coordinationValues, parameter) {
  return coordinationValues !== undefined
    && parameter in coordinationValues;
}

// The sentinel used to represent `CL(...)` (multi-level coordination)
// within JSON, such as within annotation frame coordination values.
// Reference: https://github.com/keller-mark/use-coordination/pull/115
export const COORDINATION_LEVEL_SENTINEL = '$CL';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMultiLevelValue(value) {
  return isPlainObject(value) && Object.hasOwn(value, COORDINATION_LEVEL_SENTINEL);
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Revive the `{ "$CL": ... }` sentinels within a JSON value
 * into CoordinationLevel instances.
 * @param {*} value The JSON value.
 * @returns {*} The revived value.
 */
export function reviveCoordinationLevels(value) {
  if (Array.isArray(value)) {
    return value.map(reviveCoordinationLevels);
  }
  if (isMultiLevelValue(value)) {
    return CL(reviveCoordinationLevels(value[COORDINATION_LEVEL_SENTINEL]));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => ([k, reviveCoordinationLevels(v)])),
    );
  }
  return value;
}

/**
 * Merge the coordination values that an annotation frame defines for a view
 * into the view config. The frame values take precedence over the current values.
 * The frame itself is treated as read-only.
 * - Single-level values are written wherever the view's setter would write them:
 *   in-place if the view defines the value directly (view.coordinationValues),
 *   otherwise into the coordination scope(s) that the view is mapped to
 *   (after accounting for meta-coordination), so that linked views follow along.
 * - Multi-level values (`{ "$CL": [...] }`) are expanded into new coordination scopes,
 *   and the view's existing (meta-)coordination scope mapping for those coordination types
 *   is re-pointed to the new scopes (so that linked views follow along).
 * @param {object} viewConfig The current view config.
 * @param {string} viewUid The view of interest.
 * @param {object} frameCoordinationValues The coordination values for the view in the frame.
 * @param {string} scopePrefix Prefix for any newly-created coordination scope names.
 * @returns {object} The new view config.
 */
export function applyAnnotationFrameToViewConfig(
  viewConfig, viewUid, frameCoordinationValues, scopePrefix,
) {
  const { coordinationSpace = {}, layout } = viewConfig;
  const viewObj = layout.find(l => l.uid === viewUid);
  if (!viewObj || !frameCoordinationValues) {
    return viewConfig;
  }
  const META = CoordinationType.META_COORDINATION_SCOPES;
  const META_BY = CoordinationType.META_COORDINATION_SCOPES_BY;

  const newSpace = { ...coordinationSpace };
  const newViewObj = { ...viewObj };
  const setViewValue = (coordinationType, value) => {
    newViewObj.coordinationValues = {
      ...newViewObj.coordinationValues,
      [coordinationType]: value,
    };
  };

  const entries = Object.entries(frameCoordinationValues);
  const singleLevelEntries = entries.filter(([, value]) => !isMultiLevelValue(value));
  const multiLevelEntries = entries.filter(([, value]) => isMultiLevelValue(value));

  // Single-level values.
  const resolvedScopes = getScopes(viewObj.coordinationScopes || {}, coordinationSpace[META]);
  singleLevelEntries.forEach(([coordinationType, value]) => {
    const scopes = toArray(resolvedScopes[coordinationType]);
    if (hasCoordinationValue(viewObj.coordinationValues, coordinationType) || scopes.length === 0) {
      // The view defines the value directly, or is not mapped to any scope for this type.
      setViewValue(coordinationType, value);
      return;
    }
    newSpace[coordinationType] = {
      ...newSpace[coordinationType],
      ...Object.fromEntries(scopes.map(scope => ([scope, value]))),
    };
  });

  // Multi-level values.
  if (multiLevelEntries.length > 0) {
    const {
      coordinationSpace: generatedSpace,
      coordinationScopes: generatedScopes,
    } = getCoordinationSpaceAndScopes(
      Object.fromEntries(multiLevelEntries.map(([coordinationType, value]) => ([
        coordinationType, reviveCoordinationLevels(value),
      ]))),
      scopePrefix,
    );
    // Merge the values for the new scopes into the coordination space.
    Object.entries(generatedSpace).forEach(([coordinationType, scopeValues]) => {
      if ([META, META_BY, CoordinationType.DATASET].includes(coordinationType)) return;
      newSpace[coordinationType] = {
        ...newSpace[coordinationType],
        ...scopeValues,
      };
    });
    const newTypeScopes = generatedSpace[META]?.[generatedScopes[META]?.[0]] || {};
    const newTypeScopesBy = generatedSpace[META_BY]?.[generatedScopes[META_BY]?.[0]] || {};

    // Re-point the view's mapping, in the last meta-coordination scope which
    // defines it (since later meta-scopes take precedence), otherwise on the view.
    const viewMetaScopes = toArray(viewObj.coordinationScopes?.[META]);
    Object.entries(newTypeScopes).forEach(([coordinationType, scopes]) => {
      const owner = [...viewMetaScopes].reverse()
        .find(m => Object.hasOwn(newSpace[META]?.[m] || {}, coordinationType));
      if (owner) {
        newSpace[META] = {
          ...newSpace[META],
          [owner]: { ...newSpace[META][owner], [coordinationType]: scopes },
        };
      } else {
        newViewObj.coordinationScopes = {
          ...newViewObj.coordinationScopes,
          [coordinationType]: scopes,
        };
      }
    });
    const viewMetaScopesBy = toArray(viewObj.coordinationScopes?.[META_BY]);
    Object.entries(newTypeScopesBy).forEach(([primaryType, primaryObj]) => {
      // If no meta-scope defines this (e.g., newly-nested) primary type yet,
      // fall back to the last meta-scope, so that linked views also receive it.
      const owner = [...viewMetaScopesBy].reverse()
        .find(m => Object.hasOwn(newSpace[META_BY]?.[m] || {}, primaryType))
        ?? viewMetaScopesBy.at(-1);
      if (owner) {
        newSpace[META_BY] = {
          ...newSpace[META_BY],
          [owner]: { ...newSpace[META_BY][owner], [primaryType]: primaryObj },
        };
      } else {
        newViewObj.coordinationScopesBy = {
          ...newViewObj.coordinationScopesBy,
          [primaryType]: primaryObj,
        };
      }
    });
  }

  return {
    ...viewConfig,
    coordinationSpace: newSpace,
    layout: layout.map(l => (l.uid === viewUid ? newViewObj : l)),
  };
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
export const createViewConfigStore = (initialLoaders, initialConfig) => create()(subscribeWithSelector(set => ({
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
  setViewConfig: viewConfig => set({
    viewConfig,
    initialViewConfig:
    viewConfig,
    // mostRecentConfigSource is used by the LinkController to determine
    // whether the config was set by this instance or an external linked
    // instance of Vitessce, and used to prevent infinite loops.
    mostRecentConfigSource: 'internal',
  }),
  setLoaders: loaders => set({ loaders }),
  setCoordinationValue: ({
    parameter, value, coordinationScopes,
    byType, typeScope, coordinationScopesBy,
    // The viewUid is only required to write back to view-level coordinationValues.
    viewUid,
  }) => set((state) => {
    const { coordinationSpace, layout } = state.viewConfig;
    // If the view defines the value directly, then update it in-place,
    // as long as there is no more fine-grained ({byType}-specific)
    // coordination scope which would take precedence.
    const viewObj = viewUid === undefined
      ? undefined
      : layout.find(l => l.uid === viewUid);
    const coordinationValues = viewObj?.coordinationValues;
    const byTypeScope = byType
      ? coordinationScopesBy?.[byType]?.[parameter]?.[typeScope]
      : undefined;
    if (viewUid !== undefined && hasCoordinationValue(coordinationValues, parameter) && !byTypeScope) {
      return {
        viewConfig: {
          ...state.viewConfig,
          layout: layout.map(l => (l.uid === viewUid
            ? {
              ...l,
              coordinationValues: {
                ...coordinationValues,
                [parameter]: value,
              },
            }
            : l)),
        },
        mostRecentConfigSource: 'internal',
      };
    }
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
      mostRecentConfigSource: 'internal',
    };
  }),
  mergeCoordination: (newCoordinationValues, scopePrefix, viewUid) => set((state) => {
    const { coordinationSpace, layout } = state.viewConfig;
    const {
      coordinationSpace: newCoordinationSpace,
      coordinationScopes,
    } = getCoordinationSpaceAndScopes(newCoordinationValues, scopePrefix);
    // Merge coordination objects in coordination space
    Object.entries(newCoordinationSpace).forEach(([coordinationType, coordinationObj]) => {
      if (coordinationType === CoordinationType.META_COORDINATION_SCOPES) {
        // Perform an extra level of merging for meta-coordination scopes.
        Object.entries(coordinationObj).forEach(([coordinationScope, coordinationValue]) => {
          coordinationSpace[coordinationType] = {
            ...coordinationSpace[coordinationType],
            [coordinationScope]: {
              ...coordinationValue,
              ...(coordinationSpace[coordinationType]?.[coordinationScope] || {}),
            },
          };
        });
      } else if (coordinationType === CoordinationType.META_COORDINATION_SCOPES_BY) {
        // Perform two extra levels of merging for meta-coordination scopesBy.
        Object.entries(coordinationObj).forEach(([coordinationScope, coordinationValue]) => {
          Object.entries(coordinationValue).forEach(([primaryType, primaryObj]) => {
            Object.entries(primaryObj).forEach(([secondaryType, secondaryObj]) => {
              coordinationSpace[coordinationType] = {
                ...coordinationSpace[coordinationType],
                [coordinationScope]: {
                  ...(coordinationSpace[coordinationType]?.[coordinationScope] || {}),
                  [primaryType]: {
                    ...(coordinationSpace[coordinationType]?.[coordinationScope]?.[primaryType] || {}),
                    [secondaryType]: {
                      ...secondaryObj,
                      ...(coordinationSpace[coordinationType]?.[coordinationScope]?.[primaryType]?.[secondaryType] || {}),
                    },
                  },
                },
              };
            });
          });
        });
      } else {
        coordinationSpace[coordinationType] = {
          ...coordinationObj,
          // Existing coordination values should be preserved,
          // so that user-defined values take precedence over auto-initialization values.
          ...(coordinationSpace[coordinationType] || {}),
        };
      }
    });

    const newViewConfig = {
      ...state.viewConfig,
      coordinationSpace: {
        ...coordinationSpace,
      },
      layout: layout.map((viewObj) => {
        if (viewObj.uid === viewUid) {
          // Merge coordination scopes for views
          return {
            ...viewObj,
            coordinationScopes: {
              ...viewObj.coordinationScopes,
              [CoordinationType.META_COORDINATION_SCOPES]: [
                ...(coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] || []),
                ...(viewObj.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] || []),
              ],
              [CoordinationType.META_COORDINATION_SCOPES_BY]: [
                ...(coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] || []),
                ...(viewObj.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] || []),
              ],
            },
          };
        }
        return viewObj;
      }),
    };
    // console.log('newViewConfig', newViewConfig);
    return {
      viewConfig: newViewConfig, mostRecentConfigSource: 'internal',
    };
  }),
  applyAnnotationFrameCoordination: ({
    viewUid, frameCoordinationValues, scopePrefix,
  }) => set(state => ({
    viewConfig: applyAnnotationFrameToViewConfig(
      state.viewConfig, viewUid, frameCoordinationValues, scopePrefix,
    ),
    mostRecentConfigSource: 'internal',
  })),
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
      mostRecentConfigSource: 'internal',
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
      mostRecentConfigSource: 'internal',
    };
  }),
  removeComponent: uid => set((state) => {
    const newLayout = state.viewConfig.layout.filter(c => c.uid !== uid);
    return {
      viewConfig: {
        ...state.viewConfig,
        layout: newLayout,
      },
      mostRecentConfigSource: 'internal',
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
      mostRecentConfigSource: 'internal',
    };
  }),
})));

/**
 * Hook for getting components' layout from the view config based on
 * matching all coordination scopes.
 * @returns {Object} The components' layout.
 */
export const useComponentLayout = (component, scopes, coordinationScopes) => useViewConfigStoreShallow(
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
 * @param {object} coordinationValues Mapping of coordination types to
 * values which the view defines directly. Optional.
 * @returns {object} Object containing all coordination values.
 */
export function useInitialCoordination(parameters, coordinationScopes, coordinationValues) {
  const values = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.initialViewConfig;
    return Object.fromEntries(parameters.map((parameter) => {
      // Values defined directly by the view take precedence over scoped values.
      if (coordinationValues && hasCoordinationValue(coordinationValues, parameter)) {
        return [parameter, coordinationValues[parameter]];
      }
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][coordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  });
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
 * @param {object} coordinationValues Mapping of coordination types to
 * values which the view defines directly. Optional.
 * @param {string} viewUid The view of interest. Optional, but required for
 * setter functions to be able to write back to view-level coordinationValues.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
export function useCoordination(parameters, coordinationScopes, coordinationValues, viewUid) {
  const setCoordinationValue = useViewConfigStore(state => state.setCoordinationValue);

  const values = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return Object.fromEntries(parameters.map((parameter) => {
      // Values defined directly by the view take precedence over scoped values.
      if (coordinationValues && hasCoordinationValue(coordinationValues, parameter)) {
        return [parameter, coordinationValues[parameter]];
      }
      if (coordinationSpace) {
        const parameterScope = getParameterScope(parameter, coordinationScopes);
        if (coordinationSpace && coordinationSpace[parameter]) {
          const value = coordinationSpace[parameter][parameterScope];
          return [parameter, value];
        }
      }
      return [parameter, undefined];
    }));
  });

  const setters = useMemo(() => Object.fromEntries(parameters.map((parameter) => {
    const setterName = `set${capitalize(parameter)}`;
    const setterFunc = value => setCoordinationValue({
      parameter,
      coordinationScopes,
      viewUid,
      value,
    });
    return [setterName, setterFunc];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [parameters, coordinationScopes, viewUid]);

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
  const parameterSpace = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[parameter];
  });
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
      return [scopesArr, Object.fromEntries(scopesArr.map((scope) => {
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
      return [scopesArr, Object.fromEntries(scopesArr.map((scope) => {
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

  const parameterSpace = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[parameter];
  });
  const byTypeSpace = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[byType];
  });

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
      return [scopesNonNull, Object.fromEntries(scopesNonNull.map((scope) => {
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
      return [scopesNonNull, Object.fromEntries(scopesNonNull.map((scope) => {
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
  const vals = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    // Convert a single scope to an array of scopes to be consistent.
    const scopesArr = Array.isArray(scopes) ? scopes : [scopes];
    return Object.fromEntries(scopesArr.map((scope) => {
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][scope];
        return [scope, value];
      }
      return [scope, undefined];
      // eslint-disable-next-line no-unused-vars
    }).filter(([k, v]) => v !== undefined));
  });

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
 * @param {object} coordinationValues Mapping of coordination types to
 * values which the view defines directly. Optional.
 * @param {string} viewUid The view of interest. Optional, but required for
 * setter functions to be able to write back to view-level coordinationValues.
 * @returns {array} [cValues, cSetters] where
 * cValues is a mapping from coordination scope name to { coordinationType: coordinationValue },
 * and cSetters is a mapping from coordination scope name to { setCoordinationType }
 * setter functions.
 */
export function useComplexCoordination(
  parameters, coordinationScopes, coordinationScopesBy, byType, coordinationValues, viewUid,
) {
  const setCoordinationValue = useViewConfigStore(state => state.setCoordinationValue);

  const parameterSpaces = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return parameters.map(parameter => coordinationSpace[parameter]);
  });

  const values = useMemo(() => {
    const typeScopes = getParameterScope(byType, coordinationScopes);
    if (typeScopes) {
      // Convert a single scope to an array of scopes to be consistent.
      const typeScopesArr = Array.isArray(typeScopes) ? typeScopes : [typeScopes];
      return Object.fromEntries(typeScopesArr.map((datasetScope) => {
        const datasetValues = Object.fromEntries(parameters.map((parameter, i) => {
          // Values defined directly by the view take precedence over
          // view-level coordination scopes, but not over the more
          // fine-grained ({byType}-specific) coordination scopes.
          if (
            coordinationValues
            && hasCoordinationValue(coordinationValues, parameter)
            && !coordinationScopesBy?.[byType]?.[parameter]?.[datasetScope]
          ) {
            return [parameter, coordinationValues[parameter]];
          }
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
  }, [byType, coordinationScopes, coordinationScopesBy, parameterSpaces, coordinationValues]);

  const setters = useMemo(() => {
    const typeScopes = getParameterScope(byType, coordinationScopes);
    if (typeScopes) {
      // Convert a single scope to an array of scopes to be consistent.
      const typeScopesArr = Array.isArray(typeScopes) ? typeScopes : [typeScopes];
      return Object.fromEntries(typeScopesArr.map((datasetScope) => {
        const datasetSetters = Object.fromEntries(parameters.map((parameter) => {
          const setterName = `set${capitalize(parameter)}`;
          const setterFunc = value => setCoordinationValue({
            parameter,
            byType,
            typeScope: datasetScope,
            coordinationScopes,
            coordinationScopesBy,
            viewUid,
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
  }, [coordinationScopes, viewUid]);

  return [values, setters];
}

/**
 * Get the "computed" (i.e., after accounting for meta-coordination)
 * value for coordinationScopes.
 * @param {object} coordinationScopes The original coordinationScopes passed to the view.
 * @returns {object} The coordinationScopes after filling in with meta-coordinationScopes.
 */
export function useCoordinationScopes(coordinationScopes) {
  const metaSpace = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[CoordinationType.META_COORDINATION_SCOPES];
  });
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
  const metaSpaceBy = useViewConfigStoreShallow((state) => {
    const { coordinationSpace } = state.viewConfig;
    return coordinationSpace?.[CoordinationType.META_COORDINATION_SCOPES_BY];
  });
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
 * Get the coordination information for a view, as defined directly on the
 * corresponding layout entry (i.e., prior to accounting for meta-coordination).
 * @param {string} viewUid The view of interest.
 * @returns {[coordinationScopes, coordinationScopesBy, coordinationValues]}
 */
export function useRawViewMapping(viewUid) {
  const viewObj = useViewConfigStoreShallow((state) => {
    const { layout } = state.viewConfig;
    return layout.find(l => l.uid === viewUid);
  });

  return useMemo(() => ([
    viewObj?.coordinationScopes,
    viewObj?.coordinationScopesBy,
    viewObj?.coordinationValues,
  ]), [viewObj]);
}

/**
 * Get the coordination information for a view,
 * after accounting for meta-coordination.
 * Note that coordinationValues are defined by the view directly,
 * so they are not affected by meta-coordination.
 * @param {string} viewUid The view of interest.
 * @returns {[coordinationScopes, coordinationScopesBy, coordinationValues]}
 */
export function useViewMapping(viewUid) {
  const [
    coordinationScopesRaw, coordinationScopesByRaw, coordinationValues,
  ] = useRawViewMapping(viewUid);

  // TODO: use the annotation frame information here so that coordination state (e.g., coordinationValues) from the currently-selected frame
  // overrides the coordination state from the view-level coordinationValues, if applicable.
  // Note: will need to have already loaded the annotation frames for this to work.

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw || {});
  const coordinationScopesBy = useCoordinationScopesBy(
    coordinationScopesRaw || {}, coordinationScopesByRaw || {},
  );

  return [coordinationScopes, coordinationScopesBy, coordinationValues];
}

/**
 * Use a second level of complex coordination.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopesBy The coordinationScopesBy object from the view definition.
 * @param {string} primaryType The first-level coordination type, such as spatialImageLayer.
 * @param {string} secondaryType The second-level coordination type, such as spatialImageChannel.
 * @param {object} coordinationValues Mapping of coordination types to
 * values which the view defines directly. Optional.
 * @param {string} viewUid The view of interest. Optional, but required for
 * setter functions to be able to write back to view-level coordinationValues.
 * @returns The results of useComplexCoordination.
 */
export function useComplexCoordinationSecondary(
  parameters, coordinationScopes, coordinationScopesBy, primaryType, secondaryType,
  coordinationValues, viewUid,
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
    coordinationValues, viewUid,
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
  spatialAcceleratedVolumeLoadingProgress: ['volumeLoadingProgress'],
  spatialTiledPointsLoadingProgress: ['tiledPointsLoadingProgress'],
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
  const values = useAuxiliaryStoreShallow((state) => {
    const { auxiliaryStore } = state;
    return Object.fromEntries(mappedParameters.map((parameter) => {
      if (auxiliaryStore && auxiliaryStore[parameter]) {
        const value = auxiliaryStore[parameter][mappedCoordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  });
  const setters = useMemo(() => Object.fromEntries(mappedParameters.map((parameter) => {
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
 * Obtain the loaders setter function from
 * the global app state.
 * @returns {function} The loaders setter function
 * in the `useViewConfigStore` store.
 */
export function useMergeCoordination() {
  return useViewConfigStore(state => state.mergeCoordination);
}

const ANNOTATION_FRAME_COORDINATION_TYPES = [
  CoordinationType.ANNOTATION_STORY,
  CoordinationType.ANNOTATION_FRAME_INDEX,
];

/**
 * Determine which coordination values to merge for a view
 * when the story or the current annotation frame changes.
 * - When a frame is active, the values that the frame defines for the view.
 *   If the frame does not define annotationShapes for the view, they are cleared,
 *   so that shapes from a previous frame do not persist.
 * - When the frame index becomes null (after a frame was active),
 *   annotationShapes are cleared.
 * - When the same frame (of the same story) was already applied, i.e., the story
 *   has been edited in-place via the annotation controller, only annotationShapes
 *   are merged, so that the author's current view state (e.g., zoom/pan)
 *   is not reset by every edit.
 * Clearing annotationShapes is the only exception to leaving the
 * state untouched for values that a frame does not define.
 * @param {object|null} annotationStory The annotation story.
 * @param {number|null|undefined} prevFrameIndex The previously-applied frame index.
 * @param {number|null} annotationFrameIndex The current frame index.
 * @param {string} viewUid The view of interest.
 * @param {object|null|undefined} prevAppliedFrame The { storyUid, frameUid }
 * of the previously-applied frame, if any.
 * @returns {object|null} The { frameCoordinationValues, scopePrefix } to apply, or null.
 */
export function getAnnotationFrameUpdate(
  annotationStory, prevFrameIndex, annotationFrameIndex, viewUid, prevAppliedFrame,
) {
  if (typeof annotationFrameIndex !== 'number') {
    if (typeof prevFrameIndex === 'number') {
      return {
        frameCoordinationValues: { [CoordinationType.ANNOTATION_SHAPES]: null },
        scopePrefix: '',
      };
    }
    return null;
  }
  const frame = annotationStory?.frames?.[annotationFrameIndex];
  if (!frame) {
    // The story may not have been loaded yet.
    return null;
  }
  const frameCoordinationValues = getAnnotationFrameCoordinationValues(
    annotationStory, annotationFrameIndex, viewUid,
  );
  const isSameFrame = prevAppliedFrame?.storyUid === annotationStory.uid
    && prevAppliedFrame?.frameUid === frame.uid;
  if (isSameFrame) {
    return {
      frameCoordinationValues: {
        [CoordinationType.ANNOTATION_SHAPES]:
          frameCoordinationValues?.[CoordinationType.ANNOTATION_SHAPES] ?? null,
      },
      scopePrefix: '',
    };
  }
  return {
    frameCoordinationValues: {
      [CoordinationType.ANNOTATION_SHAPES]: null,
      ...frameCoordinationValues,
    },
    scopePrefix: `annotation_${annotationStory.uid}_${frame.uid}_${viewUid}_`,
  };
}

/**
 * When the current annotation frame changes, merge the coordination values
 * that the frame defines for this view into the coordination space.
 * The annotation story is treated as read-only: after the frame has been applied,
 * the view reads (and its setters write) the coordination space as usual,
 * so user interactions (e.g., panning) are not overridden by the frame.
 * Values which the frame does not define keep their current values,
 * except that annotationShapes are cleared when the frame does not define them
 * or when the frame index becomes null.
 * @param {string} viewUid The view of interest.
 * @param {object} coordinationScopes The coordination scopes for the view,
 * after accounting for meta-coordination.
 * @param {object} coordinationValues Values which the view defines directly. Optional.
 */
export function useAnnotationFrameCoordination(viewUid, coordinationScopes, coordinationValues) {
  const [{
    annotationStory,
    annotationFrameIndex,
  }] = useCoordination(
    ANNOTATION_FRAME_COORDINATION_TYPES, coordinationScopes, coordinationValues,
  );
  const applyAnnotationFrameCoordination = useViewConfigStore(
    state => state.applyAnnotationFrameCoordination,
  );
  // Track the previously-applied frame index, to detect when the frame index becomes null.
  const prevFrameIndexRef = useRef(undefined);
  // Track the previously-applied frame, to detect in-place edits of the story.
  const prevAppliedFrameRef = useRef(null);

  useEffect(() => {
    const update = getAnnotationFrameUpdate(
      annotationStory, prevFrameIndexRef.current, annotationFrameIndex, viewUid,
      prevAppliedFrameRef.current,
    );
    prevFrameIndexRef.current = annotationFrameIndex;
    const frame = typeof annotationFrameIndex === 'number'
      ? annotationStory?.frames?.[annotationFrameIndex]
      : null;
    prevAppliedFrameRef.current = frame
      ? { storyUid: annotationStory.uid, frameUid: frame.uid }
      : null;
    if (update) {
      applyAnnotationFrameCoordination({ viewUid, ...update });
    }
  // Deliberate dependency omissions: only apply the frame when the story or
  // the current frame changes, not when the coordination scopes change
  // (which happens as a result of applying multi-level frame values).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationStory, annotationFrameIndex, viewUid]);
}

/**
 * Obtain the current view config object from
 * the global app state.
 * @returns {object} The view config object
 * in the `useViewConfigStore` store.
 */
export function useViewConfig() {
  return useViewConfigStore(state => state.viewConfig);
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
