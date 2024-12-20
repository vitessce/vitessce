import AbstractLoaderError from './AbstractLoaderError.js';

export default class LoaderValidationError extends AbstractLoaderError {
  constructor(datasetType, datasetFileType, datasetUrl, reason) {
    super(`Error while validating ${datasetType}.`);
    this.name = 'LoaderValidationError';

    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
    this.reason = reason;
  }

  warnInConsole() {
    const {
      datasetType, datasetUrl, reason,
    } = this;
    console.warn(
      `${datasetType} from ${datasetUrl}: validation failed`,
      JSON.stringify(reason, null, 2),
    );
  }
}
