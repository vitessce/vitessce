import log from './globalSettings.js';

export { log };

export {
  getDebugMode,
  setDebugMode,
  getLogLevel,
  setLogLevel,
  DEFAULT_DEBUG_MODE,
  DEFAULT_LOG_LEVEL,
} from './globalSettings.js';

export { getErrors, clearErrors, saveError } from './errorStore.js';
