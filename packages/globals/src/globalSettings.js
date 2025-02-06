// @ts-check
import log from 'loglevel';

export const DEFAULT_DEBUG_MODE = false;
export const DEFAULT_LOG_LEVEL = 'trace';

let GLOBAL_DEBUG_MODE = DEFAULT_DEBUG_MODE;

/**
 * Get the current debug mode status.
 * @returns {boolean} The current debug mode status.
 */
export function getDebugMode() {
  return GLOBAL_DEBUG_MODE;
}

/**
 * Set the debug mode.
 * @param {boolean} value - The value to set for debug mode.
 */
export function setDebugMode(value) {
  GLOBAL_DEBUG_MODE = value;
}

/**
 * Get the current log level.
 * @returns {number} The current log level.
 */
export function getLogLevel() {
  return log.getLevel();
}

/**
 * Set the log level.
 *  @param {'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'} level - The log level to set.
 */
export function setLogLevel(level) {
  log.setLevel(level);
}

export default log;
