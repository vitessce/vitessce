import log from 'loglevel';


export const DEFAULT_DEBUG_MODE = false;
export const DEFAULT_LOG_LEVEL = 'trace';

let GLOBAL_DEBUG_MODE = DEFAULT_DEBUG_MODE;

export function getDebugMode() {
  return GLOBAL_DEBUG_MODE;
}

export function setDebugMode(value) {
  if (typeof value === 'boolean') {
    GLOBAL_DEBUG_MODE = value;
  } else {
    console.warn('setDebugMode expects a boolean value.');
  }
  console.log('new debugMode', GLOBAL_DEBUG_MODE);
}

export function getLogLevel() {
  console.log('get level', log.getLevel());
  return log.getLevel();
}

export function setLogLevel(level) {
  log.setLevel(level);
  console.log('new logLEvel', log.getLevel());
}

export default log;
