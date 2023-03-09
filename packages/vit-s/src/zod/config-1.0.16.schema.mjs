import { z } from 'zod';

const coordinationTypeName = z.string();
const coordinationScopeName = z.string();

const stringOrStringArray = z.union([
  z.string(),
  z.array(z.string()),
]);

const oneOrMoreCoordinationScopeNames = stringOrStringArray;

const componentCoordinationScopes = z.record(coordinationTypeName, oneOrMoreCoordinationScopeNames);

const componentCoordinationScopesBy = z.record(
  coordinationTypeName,
  z.record(
    coordinationTypeName,
    z.record(coordinationScopeName, oneOrMoreCoordinationScopeNames),
  ),
);

const spatialImageLayer = z.array(
  z.object({
    channels: z.array(
      z.object({
        color: z.array(z.number())
          .describe(
            'The color to use when rendering this channel under the null colormap.',
          )
          .optional(),
        selection: z.record(z.any())
          .describe(
            'Determines the channel selection, e.g. some Z and time slice.',
          ),
        slider: z.array(z.number())
          .describe('Determines the range for color mapping.')
          .optional(),
        visible: z.boolean()
          .describe(
            'Determines whether this channel of the layer will be rendered in the spatial component.',
          )
          .optional(),
      })
        .strict(),
    ),
    colormap: z.string()
      .nullable(),
    transparentColor: z.array(z.number().describe('One of R G or B (0 - 255).'))
      .min(3)
      .max(3)
      .describe('Determines the color to be set to opacity 0')
      .nullable()
      .optional(),
    index: z
      .number()
      .describe(
        'The index of the layer among the array of layers available in the image file.',
      ),
    opacity: z.number(),
    modelMatrix: z.array(z.number())
      .min(16)
      .max(16)
      .describe('transformation matrix for this layer')
      .optional(),
    domainType: z.enum(['Full', 'Min/Max'])
      .describe(
        'Determines the extent of the channel slider input element in the layer controller.',
      )
      .optional(),
    resolution: z.number()
      .describe('Resolution of 3D volumetric rendering')
      .optional(),
    xSlice: z.array(z.any())
      .min(2)
      .max(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    renderingMode: z
      .string()
      .describe('Rendering mode of 3D volumetric rendering')
      .optional(),
    ySlice: z.array(z.any())
      .min(2)
      .max(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    zSlice: z.array(z.any())
      .min(2)
      .max(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    type: z.enum(['raster', 'bitmask'])
      .optional(),
    use3d: z.boolean()
      .optional(),
    visible: z
      .boolean()
      .describe(
        'Determines whether this entire layer will be rendered in the spatial component.',
      )
      .optional(),
  })
    .strict()
    .describe(
      'The properties of this object are the rendering settings for the raster layer.',
    ),
);

const cellsLayer = z.object({
  visible: z.boolean(),
  stroked: z.boolean(),
  radius: z.number(),
  opacity: z.number(),
});

const neighborhoodsLayer = z.object({
  visible: z.boolean(),
});

const moleculesLayer = z.object({
  visible: z.boolean(),
  radius: z.number(),
  opacity: z.number(),
});

const colorArray = z.array(z.number())
  .min(3)
  .max(3);

const treeNodeBase = z.object({
  name: z.string(),
  color: colorArray.optional(),
});

const treeNodeLeaf = treeNodeBase.extend({
  set: z.array(z.string()),
});

const treeNodeNonLeaf = treeNodeBase.extend({
  children: z.lazy(() => z.array(z.union([treeNodeNonLeaf, treeNodeLeaf]))),
});

const cellSets2 = z.object({
  version: z.literal('0.1.2'),
  tree: z.array(treeNodeNonLeaf),
});

const treeNodeLeafProbabilistic = treeNodeBase.extend({
  set: z.array(z.tuple([z.string(), z.number().nullable()])),
});

const treeNodeNonLeafProbabilistic = treeNodeBase.extend({
  children: z.lazy(() => z.array(
    z.union([treeNodeNonLeafProbabilistic, treeNodeLeafProbabilistic]),
  )),
});

const cellSets3 = z.object({
  version: z.literal('0.1.3'),
  tree: z.array(treeNodeNonLeafProbabilistic),
});

const cellSetsSchema = z.union([cellSets2, cellSets3]);

const requestInitSchema = z.object({
  method: z.string().optional(),
  headers: z.record(z.any()).optional(),
  body: z.string().optional(),
  mode: z.string().optional(),
  credentials: z.string().optional(),
  cache: z.string().optional(),
  redirect: z.string().optional(),
  referrer: z.string().optional(),
  integrity: z.string().optional(),
});

export const schema = z.object({
  name: z.string(),
  public: z.boolean().optional(),
  description: z.string().optional(),
  datasets: z.array(
    z.object({
      uid: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      files: z.array(
        z.object({
          name: z.string()
            .optional(),
          type: z.string()
            .optional(),
          fileType: z.string(),
          url: z.string()
            .optional(),
          options: z.union([
            // TODO?
            z.object().catchall(),
            z.array(z.any()),
          ])
            .optional(),
          requestInit: requestInitSchema
            .strict()
            .describe(
              'The properties of this object correspond to the parameters of the JavaScript fetch() function.',
            )
            .optional(),
          coordinationValues: z.record(z.string())
            .describe(
              'Keys are coordination types. Values are coordination values. Used for matching views to files.',
            )
            .optional(),
        })
          .strict(),
      ),
    })
      .strict(),
  )
    .describe(
      'The datasets array defines groups of files, where the files within each dataset reference the same entities (cells, genes, cell sets, etc).',
    ),
  coordinationSpace: z.object({
    dataset: z.record(coordinationScopeName, z.string()),
    obsType: z.record(coordinationScopeName, z.string()),
    featureType: z.record(coordinationScopeName, z.string()),
    featureValueType: z.record(coordinationScopeName, z.string()),
    obsLabelsType: z.record(coordinationScopeName, z.string().nullable()),
    embeddingZoom: z.record(coordinationScopeName, z.number().nullable()),
    embeddingRotation: z.record(coordinationScopeName, z.number().nullable()),
    embeddingTargetX: z.record(coordinationScopeName, z.number().nullable()),
    embeddingTargetY: z.record(coordinationScopeName, z.number().nullable()),
    embeddingTargetZ: z.record(coordinationScopeName, z.number().nullable()),
    embeddingType: z.record(coordinationScopeName, z.string()),
    embeddingObsSetPolygonsVisible: z.record(coordinationScopeName, z.boolean()),
    embeddingObsSetLabelsVisible: z.record(coordinationScopeName, z.boolean()),
    embeddingObsSetLabelSize: z.record(coordinationScopeName, z.number()),
    embeddingObsRadius: z.record(coordinationScopeName, z.number()),
    embeddingObsOpacity: z.record(coordinationScopeName, z.number()),
    embeddingObsRadiusMode: z.record(coordinationScopeName, z.enum(['manual', 'auto'])),
    embeddingObsOpacityMode: z.record(coordinationScopeName, z.enum(['manual', 'auto'])),
    spatialZoom: z.record(coordinationScopeName, z.number().nullable()),
    spatialRotation: z.record(coordinationScopeName, z.number().nullable()),
    spatialTargetX: z.record(coordinationScopeName, z.number().nullable()),
    spatialTargetY: z.record(coordinationScopeName, z.number().nullable()),
    spatialTargetZ: z.record(coordinationScopeName, z.number().nullable()),
    spatialRotationX: z.record(coordinationScopeName, z.number().nullable()),
    spatialRotationY: z.record(coordinationScopeName, z.number().nullable()),
    spatialRotationZ: z.record(coordinationScopeName, z.number().nullable()),
    spatialRotationOrbit: z.record(coordinationScopeName, z.number().nullable()),
    spatialOrbitAxis: z.record(coordinationScopeName, z.string().nullable()),
    spatialAxisFixed: z.record(coordinationScopeName, z.boolean().nullable()),
    spatialImageLayer: z.record(coordinationScopeName, spatialImageLayer.nullable()),
    spatialSegmentationLayer: z.record(
      coordinationScopeName,
      z.union([cellsLayer, spatialImageLayer]),
    ),
    spatialNeighborhoodLayer: z.record(coordinationScopeName, neighborhoodsLayer.nullable()),
    spatialPointLayer: z.record(coordinationScopeName, moleculesLayer.nullable()),
    heatmapZoomX: z.record(coordinationScopeName, z.number()),
    heatmapZoomY: z.record(coordinationScopeName, z.number()),
    heatmapTargetX: z.record(coordinationScopeName, z.number()),
    heatmapTargetY: z.record(coordinationScopeName, z.number()),
    obsFilter: z.record(coordinationScopeName, z.array(z.string()).nullable()),
    obsHighlight: z.record(coordinationScopeName, z.string().nullable()),
    obsSetSelection: z.record(coordinationScopeName, z.array().nullable()),
    obsSetHighlight: z.record(coordinationScopeName, z.string().nullable()),
    obsSetColor: z.record(coordinationScopeName, z.array(z.object({
      path: z.array(z.string()),
      color: z.array(z.number()),
    }))),
    obsColorEncoding: z.record(coordinationScopeName, z.enum(['geneSelection', 'cellSetSelection'])),
    featureFilter: z.record(coordinationScopeName, z.array(z.string()).nullable()),
    featureHighlight: z.record(coordinationScopeName, z.string().nullable()),
    featureSelection: z.record(coordinationScopeName, z.array(z.string()).nullable()),
    featureValueTransform: z.record(coordinationScopeName, z.enum(['log1p', 'arcsinh']).nullable()),
    featureValueTransformCoefficient: z.record(coordinationScopeName, z.number()),
    featureValueColormap: z.record(coordinationScopeName, z.string()),
    featureValueColormapRange: z.record(coordinationScopeName, z.array(z.number())),
    gatingFeatureSelectionX: z.record(coordinationScopeName, z.string().nullable()),
    gatingFeatureSelectionY: z.record(coordinationScopeName, z.string().nullable()),
    genomicZoomX: z.record(coordinationScopeName, z.number()),
    genomicZoomY: z.record(coordinationScopeName, z.number()),
    genomicTargetX: z.record(coordinationScopeName, z.number()),
    genomicTargetY: z.record(coordinationScopeName, z.number()),
    additionalObsSets: z.record(coordinationScopeName, cellSetsSchema.nullable()),
    moleculeHighlight: z.record(coordinationScopeName, z.string().nullable()),
  })
    .catchall(z.record(coordinationScopeName, z.any()))
    .describe(
      'The coordination space stores the values for each scope of each coordination object.',
    )
    .optional(),
  layout: z.array(
    z.object({
      uid: z.string()
        .describe(
          'A unique identifier for the view, to refer to it in getter and setter functions in object-oriented contexts.',
        )
        .optional(),
      component: z.string()
        .describe(
          'Specify a component using a name defined in the component registry.',
        ),
      props: z.record(z.any())
        .describe('Extra prop values for the component.')
        .optional(),
      x: z.number().int(),
      y: z.number().int(),
      w: z.number().int().optional(),
      h: z.number().int().optional(),
      coordinationScopes: componentCoordinationScopes,
      coordinationScopesBy: componentCoordinationScopesBy,
    })
      .strict(),
  )
    .describe(
      'The layout array defines the views, or components, rendered in the grid.',
    ),
  initStrategy: z.enum(['none', 'auto'])
    .describe(
      'The initialization strategy determines how missing coordination objects and coordination scope mappings are initially filled in.',
    ),
  version: z.enum(['1.0.16'])
    .describe('The schema version for the view config.'),
})
  .strict();
