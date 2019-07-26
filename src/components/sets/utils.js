/**
 * Execute a callback function based on a keypress event.
 * @param {object} event The event from onKeyPress
 * @param {string} key The key identifier to match.
 * @param {Function} callback The function to execute.
 */
export function callbackOnKeyPress(event, key, callback) {
  if (event.key === key) {
    callback();
  }
}

/**
 * Return an array from 0..stop.
 * @param {integer} stop The end of the array, exclusive.
 * @returns {Array} The resulting array of integers.
 */
export function range(stop) {
  return Array.from(Array(stop), (x, i) => i);
}

/**
 * Convert an integer to the name of the corresponding tree level.
 * Relative to the current node.
 * @param {integer} i The index of the level. 0 means children, 1 grandchildren, etc.
 * @returns {string} The name.
 */
export function levelNameFromIndex(i) {
  if (i === 0) {
    return 'children';
  } if (i === 1) {
    return 'grandchildren';
  }
  return `level ${i} descendants`;
}
