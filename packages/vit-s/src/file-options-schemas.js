import Ajv from 'ajv';

export function validateOptions(optionsSchema, options) {
  const validate = new Ajv().compile(optionsSchema);
  const valid = validate(options || null);
  if (!valid) {
    console.warn(JSON.stringify(validate.errors, null, 2));
    throw new Error(`File definition options failed schema validation (${optionsSchema.title})`);
  }
  return true;
}

export const emptySchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#empty-options',
  title: 'Empty options',
  oneOf: [
    { type: 'null' },
  ],
};

const sharedDefinitions = {
  annDataObs: {
    type: 'object',
    additionalProperties: false,
    required: ['path'],
    properties: {
      path: { type: 'string' },
    },
  },
  annDataObsm: {
    type: 'object',
    additionalProperties: false,
    required: ['path'],
    properties: {
      path: { type: 'string' },
      dims: {
        type: 'array',
        description: 'Which indices of the obsm object to take for a scatterplot, allowing for, for example, different PCs from obsm/X_pca',
        items: { type: 'number' },
      },
    },
  },
  annDataConvenienceObsLabelsItem: {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'obsLabelsType'],
    properties: {
      path: { type: 'string' },
      obsLabelsType: { type: 'string' },
    },
  },
  annDataConvenienceFeatureLabelsItem: {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'featureLabelsType'],
    properties: {
      path: { type: 'string' },
      featureLabelsType: { type: 'string' },
    },
  },
  annDataConvenienceObsEmbeddingItem: {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'embeddingType'],
    properties: {
      path: { type: 'string' },
      dims: {
        type: 'array',
        description: 'Which indices of the obsm object to take for a scatterplot, allowing for, for example, different PCs from obsm/X_pca',
        items: { type: 'number' },
      },
      embeddingType: { type: 'string' },
    },
  },
  annDataObsLabels: { $ref: '#/definitions/annDataObs' },
  annDataFeatureLabels: { $ref: '#/definitions/annDataObs' },
  annDataObsFeatureMatrix: {
    type: 'object',
    description: 'Options for the obsFeatureMatrix.anndata.zarr file type.',
    additionalProperties: false,
    required: ['path'],
    properties: {
      path: { type: 'string' },
      featureFilterPath: {
        type: 'string',
        description: 'If the feature index should be filtered, put a boolean column here (analogous to the previous geneFilter option). e.g., var/in_obsm_X_small_matrix',
      },
      initialFeatureFilterPath: {
        type: 'string',
        description: 'If only a subset of the matrix should be loaded initially, put a boolean column along the feature axis here (analogous to the previous matrixGeneFilter option). e.g., var/highly_variable',
      },
    },
  },
  annDataObsSets: {
    type: 'array',
    description: 'Options for the obsSets.anndata.zarr file type.',
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'path'],
      properties: {
        name: {
          type: 'string',
          description: "The display name for the set, like 'Cell Type' or 'Louvain.'",
        },
        path: {
          oneOf: [
            {
              type: 'string',
              description: "The location in the AnnData store for the set, like 'obs/louvain' or 'obs/celltype.'",
            },
            {
              type: 'array',
              items: { type: 'string' },
              description: 'An array of locations in the AnnData store for a hierarchy of set names, from coarse to fine levels.',
            },
          ],
        },
        scorePath: {
          oneOf: [
            {
              type: 'string',
              description: "The location in the AnnData store for the set confidence scores, like 'obs/celltype_prediction_score.'",
            },
          ],
        },
      },
    },
  },
  annDataObsLocations: { $ref: '#/definitions/annDataObsm' },
  annDataObsEmbedding: { $ref: '#/definitions/annDataObsm' },
  annDataObsSegmentations: { $ref: '#/definitions/annDataObs' },
  // OME
  // coordinateTransformations matches the OME-NGFF v0.4 spec.
  // Reference: https://ngff.openmicroscopy.org/0.4/#trafo-md
  omeCoordinateTransformations: {
    type: 'array',
    items: {
      oneOf: [
        {
          type: 'object',
          required: ['type'],
          properties: {
            type: { type: 'string', enum: ['identity'] },
          },
        },
        {
          type: 'object',
          required: ['type', 'translation'],
          properties: {
            type: { type: 'string', enum: ['translation'] },
            translation: { type: 'array', items: { type: 'number' } },
          },
        },
        {
          type: 'object',
          required: ['type', 'scale'],
          properties: {
            type: { type: 'string', enum: ['scale'] },
            scale: { type: 'array', items: { type: 'number' } },
          },
        },
      ],
    },
  },
};

/**
 * Options schemas for atomic file types.
 */
