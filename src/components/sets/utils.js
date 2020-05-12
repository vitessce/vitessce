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

// From https://stackoverflow.com/a/13627586
function ordinalSuffixOf(i) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
}

/**
 * Convert an integer to the name of the corresponding tree level.
 * Relative to the current node.
 * @param {integer} i The index of the level. 0 means children, 1 grandchildren, etc.
 * @returns {string} The name.
 */
export function levelNameFromIndex(i) {
  return `${ordinalSuffixOf(i)} descendants`;
}
