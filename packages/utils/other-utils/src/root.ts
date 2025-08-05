/* eslint-disable no-plusplus */
// Originally in src/utils.js
import plur from 'pluralize';

plur.addPluralRule('glomerulus', 'glomeruli');
plur.addPluralRule('interstitium', 'interstitia');

export function commaNumber(n: number) {
  const nf = new Intl.NumberFormat('en-US');
  return nf.format(n);
}

/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export function capitalize(word: string | null) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : '';
}

/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export function pluralize(word: string, count: number | null = null) {
  return plur(word, count);
}

/**
 * Get the longest string in the array of strings.
 * @param {string[]} strings The array of strings.
 * @returns The longest string.
 */
export function getLongestString(strings: string[]) {
  return strings.reduce(
    (prevLongest, currentValue) => (
      prevLongest.length > currentValue.length ? prevLongest : currentValue
    ),
  );
}

/**
 * Try to clean up a gene ID.
 * For example, remove the version number from an ENSG ID.
 * @param {string} featureName A gene ID.
 * @returns {string} The cleaned gene ID.
 */
export function cleanFeatureId(featureName: string) {
  if (featureName.startsWith('ENSG')) {
    // Strip the version number from the ENSG ID.
    return featureName.split('.')[0];
  }
  return featureName;
}

/**
 * Generate a new scope name which does not
 * conflict / overlap with a previous scope name.
 * Really these just need to be unique within the coordination object.
 * So in theory they could be String(Math.random()) or uuidv4() or something.
 * However it may be good to make them more human-readable and memorable
 * since eventually we will want to expose a UI to update the coordination.
 * @param {string[]} prevScopes Previous scope names.
 * @returns {string} The new scope name.
 */
export function getNextScope(prevScopes: string[]) {
  // Keep an ordered list of valid characters.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Store the value of the next character for each position
  // in the new string.
  // For example, [0] -> "A", [1] -> "B", [0, 1] -> "AB"
  const nextCharIndices = [0];

  // Generate a new scope name,
  // potentially conflicting with an existing name.
  // Reference: https://stackoverflow.com/a/12504061
  function next() {
    const r: string[] = [];
    nextCharIndices.forEach((charIndex) => {
      r.unshift(chars[charIndex]);
    });
    let increment = true;
    for (let i = 0; i < nextCharIndices.length; i++) {
      const val = ++nextCharIndices[i];
      if (val >= chars.length) {
        nextCharIndices[i] = 0;
      } else {
        increment = false;
        break;
      }
    }
    if (increment) {
      nextCharIndices.push(0);
    }
    return r.join('');
  }

  let nextScope;
  do {
    nextScope = next();
  } while (prevScopes.includes(nextScope));
  return nextScope;
}

/**
 * Generate a new scope name which does not
 * conflict / overlap with a previous scope name.
 * Really these just need to be unique within the coordination object.
 * So in theory they could be String(Math.random()) or uuidv4() or something.
 * In this version we use an incrementing integer starting from 0.
 * @param {string[]} prevScopes Previous scope names.
 * @returns {string} The new scope name.
 */
export function getNextScopeNumeric(prevScopes: string[]) {
  let nextScopeInt = 0;
  let nextScopeStr: string;
  do {
    nextScopeStr = `${nextScopeInt}`;
    nextScopeInt += 1;
  } while (prevScopes.includes(nextScopeStr));
  return nextScopeStr;
}

/**
 * Generate a getNextScopeNumeric function which includes a prefix.
 * @param {string} prefix The prefix to use.
 * @returns {Function} The getNextScope function.
 */
export function createPrefixedGetNextScopeNumeric(prefix: string) {
  return (prevScopes: string[]) => {
    let nextScopeInt = 0;
    let nextScopeStr: string;
    do {
      nextScopeStr = `${prefix}${nextScopeInt}`;
      nextScopeInt += 1;
    } while (prevScopes.includes(nextScopeStr));
    return nextScopeStr;
  };
}

/**
 * Get the prefix for an automatically-initialized coordination scope.
 * @param datasetUid The dataset UID.
 * @param dataType The dataType corresponding to the fileType
 * whose loader defines the initial coordination values.
 * @returns The prefix for the initial coordination scope
 * like "init_<datasetUid>_<dataType>_".
 */
export function getInitialCoordinationScopePrefix(
  datasetUid: string, dataType: string,
) {
  return `init_${datasetUid}_${dataType}_`;
}

/**
 * Get the name for an automatically-initialized coordination scope.
 * @param datasetUid The dataset UID.
 * @param dataType The dataType corresponding to the fileType
 * whose loader defines the initial coordination values.
 * @param i Optional. If null, the initial coordination scope
 * name will be "init_<datasetUid>_<dataType>_0".
 * @returns The name for the initial coordination scope
 * like "init_<datasetUid>_<dataType>_<i>".
 */
export function getInitialCoordinationScopeName(
  datasetUid: string, dataType: string, i: number | null = null,
) {
  const prefix = getInitialCoordinationScopePrefix(datasetUid, dataType);
  return `${prefix}${i === null ? 0 : i}`;
}

const identityFunc = ((d: any) => d);

/**
 * Convert a (potentially nested) InternMap or Map
 * to a flat array which can be passed to d3-group
 * to enable an alternative nesting strategy.
 * @param map The InternMap or Map to flatten.
 * @param keys An array of new keys [levelZeroKey, levelOneKey, valueKey]
 * with one more than the number of Map levels.
 * @param aggFunc Optionally, an aggregation function to apply to leaves.
 * @returns The flattened array.
 */
export function unnestMap(
  map: Map<any, any>,
  keys: string[],
  aggFunc?: ((d: any) => any),
): object[] {
  if (keys.length < 2) {
    throw new Error('Insufficient number of keys passed to flattenInternMap');
  }
  const aggFuncToUse = (!aggFunc ? identityFunc : aggFunc);
  return Array.from(map.entries()).flatMap(([k, v]) => {
    if (v instanceof Map) {
      const keysWithoutFirst = [...keys];
      keysWithoutFirst.splice(0, 1);
      return unnestMap(v, keysWithoutFirst, aggFuncToUse).map(childObj => ({
        [keys[0]]: k,
        ...childObj,
      }));
    }
    return {
      [keys[0]]: k,
      [keys[1]]: aggFuncToUse(v),
    };
  });
}
