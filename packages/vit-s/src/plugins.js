import {
  DEFAULT_COORDINATION_VALUES,
} from '@vitessce/constants-internal';

const PLUGINS_KEY = '__VITESSCE_PLUGINS__';
const PLUGIN_VIEW_TYPES_KEY = 'viewTypes';
const PLUGIN_COORDINATION_TYPES_KEY = 'coordinationTypes';
const PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY = 'coordinationTypesPerView';
const PLUGIN_FILE_TYPES_KEY = 'fileTypes';
const PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY = 'fileTypeDataTypeMapping';
const PLUGIN_JOINT_FILE_TYPES_KEY = 'jointFileTypes';

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
PLUGINS[PLUGIN_JOINT_FILE_TYPES_KEY] = PLUGINS[PLUGIN_JOINT_FILE_TYPES_KEY] || {};

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
 * @param {z.ZodTypeAny|null} optionsSchema A zod schema for the file type options.
 */
export function registerPluginFileType(
  // eslint-disable-next-line no-unused-vars
  fileTypeName, dataTypeName, dataLoaderClass, dataSourceClass, optionsSchema = null,
) {
  PLUGINS[PLUGIN_FILE_TYPES_KEY][fileTypeName] = {
    loaderClasses: [dataSourceClass, dataLoaderClass],
    optionsSchema,
  };
  PLUGINS[PLUGIN_FILE_TYPE_DATA_TYPE_MAPPING_KEY][fileTypeName] = dataTypeName;
}


// Plugin getter functions.
export function getPluginCoordinationTypeDefaults() {
  return PLUGINS[PLUGIN_COORDINATION_TYPES_KEY];
}

// Need to do this in a function since the plugin coordination
// types are dynamic.
export function getDefaultCoordinationValues() {
  return {
    ...DEFAULT_COORDINATION_VALUES,
    ...getPluginCoordinationTypeDefaults(),
  };
}
