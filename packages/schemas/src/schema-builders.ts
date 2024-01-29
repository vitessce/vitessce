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
  componentCoordinationScopes,
  componentCoordinationScopesBy,
} from './shared.js';
import { latestConfigSchema } from './previous-config-meta.js';
import { configSchemaToVersion } from './view-config-versions.js';

/**
 * Convert an array of strings into a Zod enum schema,
 * bypassing the need for the input array to have
 * at least two elements.
 * @param schemaArr Array of strings.
 * @returns Zod enum schema.
 */
function toEnum(schemaArr: string[]) {
  if (schemaArr.length === 0) return z.null();
  if (schemaArr.length === 1) return z.literal(schemaArr[0]);
  return z.enum([schemaArr[0], ...schemaArr.slice(1, schemaArr.length)]);
}

/**
 * Build a Zod schema for a file definition.
 * The builder pattern allows the returned
 * Zod schema to be typed despite not knowing
 * the file type name or options sub-schema in advance,
 * which is the case for plugin file types in particular.
 * @param fileType The file type name.
 * @param options Zod schema for the file definition options.
 * @returns Zod object schema for the file definition.
 */
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

type FileDefSchema = ReturnType<typeof buildFileDefSchema>;

/**
 * Convert an array of Zod schemas into a Zod union schema,
 * bypassing the need for the input array to have
 * at least two elements.
 * @param schemaArr Array of Zod schemas.
 * @returns Zod union schema.
 */
function toFileDefUnion<T extends FileDefSchema>(schemaArr: T[]) {
  if (schemaArr.length === 0) return z.null();
  if (schemaArr.length === 1) return schemaArr[0];
  return z.discriminatedUnion('fileType', [
    schemaArr[0],
    schemaArr[1],
    ...schemaArr.slice(2, schemaArr.length),
  ]);
}

/**
 * Build a Zod schema for the latest Vitessce config,
 * which is specific to any registered plugins.
 * The builder pattern allows the returned
 * Zod schema to be typed despite not knowing
 * the plugin names or sub-schemas in advance.
 * @param pluginFileTypes
 * @param pluginJointFileTypes
 * @param pluginCoordinationTypes
 * @param pluginViewTypes
 * @returns The Zod schema.
 */
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

  const fileDefs = toFileDefUnion(fileTypeSchemas);

  // TODO: make this less redundant with latestSchema from ./previous-base-schemas
  return z.object({
    // eslint-disable-next-line no-underscore-dangle
    version: z.literal(configSchemaToVersion(latestConfigSchema))
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
              // For now, assume the key type is string (though it would be
              // slightly nicer if we could use the coordinationScopeName schema here).
              // Once https://github.com/colinhacks/zod/issues/2746 gets resolved
              // then we can try that approach again, but it should not be a big deal.
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
