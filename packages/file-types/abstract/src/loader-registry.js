/**
 * Get the data source and data loader class.
 * @param {string} type The fileType name.
 * @param {PluginFileType[]} fileTypes The array of file types.
 * @returns {array} [dataSourceClass, dataLoaderClass].
 */
export function getSourceAndLoaderFromFileType(type, fileTypes) {
  if (Array.isArray(fileTypes)) {
    const matchingFileType = fileTypes.find(ft => ft.name === type);
    if (matchingFileType) {
      return matchingFileType.getSourceAndLoader();
    }
  }
  // Fallback to JSON.
  // TODO(monorepo)
  // return [JsonSource, JsonLoader];
  return [null, null];
}

export function getDataTypeFromFileType(type, fileTypes) {
  if (Array.isArray(fileTypes)) {
    const matchingFileType = fileTypes.find(ft => ft.name === type);
    if (matchingFileType) {
      return matchingFileType.dataType;
    }
  }
  return null;
}
