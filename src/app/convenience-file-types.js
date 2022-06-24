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
  const obsLabelsTypes = options.factors ? options.factors : [];
  return [
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
    ...obsLabelsTypes.map(olt => ({
      ...baseFileDef,
      fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
      options: {
        path: olt,
      },
      coordinationValues: {
        ...baseFileDef.coordinationValues,
        obsLabelsType: olt.split('/').at(-1),
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
    ...(options.geneAlias ? [{
      ...baseFileDef,
      fileType: FileType.FEATURE_LABELS_ANNDATA_ZARR,
      options: {
        path: options.geneAlias,
      },
      coordinationValues: {
        ...baseFileDef.coordinationValues,
        featureLabelsType: 'geneAlias',
      },
    }] : []),
    {
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR,
      options: {
        path: options.matrix,
        featureFilterPath: options.geneFilter,
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
    // obsLabels
    // eslint-disable-next-line no-nested-ternary
    ...(options.obsLabels ? (
      Array.isArray(options.obsLabels) ? options.obsLabels.map(ol => ({
        // obsLabels was an array, process each element.
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
        options: {
          path: ol.path,
        },
        coordinationValues: {
          ...baseFileDef.coordinationValues,
          // Move obsLabels type property out of options and into coordinationValues.
          obsLabelsType: ol.obsLabelsType,
        },
      })) : [{
        // obsLabels was an object.
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
        options: options.obsLabels,
      }]
    ) : []),
    // featureLabels
    // eslint-disable-next-line no-nested-ternary
    ...(options.featureLabels ? (
      Array.isArray(options.featureLabels) ? options.featureLabels.map(fl => ({
        // featureLabels was an array, process each element.
        ...baseFileDef,
        fileType: FileType.FEATURE_LABELS_ANNDATA_ZARR,
        options: {
          path: fl.path,
        },
        coordinationValues: {
          ...baseFileDef.coordinationValues,
          // Move featureLabels type property out of options and into coordinationValues.
          obsLabelsType: fl.featureLabelsType,
        },
      })) : [{
        // featureLabels was an object.
        ...baseFileDef,
        fileType: FileType.FEATURE_LABELS_ANNDATA_ZARR,
        options: options.featureLabels,
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
  // [FileType.RASTER_JSON]: expandRasterJson,
  // [FileType.RASTER_OME_ZARR]: expandRasterOmeZarr,
  // [FileType.CELL_SETS_JSON]: expandCellSetsJson,
  // [FileType.CLUSTERS_JSON]: expandClustersJson,
  // [FileType.GENES_JSON]: expandGenesJson,
  // [FileType.CELLS_JSON]: expandCellsJson,
};
