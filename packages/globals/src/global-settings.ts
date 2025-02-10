// @ts-check
import log from 'loglevel';

/*
  Constants representing different modes for showing logs
*/
export const LogLevel = {
  SILENT: 'silent',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
  TRACE: 'trace', // default value
};

const OrderedLogLevels = [
  LogLevel.TRACE,
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.WARN,
  LogLevel.ERROR,
];

export const DEFAULT_DEBUG_MODE = false;
export const DEFAULT_LOG_LEVEL = LogLevel.TRACE;

let GLOBAL_DEBUG_MODE = DEFAULT_DEBUG_MODE;

/**
 * Get the current debug mode status.
 * @returns {boolean}
 */
export function getDebugMode(): boolean {
  return GLOBAL_DEBUG_MODE;
}

/**
 * Set the debug mode.
 * @param {boolean} value
 */
export function setDebugMode(value: boolean): void {
  GLOBAL_DEBUG_MODE = value;
}

/**
 * Get the current log level.
 * @returns The current log level
 */
export function getLogLevel(): number {
  return log.getLevel();
}

/**
 * Set the log level.
 * @param level A string like "debug" or "error".
 */
export function setLogLevel(level: typeof LogLevel[keyof typeof LogLevel]): void {
  if (Object.values(LogLevel).includes(level)) {
    log.setLevel(level as any);
  } else {
    log.warn('Log level is not valid');
  }
}

/**
 * Is the current log level at least as verbose as some target level?
 * @param someLevel The target level.
 * @returns True if the target level is at least as verbose as the current level.
 */
export function atLeastLogLevel(someLevel: typeof LogLevel[keyof typeof LogLevel]): boolean {
  const currLevel = getLogLevel();
  const numericTarget = OrderedLogLevels.indexOf(someLevel);
  return currLevel <= numericTarget;
}

export { log };
