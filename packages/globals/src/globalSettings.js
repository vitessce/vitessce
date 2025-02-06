import log from 'loglevel';

export const DEFAULT_DEBUG_MODE = false;
export const DEFAULT_LOG_LEVEL = 'trace';

let GLOBAL_DEBUG_MODE = DEFAULT_DEBUG_MODE;

export function getDebugMode() {
  return GLOBAL_DEBUG_MODE;
}

export function setDebugMode(value) {
    GLOBAL_DEBUG_MODE = value;
}

export function getLogLevel() {
  return log.getLevel();
}

export function setLogLevel(level) {
  log.setLevel(level);
}

export default log;
