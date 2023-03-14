// TODO: call functions on PluginFileType class instead?
export function getSourceAndLoaderFromFileType(type, fileTypes) {
  if (Array.isArray(fileTypes)) {
    const matchingFileType = fileTypes.find(ft => ft.name === type);
    if (matchingFileType) {
      return [matchingFileType.dataSourceClass, matchingFileType.dataLoaderClass];
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
