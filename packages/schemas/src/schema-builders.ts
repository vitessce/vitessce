import { z } from 'zod';
import { fromEntries } from '@vitessce/utils';
import {
  PluginViewType,
  PluginCoordinationType,
  PluginFileType,
  PluginJointFileType,
} from '@vitessce/plugins';
import {
  requestInit,
  coordinationScopeName,
  componentCoordinationScopes,
  componentCoordinationScopesBy,
} from './shared';

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

export function buildConfigSchema<
  T1 extends PluginFileType<any, any, z.ZodTypeAny>,
  T2 extends PluginJointFileType<z.ZodTypeAny>,
  T3 extends PluginCoordinationType<z.ZodTypeAny>,
>(
  pluginFileTypes: Array<T1>,
  pluginJointFileTypes: Array<T2>,
  pluginCoordinationTypes: Array<T3>,
  pluginViewTypes: Array<PluginViewType>,
) {
  const fileTypeSchemas = [...pluginFileTypes, ...pluginJointFileTypes]
    .map(ft => buildFileDefSchema(ft.name, ft.optionsSchema));

  const fileDefs = toUnion(fileTypeSchemas);

  // TODO: make this less redundant with latestSchema from ./previous-base-schemas
  return z.object({
    version: z.literal('1.0.16')
      .describe('The schema version for the view config.'),
    uid: z.string().optional(),
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
    coordinationSpace: z.object(
      // Wrap each value schema in z.record()
      fromEntries(
        pluginCoordinationTypes
          .map(ct => ([
            ct.name,
            z.record(
              coordinationScopeName,
              ct.valueSchema.optional(),
            ).optional(),
          ])),
      ),
    )
      .strict()
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
        component: toEnum(pluginViewTypes.map(vt => vt.name))
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
  });
}
