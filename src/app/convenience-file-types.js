import { FileType } from './constants';

export function expandClustersJson(fileDef) {
  const baseFileDef = {
    ...fileDef,
    coordinationValues: {
      ...fileDef.coordinationValues,
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
    },
  };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON,
    },
  ];
}
/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.CLUSTERS_JSON]: expandClustersJson,
};
