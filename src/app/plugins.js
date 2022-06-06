import { fromEntries } from '../utils';
import { FILE_TYPE_DATA_TYPE_MAPPING } from './constant-relationships';
import { FileType, CoordinationType } from './constants';
import {
  COMPONENT_COORDINATION_TYPES,
  DEFAULT_COORDINATION_VALUES,
} from './state/coordination';

const PLUGINS_KEY = '__VITESSCE_PLUGINS__';
const PLUGIN_VIEW_TYPES_KEY = 'viewTypes';
const PLUGIN_COORDINATION_TYPES_KEY = 'coordinationTypes';
const PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY = 'coordinationTypesPerView';
const PLUGIN_FILE_TYPES_KEY = 'fileTypes';
const PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY = 'fileTypeDataTypeMapping';
const PLUGIN_CONVENIENCE_FILE_TYPES_KEY = 'convenienceFileTypes';

window[PLUGINS_KEY] = {};
const PLUGINS = window[PLUGINS_KEY];

// Reference: https://github.com/higlass/higlass-register/blob/master/src/index.js
PLUGINS[PLUGIN_VIEW_TYPES_KEY] = PLUGINS[PLUGIN_VIEW_TYPES_KEY] || {};
PLUGINS[PLUGIN_COORDINATION_TYPES_KEY] = PLUGINS[PLUGIN_COORDINATION_TYPES_KEY] || {};
PLUGINS[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] = (
  PLUGINS[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] || {}
);
PLUGINS[PLUGIN_FILE_TYPES_KEY] = PLUGINS[PLUGIN_FILE_TYPES_KEY] || {};
PLUGINS[PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY] = (
  PLUGINS[PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY] || {}
);
PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY] = PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY] || {};

/**
 * Register a new coordination type.
 * @param {string} typeName Name for the new coordination type.
 * @param {*} defaultValue A default value for the coordination type.
 */
export function registerPluginCoordinationType(typeName, defaultValue) {
  PLUGINS[PLUGIN_COORDINATION_TYPES_KEY][typeName] = defaultValue;
}

/**
 * Register a new view type.
 * @param {string} viewType A name
 * @param {function} viewSubscriberReactComponent A react component.
 * @param {string[]} coordinationTypes A list of coordination types that this view supports.
 */
export function registerPluginViewType(viewType, viewSubscriberReactComponent, coordinationTypes) {
  PLUGINS[PLUGIN_VIEW_TYPES_KEY][viewType] = viewSubscriberReactComponent;
  // Register the supported coordination types.
  const pluginTypesPerView = PLUGINS[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY];
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
  PLUGINS[PLUGIN_FILE_TYPES_KEY][fileTypeName] = {
    dataType: dataTypeName,
    loaderClasses: [dataSourceClass, dataLoaderClass],
  };
}

/**
 * Register a new file type.
 * @param {string} fileTypeName Name for the new file type.
 * @param {function} expansionFunction The file type expansion function.
 * Should take in a single file definition and return an array of
 * file definitions with valid fileType values.
 */
export function registerPluginConvenienceFileType(
  // eslint-disable-next-line no-unused-vars
  fileTypeName, expansionFunction,
) {
  PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY][fileTypeName] = expansionFunction;
}


// Plugin getter functions.

export function getPluginViewTypes() {
  return Object.keys(PLUGINS[PLUGIN_VIEW_TYPES_KEY]);
}

export function getPluginViewType(viewType) {
  return PLUGINS[PLUGIN_VIEW_TYPES_KEY][viewType];
}

export function getPluginCoordinationTypes() {
  return Object.keys(PLUGINS[PLUGIN_COORDINATION_TYPES_KEY]);
}

export function getPluginCoordinationTypeDefaults() {
  return PLUGINS[PLUGIN_COORDINATION_TYPES_KEY];
}

export function getPluginCoordinationTypesForViewType(viewType) {
  if (Array.isArray(PLUGINS[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType])) {
    return PLUGINS[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType];
  }
  return [];
}

export function getPluginFileTypes() {
  return Object.keys(PLUGINS[PLUGIN_FILE_TYPES_KEY]);
}
export function getPluginConvenienceFileTypes() {
  return Object.keys(PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY]);
}

export function getDataTypeForPluginFileType(fileType) {
  return PLUGINS[PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY][fileType];
}
export function getLoaderClassesForPluginFileType(fileType) {
  return PLUGINS[PLUGIN_FILE_TYPES_KEY][fileType];
}
export function getExpansionFunctionForPluginConvenienceFileType(fileType) {
  return PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY][fileType];
}

// Getters that depend on plugins.
export function getFileTypes() {
  return [
    ...Object.values(FileType),
    ...getPluginFileTypes(),
  ];
}

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

export function getFileTypeDataTypeMapping() {
  return {
    ...FILE_TYPE_DATA_TYPE_MAPPING,
    ...fromEntries(getPluginFileTypes().map(fileType => ([
      fileType,
      getDataTypeForPluginFileType(fileType),
    ]))),
  };
}

export function getConvenienceFileTypes() {
  return {
    // TODO: import built-in convenience file types and include them here.
    ...PLUGINS[PLUGIN_CONVENIENCE_FILE_TYPES_KEY],
  };
}
