import { z } from 'zod';

// Shared
const annDataObs = z.object({
  path: z.string(),
});

const annDataObsm = z.object({
  path: z.string(),
  dims: z.array(z.number())
    .optional(),
});

const annDataConvenienceObsLabelsItem = z.object({
  path: z.string(),
  obsLabelsType: z.string(),
});

const annDataConvenienceFeatureLabelsItem = z.object({
  path: z.string(),
  featureLabelsType: z.string(),
});

const annDataConvenienceObsEmbeddingItem = z.object({
  path: z.string(),
  dims: z.array(z.number())
    .optional(),
  embeddingType: z.string(),
});

const annDataComparisonMetadata = z.object({
  path: z.string().describe('Path to the comparison metadata, such as /uns/comparison_metadata'),
});

const annDataFeatureStats = z.object({
  // TODO: implement a featureStats.anndata.zarr loader
  // which does not depend on comparisonMetadata
  // (instead, would point directly to the root of
  // the dataframe containing a set of diff exp results)
  // path: z.string().describe('Path to the dataframe containing the results.'),
  metadataPath: z.string().describe('Path to the comparison metadata.'),
  indexColumn: z.string()
    .optional()
    .describe('Provide a column to use for the feature index, if different than the default dataframe index.'),
  pValueColumn: z.string(),
  foldChangeColumn: z.string(),
  pValueTransformation: z.enum(['minuslog10'])
    .optional(),
  pValueAdjusted: z.boolean()
    .optional(),
  foldChangeTransformation: z.enum(['log2'])
    .optional(),
});

const annDataFeatureSetStats = z.object({
  metadataPath: z.string().describe('Path to the comparison metadata.'),
  indexColumn: z.string()
    .optional()
    .describe('Provide a column to use for the feature set index, if different than the default dataframe index.'),
  termColumn: z.string()
    .optional(),
  pValueColumn: z.string(),
  pValueAdjusted: z.boolean()
    .optional(),
  featureSetLibrary: z.string()
    .optional()
    .describe('Optionally, provide a feature set library name. By default, Reactome_2022.'),
  analysisType: z.string()
    .optional()
    .describe('Optionally, provide an analysis_type name. By default, pertpy_hypergeometric.'),
});

// Reference: https://pertpy.readthedocs.io/en/stable/tutorials/notebooks/sccoda.html#Result-interpretation
const annDataObsSetStats = z.object({
  metadataPath: z.string().describe('Path to the comparison metadata.'),
  indexColumn: z.string()
    .optional()
    .describe('Provide a column to use for the obs set index, if different than the default dataframe index.'),
  interceptExpectedSampleColumn: z.string()
    .describe('If we had a new sample (with no active covariates) with a total number of cells equal to the mean sampling depth of the dataset, then this distribution over the cell types would be most likely.'),
  effectExpectedSampleColumn: z.string()
    .describe('If we had a new sample (with no active covariates) with a total number of cells equal to the mean sampling depth of the dataset, then this distribution over the cell types would be most likely.'),
  foldChangeColumn: z.string()
    .describe('The log-fold change is then calculated between this expected sample and the expected sample with no active covariates from the intercept section.'),
  foldChangeTransformation: z.enum(['log2'])
    .optional(),
  isCredibleEffectColumn: z.string()
    .describe('Column which annotates effects as being credible or not (boolean).'),
  analysisType: z.string()
    .optional()
    .describe('Optionally, provide an analysis_type name. By default, sccoda_df.'),
});

const annDataObsLabels = annDataObs;
const annDataFeatureLabels = annDataObs;
const annDataSampleEdges = annDataObs;
const annDataObsFeatureMatrix = z.object({
  path: z.string(),
  featureFilterPath: z.string()
    .optional()
    .describe('If the feature index should be filtered, put a boolean column here (analogous to the previous geneFilter option). e.g., var/in_obsm_X_small_matrix'),
  initialFeatureFilterPath: z.string()
    .optional()
    .describe('If only a subset of the matrix should be loaded initially, put a boolean column along the feature axis here (analogous to the previous matrixGeneFilter option). e.g., var/highly_variable'),
});

const annDataObsSetsArr = z.array(
  z.object({
    name: z.string()
      .describe("The display name for the set, like 'Cell Type' or 'Louvain.'"),
    path: z.union([
      z.string()
        .describe("The location in the AnnData store for the set, like 'obs/louvain' or 'obs/celltype.'"),
      z.array(z.string())
        .describe('An array of locations in the AnnData store for a hierarchy of set names, from coarse to fine levels.'),
    ]),
    scorePath: z.string()
      .optional()
      .describe("The location in the AnnData store for the set confidence scores, like 'obs/celltype_prediction_score.'"),
  }),
);

