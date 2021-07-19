/* eslint-disable no-plusplus */
import packageJson from '../../package.json';
import { getNextScope } from '../utils';
import {
  COORDINATION_TYPES,
  DEFAULT_COORDINATION_VALUES,
  COMPONENT_COORDINATION_TYPES,
  AUTO_INDEPENDENT_COORDINATION_TYPES,
} from './state/coordination';
import { UPGRADE_FUNCTIONS } from './view-config-versions';

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
  const spaceScopes = Object.keys(config?.coordinationSpace?.[coordinationType] || {});
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
        ...config?.coordinationSpace?.[coordinationType],
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

export function upgradeAndValidate(oldConfig) {
  // oldConfig object must have a `version` property.
  let nextConfig = oldConfig;
  let fromVersion;
  let upgradeFunction; let
    validateFunction;

  do {
    fromVersion = nextConfig.version;

    if (!Object.keys(UPGRADE_FUNCTIONS).includes(fromVersion)) {
      return [{
        title: 'Config validation failed',
        preformatted: 'Unknown config version.',
      }, false];
    }

    [validateFunction, upgradeFunction] = UPGRADE_FUNCTIONS[fromVersion];

    // Validate under the legacy schema before upgrading.
    const validLegacy = validateFunction(nextConfig);
    if (!validLegacy) {
      const failureReason = JSON.stringify(validateFunction.errors, null, 2);
      return [{
        title: 'Config validation failed',
        preformatted: failureReason,
      }, false];
    }

    if (upgradeFunction) {
      nextConfig = upgradeFunction(nextConfig);
    }
  } while (upgradeFunction);

  // NOTE: Remove when a view config viewer/editor is available in UI.
  console.groupCollapsed(`🚄 Vitessce (${packageJson.version}) view configuration`);
  console.info(`data:,${JSON.stringify(nextConfig)}`);
  console.info(JSON.stringify(nextConfig, null, 2));
  console.groupEnd();

  return [nextConfig, true];
}
