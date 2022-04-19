
export const PLUGIN_VIEW_TYPES_KEY = '__VITESSCE_PLUGIN_VIEW_TYPES__';
export const PLUGIN_COORDINATION_TYPES_KEY = '__VITESSCE_PLUGIN_COORDINATION_TYPES__';
export const PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY = '__VITESSCE_PLUGIN_COORDINATION_TYPES_PER_VIEW__';

// Reference: https://github.com/higlass/higlass-register/blob/master/src/index.js
window[PLUGIN_VIEW_TYPES_KEY] = window[PLUGIN_VIEW_TYPES_KEY] || {};
window[PLUGIN_COORDINATION_TYPES_KEY] = window[PLUGIN_COORDINATION_TYPES_KEY] || {};
window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] = (
  window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY] || {}
);

/**
 * Register a new coordination type.
 * @param {string} typeName Name for the new coordination type.
 * @param {string[]} supportedViews A list of view types that should support this coordination type.
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
  if (Array.isArray(window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType])) {
    coordinationTypes.forEach((coordinationType) => {
      if (!window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType].includes(coordinationType)) {
        window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType].push(coordinationType);
      }
    });
  } else {
    window[PLUGIN_COORDINATION_TYPES_PER_VIEW_KEY][viewType] = coordinationTypes;
  }
}

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