// AnnData
export const obsEmbeddingAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsEmbedding-anndata-zarr-options',
  title: 'obsEmbedding.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsEmbedding',
};
export const obsLocationsAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsLocations-anndata-zarr-options',
  title: 'obsLocations.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsLocations',
};
export const obsSegmentationsAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsSegmentations-anndata-zarr-options',
  title: 'obsSegmentations.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsSegmentations',
};
export const obsSetsAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsSets-anndata-zarr-options',
  title: 'obsSets.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsSets',
};
export const obsFeatureMatrixAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsFeatureMatrix-anndata-zarr-options',
  title: 'obsFeatureMatrix.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsFeatureMatrix',
};
export const obsLabelsAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsLabels-anndata-zarr-options',
  title: 'obsLabels.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataObsLabels',
};
export const featureLabelsAnndataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#featureLabels-anndata-zarr-options',
  title: 'featureLabels.anndata.zarr options',
  definitions: sharedDefinitions,
  $ref: '#/definitions/annDataFeatureLabels',
};
// CSV
export const obsEmbeddingCsvSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsEmbedding-csv-options',
  title: 'obsEmbedding.csv options',
  type: 'object',
  required: ['obsIndex', 'obsEmbedding'],
  properties: {
    obsIndex: { type: 'string' },
    obsEmbedding: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 2,
    },
  },
};
export const obsLocationsCsvSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsLocations-csv-options',
  title: 'obsLocations.csv options',
  type: 'object',
  required: ['obsIndex', 'obsLocations'],
  properties: {
    obsIndex: { type: 'string' },
    obsLocations: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 2,
    },
  },
};
export const obsLabelsCsvSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsLabels-csv-options',
  title: 'obsLabels.csv options',
  type: 'object',
  required: ['obsIndex', 'obsLabels'],
  properties: {
    obsIndex: { type: 'string' },
    obsLabels: { type: 'string' },
  },
};
export const featureLabelsCsvSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#featureLabels-csv-options',
  title: 'featureLabels.csv options',
  type: 'object',
  required: ['featureIndex', 'featureLabels'],
  properties: {
    featureIndex: { type: 'string' },
    featureLabels: { type: 'string' },
  },
};
export const obsSetsCsvSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#obsLabels-csv-options',
  title: 'obsLabels.csv options',
  type: 'object',
  additionalProperties: false,
  required: ['obsIndex', 'obsSets'],
  properties: {
    obsIndex: { type: 'string' },
    obsSets: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'column'],
        properties: {
          name: {
            type: 'string',
            description: "The display name for the set, like 'Cell Type' or 'Louvain'",
          },
          column: {
            oneOf: [
              {
                type: 'string',
                description: "The column for the set, like 'cell_type'",
              },
              {
                type: 'array',
                items: { type: 'string' },
                description: 'An array of columns for a hierarchy of set names, from coarse to fine levels.',
              },
            ],
          },
          scoreColumn: {
            oneOf: [
              {
                type: 'string',
                description: "The column for the set confidence scores, like 'celltype_prediction_score'",
              },
            ],
          },
        },
      },
    },
  },
};
// OME-TIFF
export const imageOmeTiffSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#image-omeTiff-options',
  title: 'image.ome-tiff options',
  definitions: sharedDefinitions,
  type: 'object',
  required: [],
  properties: {
    offsetsUrl: { type: 'string' },
    coordinateTransformations: { $ref: '#/definitions/omeCoordinateTransformations' },
  },
};
// OME-Zarr (NGFF)
export const imageOmeZarrSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#image-omeZarr-options',
  title: 'image.ome-zarr options',
  definitions: sharedDefinitions,
  type: 'object',
  required: [],
  properties: {
    coordinateTransformations: { $ref: '#/definitions/omeCoordinateTransformations' },
  },
};

/**
 * Options schemas for joint file types.
 */
export const anndataZarrSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#anndata-zarr-options',
  title: 'anndata.zarr options',
  definitions: sharedDefinitions,
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  required: [],
  properties: {
    obsLabels: {
      oneOf: [
        { $ref: '#/definitions/annDataObsLabels' },
        { type: 'array', items: { $ref: '#/definitions/annDataConvenienceObsLabelsItem' } },
      ],
    },
    featureLabels: {
      oneOf: [
        { $ref: '#/definitions/annDataFeatureLabels' },
        { type: 'array', items: { $ref: '#/definitions/annDataConvenienceFeatureLabelsItem' } },
      ],
    },
    obsFeatureMatrix: { $ref: '#/definitions/annDataObsFeatureMatrix' },
    obsSets: { $ref: '#/definitions/annDataObsSets' },
    obsLocations: { $ref: '#/definitions/annDataObsLocations' },
    obsSegmentations: { $ref: '#/definitions/annDataObsSegmentations' },
    obsEmbedding: {
      oneOf: [
        { $ref: '#/definitions/annDataObsEmbedding' },
        { type: 'array', items: { $ref: '#/definitions/annDataConvenienceObsEmbeddingItem' } },
      ],
    },
  },
};
