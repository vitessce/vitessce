/* eslint-disable camelcase */
import { z } from 'zod';
import { gte as semverGte } from 'semver';
import { OldCoordinationType } from '@vitessce/constants';
import { SCHEMA_HANDLERS, latestConfigSchema } from './previous-config-meta.js';
export function configSchemaToVersion(zodSchema) {
    // eslint-disable-next-line no-underscore-dangle
    return zodSchema.shape.version._def.value;
}
export const VERSIONED_CONFIG_SCHEMAS = {
    ...Object.fromEntries(SCHEMA_HANDLERS.map(([zodSchema]) => {
        // eslint-disable-next-line no-underscore-dangle
        const version = configSchemaToVersion(zodSchema);
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
function refineCoordinationTypes(config, ctx) {
    if ('version' in config) {
        const version = config?.version;
        const deprecatedCoordinationTypes = Object.entries(OldCoordinationType)
            .filter(([prevConstant, v]) => semverGte(version, v[2]))
            .map(([prevConstant]) => prevConstant);
        deprecatedCoordinationTypes.forEach((prevConstant) => {
            const newTypeName = OldCoordinationType[prevConstant][3];
            const prevName = OldCoordinationType[prevConstant][0];
            if ('coordinationSpace' in config
                && typeof config.coordinationSpace === 'object'
                && config.coordinationSpace !== null
                && prevName in config.coordinationSpace) {
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
export function upgradeAndParse(config, onConfigUpgrade = null) {
    // If this is the latest schema version, then no upgrading required.
    if (config?.version === latestConfigSchema.shape.version.value) {
        return latestConfigSchema.parse(config);
    }
    // Otherwise, do an upgrade (potentially multiple).
    // eslint-disable-next-line no-underscore-dangle
    const versions = SCHEMA_HANDLERS.map(([zodSchema]) => configSchemaToVersion(zodSchema));
    if (versions.includes(config?.version)) {
        const versionIndex = versions.indexOf(config.version);
        let upgradable = SCHEMA_HANDLERS[versionIndex][0];
        SCHEMA_HANDLERS.slice(versionIndex, SCHEMA_HANDLERS.length).forEach((versionInfo) => {
            upgradable = upgradable
                .superRefine(refineCoordinationTypes)
                .transform((prevConfig) => {
                const nextConfig = versionInfo[1](prevConfig);
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
