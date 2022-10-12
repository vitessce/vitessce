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
