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
};

/**
 * Options schemas for atomic file types.
 */
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


/**
 * Options schemas for joint file types.
 */
export const cellsJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#cells-json-options',
  title: 'cells.json options',
  oneOf: [
    { type: 'null' },
    {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        obsLabelsTypes: {
          type: 'array',
          items: { type: 'string' },
        },
        embeddingTypes: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  ],
};

export const anndataCellsZarrSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#anndata-cells-zarr-options',
  title: 'anndata-cells.zarr options',
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  required: [],
  properties: {
    xy: {
      type: 'string',
      description: "The location in the AnnData store of cell centroids, like 'obsm/X_centroids.'",
    },
    poly: {
      type: 'string',
      description: "The location in the AnnData store of cell polygon outlines, like 'obsm/X_polygons.'",
    },
    factors: {
      type: 'array',
      description: "List of locations in the AnnData store of cell sets, like 'obs/louvain'",
      items: {
        type: 'string',
      },
    },
    mappings: {
      patternProperties: {
        '.': {
          type: 'object',
          description: "An object containing key-values for mappings like { UMAP: { key: 'obsm/X_umap', dims: [0, 1] } }.",
          additionalProperties: false,
          required: ['key'],
          properties: {
            key: {
              type: 'string',
              description: "Where to look in the AnnData store for this mapping, like 'obsm/X_umap.'",
            },
            dims: {
              type: 'array',
              description: 'Which indices of the obsm object to take for a scatterplot, allowing for, for example, different PCs from obsm/X_pca',
              minItems: 2,
              maxItems: 2,
              items: { type: 'number' },
            },
          },
        },
      },
    },
  },
};

export const anndataCellSetsZarrSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#anndata-cell-sets-zarr-options',
  title: 'anndata-cell-sets.zarr options',
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['groupName', 'setName'],
    properties: {
      groupName: {
        type: 'string',
        description: "The display name for the set, like 'Cell Type' or 'Louvain.'",
      },
      setName: {
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
      scoreName: {
        oneOf: [
          {
            type: 'string',
            description: "The location in the AnnData store for the set confidence scores, like 'obs/celltype_prediction_score.'",
          },
        ],
      },
    },
  },
};

export const anndataExpressionMatrixZarrSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#anndata-expression-matrix-zarr-options',
  title: 'anndata-expression-matrix.zarr options',
  type: 'object',
  additionalProperties: false,
  required: ['matrix'],
  properties: {
    matrix: {
      type: 'string',
      description: "The location in the AnnData store of the cell x gene matrix, like 'obsm/hvg_subset.' or 'X'",
    },
    geneFilter: {
      type: 'string',
      description: "The location in the AnnData store of a filter for the genes if using a subset of the data, like 'var.highly_variable.' if the matrix comes from 'obsm/hvg_subset.'",
    },
    matrixGeneFilter: {
      type: 'string',
      description: "The location in the AnnData store of a filter for the matrix data (used in heatmap and histogram), like 'var.highly_variable.''",
    },
    geneAlias: {
      type: 'string',
      description: 'The location in the AnnData store of a different list of names for gene list component, other than the `var` index',
    },
  },
};

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
