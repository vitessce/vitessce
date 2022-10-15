import { getLoaderClassesForPluginFileType } from '../plugins';

export const fileTypeToLoaderAndSource = {};

export function getSourceAndLoaderFromFileType(type) {
  if (fileTypeToLoaderAndSource[type]) {
    return fileTypeToLoaderAndSource[type];
  }
  const pluginFileType = getLoaderClassesForPluginFileType(type);
  if (pluginFileType) {
    return pluginFileType;
  }
  // Fallback to JSON.
  // TODO(monorepo)
  // return [JsonSource, JsonLoader];
  return [null, null];
}
