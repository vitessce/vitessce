import { z } from 'zod';
import cloneDeep from 'lodash/cloneDeep';
import { OldCoordinationType } from '@vitessce/constants';
import { coordinationScopeName, requestInit } from './shared';

// TODO: define base schemas for previous config versions.
const configSchema1_0_0 = z.object({
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
          name: z.string().optional(),
          type: z.string().optional(),
          fileType: z.string(),
          url: z.string().optional(),
          options: z.union([z.object({}), z.array(z.any())]).optional(),
          requestInit,
        }),
      ),
    }),
  )
    .describe(
      'The datasets array defines groups of files, where the files within each dataset reference the same entities (cells, genes, cell sets, etc).',
    ),
  // Merge with coordination type schemas.
  coordinationSpace: z.object({})
    .catchall(z.record(coordinationScopeName, z.any()))
    .describe(
      'The coordination space stores the values for each scope of each coordination object.',
    )
    .optional(),
  layout: z.array(
    z.object({
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
      coordinationScopes: z.record(z.string())
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
  version: z.literal('1.0.0')
    .describe('The schema version for the view config.'),
});

const configSchema1_0_1 = configSchema1_0_0.extend({
  version: z.literal('1.0.1'),
});

export const upgradedConfigSchema1_0_1 = configSchema1_0_0.transform((oldConfig) => {
  // TODO: use upgrade functions
  const newConfig = cloneDeep(oldConfig) as z.infer<typeof configSchema1_0_0>;
  const nextVersion = '1.0.1';
  Object.values(OldCoordinationType).forEach((oldType) => {
    const [oldName, description, deprecatedIn, newName] = oldType;
    if (deprecatedIn === nextVersion) {
      if (newConfig.coordinationSpace && oldName in newConfig.coordinationSpace) {
        if (newName !== null) {
          newConfig.coordinationSpace[newName] = newConfig.coordinationSpace[oldName];
          delete newConfig.coordinationSpace[oldName];
          newConfig.layout.forEach((viewDef) => {
            if (viewDef.coordinationScopes && oldName in viewDef.coordinationScopes) {
              viewDef.coordinationScopes[newName] = viewDef.coordinationScopes[oldName];
              delete viewDef.coordinationScopes[oldName];
            }
          });
        } else {
          // TODO: not as simple as name change
        }
      }
    }
  });
  return {
    ...newConfig,
    version: '1.0.1',
  };
}).pipe(configSchema1_0_1);
