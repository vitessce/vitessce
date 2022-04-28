/**
 * Select between a singular and plural version of a word,
 * based on an item count.
 * @param {string} singular The singular version of the word.
 * @param {string} plural The plural version of the word.
 * @param {number} count The number of items.
 * @returns {string} Singular if count is one, else plural.
 */
export function pluralize(singular, plural, count) {
  return (count === 1 ? singular : plural);
}

/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Get a representative PixelSource from a loader object returned from
 * the Vitessce imaging loaders
 * @param {object} loader { data: (PixelSource[]|PixelSource), metadata, channels } object
 * @param {number=} level Level of the multiscale loader from which to get a PixelSource
 * @returns {object} PixelSource object
 */
export function getSourceFromLoader(loader, level) {
  const { data } = loader;
  const source = Array.isArray(data) ? data[(level || data.length - 1)] : data;
  return source;
}

/*
 * Helper method to determine whether pixel data is interleaved and rgb or not.
 * @param {object} loader
 */
export function isRgb(loader) {
  const source = getSourceFromLoader(loader);
  const { shape, dtype, labels } = source;
  const channelSize = shape[labels.indexOf('c')];
  return (channelSize === 3) && dtype === 'Uint8';
}