// Need to nest this within an object
// to allow for additional properties like `refSpecUrl`.
const annDataObsSets = z.object({
  obsSets: annDataObsSetsArr,
});
const annDataSampleSets = z.object({
  sampleSets: annDataObsSetsArr,
});

const annDataObsFeatureColumnsArr = z.array(
  z.object({
    path: z.string(),
  }),
);

// Need to nest this within an object
// to allow for additional properties like `refSpecUrl`.
const annDataObsFeatureColumns = z.object({
  obsFeatureColumns: annDataObsFeatureColumnsArr,
});

const annDataObsSpots = annDataObsm;
const annDataObsPoints = annDataObsm;
const annDataObsLocations = annDataObsm;
const annDataObsEmbedding = annDataObsm;
const annDataObsSegmentations = annDataObs;

// OME
// coordinateTransformations matches the OME-NGFF v0.4 spec.
// Reference: https://ngff.openmicroscopy.org/0.4/#trafo-md
const omeCoordinateTransformations = z.array(z.union([
  z.object({
    type: z.literal('identity'),
  }),
  z.object({
    type: z.literal('translation'),
    translation: z.array(z.number()),
  }),
  z.object({
    type: z.literal('scale'),
    scale: z.array(z.number()),
  }),
]));

// OME-TIFF
export const imageOmeTiffSchema = z.object({
  offsetsUrl: z.string()
    .optional(),
  coordinateTransformations: omeCoordinateTransformations
    .optional(),
});

export const obsSegmentationsOmeTiffSchema = imageOmeTiffSchema.extend({
  obsTypesFromChannelNames: z.boolean()
    .optional(),
});

// OME-Zarr (NGFF)
export const imageOmeZarrSchema = z.object({
  coordinateTransformations: omeCoordinateTransformations
    .optional(),
});

export const obsSegmentationsOmeZarrSchema = imageOmeZarrSchema.extend({
  obsTypesFromChannelNames: z.boolean()
    .optional(),
});

// SpatialData
// TODO: properties to specify target coordinate system name?
export const imageSpatialdataSchema = z.object({
  path: z.string(),
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform the image. If not provided, the "global" coordinate system is assumed.'),
});
export const obsSegmentationsSpatialdataSchema = z.object({
  // TODO: should this be renamed labelsSpatialdataSchema?
  // TODO: support obsTypesFromChannelNames?
  path: z.string(),
  tablePath: z.string()
    .optional()
    .describe('The path to a table which annotates the labels. If available but not specified, the spot identifiers may not be aligned with associated tabular data as expected.'),
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform the image. If not provided, the "global" coordinate system is assumed.'),
});
export const obsLocationsSpatialdataSchema = z.object({
  path: z.string(),
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform the coordinates. If not provided, the "global" coordinate system is assumed.'),
});
export const obsSpotsSpatialdataSchema = z.object({
  path: z.string(),
  tablePath: z.string()
    .optional()
    .describe('The path to a table which annotates the spots. If available but not specified, the spot identifiers may not be aligned with associated tabular data as expected.'),
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform the coordinates and radii. If not provided, the "global" coordinate system is assumed.'),
});
export const obsFeatureMatrixSpatialdataSchema = annDataObsFeatureMatrix.extend({
  region: z.string()
    .describe('The name of a region to use to filter instances (i.e., rows) in the table')
    .optional(),
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform the image. If not provided, the "global" coordinate system is assumed.'),
});
export const obsSetsSpatialdataSchema = z.object({
  region: z.string()
    .describe('The name of a region to use to filter instances (i.e., rows) in the table')
    .optional(),
  tablePath: z.string()
    .optional()
    .describe('The path to a table which contains the index for the set values.'),
  obsSets: annDataObsSetsArr,
});

// GLB
export const meshGlbSchema = z.object({
  targetX: z.number(),
  targetY: z.number(),
  targetZ: z.number(),
  rotationX: z.number(),
  rotationY: z.number(),
  rotationZ: z.number(),
  scaleX: z.number(),
  scaleY: z.number(),
  scaleZ: z.number(),
  sceneRotationX: z.number(),
  sceneRotationY: z.number(),
  sceneRotationZ: z.number(),
  sceneScaleX: z.number(),
  sceneScaleY: z.number(),
  sceneScaleZ: z.number(),
  materialSide: z.enum(['front', 'back']),
}).partial().nullable();

/**
 * Options schemas for atomic file types.
 */
