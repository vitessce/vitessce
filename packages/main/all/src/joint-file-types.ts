import type { z } from 'zod';
import type { latestFileDefSchema } from '@vitessce/schemas';
import { FileType, ALT_ZARR_STORE_TYPES } from '@vitessce/constants-internal';

type BaseFileDef = {
  url?: string;
  requestInit?: any;
  coordinationValues: Record<string, string>;
};

const expectedCoordinationTypes = [
  'obsType', 'featureType', 'featureValueType',
  'featureLabelsType', 'obsLabelsType',
  'embeddingType',
];


function createGetFileType(jointFileType: string) {
  // Based on the jointFileType, return the appropriate fileType.
  return (fileType: string) => {
    if (jointFileType.endsWith('.zip') && ALT_ZARR_STORE_TYPES[fileType]?.zip) {
      return ALT_ZARR_STORE_TYPES[fileType].zip;
    }
    if (jointFileType.endsWith('.h5ad') && ALT_ZARR_STORE_TYPES[fileType]?.h5ad) {
      return ALT_ZARR_STORE_TYPES[fileType].h5ad;
    }
    return fileType;
  };
}

export function expandAnndataZarr(fileDef: z.infer<typeof latestFileDefSchema>) {
  const getFileType = createGetFileType(fileDef.fileType);
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
    if (!expectedCoordinationTypes.includes(key)) {
      extraCoordinationValues[key] = value;
    }
  });
  const { options = {} } = fileDef;
  const sharedOptions: { refSpecUrl?: string } = {};
  if (fileDef.fileType.endsWith('.h5ad')) {
    sharedOptions.refSpecUrl = options?.refSpecUrl;
  }
  return [
    // obsFeatureMatrix
    ...(options.obsFeatureMatrix ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        ...options.obsFeatureMatrix,
      },
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
      fileType: getFileType(FileType.OBS_SETS_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        obsSets: options.obsSets,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSpots
    ...(options.obsSpots ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.OBS_SPOTS_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        ...options.obsSpots,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsPoints
    ...(options.obsPoints ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.OBS_POINTS_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        ...options.obsPoints,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsLocations
    ...(options.obsLocations ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.OBS_LOCATIONS_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        ...options.obsLocations,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSegmentations
    ...(options.obsSegmentations ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR),
      options: {
        ...sharedOptions,
        ...options.obsSegmentations,
      },
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
        fileType: getFileType(FileType.OBS_EMBEDDING_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
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
        fileType: getFileType(FileType.OBS_EMBEDDING_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
          ...options.obsEmbedding,
        },
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
        fileType: getFileType(FileType.OBS_LABELS_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
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
        fileType: getFileType(FileType.OBS_LABELS_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
          ...options.obsLabels,
        },
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
        fileType: getFileType(FileType.FEATURE_LABELS_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
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
        fileType: getFileType(FileType.FEATURE_LABELS_ANNDATA_ZARR),
        options: {
          ...sharedOptions,
          ...options.featureLabels,
        },
        coordinationValues: {
          ...extraCoordinationValues,
          featureType: baseFileDef.coordinationValues.featureType,
          featureLabelsType: baseFileDef.coordinationValues.featureLabelsType,
        },
      }]
    ) : []),
    // sampleEdges
    ...(options.sampleEdges ? [{
      ...baseFileDef,
      fileType: getFileType(FileType.SAMPLE_EDGES_ANNDATA_ZARR),
      options: options.sampleEdges,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
        sampleType: fileDef.coordinationValues?.sampleType || 'sample',
      },
    }] : []),
  ];
}

export function expandSpatialdataZarr(fileDef: z.infer<typeof latestFileDefSchema>) {
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
    if (!expectedCoordinationTypes.includes(key)) {
      extraCoordinationValues[key] = value;
    }
  });
  const { options = {} } = fileDef;
  const defaultCoordinateSystem = options.coordinateSystem;
  return [
    // obsFeatureMatrix
    // TODO: handle multiple obsFeatureMatrix?
    ...(options.obsFeatureMatrix ? [{
      ...baseFileDef,
      fileType: FileType.OBS_FEATURE_MATRIX_SPATIALDATA_ZARR,
      options: options.obsFeatureMatrix,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
        featureType: baseFileDef.coordinationValues.featureType,
        featureValueType: baseFileDef.coordinationValues.featureValueType,
      },
    }] : []),
    // obsSets
    // TODO: handle multiple obsSets?
    ...(options.obsSets ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SETS_SPATIALDATA_ZARR,
      options: options.obsSets,
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // obsSpots
    // TODO: handle multiple obsSpots?
    ...(options.obsSpots ? [{
      ...baseFileDef,
      fileType: FileType.OBS_SPOTS_SPATIALDATA_ZARR,
      options: {
        coordinateSystem: defaultCoordinateSystem,
        ...options.obsSpots,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
      },
    }] : []),
    // TODO: obsPoints?
    // TODO: obsLocations?
    // TODO: obsLabels
    // TODO: featureLabels
    // TODO: obsEmbedding
    // image
    // TODO: handle multiple images
    ...(options.image ? [{
      ...baseFileDef,
      fileType: FileType.IMAGE_SPATIALDATA_ZARR,
      options: {
        coordinateSystem: defaultCoordinateSystem,
        ...options.image,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        featureType: baseFileDef.coordinationValues.featureType,
        // TODO: fileUid?
      },
    }] : []),
    // labels
    // TODO: handle multiple labels?
    ...(options.labels ? [{
      ...baseFileDef,
      fileType: FileType.LABELS_SPATIALDATA_ZARR,
      options: {
        coordinateSystem: defaultCoordinateSystem,
        ...options.labels,
      },
      coordinationValues: {
        ...extraCoordinationValues,
        obsType: baseFileDef.coordinationValues.obsType,
        // TODO: fileUid?
      },
    }] : []),
  ];
}
