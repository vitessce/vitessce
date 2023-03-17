/* eslint-disable camelcase */
import { z } from 'zod';
import semverGte from 'semver/functions/gte';
import { OldCoordinationType } from '@vitessce/constants';
import {
  configSchema0_1_0,
  configSchema1_0_0,
  configSchema1_0_1,
  configSchema1_0_2,
  configSchema1_0_3,
  configSchema1_0_4,
  configSchema1_0_5,
  configSchema1_0_6,
  configSchema1_0_7,
  configSchema1_0_8,
  configSchema1_0_9,
  configSchema1_0_10,
  configSchema1_0_11,
  configSchema1_0_12,
  configSchema1_0_13,
  configSchema1_0_14,
  configSchema1_0_15,
  AnyVersionConfig,
  UpgradeFunction,
  latestConfigSchema,
} from './previous-base-schemas';
import {
  upgradeFrom0_1_0,
  upgradeFrom1_0_0,
  upgradeFrom1_0_1,
  upgradeFrom1_0_2,
  upgradeFrom1_0_3,
  upgradeFrom1_0_4,
  upgradeFrom1_0_5,
  upgradeFrom1_0_6,
  upgradeFrom1_0_7,
  upgradeFrom1_0_8,
  upgradeFrom1_0_9,
  upgradeFrom1_0_10,
  upgradeFrom1_0_11,
  upgradeFrom1_0_12,
  upgradeFrom1_0_13,
  upgradeFrom1_0_14,
  upgradeFrom1_0_15,
} from './view-config-upgraders';

export const SCHEMA_HANDLERS: [string, z.ZodTypeAny, UpgradeFunction][] = [
  ['0.1.0', configSchema0_1_0, upgradeFrom0_1_0],
  ['1.0.0', configSchema1_0_0, upgradeFrom1_0_0],
  ['1.0.1', configSchema1_0_1, upgradeFrom1_0_1],
  ['1.0.2', configSchema1_0_2, upgradeFrom1_0_2],
  ['1.0.3', configSchema1_0_3, upgradeFrom1_0_3],
  ['1.0.4', configSchema1_0_4, upgradeFrom1_0_4],
  ['1.0.5', configSchema1_0_5, upgradeFrom1_0_5],
  ['1.0.6', configSchema1_0_6, upgradeFrom1_0_6],
  ['1.0.7', configSchema1_0_7, upgradeFrom1_0_7],
  ['1.0.8', configSchema1_0_8, upgradeFrom1_0_8],
  ['1.0.9', configSchema1_0_9, upgradeFrom1_0_9],
  ['1.0.10', configSchema1_0_10, upgradeFrom1_0_10],
  ['1.0.11', configSchema1_0_11, upgradeFrom1_0_11],
  ['1.0.12', configSchema1_0_12, upgradeFrom1_0_12],
  ['1.0.13', configSchema1_0_13, upgradeFrom1_0_13],
  ['1.0.14', configSchema1_0_14, upgradeFrom1_0_14],
  ['1.0.15', configSchema1_0_15, upgradeFrom1_0_15],
];

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
