import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderNotFoundError extends AbstractLoaderError {
  constructor(datasetName, datasetType, datasetFileType, datasetUrl) {
    super(`Error finding loader for ${datasetName}.`);
    this.name = 'LoaderNotFoundError';

    this.datasetName = datasetName;
    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
  }

  warnInConsole() {
    const {
      datasetName, datasetType, datasetFileType, datasetUrl,
    } = this;
    if (datasetFileType && datasetUrl) {
      console.warn(
        `"${datasetName}" (${datasetType}) from ${datasetUrl}: unable to find loader for fileType ${datasetFileType}`,
      );
    } else {
      console.warn(
        `"${datasetName}" (${datasetType}): unable to find loader`,
      );
    }
  }
}
