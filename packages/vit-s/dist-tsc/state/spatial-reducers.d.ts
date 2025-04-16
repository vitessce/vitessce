/**
 * Get the name of the metaCoordinationScopes coordination scope
 * for a particular non-meta coordination scope, after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @param {string} parameter The parameter for which to get the metaScope.
 * @returns {string|undefined} The metaCoordinationScopes coordination scope name.
 */
export function getMetaScope(coordinationScopes: any, coordinationSpace: any, parameter: string): string | undefined;
/**
 * Get the name of the metaCoordinationScopesBy coordination scope
 * for a particular non-meta coordination scope, after accounting for
 * meta-coordination.
 * @param {*} coordinationScopes The coordinationScopes for a view.
 * @param {*} coordinationSpace The coordinationSpace for a config.
 * @param {string} byParameter The byParameter for which to get the metaScope.
 * @param {string} parameter The parameter for which to get the metaScope.
 * @param {string} byScope The byScope for the byParameter in which to look for the metaScope.
 * @returns {string|undefined} The metaCoordinationScopesBy coordination scope name.
 */
export function getMetaScopeBy(coordinationScopes: any, coordinationSpace: any, byParameter: string, parameter: string, byScope: string): string | undefined;
export function removeImageChannelInMetaCoordinationScopesHelper(coordinationScopesRaw: any, layerScope: any, channelScope: any, coordinationSpace: any): any;
export function addImageChannelInMetaCoordinationScopesHelper(coordinationScopesRaw: any, layerScope: any, coordinationSpace: any): any;
//# sourceMappingURL=spatial-reducers.d.ts.map