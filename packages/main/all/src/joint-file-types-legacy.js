import { FileType } from '@vitessce/constants-internal';

/** @typedef {typeof import('@vitessce/schemas').latestFileDefSchema} latestFileDefSchema */
/** @typedef {import('zod').z.infer<latestFileDefSchema> & { type?: string }} legacyFileDefSchema */

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
export function expandRasterJson(fileDef) {
  // Validation already happens in the RasterJsonLoader.
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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
    ...(fileDef.options?.embeddingTypes ? fileDef.options.embeddingTypes.map(
      /**
       * @param {string} et 
       * @returns 
       */
      (et) => ({
        ...baseFileDef,
        fileType: FileType.OBS_EMBEDDING_CELLS_JSON,
        coordinationValues: {
          obsType: baseFileDef.coordinationValues.obsType,
          embeddingType: et,
        },
      })
    ) : []),
    ...(fileDef.options?.obsLabelsTypes ? fileDef.options.obsLabelsTypes.map(
      /**
       * @param {string} key 
       * @returns 
       */
      (key) => ({
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_CELLS_JSON,
        coordinationValues: {
          obsType: baseFileDef.coordinationValues.obsType,
          obsLabelsType: key,
        },
      }),
    ) : []),
  ];
}

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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
    ...obsLabelsTypes.map(
      /**
       * @param {string} olt 
       * @returns 
       */
      (olt) => ({
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
        options: {
          path: olt,
        },
        coordinationValues: {
          obsType: baseFileDef.coordinationValues.obsType,
          obsLabelsType: olt.split('/').at(-1),
        },
      }),
    ),
  ];
}

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
export function expandAnndataCellSetsZarr(fileDef) {
  const baseFileDef = getAnndataBaseFileDef(fileDef);
  const { options = [] } = fileDef;
  return [
    {
      ...baseFileDef,
      fileType: FileType.OBS_SETS_ANNDATA_ZARR,
      options: options.map(
        /**
         * @param {any} option 
         * @returns 
         */
        (option) => ({
          name: option.groupName,
          path: option.setName,
          scorePath: option.scoreName,
        }),
      ),
      coordinationValues: {
        obsType: baseFileDef.coordinationValues.obsType,
      },
    },
  ];
}

/**
 * @param {legacyFileDefSchema} fileDef 
 * @returns 
 */
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
