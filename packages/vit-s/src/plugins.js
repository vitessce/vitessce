import {
  DEFAULT_COORDINATION_VALUES,
} from '@vitessce/constants-internal';

const PLUGINS_KEY = '__VITESSCE_PLUGINS__';
const PLUGIN_COORDINATION_TYPES_KEY = 'coordinationTypes';

window[PLUGINS_KEY] = {};
const PLUGINS = window[PLUGINS_KEY];

// Reference: https://github.com/higlass/higlass-register/blob/master/src/index.js
PLUGINS[PLUGIN_COORDINATION_TYPES_KEY] = PLUGINS[PLUGIN_COORDINATION_TYPES_KEY] || {};

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
