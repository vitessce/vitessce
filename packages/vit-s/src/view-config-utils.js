/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import { cloneDeep } from 'lodash-es';
import { fromEntries, getNextScope } from '@vitessce/utils';
import {
  AUTO_INDEPENDENT_COORDINATION_TYPES,
  META_VERSION,
} from '@vitessce/constants-internal';

export function logConfig(config, name) {
  console.groupCollapsed(`🚄 VitS (${META_VERSION.version}) ${name}`);
  console.info(`data:,${JSON.stringify(config)}`);
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
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
function coordinateComponentsTogether(config, coordinationType, scopeValue, viewTypes) {
  const componentCoordinationTypes = fromEntries(
    viewTypes.map(vt => ([vt.name, vt.coordinationTypes])),
  );
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
function coordinateComponentsIndependent(config, coordinationType, scopeValue, viewTypes) {
  const componentCoordinationTypes = fromEntries(
    viewTypes.map(vt => ([vt.name, vt.coordinationTypes])),
  );
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

/**
 * Perform initialization using initStrategy: "auto".
 * @param {object} config The view config.
 * @param {PluginCoordinationType[]} coordinationTypeObjs
 * @param {PluginViewType[]} viewTypeObjs
 * @returns {object} The config.
 */
function initializeAuto(config, coordinationTypeObjs, viewTypeObjs) {
  let newConfig = config;
  const { layout, datasets } = newConfig;

  const componentCoordinationTypes = fromEntries(
    viewTypeObjs.map(vt => ([vt.name, vt.coordinationTypes])),
  );
  const defaultCoordinationValues = fromEntries(
    coordinationTypeObjs.map(ct => ([ct.name, ct.defaultValue])),
  );
  const coordinationTypes = coordinationTypeObjs.map(ct => ct.name);

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
        newConfig = coordinateComponentsIndependent(
          newConfig, coordinationType, defaultValue, viewTypeObjs,
        );
      } else {
        newConfig = coordinateComponentsTogether(
          newConfig, coordinationType, defaultValue, viewTypeObjs,
        );
      }
    }
  });

  return newConfig;
}

/**
 * Assign unique ids for view definitions where
 * they are missing a value for the uid property
 * in layout[].uid.
 * @param {object} config The view config
 * @returns The updated view config.
 */
function assignViewUids(config) {
  const { uid, layout } = config;
  const usedIds = layout.map(view => view.uid);
  layout.forEach((view, i) => {
    // Assign uids for views where they are not present.
    if (!view.uid) {
      const nextUid = getNextScope(usedIds);
      layout[i].uid = nextUid;
      usedIds.push(nextUid);
    }
  });
  const newUid = uid || getNextScope([]);
  return {
    ...config,
    uid: newUid,
    layout,
  };
}

/**
 * Expand convenience file definitions. Each convenience file
 * definition expansion function takes in one file definition and
 * returns an array of file definitions. Not performed recursively.
 * @param {object} config The view config containing collapsed
 * convenience file types.
 * @returns The view config containing expanded minimal file types.
 */
function expandConvenienceFileDefs(config, jointFileTypes) {
  const convenienceFileTypes = fromEntries(
    jointFileTypes.map(ft => ([ft.name, ft.expandFunction])),
  );
  const { datasets: currDatasets } = config;
  const datasets = cloneDeep(currDatasets);
  currDatasets.forEach((dataset, i) => {
    const { files = [] } = dataset;
    let newFiles = [];
    files.forEach((fileDef) => {
      const { fileType } = fileDef;
      const expansionFunc = convenienceFileTypes[fileType];
      if (expansionFunc && typeof expansionFunc === 'function') {
        // This was a convenience file type, so expand it.
        const expandedFileDefs = expansionFunc(fileDef);
        newFiles = newFiles.concat(expandedFileDefs);
      } else {
        // This was not a convenience file type,
        // so keep it in the files array as-is.
        newFiles.push(fileDef);
      }
    });
    datasets[i].files = newFiles;
  });
  return {
    ...config,
    datasets,
  };
}

/**
 * Initialize the view config:
 * - Fill in missing coordination objects with default values.
 * - Fill in missing component coordination scope mappings.
 *   based on the `initStrategy` specified in the view config.
 * - Fill in missing view uid values.
 * - Expand convenience file types.
 * Should be "stable": if run on the same view config twice, the return value the second
 * time should be identical to the return value the first time.
 * @param {object} config The view config prop.
 * @param {PluginJointFileType[]} jointFileTypes
 * @param {PluginCoordinationType[]} coordinationTypes
 * @param {PluginViewType[]} viewTypes
 * @returns The initialized view config.
 */
export function initialize(config, jointFileTypes, coordinationTypes, viewTypes) {
  let newConfig = cloneDeep(config);
  if (newConfig.initStrategy === 'auto') {
    // TODO: pass coordination types with defaults
    // TODO: pass view types with per-view coordination type lists
    newConfig = initializeAuto(config, coordinationTypes, viewTypes);
  }
  newConfig = expandConvenienceFileDefs(newConfig, jointFileTypes);
  return assignViewUids(newConfig);
}
