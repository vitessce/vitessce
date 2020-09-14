/* eslint-disable no-plusplus */
import {
  COORDINATION_TYPES,
  DEFAULT_COORDINATION_VALUES,
  COMPONENT_COORDINATION_TYPES,
  AUTO_INDEPENDENT_COORDINATION_TYPES,
} from './state/coordination';

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
export function getNextScope(prevScopes) {
  // Keep an ordered list of valid characters.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Store the value of the next character for each position
  // in the new string.
  // For example, [0] -> "A", [1] -> "B", [0, 1] -> "AB"
  const nextCharIndices = [0];

  // Generate a new scope name,
  // potentially conflicting with an existing name.
  // Reference: https://stackoverflow.com/a/12504061
  function next() {
    const r = [];
    nextCharIndices.forEach((charIndex) => {
      r.unshift(chars[charIndex]);
    });
    let increment = true;
    for (let i = 0; i < nextCharIndices.length; i++) {
      const val = ++nextCharIndices[i];
      if (val >= chars.length) {
        nextCharIndices[i] = 0;
      } else {
        increment = false;
        break;
      }
    }
    if (increment) {
      nextCharIndices.push(0);
    }
    return r.join('');
  }

  let nextScope;
  do {
    nextScope = next();
  } while (prevScopes.includes(nextScope));
  return nextScope;
}

/**
 * Get a list of all unique scope names for a
 * particular coordination type, which exist in
 * a particular view config.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @returns {string[]} Array of existing coordination scope names.
 */
export function getExistingScopesForCoordinationType(config, coordinationType) {
  const spaceScopes = Object.keys(config.coordinationSpace[coordinationType] || {});
  const componentScopes = config.layout.map(c => c.coordinationScopes?.[coordinationType]);
  return Array.from(new Set([...spaceScopes, ...componentScopes]));
}

/**
 * Give each component the same scope name for this coordination type.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @param {*} scopeValue The initial value for the coordination scope,
 * to set in the coordination space.
 * @returns {object} The new view config.
 */
function coordinateComponentsTogether(config, coordinationType, scopeValue) {
  const scopeName = getNextScope(getExistingScopesForCoordinationType(config, coordinationType));
  const newConfig = {
    ...config,
    coordinationSpace: {
      ...config.coordinationSpace,
      [coordinationType]: {
        ...config.coordinationSpace[coordinationType],
        // Add the new scope name and value to the coordination space.
        [scopeName]: scopeValue,
      },
    },
    layout: config.layout.map(component => ({
      ...component,
      coordinationScopes: {
        ...component.coordinationScopes,
        // Only set the coordination scope if this component uses this coordination type,
        // and the component is missing a coordination scope for this coordination type.
        ...((
          COMPONENT_COORDINATION_TYPES[component.component].includes(coordinationType)
          && !component.coordinationScopes?.[coordinationType]
        ) ? {
          // Only set the new scope name if the scope name
          // for this component and coordination type is currently undefined.
            [coordinationType]: scopeName,
          } : {}),
      },
    })),
  };
  return newConfig;
}

/**
 * Give each component a different scope name for this coordination type.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @param {*} scopeValue The initial value for the coordination scope,
 * to set in the coordination space.
 * @returns {object} The new view config.
 */
function coordinateComponentsIndependent(config, coordinationType, scopeValue) {
  const newConfig = {
    ...config,
    layout: [...config.layout],
  };
  const newScopes = {};
  newConfig.layout.forEach((component, i) => {
    // Only set the coordination scope if this component uses this coordination type,
    // and the component is missing a coordination scope for this coordination type.
    if (COMPONENT_COORDINATION_TYPES[component.component].includes(coordinationType)
      && !component.coordinationScopes?.[coordinationType]
    ) {
      const scopeName = getNextScope([
        ...getExistingScopesForCoordinationType(config, coordinationType),
        ...Object.keys(newScopes),
      ]);
      newScopes[scopeName] = scopeValue;
      newConfig.layout[i] = {
        ...component,
        coordinationScopes: {
          ...component.coordinationScopes,
          [coordinationType]: scopeName,
        },
      };
    }
  });
  newConfig.coordinationSpace = {
    ...newConfig.coordinationSpace,
    [coordinationType]: {
      ...newConfig.coordinationSpace[coordinationType],
      // Add the new scope name and value to the coordination space.
      ...newScopes,
    },
  };
  return newConfig;
}

