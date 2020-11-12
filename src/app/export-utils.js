import Bowser from 'bowser';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const CURRENT_VERSION = '0.0.1';
const VITESSCE_CONF_QUERY_STRING = 'vitessce_conf';
const VERSION_QUERY_STRING = 'version';
const LENGTH_QUERY_STRING = 'conf_length';

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

/**
 * Encode a configuration as url params with a version and an lz-compressed conf.
 * @param {Object} params
 * @param {Object} params.conf Previous scope names.
 * @param {Object} params.baseUrl The URL to which the params should be appended.
 * @param {function} params.onOverMaximumUrlLength Callback for when new url
 * is over max length for your browser (optional).
 * @param {Object} params.confParameter The parameter to use instead of vitessce_conf for
 * the view config in the URL (optional).
 * @returns {string} The URL like https://example.com/conf_length=10&version=0.0.1#vitessce_conf=fksdfasdfjkl
 */
export function encodeConfInUrl({
  conf,
  baseUrl,
  onOverMaximumUrlLength = () => { },
  confParameter,
}) {
  const compressedConf = compressToEncodedURIComponent(JSON.stringify(conf));
  const newUrl = `${baseUrl}?${LENGTH_QUERY_STRING}=${compressedConf.length}&${VERSION_QUERY_STRING}=${CURRENT_VERSION}#${confParameter || VITESSCE_CONF_QUERY_STRING}=${compressedConf}`;
  const browser = sniffBrowser();
  const maxLength = MAX_BROWSER_URL_LENGTHS[browser];
  if (newUrl.length > maxLength) {
    let message;
    if (newUrl.length < MAX_BROWSER_URL_LENGTHS.Firefox) {
      message = `URL is too long to be used in current browser ${browser} but will work in Firefox or Safari.`;
    } else if (newUrl.length < MAX_BROWSER_URL_LENGTHS.Chrome) {
      message = `URL is too long to be used in current browser ${browser} but will work in Firefox, Chrome, or Safari.`;
    } else if (newUrl.length > MAX_BROWSER_URL_LENGTHS.Firefox) {
      message = 'URL is too long to be used reliably in modern browsers.';
    }
    console.error(message);
    onOverMaximumUrlLength(message);
  }
  return newUrl;
}

/**
 * Decode URL params to a Vitessce configuration.
 * The URL params must have version and vitessce_conf params,
 * like conf_length=10&version=0.0.1#vitessce_conf=fksdfasdfjkl.
 * @param {Object} queryString The URL params,
 * like conf_length=10&version=0.0.1#vitessce_conf=fksdfasdfjkl.
 * @param {Object} confParameter The parameter to use instead of vitessce_conf
 * for the view config in the URL (optional).
 * @returns {string} A vitessce configuration.
 */
export function decodeURLParamsToConf(queryString, confParameter) {
  const params = new URLSearchParams(queryString.replace('#', '&'));
  const compressedConfString = params.get(confParameter || VITESSCE_CONF_QUERY_STRING);
  const expectedConfLength = Number(params.get(LENGTH_QUERY_STRING));
  if (expectedConfLength !== compressedConfString.length) {
    throw new Error('Compressed conf string length was different than expected.  URL param containing view conf could be truncated.');
  }
  const version = params.get(VERSION_QUERY_STRING);
  if (version === CURRENT_VERSION) {
    const conf = JSON.parse(decompressFromEncodedURIComponent(compressedConfString));
    return conf;
  }
  throw new Error('Unrecognized URL Param Version');
}
