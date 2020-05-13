import tinycolor from 'tinycolor2';

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

export function toHexString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}
