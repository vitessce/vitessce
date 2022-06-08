import { FileType } from './constants';

export function expandCellsJson(fileDef) {
  const {
    url,
    requestInit,
    options,
    coordinationValues = {},
  } = fileDef;
  const baseCoordinationValues = {
    obsType: coordinationValues.obsType || 'cell',
    featureType: coordinationValues.featureType || 'gene',
  };
  return [
    {
      fileType: FileType.OBS_INDEX_CELLS_JSON,
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    {
      fileType: 'obsLocations.cells.json',
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    {
      fileType: 'obsSegmentations.cells.json',
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    ...(options && options.embeddingTypes ? options.embeddingTypes.map(et => ({
      fileType: FileType.OBS_EMBEDDING_CELLS_JSON,
      url,
      requestInit,
      coordinationValues: {
        ...baseCoordinationValues,
        embeddingType: et,
      },
    })) : []),
    // TODO: obsAnnotations for factors.json
  ];
}

export function expandCellSetsJson(fileDef) {
  const {
    url,
    requestInit,
    coordinationValues = {},
  } = fileDef;
  const baseCoordinationValues = {
    obsType: coordinationValues.obsType || 'cell',
  };
  return [
    {
      fileType: FileType.OBS_SETS_CELL_SETS_JSON,
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  [FileType.CELLS_JSON]: expandCellsJson,
  [FileType.CELL_SETS_JSON]: expandCellSetsJson,
};
