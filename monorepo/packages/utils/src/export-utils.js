import Bowser from 'bowser';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const CURRENT_VERSION = '0.0.1';
const VITESSCE_CONF_QUERY_STRING = 'vitessce_conf';
const VERSION_QUERY_STRING = 'vitessce_conf_version';
const LENGTH_QUERY_STRING = 'vitessce_conf_length';

function sniffBrowser() {
  const { browser } = Bowser.parse(window.navigator.userAgent);
  return browser.name;
}

// https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
const MAX_BROWSER_URL_LENGTHS = {
  Chrome: 32779,
  'Internet Explorer': 2047,
  Edge: 2047,
  Safari: 65000,
  Firefox: 65000,
};

export default class CompressedConfLengthError {
  constructor(message) {
    this.message = message;
  }
}

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
export function encodeConfInUrl({
  conf,
  onOverMaximumUrlLength = () => { },
}) {
  const compressedConf = compressToEncodedURIComponent(JSON.stringify(conf));
  const newParams = `${LENGTH_QUERY_STRING}=${compressedConf.length}&${VERSION_QUERY_STRING}=${CURRENT_VERSION}&${VITESSCE_CONF_QUERY_STRING}=${compressedConf}`;
  const browser = sniffBrowser();
  const maxLength = MAX_BROWSER_URL_LENGTHS[browser];
  if (newParams.length > maxLength) {
    const willWorkOn = Object.entries(MAX_BROWSER_URL_LENGTHS)
      .filter(entry => entry[1] > newParams.length)
      .map(entry => entry[0]);
    const message = `Configuration is ${compressedConf.length} characters; max URL for ${browser} is ${maxLength}: it will work on ${willWorkOn.join(', ') || 'no browser'}.`;
    console.error(message);
    onOverMaximumUrlLength({ message, willWorkOn });
  }
  return newParams;
}

/**
 * Decode URL params to a Vitessce configuration.
 * The URL params must have version and vitessce_conf params,
 * like vitessce_conf_length=10&vitessce_conf_version=0.0.1&vitessce_conf=fksdfasdfjkl.
 * @param {Object} queryString The URL params,
 * like vitessce_conf_length=10&vitessce_conf_version=0.0.1&vitessce_conf=fksdfasdfjkl.
 * @returns {string} A vitessce configuration.
 */
export function decodeURLParamsToConf(queryString) {
  const params = new URLSearchParams(queryString.replace('#', '&'));
  const compressedConfString = params.get(VITESSCE_CONF_QUERY_STRING);
  const expectedConfLength = Number(params.get(LENGTH_QUERY_STRING));
  if (expectedConfLength !== compressedConfString.length) {
    throw new CompressedConfLengthError(`Compressed conf length (${compressedConfString.length}) != expected (${expectedConfLength}). URL truncated?`);
  }
  const version = params.get(VERSION_QUERY_STRING);
  if (version === CURRENT_VERSION) {
    const conf = JSON.parse(decompressFromEncodedURIComponent(compressedConfString));
    return conf;
  }
  throw new Error('Unrecognized URL Param Version');
}
