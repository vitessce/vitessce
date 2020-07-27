import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderValidationError extends AbstractLoaderError {
  constructor(datasetName, datasetType, datasetFileType, datasetUrl, reason) {
    super(`Error while validating ${datasetName}.`);
    this.name = 'LoaderValidationError';

    this.datasetName = datasetName;
    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
    this.reason = reason;
  }

  warnInConsole() {
    const {
      datasetName, datasetType, datasetUrl, reason,
    } = this;
    console.warn(
      `"${datasetName}" (${datasetType}) from ${datasetUrl}: validation failed`,
      JSON.stringify(reason, null, 2),
    );
  }
}
