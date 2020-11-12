import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const CURRENT_VERSION = '0.0.1';
const VITESSCE_CONF_QUERY_STRING = 'vitessce_conf';
const VERSION_QUERY_STRING = 'version';

/**
 * Encode a configuration as url params with a version and an lz-compressed conf.
 * @param {Object} conf Previous scope names.
 * @param {Object} confParameter The parameter to use instead of vitessce_conf for
 * the view config in the URL (optional).
 * @returns {string} The URL params as a string like version=0.0.1#vitessce_conf=fksdfasdfjkl
 */
export function encodeConfAsURLParams(conf, confParameter) {
  const compressedConf = compressToEncodedURIComponent(JSON.stringify(conf));
  const params = `${VERSION_QUERY_STRING}=${CURRENT_VERSION}#${confParameter || VITESSCE_CONF_QUERY_STRING}=${compressedConf}`;
  return params;
}

/**
 * Decode URL params to a Vitessce configuration.
 * The URL params must have version and vitessce_conf params,
 * like vitessce_conf=fksdfasdfjkl&version=0.0.1.
 * @param {Object} queryString The URL params, like version=0.0.1#vitessce_conf=fksdfasdfjkl.
 * @param {Object} confParameter The parameter to use instead of vitessce_conf
 * for the view config in the URL (optional).
 * @returns {string} A vitessce configuration.
 */
export function decodeURLParamsToConf(queryString, confParameter) {
  const params = new URLSearchParams(queryString.replace('#', '&'));
  const compressedConfString = params.get(confParameter || VITESSCE_CONF_QUERY_STRING);
  const version = params.get(VERSION_QUERY_STRING);
  if (version === CURRENT_VERSION) {
    const conf = JSON.parse(decompressFromEncodedURIComponent(compressedConfString));
    return conf;
  }
  throw new Error('Unrecognized Version');
}
