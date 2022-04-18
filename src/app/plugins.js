const PLUGIN_VIEWS_KEY = '__VITESSCE_PLUGIN_VIEWS__';
const PLUGIN_DATA_SOURCES_KEY = '__VITESSCE_PLUGIN_DATA_SOURCES__';
const PLUGIN_DATA_LOADERS_KEY = '__VITESSCE_PLUGIN_DATA_LOADERS__';

// Reference: https://github.com/higlass/higlass-register/blob/master/src/index.js
window[PLUGIN_VIEWS_KEY] = window[PLUGIN_VIEWS_KEY] || {};
window[PLUGIN_DATA_SOURCES_KEY] = window[PLUGIN_DATA_SOURCES_KEY] || {};
window[PLUGIN_DATA_LOADERS_KEY] = window[PLUGIN_DATA_LOADERS_KEY] || {};

export function registerPluginViewType(viewType, viewSubscriberReactComponent) {
  window[PLUGIN_VIEWS_KEY][viewType] = viewSubscriberReactComponent;
}

export function registerPluginFileType(fileType, dataLoaderClass, dataSourceClass) {
  window[PLUGIN_DATA_SOURCES_KEY][fileType] = dataSourceClass;
  window[PLUGIN_DATA_LOADERS_KEY][fileType] = dataLoaderClass;
}
