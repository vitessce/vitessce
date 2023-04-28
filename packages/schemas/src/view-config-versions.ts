/* eslint-disable camelcase */
import { z } from 'zod';
import semverGte from 'semver/functions/gte';
import { OldCoordinationType } from '@vitessce/constants';
import { fromEntries } from '@vitessce/utils';
import { SCHEMA_HANDLERS, latestConfigSchema, AnyVersionConfig } from './previous-config-meta';

export const VERSIONED_CONFIG_SCHEMAS: Record<string, z.AnyZodObject> = {
  ...fromEntries(SCHEMA_HANDLERS.map(([zodSchema]) => {
    // eslint-disable-next-line no-underscore-dangle
    const version = zodSchema.shape.version._def.value;
    return [version, zodSchema];
  })),
  // eslint-disable-next-line no-underscore-dangle
  [latestConfigSchema.shape.version._def.value]: latestConfigSchema,
};

/**
 * Check for deprecated coordination types.
 * @param {object} config The parsed config.
 * @param ctx The Zod refinement context.
 */
function refineCoordinationTypes(config: AnyVersionConfig, ctx: z.RefinementCtx) {
  if ('version' in config) {
    const version = config?.version;
    const deprecatedCoordinationTypes = Object.entries(OldCoordinationType)
      .filter(([prevConstant, v]) => semverGte(version, v[2]))
      .map(([prevConstant]) => prevConstant);
    deprecatedCoordinationTypes.forEach((prevConstant) => {
      const newTypeName = (OldCoordinationType as Record<string, string[]>)[prevConstant][3];
      const prevName = (OldCoordinationType as Record<string, string[]>)[prevConstant][0];
      if (
        'coordinationSpace' in config
        && typeof config.coordinationSpace === 'object'
        && config.coordinationSpace !== null
        && prevName in config.coordinationSpace
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The coordination type ${prevName} was changed to ${newTypeName} in view config schema version ${version}`,
          path: ['coordinationSpace', prevName],
        });
      }
      // TODO: check config.layout[].coordinationScopes also?
    });
  }
}

// Run upgrade, then parse against the latest schema built against the registered plugins.
export function upgradeAndParse(
  config: any,
  onConfigUpgrade: ((a: any, b: any) => void)|null = null,
): z.infer<typeof latestConfigSchema> {
  // If this is the latest schema version, then no upgrading required.
  if (config?.version === latestConfigSchema.shape.version.value) {
    return latestConfigSchema.parse(config);
  }
  // Otherwise, do an upgrade (potentially multiple).
  const versions = SCHEMA_HANDLERS.map(d => d[0]);
  if (versions.includes(config?.version)) {
    const versionIndex = versions.indexOf(config.version);
    let upgradable = SCHEMA_HANDLERS[versionIndex][1];
    SCHEMA_HANDLERS.slice(versionIndex, SCHEMA_HANDLERS.length).forEach((versionInfo) => {
      upgradable = upgradable
        .superRefine(refineCoordinationTypes)
        .transform((prevConfig) => {
          const nextConfig = versionInfo[2](prevConfig);
          if (typeof onConfigUpgrade === 'function') {
            onConfigUpgrade(prevConfig, nextConfig);
          }
          return nextConfig;
        });
    });
    upgradable = upgradable.pipe(latestConfigSchema);
    return upgradable.parse(config);
  }
  if (typeof config === 'object' && !('version' in config)) {
    throw new Error('Missing version');
  }
  throw new Error('Config version was not recognized');
}