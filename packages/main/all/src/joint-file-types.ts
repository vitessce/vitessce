import type { z } from 'zod';
import type { latestFileDefSchema } from '@vitessce/schemas';
import { FileType } from '@vitessce/constants-internal';

type BaseFileDef = {
  url?: string;
  requestInit?: any;
  coordinationValues: Record<string, string>;
};

export function expandAnndataZarr(fileDef: z.infer<typeof latestFileDefSchema>) {
  const baseFileDef: BaseFileDef = {
    url: fileDef.url,
    requestInit: fileDef.requestInit,
    coordinationValues: {
      ...fileDef.coordinationValues,
      obsType: fileDef.coordinationValues?.obsType || 'cell',
      featureType: fileDef.coordinationValues?.featureType || 'gene',
      featureValueType: fileDef.coordinationValues?.featureValueType || 'expression',
    },
  };
  const extraCoordinationValues: Record<string, any> = {};
  Object.entries(baseFileDef.coordinationValues).forEach(([key, value]) => {
    if (!['obsType', 'featureType', 'featureValueType'].includes(key)) {
      extraCoordinationValues[key] = value;
    }
  });
  const { options = {} } = fileDef;
  return [
    // obsFeatureMatrix
    ...(options.obsFeatureMatrix ? [{
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR,
      options: options.obsFeatureMatrix,
      coordinationValues: {
        ...extraCoordinationValues,
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
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSpots
    ...(options.obsSpots ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SPOTS_ANNDATA_ZARR,
      options: options.obsSpots,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsPoints
    ...(options.obsPoints ? [{
      ...baseFileDef,
      fileType: FileType.OBS_POINTS_ANNDATA_ZARR,
      options: options.obsPoints,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsLocations
    ...(options.obsLocations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_LOCATIONS_ANNDATA_ZARR,
      options: options.obsLocations,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSegmentations
    ...(options.obsSegmentations ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR,
      options: options.obsSegmentations,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsEmbedding
    // eslint-disable-next-line no-nested-ternary
    ...(options.obsEmbedding ? (
      Array.isArray(options.obsEmbedding) ? options.obsEmbedding.map((oe: any) => ({
        // obsEmbedding was an array, process each element.
        ...baseFileDef,
        fileType: FileType.OBS_EMBEDDING_ANNDATA_ZARR,
        options: {
          path: oe.path,
          dims: oe.dims,
        },
        coordinationValues: {
          ...extraCoordinationValues,
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
          ...extraCoordinationValues,
          obsType: baseFileDef.coordinationValues.obsType,
          embeddingType: baseFileDef.coordinationValues.embeddingType,
        },
      }]
    ) : []),
    // obsLabels
    // eslint-disable-next-line no-nested-ternary
    ...(options.obsLabels ? (
      Array.isArray(options.obsLabels) ? options.obsLabels.map((ol: any) => ({
        // obsLabels was an array, process each element.
        ...baseFileDef,
        fileType: FileType.OBS_LABELS_ANNDATA_ZARR,
        options: {
          path: ol.path,
        },
        coordinationValues: {
          ...extraCoordinationValues,
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
          ...extraCoordinationValues,
          obsType: baseFileDef.coordinationValues.obsType,
          obsLabelsType: baseFileDef.coordinationValues.obsLabelsType,
        },
      }]
    ) : []),
    // featureLabels
    // eslint-disable-next-line no-nested-ternary
    ...(options.featureLabels ? (
      Array.isArray(options.featureLabels) ? options.featureLabels.map((fl: any) => ({
        // featureLabels was an array, process each element.
        ...baseFileDef,
        fileType: FileType.FEATURE_LABELS_ANNDATA_ZARR,
        options: {
          path: fl.path,
        },
        coordinationValues: {
          ...extraCoordinationValues,
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
          ...extraCoordinationValues,
          featureType: baseFileDef.coordinationValues.featureType,
          featureLabelsType: baseFileDef.coordinationValues.featureLabelsType,
        },
      }]
    ) : []),
  ];
}
