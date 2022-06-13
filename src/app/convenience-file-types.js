import { FileType } from './constants';

function getAnndataBaseFileDef(fileDef) {
  return {
    url: fileDef.url,
    requestInit: fileDef.requestInit,
    coordinationValues: {
      ...fileDef.coordinationValues,
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
    },
  };
}

export function expandAnndataCellsZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = {} } = fileDef;
  const embeddingTypes = options.mappings ? Object.keys(options.mappings) : [];
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_INDEX_ANNDATA_ZARR,
      options: {
        path: 'obs/index',
      },
    },
    ...(options.xy ? [{
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_ANNDATA_ZARR,
      options: {
        path: options.xy,
      },
    }] : []),
    ...(options.poly ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR,
      options: {
        path: options.poly,
      },
    }] : []),
    ...embeddingTypes.map(et => ({
      ...baseFileDef,
      fileType: FileType.OBS_EMBEDDING_ANNDATA_ZARR,
      options: {
        path: options.mappings[et].key,
        dims: options.mappings[et].dims,
      },
    })),
  ];
}

export function expandAnndataCellSetsZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = [] } = fileDef;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_SETS_ANNDATA_ZARR,
      options: options.map(option => ({
        name: option.groupName,
        path: option.setName,
        scorePath: option.scoreName,
      })),
    },
  ];
}

export function expandAnndataExpressionMatrixZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = {} } = fileDef;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_INDEX_ANNDATA_ZARR,
      options: {
        path: 'obs/index',
      },
    },
    {
      ...baseFileDef,
      fileType: FileType.FEATURE_INDEX_ANNDATA_ZARR,
      options: {
        path: options.geneAlias || 'var/index',
        filterPath: options.geneFilter,
      },
    },
    {
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR,
      options: {
        path: options.matrix,
        initialFeatureFilterPath: options.matrixGeneFilter,
      },
    },
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.ANNDATA_CELLS_ZARR]: expandAnndataCellsZarr,
  // [FileType.ANNDATA_CELL_SETS_ZARR]: expandAnndataCellSetsZarr,
  // [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: expandAnndataExpressionMatrixZarr,
};
