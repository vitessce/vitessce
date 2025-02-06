// @ts-check
import log from 'loglevel';

/*
  Constants representing different modes for showing logs
*/
export const LogLevels = {
  silent: 'silent',
  info: 'info',
  warn: 'warn',
  error: 'error',
  trace: 'trace', // default
  debug: 'debug',
} as const; // This will help TypeScript infer the exact types for these values

export const DEFAULT_DEBUG_MODE = false;
export const DEFAULT_LOG_LEVEL = 'trace';

let GLOBAL_DEBUG_MODE = DEFAULT_DEBUG_MODE;

/**
 * Get the current debug mode status.
 * @returns {boolean} The current debug mode status.
 */
export function getDebugMode(): boolean {
  return GLOBAL_DEBUG_MODE;
}

/**
 * Set the debug mode.
 * @param {boolean} value - The value to set for debug mode.
 */
export function setDebugMode(value: boolean): void {
  GLOBAL_DEBUG_MODE = value;
}

/**
 * Get the current log level.
 * @returns {number} The current log level.
 */
export function getLogLevel(): number {
  return log.getLevel();
}

/**
 * Set the log level.
 * @param {keyof typeof LogLevels} level - The log level to set.
 */
export function setLogLevel(level: keyof typeof LogLevels): void {
  if (Object.values(LogLevels).includes(level)) {
    log.setLevel(level); // loglevel expects lowercase log levels
  } else {
    log.warn('Log level is not valid');
  }
}

export default log;
