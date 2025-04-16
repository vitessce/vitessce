/**
 * Encode a configuration as url params with a version and an lz-compressed conf.
 * @param {Object} params
 * @param {Object} params.conf Previous scope names.
 * @param {function} params.onOverMaximumUrlLength Callback for when new url
 * is over max length for your browser - takes two arguments: { message, willWorkOn }
 * for the error message and the browsers for which the url will work (optional).
 * @returns {string} The new params like
 * vitessce_conf_length=10&vitessce_conf_version=0.0.1&vitessce_conf=fksdfasdfjkl
 */
export function encodeConfInUrl({ conf, onOverMaximumUrlLength, }: {
    conf: Object;
    onOverMaximumUrlLength: Function;
}): string;
/**
 * Decode URL params to a Vitessce configuration.
 * The URL params must have version and vitessce_conf params,
 * like vitessce_conf_length=10&vitessce_conf_version=0.0.1&vitessce_conf=fksdfasdfjkl.
 * @param {Object} queryString The URL params,
 * like vitessce_conf_length=10&vitessce_conf_version=0.0.1&vitessce_conf=fksdfasdfjkl.
 * @returns {string} A vitessce configuration.
 */
export function decodeURLParamsToConf(queryString: Object): string;
export default class CompressedConfLengthError {
    constructor(message: any);
    message: any;
}
//# sourceMappingURL=export-utils.d.ts.map