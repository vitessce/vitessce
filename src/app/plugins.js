import fromEntries from 'object.fromentries';
import { CoordinationType } from './constants';
import {
  COMPONENT_COORDINATION_TYPES,
  DEFAULT_COORDINATION_VALUES,
} from './state/coordination';

export const PLUGIN_VIEW_TYPES_KEY = '__VITESSCE_PLUGIN_VIEW_TYPES__';
export const PLUGIN_COORDINATION_TYPES_KEY = '__VITESSCE_PLUGIN_COORDINATION_TYPES__';
export const PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY = '__VITESSCE_PLUGIN_COORDINATION_TYPES_PER_VIEW__';
export const PLUGIN_FILE_TYPES_KEY = '__VITESSCE_PLUGIN_FILE_TYPES__';

// Reference: https://github.com/higlass/higlass-register/blob/master/src/index.js
window[PLUGIN_VIEW_TYPES_KEY] = window[PLUGIN_VIEW_TYPES_KEY] || {};
window[PLUGIN_COORDINATION_TYPES_KEY] = window[PLUGIN_COORDINATION_TYPES_KEY] || {};
window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] = (
  window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] || {}
);
window[PLUGIN_FILE_TYPES_KEY] = window[PLUGIN_FILE_TYPES_KEY] || {};

/**
 * Register a new coordination type.
 * @param {string} typeName Name for the new coordination type.
 * @param {*} defaultValue A default value for the coordination type.
 */
export function registerPluginCoordinationType(typeName, defaultValue) {
  window[PLUGIN_COORDINATION_TYPES_KEY][typeName] = defaultValue;
}

/**
 * Register a new view type.
 * @param {string} viewType A name
 * @param {function} viewSubscriberReactComponent A react component.
 * @param {string[]} coordinationTypes A list of coordination types that this view supports.
 */
export function registerPluginViewType(viewType, viewSubscriberReactComponent, coordinationTypes) {
  window[PLUGIN_VIEW_TYPES_KEY][viewType] = viewSubscriberReactComponent;
  // Register the supported coordination types.
  const pluginTypesPerView = window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY];
  if (Array.isArray(pluginTypesPerView[viewType])) {
    coordinationTypes.forEach((coordinationType) => {
      if (!pluginTypesPerView[viewType].includes(coordinationType)) {
        pluginTypesPerView[viewType].push(coordinationType);
      }
    });
  } else {
    pluginTypesPerView[viewType] = coordinationTypes;
  }
}

/**
 * Register a new file type.
 * @param {string} fileTypeName Name for the new file type.
 * @param {string} dataTypeName Name for the data type associated with the file type.
 * @param {class} dataSourceClass Data source class definition.
 * @param {class} dataLoaderClass Data loader class definition.
 */
export function registerPluginFileType(
  // eslint-disable-next-line no-unused-vars
  fileTypeName, dataTypeName, dataLoaderClass, dataSourceClass,
) {
  window[PLUGIN_FILE_TYPES_KEY][fileTypeName] = [dataSourceClass, dataLoaderClass];
}


// Plugin getter functions.

export function getPluginViewTypes() {
  return Object.keys(window[PLUGIN_VIEW_TYPES_KEY]);
}

export function getPluginViewType(viewType) {
  return window[PLUGIN_VIEW_TYPES_KEY][viewType];
}

export function getPluginCoordinationTypes() {
  return Object.keys(window[PLUGIN_COORDINATION_TYPES_KEY]);
}

export function getPluginCoordinationTypeDefaults() {
  return window[PLUGIN_COORDINATION_TYPES_KEY];
}

export function getPluginCoordinationTypesForViewType(viewType) {
  if (Array.isArray(window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType])) {
    return window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType];
  }
  return [];
}

export function getPluginFileTypes() {
  return Object.keys(window[PLUGIN_FILE_TYPES_KEY]);
}

export function getPluginFileType(fileType) {
  return window[PLUGIN_FILE_TYPES_KEY][fileType];
}

// Getters that depend on plugins.

export function getCoordinationTypes() {
  return [
    ...Object.values(CoordinationType),
    ...getPluginCoordinationTypes(),
  ];
}

// Need to do this in a function since the plugin coordination
// types are dynamic.
export function getDefaultCoordinationValues() {
  return {
    ...DEFAULT_COORDINATION_VALUES,
    ...getPluginCoordinationTypeDefaults(),
  };
}

// Need to do this in a function since the plugin coordination
// types are dynamic.
export function getComponentCoordinationTypes() {
  return {
    ...COMPONENT_COORDINATION_TYPES,
    ...fromEntries(getPluginViewTypes().map(viewType => ([
      viewType,
      getPluginCoordinationTypesForViewType(viewType),
    ]))),
  };
}
