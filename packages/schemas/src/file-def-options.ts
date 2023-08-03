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

const annDataObsLabels = annDataObs;
const annDataFeatureLabels = annDataObs;
const annDataObsFeatureMatrix = z.object({
  path: z.string(),
  featureFilterPath: z.string()
    .optional()
    .describe('If the feature index should be filtered, put a boolean column here (analogous to the previous geneFilter option). e.g., var/in_obsm_X_small_matrix'),
  initialFeatureFilterPath: z.string()
    .optional()
    .describe('If only a subset of the matrix should be loaded initially, put a boolean column along the feature axis here (analogous to the previous matrixGeneFilter option). e.g., var/highly_variable'),
});

const annDataObsSets = z.array(
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

// OME-Zarr (NGFF)
export const imageOmeZarrSchema = z.object({
  coordinateTransformations: omeCoordinateTransformations
    .optional(),
});


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
export const obsFeatureMatrixAnndataSchema = annDataObsFeatureMatrix;
export const obsLabelsAnndataSchema = annDataObsLabels;
export const featureLabelsAnndataSchema = annDataFeatureLabels;

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
  obsSets: annDataObsSets,
  obsSpots: annDataObsSpots,
  obsPoints: annDataObsPoints,
  obsLocations: annDataObsLocations,
  obsSegmentations: annDataObsSegmentations,
  obsEmbedding: z.union([
    annDataObsEmbedding,
    z.array(annDataConvenienceObsEmbeddingItem),
  ]),
}).partial();
