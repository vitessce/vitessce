import { log, getDebugMode, saveError } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class DatasetNotFoundError extends AbstractLoaderError {
  constructor(datasetUid) {
    super(`Error finding dataset for ${datasetUid}. Please check that at least one dataset exists in the view config.`);
    this.name = 'DatasetNotFoundError';
    this.datasetUid = datasetUid;
    this.debugMode = getDebugMode();
    this.message = datasetUid ? `Unable to find dataset for ${datasetUid}` : 'No dataset uid specified.';

    if (this.debugMode) {
      saveError({ ...this });
    }
  }

  warnInConsole() {
    const {
      message,
    } = this;
    log.warn(message);
  }
}
