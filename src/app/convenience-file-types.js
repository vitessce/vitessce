import { FileType } from './constants';

export function expandRasterJson(fileDef) {
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
      fileType: FileType.IMAGE_RASTER_JSON,
      url,
      requestInit,
      coordinationValues,
    },
    {
      fileType: FileType.OBS_SEGMENTATIONS_RASTER_JSON,
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
  ];
}

export function expandRasterOmeZarr(fileDef) {
  const {
    url,
    requestInit,
    coordinationValues = {},
  } = fileDef;
  return [
    {
      fileType: FileType.IMAGE_OME_ZARR,
      url,
      requestInit,
      coordinationValues,
    },
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
  // [FileType.RASTER_JSON]: expandRasterJson,
  // [FileType.RASTER_OME_ZARR]: expandRasterOmeZarr,
  // [FileType.CELL_SETS_JSON]: expandCellSetsJson,
  // [FileType.CLUSTERS_JSON]: expandClustersJson,
  // [FileType.GENES_JSON]: expandGenesJson,
  // [FileType.CELLS_JSON]: expandCellsJson,
};
