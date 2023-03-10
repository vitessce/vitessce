import { z } from 'zod';
import {
  requestInit,
  obsSets,
  coordinationScopeName,
  componentCoordinationScopes,
  componentCoordinationScopesBy,
  obsSetPath,
  rgbArray,
} from './shared';
import {
  imageLayerObj,
  cellsLayerObj,
  moleculesLayerObj,
  neighborhoodsLayerObj,
} from './spatial-layers';

function toUnion<T extends z.ZodTypeAny[]>(schemaArr: T) {
  if (schemaArr.length === 0) return z.null();
  if (schemaArr.length === 1) return schemaArr[0];
  return z.union([
    schemaArr[0],
    schemaArr[1],
    ...schemaArr.slice(2, schemaArr.length),
  ]);
}

function toEnum(schemaArr: string[]) {
  if (schemaArr.length === 0) return z.null();
  if (schemaArr.length === 1) return z.literal(schemaArr[0]);
  return z.enum([schemaArr[0], ...schemaArr.slice(1, schemaArr.length)]);
}

function buildFileDefSchema<T extends z.ZodTypeAny>(fileType: string, options: T) {
  return z.object({
    fileType: z.literal(fileType),
    options: options.optional(),
    url: z.string()
      .optional(),
    requestInit: requestInit
      .describe(
        'The properties of this object correspond to the parameters of the JavaScript fetch() function.',
      )
      .optional(),
    coordinationValues: z.record(z.string())
      .describe(
        'Keys are coordination types. Values are coordination values. Used for matching views to files.',
      )
      .optional(),
  });
}

function buildVitessceSchema<
  T1 extends Record<string, z.ZodTypeAny>,
  T2 extends Record<string, z.ZodTypeAny>,
  T3 extends Record<string, any>,
>(
  pluginFileTypes: T1,
  pluginCoordinationTypes: T2,
  pluginCoordinationTypeDefaults: T3,
  pluginViewTypes: string[],
) {
  const fileTypeSchemas = Object.entries(pluginFileTypes)
    .map(([k, v]) => buildFileDefSchema(k, v));

  const genericFileDef = buildFileDefSchema('any', z.null());

  const fileDefs = toUnion([genericFileDef, ...fileTypeSchemas]);

  return z.object({
    name: z.string(),
    public: z.boolean().optional(),
    description: z.string().optional(),
    datasets: z.array(
      z.object({
        uid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        files: z.array(
          fileDefs,
        ),
      }),
    )
      .describe(
        'The datasets array defines groups of files, where the files within each dataset reference the same entities (cells, genes, cell sets, etc).',
      ),
    // Merge with coordination type schemas.
    coordinationSpace: z.object(pluginCoordinationTypes)
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
        component: toEnum(pluginViewTypes)
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
        coordinationScopes: componentCoordinationScopes
          .optional(),
        coordinationScopesBy: componentCoordinationScopesBy
          .optional(),
      }),
    )
      .describe(
        'The layout array defines the views, or components, rendered in the grid.',
      ),
    initStrategy: z.enum(['none', 'auto'])
      .describe(
        'The initialization strategy determines how missing coordination objects and coordination scope mappings are initially filled in.',
      ),
    version: z.literal('1.0.16')
      .describe('The schema version for the view config.'),
  });
}

export const genericSchema = buildVitessceSchema({}, {}, {}, []);

export const vitessceSchema = buildVitessceSchema({
  // TODO: fileTypes
}, {
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
  spatialImageLayer: z.record(coordinationScopeName, imageLayerObj.nullable()),
  spatialSegmentationLayer: z.record(
    coordinationScopeName,
    z.union([cellsLayerObj, imageLayerObj]),
  ),
  spatialNeighborhoodLayer: z.record(coordinationScopeName, neighborhoodsLayerObj.nullable()),
  spatialPointLayer: z.record(coordinationScopeName, moleculesLayerObj.nullable()),
  heatmapZoomX: z.record(coordinationScopeName, z.number()),
  heatmapZoomY: z.record(coordinationScopeName, z.number()),
  heatmapTargetX: z.record(coordinationScopeName, z.number()),
  heatmapTargetY: z.record(coordinationScopeName, z.number()),
  obsFilter: z.record(coordinationScopeName, z.array(z.string()).nullable()),
  obsHighlight: z.record(coordinationScopeName, z.string().nullable()),
  obsSetSelection: z.record(coordinationScopeName, z.array(obsSetPath).nullable()),
  obsSetHighlight: z.record(coordinationScopeName, obsSetPath.nullable()),
  obsSetColor: z.record(coordinationScopeName, z.array(z.object({
    path: obsSetPath,
    color: rgbArray,
  }))),
  obsColorEncoding: z.record(coordinationScopeName, z.enum(['geneSelection', 'cellSetSelection'])),
  featureFilter: z.record(coordinationScopeName, z.array(z.string()).nullable()),
  featureHighlight: z.record(coordinationScopeName, z.string().nullable()),
  featureSelection: z.record(coordinationScopeName, z.array(z.string()).nullable()),
  featureValueTransform: z.record(coordinationScopeName, z.enum(['log1p', 'arcsinh']).nullable()),
  featureValueTransformCoefficient: z.record(coordinationScopeName, z.number()),
  featureValueColormap: z.record(coordinationScopeName, z.string().nullable()),
  featureValueColormapRange: z.record(coordinationScopeName, z.array(z.number())),
  gatingFeatureSelectionX: z.record(coordinationScopeName, z.string().nullable()),
  gatingFeatureSelectionY: z.record(coordinationScopeName, z.string().nullable()),
  genomicZoomX: z.record(coordinationScopeName, z.number()),
  genomicZoomY: z.record(coordinationScopeName, z.number()),
  genomicTargetX: z.record(coordinationScopeName, z.number()),
  genomicTargetY: z.record(coordinationScopeName, z.number()),
  additionalObsSets: z.record(coordinationScopeName, obsSets.nullable()),
  moleculeHighlight: z.record(coordinationScopeName, z.string().nullable()),
}, {
  // TODO: defaultCoordinationTypes
}, [
  // TODO: view type names
  'description'
]).transform((val) => {
  console.log(val.layout[0].component);
  return val;
});
