export function logConfig(config: any, name: any): void;
/**
 * Get a list of all unique scope names for a
 * particular coordination type, which exist in
 * a particular view config.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @returns {string[]} Array of existing coordination scope names.
 */
export function getExistingScopesForCoordinationType(config: object, coordinationType: string): string[];
/**
 * Initialize the view config:
 * - Fill in missing coordination objects with default values.
 * - Fill in missing component coordination scope mappings.
 *   based on the `initStrategy` specified in the view config.
 * - Fill in missing view uid values.
 * - Expand convenience file types.
 * Should be "stable": if run on the same view config twice, the return value the second
 * time should be identical to the return value the first time.
 * @param {object} config The view config prop.
 * @param {PluginJointFileType[]} jointFileTypes
 * @param {PluginCoordinationType[]} coordinationTypes
 * @param {PluginViewType[]} viewTypes
 * @returns The initialized view config.
 */
export function initialize(config: object, jointFileTypes: PluginJointFileType[], coordinationTypes: PluginCoordinationType[], viewTypes: PluginViewType[]): {
    uid: any;
    layout: any;
};
//# sourceMappingURL=view-config-utils.d.ts.map