function initializeAuto(config) {
  let newConfig = config;
  const { layout, datasets } = newConfig;

  // For each coordination type, check whether it requires initialization.
  Object.values(COORDINATION_TYPES).forEach((coordinationType) => {
    // A coordination type requires coordination if at least one component is missing
    // a (coordination type, coordination scope) tuple.
    // Components may only use a subset of all coordination types.
    const requiresCoordination = !layout
      .every(c => (
        !COMPONENT_COORDINATION_TYPES[c.component].includes(coordinationType)
                || c.coordinationScopes?.[coordinationType]
      ));
    if (requiresCoordination) {
      // Note that the default value may be undefined.
      let defaultValue = DEFAULT_COORDINATION_VALUES[coordinationType];
      // Check whether this is the special 'dataset' coordination type.
      if (coordinationType === 'dataset' && datasets.length >= 1) {
        // Use the first dataset ID as the default
        // if there is at least one dataset.
        defaultValue = datasets[0].uid;
      }
      // Use the list of "independent" coordination types
      // to determine whether a particular coordination type
      // should be initialized to
      // a unique scope for every component ("independent")
      // vs. the same scope for every component ("together").
      if (AUTO_INDEPENDENT_COORDINATION_TYPES.includes(coordinationType)) {
        newConfig = coordinateComponentsIndependent(newConfig, coordinationType, defaultValue);
      } else {
        newConfig = coordinateComponentsTogether(newConfig, coordinationType, defaultValue);
      }
    }
  });

  return newConfig;
}


/**
 * Initialize the view config:
 * - Fill in missing coordination objects with default values.
 * - Fill in missing component coordination scope mappings.
 *   based on the `initStrategy` specified in the view config.
 * Should be "stable": if run on the same view config twice, the return value the second
 * time should be identical to the return value the first time.
 * @param {object} config The view config prop.
 */
export function initialize(config) {
  if (config.initStrategy === 'auto') {
    return initializeAuto(config);
  }
  return config;
}

/**
 * A helper function for the `upgrade()` function,
 * which helps convert `props.view` (for scatterplot and spatial),
 * into new coordination scopes, setting their values
 * in the coordination space and returning the new scope mappings.
 * This function does mutate the `coordinationSpace` parameter.
 * @param {string} prefix The coordination type prefix,
 * either 'embedding' or 'spatial'.
 * @param {object} view The view prop object containing
 * the properties `.target` and `.zoom`.
 * @param {object} coordinationSpace The coordination space.
 * @returns {object} The new coordination scope names.
 */
function upgradeReplaceViewProp(prefix, view, coordinationSpace) {
  const prevZScopes = Object.keys(coordinationSpace[`${prefix}Zoom`]);
  const prevTXScopes = Object.keys(coordinationSpace[`${prefix}TargetX`]);
  const prevTYScopes = Object.keys(coordinationSpace[`${prefix}TargetY`]);

  const nextZScope = getNextScope(prevZScopes);
  const nextTXScope = getNextScope(prevTXScopes);
  const nextTYScope = getNextScope(prevTYScopes);

  const { zoom, target: [targetX, targetY] } = view;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}Zoom`][nextZScope] = zoom;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}TargetX`][nextTXScope] = targetX;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}TargetY`][nextTYScope] = targetY;
  return {
    [`${prefix}Zoom`]: nextZScope,
    [`${prefix}TargetX`]: nextTXScope,
    [`${prefix}TargetY`]: nextTYScope,
  };
}

/**
 * Convert an older view config to a newer view config.
 * @param {object} config A v0.1.0 "legacy" view config.
 * @returns {object} A v1.0.0 "upgraded" view config.
 */
export function upgrade(config) {
  const coordinationSpace = {
    embeddingType: {},
    embeddingZoom: {},
    embeddingTargetX: {},
    embeddingTargetY: {},
    spatialZoom: {},
    spatialTargetX: {},
    spatialTargetY: {},
  };

  const layout = [];
  config.staticLayout.forEach((componentDef) => {
    let newComponentDef = {
      ...componentDef,
      coordinationScopes: {},
    };
    if (componentDef.component === 'scatterplot') {
      // Need to set up the coordinationSpace
      // with embeddingType to replace scatterplot
      // component prop "mapping".
      if (componentDef.props.mapping) {
        coordinationSpace.embeddingType[componentDef.props.mapping] = componentDef.props.mapping;
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            embeddingType: componentDef.props.mapping,
          },
        };
      }
      // Need to set up the coordinationSpace
      // with embeddingZoom / embeddingTargetX/Y to replace scatterplot
      // component prop "view" ({ zoom, target }).
      if (componentDef.props.view) {
        // Note that the below function does mutate the coordinationSpace param.
        const newScopeValues = upgradeReplaceViewProp(
          'embedding', componentDef.props.view, coordinationSpace,
        );
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            ...newScopeValues,
          },
        };
      }
    }
    if (componentDef.component === 'spatial') {
      // Need to set up the coordinationSpace
      // with spatialZoom / spatialTargetX/Y to replace spatial
      // component prop "view" ({ zoom, target }).
      if (componentDef.props.view) {
        // Note that the below function does mutate the coordinationSpace param.
        const newScopeValues = upgradeReplaceViewProp(
          'spatial', componentDef.props.view, coordinationSpace,
        );
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            ...newScopeValues,
          },
        };
      }
    }
    layout.push(newComponentDef);
  });

  return {
    version: '1.0.0',
    name: config.name,
    description: config.description,
    public: config.public,
    datasets: [
      {
        uid: 'A',
        name: 'A',
        files: config.layers.map(layer => ({
          type: layer.type.toLowerCase(),
          fileType: layer.fileType,
          url: layer.url,
        })),
      },
    ],
    initStrategy: 'auto',
    coordinationSpace,
    layout,
  };
}
