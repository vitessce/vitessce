/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import difference from 'lodash/difference';
import cloneDeep from 'lodash/cloneDeep';
import packageJson from '../../package.json';
import { getNextScope } from '../utils';
import {
  AUTO_INDEPENDENT_COORDINATION_TYPES,
} from './state/coordination';
import { getViewTypes } from './component-registry';
import { getFileTypes } from '../loaders/types';
import {
  getComponentCoordinationTypes,
  getDefaultCoordinationValues,
  getCoordinationTypes,
} from './plugins';
import { SCHEMA_HANDLERS } from './view-config-versions';

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
  const componentCoordinationTypes = getComponentCoordinationTypes();
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
          componentCoordinationTypes[component.component].includes(coordinationType)
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
  const componentCoordinationTypes = getComponentCoordinationTypes();
  const newConfig = {
    ...config,
    layout: [...config.layout],
  };
  const newScopes = {};
  newConfig.layout.forEach((component, i) => {
    // Only set the coordination scope if this component uses this coordination type,
    // and the component is missing a coordination scope for this coordination type.
    if (componentCoordinationTypes[component.component].includes(coordinationType)
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

  const componentCoordinationTypes = getComponentCoordinationTypes();
  const defaultCoordinationValues = getDefaultCoordinationValues();
  const coordinationTypes = getCoordinationTypes();

  // For each coordination type, check whether it requires initialization.
  coordinationTypes.forEach((coordinationType) => {
    // A coordination type requires coordination if at least one component is missing
    // a (coordination type, coordination scope) tuple.
    // Components may only use a subset of all coordination types.
    const requiresCoordination = !layout
      .every(c => (
        (!componentCoordinationTypes[c.component].includes(coordinationType))
                || c.coordinationScopes?.[coordinationType]
      ));
    if (requiresCoordination) {
      // Note that the default value may be undefined.
      let defaultValue = defaultCoordinationValues[coordinationType];
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

export function checkTypes(config) {
  // Add a log message when there are additionalProperties in the coordination space that
  // do not appear in the view config JSON schema,
  // with a note that this indicates either a mistake or custom coordination type usage.
  const coordinationTypesInConfig = Object.keys(config.coordinationSpace || {});
  const allCoordinationTypes = getCoordinationTypes();
  const unknownCoordinationTypes = difference(coordinationTypesInConfig, allCoordinationTypes);
  if (unknownCoordinationTypes.length > 0) {
    return [false, `The following coordination types are not recognized: [${unknownCoordinationTypes}].\nIf these are plugin coordination types, ensure that they have been properly registered.`];
  }
  // Add a log message when there are views in the layout that are neither
  // core views nor registered plugin views.
  const viewTypesInConfig = config.layout.map(c => c.component);
  const allViewTypes = getViewTypes();
  const unknownViewTypes = difference(viewTypesInConfig, allViewTypes);
  if (unknownViewTypes.length > 0) {
    return [false, `The following view types are not recognized: [${unknownViewTypes}].\nIf these are plugin view types, ensure that they have been properly registered.`];
  }
  // Add a log message when there are file definitions with neither
  // core nor registered plugin file types.
  const fileTypesInConfig = config.datasets.flatMap(d => d.files.map(f => f.fileType));
  const allFileTypes = getFileTypes();
  const unknownFileTypes = difference(fileTypesInConfig, allFileTypes);
  if (unknownFileTypes.length > 0) {
    return [false, `The following file types are not recognized: [${unknownFileTypes}].\nIf these are plugin file types, ensure that they have been properly registered.`];
  }
  return [true, 'All view types, coordination types, and file types that appear in the view config are recognized.'];
}

/**
 * Assign unique ids for view definitions where
 * they are missing a value for the uid property
 * in layout[].uid.
 * @param {object} config The view config
 * @returns The updated view config.
 */
function assignViewUids(config) {
  const { layout } = config;
  const usedIds = layout.map(view => view.uid);
  layout.forEach((view, i) => {
    // Assign uids for views where they are not present.
    if (!view.uid) {
      const nextUid = getNextScope(usedIds);
      layout[i].uid = nextUid;
      usedIds.push(nextUid);
    }
  });
  return {
    ...config,
    layout,
  };
}

/**
 * Initialize the view config:
 * - Fill in missing coordination objects with default values.
 * - Fill in missing component coordination scope mappings.
 *   based on the `initStrategy` specified in the view config.
 * Should be "stable": if run on the same view config twice, the return value the second
 * time should be identical to the return value the first time.
 * @param {object} config The view config prop.
 * @returns The initialized view config.
 */
export function initialize(config) {
  let newConfig = cloneDeep(config);
  if (newConfig.initStrategy === 'auto') {
    newConfig = initializeAuto(config);
  }
  return assignViewUids(newConfig);
}

export function upgradeAndValidate(oldConfig) {
  // oldConfig object must have a `version` property.
  let nextConfig = oldConfig;
  let fromVersion;
  let upgradeFunction; let
    validateFunction;

  do {
    fromVersion = nextConfig.version;

    if (!Object.keys(SCHEMA_HANDLERS).includes(fromVersion)) {
      return [{
        title: 'Config validation failed',
        preformatted: 'Unknown config version.',
      }, false];
    }

    [validateFunction, upgradeFunction] = SCHEMA_HANDLERS[fromVersion];

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
