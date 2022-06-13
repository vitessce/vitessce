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
      coordinationValues: {
        ...baseFileDef.coordinationValues,
        embeddingType: et,
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

export function expandAnndataZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = {} } = fileDef;
  return [
    // obsFeatureMatrix
    ...(options.obsIndex ? [{
      ...baseFileDef,
      fileType: FileType.OBS_INDEX_ANNDATA_ZARR,
      options: options.obsIndex,
    }] : []),
    ...(options.featureIndex ? [{
      ...baseFileDef,
      fileType: FileType.FEATURE_INDEX_ANNDATA_ZARR,
      options: options.featureIndex,
    }] : []),
    ...(options.obsFeatureMatrix ? [{
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR,
      options: options.obsFeatureMatrix,
    }] : []),
    // obsSets
    ...(options.obsSets ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SETS_ANNDATA_ZARR,
      options: options.obsSets,
    }] : []),
    // obsLocations
    ...(options.obsLocations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_ANNDATA_ZARR,
      options: options.obsLocations,
    }] : []),
    // obsSegmentations
    ...(options.obsSegmentations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR,
      options: options.obsSegmentations,
    }] : []),
    // obsEmbedding
    // eslint-disable-next-line no-nested-ternary
    ...(options.obsEmbedding ? (
      Array.isArray(options.obsEmbedding) ? options.obsEmbedding.map(oe => ({
        // obsEmbedding was an array, process each element.
        ...baseFileDef,
        fileType: FileType.OBS_EMBEDDING_ANNDATA_ZARR,
        options: {
          path: oe.path,
          dims: oe.dims,
        },
        coordinationValues: {
          ...baseFileDef.coordinationValues,
          // Move embedding type property out of options and into coordinationValues.
          embeddingType: oe.embeddingType,
        },
      })) : [{
        // obsEmbedding was an object.
        ...baseFileDef,
        fileType: FileType.OBS_EMBEDDING_ANNDATA_ZARR,
        options: options.obsEmbedding,
      }]
    ) : []),
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.ANNDATA_ZARR]: expandAnndataZarr,
  // [FileType.ANNDATA_CELLS_ZARR]: expandAnndataCellsZarr,
  // [FileType.ANNDATA_CELL_SETS_ZARR]: expandAnndataCellSetsZarr,
  // [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: expandAnndataExpressionMatrixZarr,
};
