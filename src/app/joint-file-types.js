import { FileType } from './constants';

export function expandMoleculesJson(fileDef) {
  const baseFileDef = {
    ...fileDef,
    coordinationValues: {
      obsType: fileDef.coordinationValues?.obsType || 'molecule',
    },
  };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_MOLECULES_JSON,
    },
    {
      ...baseFileDef,
      fileType: FileType.OBS_LABELS_MOLECULES_JSON,
    },
  ];
}

export function expandExpressionMatrixZarr(fileDef) {
  const baseFileDef = {
    ...fileDef,
    coordinationValues: {
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
    },
  };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR,
    },
  ];
}

export function expandRasterJson(fileDef) {
  const baseFileDef = { ...fileDef };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.IMAGE_RASTER_JSON,
    },
    {
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_RASTER_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues?.obsType || 'cell',
      },
    },
  ];
}

export function expandRasterOmeZarr(fileDef) {
  const baseFileDef = { ...fileDef };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.IMAGE_OME_ZARR,
    },
  ];
}

export function expandCellSetsJson(fileDef) {
  const baseFileDef = { ...fileDef };
  delete baseFileDef.type;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_SETS_CELL_SETS_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues?.obsType || 'cell',
      },
    },
  ];
}

export function expandCellsJson(fileDef) {
  const baseFileDef = {
    ...fileDef,
    coordinationValues: {
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
    },
  };
  delete baseFileDef.type;
  delete baseFileDef.options;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_CELLS_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    },
    {
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_CELLS_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    },
    ...(fileDef.options?.embeddingTypes ? fileDef.options.embeddingTypes.map(et => ({
      ...baseFileDef,
      fileType: FileType.OBS_EMBEDDING_CELLS_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
        embeddingType: et,
      },
    })) : []),
    ...(fileDef.options?.obsLabelsTypes ? fileDef.options.obsLabelsTypes.map(key => ({
      ...baseFileDef,
      fileType: FileType.OBS_LABELS_CELLS_JSON,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
        obsLabelsType: key,
      },
    })) : []),
  ];
}

export function expandClustersJson(fileDef) {
  const baseFileDef = {
    ...fileDef,
    coordinationValues: {
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
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
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
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
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
    },
  };
}

export function expandAnndataCellsZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = {} } = fileDef;
  const embeddingTypes = options.mappings ? Object.keys(options.mappings) : [];
  const obsLabelsTypes = options.factors ? options.factors : [];
  return [
    ...(options.poly ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR,
      options: {
        path: options.poly,
      },
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    ...(options.xy ? [{
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_ANNDATA_ZARR,
      options: {
        path: options.xy,
      },
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
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
        obsType: baseFileDef.coordinationValues.obsType,
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
        obsType: baseFileDef.coordinationValues.obsType,
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
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
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
        featureType: baseFileDef.coordinationValues.featureType,
        featureLabelsType: 'geneAlias', // TODO: check if this works in the portal
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
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
        featureType: baseFileDef.coordinationValues.featureType,
        featureValueType: baseFileDef.coordinationValues.featureValueType,
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
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
        featureType: baseFileDef.coordinationValues.featureType,
        featureValueType: baseFileDef.coordinationValues.featureValueType,
      },
    }] : []),
    // obsSets
    ...(options.obsSets ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SETS_ANNDATA_ZARR,
      options: options.obsSets,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsLocations
    ...(options.obsLocations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_ANNDATA_ZARR,
      options: options.obsLocations,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSegmentations
    ...(options.obsSegmentations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR,
      options: options.obsSegmentations,
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
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
          obsType: baseFileDef.coordinationValues.obsType,
          // Move embedding type property out of options and into coordinationValues.
          embeddingType: oe.embeddingType,
        },
      })) : [{
        // obsEmbedding was an object.
        ...baseFileDef,
        fileType: FileType.OBS_EMBEDDING_ANNDATA_ZARR,
        options: options.obsEmbedding,
        coordinationValues: {
          obsType: baseFileDef.coordinationValues.obsType,
          embeddingType: baseFileDef.coordinationValues.embeddingType,
        },
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
          obsType: baseFileDef.coordinationValues.obsType,
          // Move obsLabels type property out of options and into coordinationValues.
          obsLabelsType: ol.obsLabelsType,
        },
      })) : [{
        // obsLabels was an object.
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
        options: options.obsLabels,
        coordinationValues: {
          obsType: baseFileDef.coordinationValues.obsType,
          obsLabelsType: baseFileDef.coordinationValues.obsLabelsType,
        },
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
          featureType: baseFileDef.coordinationValues.featureType,
          // Move featureLabels type property out of options and into coordinationValues.
          featureLabelsType: fl.featureLabelsType,
        },
      })) : [{
        // featureLabels was an object.
        ...baseFileDef,
        fileType: FileType.FEATURE_LABELS_ANNDATA_ZARR,
        options: options.featureLabels,
        coordinationValues: {
          featureType: baseFileDef.coordinationValues.featureType,
          featureLabelsType: baseFileDef.coordinationValues.featureLabelsType,
        },
      }]
    ) : []),
  ];
}

/**
 * Built-in joint file type
 * expansion functions.
 */
export const JOINT_FILE_TYPES = {
  [FileType.ANNDATA_ZARR]: expandAnndataZarr,
  [FileType.ANNDATA_CELLS_ZARR]: expandAnndataCellsZarr,
  [FileType.ANNDATA_CELL_SETS_ZARR]: expandAnndataCellSetsZarr,
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: expandAnndataExpressionMatrixZarr,
  [FileType.EXPRESSION_MATRIX_ZARR]: expandExpressionMatrixZarr,
  [FileType.RASTER_JSON]: expandRasterJson,
  [FileType.RASTER_OME_ZARR]: expandRasterOmeZarr,
  [FileType.CELL_SETS_JSON]: expandCellSetsJson,
  [FileType.CLUSTERS_JSON]: expandClustersJson,
  [FileType.GENES_JSON]: expandGenesJson,
  [FileType.CELLS_JSON]: expandCellsJson,
  [FileType.MOLECULES_JSON]: expandMoleculesJson,
};
