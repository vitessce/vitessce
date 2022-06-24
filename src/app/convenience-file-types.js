import { FileType } from './constants';

export function expandCellsJson(fileDef) {
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
      fileType: FileType.OBS_LOCATIONS_CELLS_JSON,
    },
    {
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_CELLS_JSON,
    },
    ...(fileDef.options?.embeddingTypes ? fileDef.options.embeddingTypes.map(et => ({
      ...baseFileDef,
      fileType: FileType.OBS_EMBEDDING_CELLS_JSON,
      coordinationValues: {
        ...baseFileDef.coordinationValues,
        embeddingType: et,
      },
    })) : []),
    ...(fileDef.options?.obsLabelsTypes ? fileDef.options.obsLabelsTypes.map(key => ({
      ...baseFileDef,
      fileType: FileType.OBS_LABELS_CELLS_JSON,
      coordinationValues: {
        ...baseFileDef.coordinationValues,
        obsLabelsType: key,
      },
    })) : []),
  ];
}

export function expandGenesJson(fileDef) {
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
      fileType: FileType.OBS_FEATURE_MATRIX_GENES_JSON,
    },
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.GENES_JSON]: expandGenesJson,
  // [FileType.CELLS_JSON]: expandCellsJson,
};
