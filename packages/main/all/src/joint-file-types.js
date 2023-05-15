import { FileType } from '@vitessce/constants-internal';

/** @typedef {typeof import('@vitessce/schemas').latestFileDefSchema} latestFileDefSchema */
/** @typedef {import('zod').z.infer<latestFileDefSchema>} latestFileDefSchemaType */

/**
 * @typedef BaseFileDef
 * @type {object}
 * @property {string|undefined} url
 * @property {?any} requestInit
 * @property {Record<string, string>} coordinationValues
 */

/**
 * 
 * @param {latestFileDefSchemaType} fileDef 
 * @returns 
 */
export function expandAnndataZarr(fileDef) {
  /** @type {BaseFileDef} */
  const baseFileDef = {
    url: fileDef.url,
    requestInit: fileDef.requestInit,
    coordinationValues: {
      ...fileDef.coordinationValues,
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
    },
  };
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
      Array.isArray(options.obsEmbedding) ? options.obsEmbedding.map(
        /**
         * @param {any} oe
         * @returns
         */
        (oe) => ({
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
        })
      ) : [{
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
      Array.isArray(options.obsLabels) ? options.obsLabels.map(
        /**
         * @param {any} ol
         * @returns
         */
        (ol) => ({
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
        })
      ) : [{
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
      Array.isArray(options.featureLabels) ? options.featureLabels.map(
        /**
         * @param {any} fl
         * @returns
         */
        (fl) => ({
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
        })
      ) : [{
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
