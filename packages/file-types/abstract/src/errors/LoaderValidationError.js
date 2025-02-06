import { log, getDebugMode, saveError } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class LoaderValidationError extends AbstractLoaderError {
  constructor(datasetType, datasetFileType, datasetUrl, reason) {
    super(`Error while validating ${datasetType}.`);
    this.name = 'LoaderValidationError';

    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
    this.reason = reason;
    this.debugMode = getDebugMode();
    this.message = `${datasetType} from ${datasetUrl}: validation failed`;

    if (this.debugMode) {
      saveError({ ...this });
    }
  }

  warnInConsole() {
    const {
      reason, message,
    } = this;
    log.warn(
      message,
      JSON.stringify(reason, null, 2),
    );
  }
}