// AnnData
export const obsEmbeddingAnndataSchema = annDataObsEmbedding;
export const obsSpotsAnndataSchema = annDataObsLocations;
export const obsPointsAnndataSchema = annDataObsLocations;
export const obsLocationsAnndataSchema = annDataObsLocations;
export const obsSegmentationsAnndataSchema = annDataObsSegmentations;
export const obsSetsAnndataSchema = annDataObsSets;
export const sampleSetsAnndataSchema = annDataSampleSets;
export const obsFeatureMatrixAnndataSchema = annDataObsFeatureMatrix;
export const obsLabelsAnndataSchema = annDataObsLabels;
export const featureLabelsAnndataSchema = annDataFeatureLabels;
export const obsFeatureColumnsAnndataSchema = annDataObsFeatureColumns;
export const sampleEdgesAnndataSchema = annDataSampleEdges;

export const comparisonMetadataAnndataSchema = annDataComparisonMetadata;
export const featureStatsAnndataSchema = annDataFeatureStats;
export const featureSetStatsAnndataSchema = annDataFeatureSetStats;
export const obsSetStatsAnndataSchema = annDataObsSetStats;

// CSV
export const obsEmbeddingCsvSchema = z.object({
  obsIndex: z.string(),
  obsEmbedding: z.array(z.string()).length(2), // TODO: support 3D?
});
export const obsSpotsCsvSchema = z.object({
  obsIndex: z.string(),
  obsSpots: z.array(z.string()).length(2), // TODO: support 3D?
});
export const obsPointsCsvSchema = z.object({
  obsIndex: z.string(),
  obsPoints: z.array(z.string()).length(3),
});
export const obsLocationsCsvSchema = z.object({
  obsIndex: z.string(),
  obsLocations: z.array(z.string()).length(2), // TODO: support 3D?
});
export const obsLabelsCsvSchema = z.object({
  obsIndex: z.string(),
  obsLabels: z.string(),
});
export const featureLabelsCsvSchema = z.object({
  featureIndex: z.string(),
  featureLabels: z.string(),
});
export const obsSetsCsvSchema = z.object({
  obsIndex: z.string(),
  obsSets: z.array(
    z.object({
      name: z.string(),
      column: z.union([
        z.string(),
        z.array(z.string()),
      ]),
      scoreColumn: z.string().optional(),
    }),
  ),
});
export const sampleSetsCsvSchema = z.object({
  sampleIndex: z.string(),
  sampleSets: z.array(
    z.object({
      name: z.string(),
      column: z.union([
        z.string(),
        z.array(z.string()),
      ]),
      scoreColumn: z.string().optional(),
    }),
  ),
});

/**
 * Options schemas for joint file types.
 */
export const anndataZarrSchema = z.object({
  obsLabels: z.union([
    annDataObsLabels,
    z.array(annDataConvenienceObsLabelsItem),
  ]),
  featureLabels: z.union([
    annDataFeatureLabels,
    z.array(annDataConvenienceFeatureLabelsItem),
  ]),
  obsFeatureMatrix: annDataObsFeatureMatrix,
  obsSets: annDataObsSetsArr,
  obsSpots: annDataObsSpots,
  obsPoints: annDataObsPoints,
  obsLocations: annDataObsLocations,
  obsSegmentations: annDataObsSegmentations,
  obsEmbedding: z.union([
    annDataObsEmbedding,
    z.array(annDataConvenienceObsEmbeddingItem),
  ]),
  sampleEdges: annDataSampleEdges,
}).partial();

export const anndataH5adSchema = anndataZarrSchema.extend({
  refSpecUrl: z.string(),
});

export const spatialdataZarrSchema = z.object({
  // TODO: should `image` be a special schema
  // to allow specifying fileUid (like for embeddingType)?
  // TODO: allow multiple images
  image: imageSpatialdataSchema,
  // TODO: should this be a special schema
  // to allow specifying fileUid (like for embeddingType)?
  // TODO: allow multiple labels
  labels: obsSegmentationsSpatialdataSchema,
  obsFeatureMatrix: obsFeatureMatrixSpatialdataSchema,
  obsSpots: obsSpotsSpatialdataSchema,
  // TODO: obsPoints
  // TODO: obsLocations
  obsSets: obsSetsSpatialdataSchema,
  // TODO: obsEmbedding
  // TODO: obsLabels
  // TODO: featureLabels
  coordinateSystem: z.string()
    .optional()
    .describe('The name of a coordinate transformation output used to transform all elements which lack a per-element coordinateSystem property.'),
}).partial();
